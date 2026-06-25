// api/inbound-email.js
// ─────────────────────────────────────────────────────────────────────────
// CasaCEO inbound bill ingestion — Vercel serverless function.
//
// SendGrid Inbound Parse POSTs forwarded bills here as multipart/form-data.
// This function:
//   1. Verifies a shared secret (?key=...) so random POSTs can't create bills.
//   2. Parses the email with mailparser (handles every MIME shape, nested
//      parts, base64/quoted-printable, charsets — all correctly).
//   3. Extracts the body text/HTML and the first PDF/image attachment as a
//      clean Buffer, base64-encoded losslessly (Node Buffer — no corruption).
//   4. Calls Claude (Haiku) with the right document/image block to extract
//      companyName, amount, dueDate, category.
//   5. Writes a pending_review bill to PocketBase via its REST API, owned by
//      the userId taken from the ceo+<userId>@bills.casaceo.com address.
//
// Why this lives on Vercel and not in the PocketBase hook: PocketBase's JS VM
// can't read binary attachment bytes without corrupting them (every string
// path mangles bytes >= 0x80, which PDFs are full of). Node's Buffer handles
// binary natively, so attachment bills parse reliably here.
//
// Environment variables required (set in Vercel project settings):
//   INBOUND_PARSE_SECRET  — shared secret, must match SendGrid's ?key=
//   ANTHROPIC_API_KEY     — for the Claude call
//   POCKETBASE_URL        — e.g. https://rezpanda-production.up.railway.app
//   PB_SERVICE_TOKEN      — a PocketBase auth token for writing records
//                           (obtained via PB_SERVICE_EMAIL/PASSWORD below)
//   PB_SERVICE_EMAIL      — service account email
//   PB_SERVICE_PASSWORD   — service account password
// ─────────────────────────────────────────────────────────────────────────

import { simpleParser } from 'mailparser';
import Busboy from 'busboy';

const CATEGORIES = ['Electric', 'Water', 'Internet', 'Insurance', 'Auto', 'Other'];

// Vercel: disable the default body parser so we can read the raw multipart stream.
export const config = {
  api: { bodyParser: false },
};

// ── Read SendGrid's multipart/form-data POST into { fields } ───────────────
// SendGrid sends the raw email under the "email" field when "POST raw" is on.
function readForm(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    let bb;
    try {
      bb = Busboy({ headers: req.headers, limits: { fileSize: 30 * 1024 * 1024 } });
    } catch (err) {
      return reject(err);
    }
    bb.on('field', (name, val) => { fields[name] = val; });
    // SendGrid raw mode puts everything in fields; if any file parts appear,
    // drain them so the stream finishes (we don't use them — we parse raw MIME).
    bb.on('file', (_name, stream) => { stream.resume(); });
    bb.on('finish', () => resolve({ fields }));
    bb.on('error', reject);
    req.pipe(bb);
  });
}

// ── Extract structured content from the raw MIME email ─────────────────────
// Recursively collect attachments, descending into message/rfc822 parts so
// that a forward-of-a-forward (where the original bill + its PDF are nested as
// an attached email) still surfaces the PDF/image. Depth-capped for safety.
async function collectAttachments(parsed, depth) {
  let results = [];
  for (const att of parsed.attachments || []) {
    const ct = (att.contentType || '').toLowerCase();
    if (ct === 'message/rfc822' && depth < 3) {
      try {
        const inner = await simpleParser(att.content);
        results = results.concat(await collectAttachments(inner, depth + 1));
      } catch (e) {
        // unparseable nested message — skip it
      }
    } else {
      results.push(att);
    }
  }
  return results;
}

async function extractFromEmail(rawMime) {
  const parsed = await simpleParser(rawMime);

  const text = parsed.text || '';
  const html = parsed.html || '';
  const htmlAsText = html
    ? html.replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&')
          .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
          .replace(/\s+/g, ' ').trim()
    : '';
  const bestBody = htmlAsText.length > text.length ? htmlAsText : text;

  // Gather attachments recursively (handles nested forwarded emails).
  const allAttachments = await collectAttachments(parsed, 0);

  // First usable PDF or image attachment becomes the media block for Claude.
  let mediaBlock = null;
  let attachmentName = null;
  for (const att of allAttachments) {
    const ct = (att.contentType || '').toLowerCase();
    const fn = (att.filename || '').toLowerCase();
    const isPdf = ct === 'application/pdf' || fn.endsWith('.pdf');
    const isImg = ct.startsWith('image/') || /\.(png|jpe?g)$/.test(fn);
    if (isPdf) {
      mediaBlock = { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: att.content.toString('base64') } };
      attachmentName = att.filename || 'attachment.pdf';
      break;
    } else if (isImg) {
      const mt = ct.startsWith('image/') ? ct : (fn.endsWith('.png') ? 'image/png' : 'image/jpeg');
      mediaBlock = { type: 'image', source: { type: 'base64', media_type: mt, data: att.content.toString('base64') } };
      attachmentName = att.filename || 'attachment';
      break;
    }
  }

  return {
    from: parsed.from?.text || '',
    to: parsed.to?.text || '',
    subject: parsed.subject || '',
    bestBody,
    mediaBlock,
    attachmentName,
  };
}

// ── Call Claude to extract the bill fields ─────────────────────────────────
async function extractBillWithClaude(apiKey, content) {
  const systemPrompt =
    'You extract structured data from utility bills, invoices, and receipts. ' +
    'Return ONLY a single JSON object, no prose, no markdown, no code fences. ' +
    'Schema: {"documentType": "bill"|"marketing"|"receipt"|"notice"|"other", ' +
    '"companyName": string|null, "amount": number|null, "dueDate": "YYYY-MM-DD"|null, ' +
    '"category": one of ' + JSON.stringify(CATEGORIES) + ', ' +
    '"amountConfidence": "high"|"medium"|"low", "amountReason": string, ' +
    '"payUrl": string|null, "phone": string|null, "address": string|null, ' +
    '"accountNumber": string|null, "invoiceNumber": string|null, "billingPeriod": string|null}. ' +
    'Rules: use null only if a field is truly not present anywhere in the document. ' +
    // ── Document classification (the gate) ───────────────────────────────
    // Decide FIRST what this email/document actually is. The pipeline uses this
    // to keep marketing and noise out of the user's bill queue. Be conservative:
    // only call something "marketing" when it is clearly promotional with no
    // amount the customer owes. When genuinely unsure, prefer "bill" — a real
    // bill must never be dropped; a stray non-bill in the queue is recoverable.
    'documentType = what this document IS. ' +
    '"bill" = an invoice, statement, or bill stating an amount the customer owes ' +
    '(has or implies a balance/amount due and typically a due date or account). ' +
    '"receipt" = a confirmation that a payment ALREADY happened (paid, thank-you, ' +
    'payment confirmation, autopay-processed) — money already moved, nothing owed now. ' +
    '"marketing" = a promotion, offer, ad, upgrade pitch, newsletter, refer-a-friend, ' +
    'or rate advertisement. A price shown as a DEAL or PLAN PRICE (e.g. "get internet ' +
    'for $39.99/mo") is NOT an amount owed — classify as marketing, not a bill. ' +
    '"notice" = an account/service message with no amount owed (outage alert, policy ' +
    'change, paperless-enrollment confirmation, password reset, login alert). ' +
    '"other" = anything that fits none of the above. ' +
    'If the document is genuinely a bill but also contains promo sections, it is still "bill". ' +
    // ── Vendor enrichment fields ─────────────────────────────────────────
    // These describe the BILLER (the company), not this month\'s charge. They
    // are used to build/enrich a reusable vendor record. Pull them only if the
    // document actually states them; never invent.
    'payUrl = the URL where the customer pays this biller online, if printed ' +
    '(e.g. "pay.duke-energy.com"). Include the scheme if shown; null if absent. ' +
    'phone = the biller\'s customer-service or billing phone number as printed; null if absent. ' +
    'address = the biller\'s remittance or mailing address (one line, as printed); null if absent. ' +
    'accountNumber = the customer\'s account number with this biller exactly as printed, ' +
    'digits and any separators; null if absent. Do NOT guess or pad it. ' +
    'amount = the total current amount the customer must pay now. It may be labeled ' +
    "'Amount Due', 'Total Due', 'Total Amount Due', 'Please Pay', 'Pay This Amount', " +
    "'Balance Due', 'Current Charges', 'New Charges', or appear in a payment/remittance " +
    'stub near the bottom or in a summary box. Return it as a plain number with no ' +
    'currency symbol or commas (e.g. 1234.56). If several totals appear, prefer the one ' +
    'the customer is asked to pay by the due date, not the prior balance or a past-due subtotal. ' +
    "dueDate = the date payment is due, often labeled 'Due Date', 'Payment Due', 'Pay By', " +
    "or 'Please Pay By'. Convert it to YYYY-MM-DD. If only a service period appears and no " +
    'explicit due date, use null. ' +
    // ── Amount confidence ────────────────────────────────────────────────
    // Grade how sure you are of the AMOUNT, based on how it was labeled and
    // located — not on a general feeling. This signal tells a human reviewer
    // which bills to double-check. Amount is the costliest field to get wrong.
    'amountConfidence = your confidence that "amount" is the correct pay-now total. ' +
    'Use "high" when a single amount is clearly labeled as the amount due in a summary box, ' +
    'payment stub, or remittance slip with no competing total. ' +
    'Use "medium" when a plausible total exists but competes with other amounts ' +
    '(a prior balance, a past-due line, a budget/average-pay figure, or multiple totals) ' +
    'and you had to choose between them. ' +
    'Use "low" when the amount is unlabeled, inferred from running text, the document was ' +
    'messy or text-only with no clear total, or you are genuinely unsure. ' +
    'amountReason = a short phrase (under 12 words) naming WHERE the amount came from, ' +
    'e.g. "boxed Total Amount Due" or "inferred from body text, no clear label". ' +
    // ── Disambiguation fields ────────────────────────────────────────────
    // These distinguish two bills from the SAME biller (which otherwise look
    // identical). Pull only if printed; never invent.
    'invoiceNumber = the invoice, statement, or bill number for THIS bill as printed ' +
    "(labeled 'Invoice #', 'Invoice Number', 'Statement Number', 'Bill Number', or similar). " +
    'It identifies this one bill, NOT the account number. Return exactly as printed; null if absent. ' +
    'billingPeriod = the service or billing period this bill covers, as a short human label. ' +
    "If a date range is printed (e.g. 'Feb 12 - Mar 11, 2026'), return it compactly as " +
    '"Feb 12 – Mar 11, 2026". If only a single month/cycle is shown (e.g. "March 2026"), ' +
    'return that. Prefer the SERVICE period over the statement date. null if no period appears. ' +
    'Output only the JSON object.';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: 'user', content }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error('Anthropic API error ' + res.status + ': ' + body.slice(0, 300));
  }
  const data = await res.json();
  const rawText = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');
  const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  return JSON.parse(cleaned.slice(start, end + 1));
}

// ── PocketBase: authenticate as service account, then write the bill ───────
async function pbAuth(pbUrl, email, password) {
  const res = await fetch(pbUrl + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ identity: email, password }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error('PocketBase auth failed ' + res.status + ': ' + body.slice(0, 200));
  }
  const data = await res.json();
  return data.token;
}

async function pbVerifyUser(pbUrl, token, userId) {
  const res = await fetch(pbUrl + '/api/collections/users/records/' + encodeURIComponent(userId), {
    headers: { Authorization: token },
  });
  return res.ok;
}

// ── Guard 1: ingestion dedupe (mechanical re-forward suppression) ──────────
// Before creating a bill, look for one this user already has with the SAME
// payee + SAME amount + SAME due date, created recently. That triple is the
// signature of the same physical bill arriving twice (re-forward, SendGrid
// retry, nested double-forward) — NOT a legitimate recurring bill, because a
// recurring bill has a DIFFERENT due date each cycle. The recent-window cap
// keeps us from ever colliding with last month's same-amount bill.
//
// Deliberately conservative: exact payee-string match only. "Xfinity" vs
// "Comcast Xfinity" won't collide here — that's the normalized-payee problem,
// a separate (later) job. This catches the common literal re-forward cleanly
// and never risks suppressing a genuinely different bill.
async function pbFindDuplicate(pbUrl, token, { ownerId, companyName, amount, dueDate, windowDays = 14 }) {
  // Only a fully-specified bill can be a confident mechanical duplicate.
  // If any of the three keys is missing, don't dedupe — let it through to review.
  if (!companyName || typeof amount !== 'number' || !dueDate) return null;

  const cutoff = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();

  // PocketBase list filter. Note: amount compared as a number; companyName and
  // dueDate as exact strings. created >= cutoff bounds the window.
  const filter =
    'ownerId = "' + ownerId + '"' +
    ' && companyName = "' + String(companyName).replace(/"/g, '\\"') + '"' +
    ' && amount = ' + amount +
    ' && dueDate = "' + dueDate + '"' +
    ' && created >= "' + cutoff + '"';

  const url =
    pbUrl + '/api/collections/invoices/records' +
    '?perPage=1&filter=' + encodeURIComponent(filter);

  try {
    const res = await fetch(url, { headers: { Authorization: token } });
    if (!res.ok) return null; // on any lookup failure, fail open (allow the write)
    const data = await res.json();
    if (data && Array.isArray(data.items) && data.items.length > 0) {
      return data.items[0];
    }
    return null;
  } catch (e) {
    return null; // never let a dedupe lookup error block ingestion
  }
}

async function pbCreateBill(pbUrl, token, record) {
  const res = await fetch(pbUrl + '/api/collections/invoices/records', {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: token },
    body: JSON.stringify(record),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error('PocketBase create failed ' + res.status + ': ' + body.slice(0, 300));
  }
  return res.json();
}

// ── Vendor enrichment helpers ──────────────────────────────────────────────
// A vendor is the stable biller entity (Comcast). Many invoices reference one
// vendor. We resolve-or-create per owner, matching on name OR sender domain.

// Consumer / ISP mail domains. A bill FORWARDED from one of these has a "from"
// that is the USER'S inbox, not the biller — so its domain is meaningless as a
// vendor signal and must never become a match key, a stored senderDomain, or a
// "use this domain" guess. Only mail arriving DIRECT from the biller's own
// domain produces a usable signal. Keep this list in sync with the same list in
// ServiceCompanyCard.jsx (the card's "Add payment link" finder).
const CONSUMER_MAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'icloud.com', 'outlook.com', 'hotmail.com',
  'aol.com', 'me.com', 'proton.me', 'protonmail.com', 'live.com', 'msn.com',
  'comcast.net', 'comcast.com', 'xfinity.com', 'att.net', 'verizon.net',
  'sbcglobal.net', 'cox.net', 'charter.net', 'bellsouth.net', 'earthlink.net',
];

// Pull a bare domain from a "from" header like 'Billing <billing@comcast.com>'.
// Returns '' for consumer/ISP domains: a forwarded bill's "from" is the user's
// own inbox, so its domain must not be treated as the biller's.
function senderDomainFrom(fromRaw) {
  if (!fromRaw) return '';
  const m = String(fromRaw).match(/@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/);
  if (!m) return '';
  const domain = m[1].toLowerCase();
  if (CONSUMER_MAIL_DOMAINS.includes(domain)) return '';
  return domain;
}

// Truncate any account number to a masked last-4 (XXXX1234). The FULL number is
// never returned, never stored — this is the only account value that survives.
// Returns '' if there aren't at least 4 digits to mask.
function maskAccount(raw) {
  if (raw == null) return '';
  const digits = String(raw).replace(/[^0-9]/g, '');
  if (digits.length < 4) return '';
  return 'XXXX' + digits.slice(-4);
}

// Remove the raw account number from the object we persist as parsed_raw, so the
// full number never leaks through the "what we saw" reference panel.
function scrubParsed(parsed) {
  const clone = { ...parsed };
  delete clone.accountNumber;
  return clone;
}

// Find this owner's vendor by name (case-insensitive) OR sender domain.
async function pbFindVendor(pbUrl, token, { ownerId, name, senderDomain }) {
  const clauses = [];
  const nameLc = (name || '').trim();
  if (nameLc) clauses.push('name ~ "' + nameLc.replace(/"/g, '\\"') + '"');
  if (senderDomain) clauses.push('senderDomain = "' + senderDomain.replace(/"/g, '\\"') + '"');
  if (clauses.length === 0) return null;

  const filter = 'ownerId = "' + ownerId + '" && (' + clauses.join(' || ') + ')';
  const url = pbUrl + '/api/collections/vendors/records?perPage=5&filter=' + encodeURIComponent(filter);
  try {
    const res = await fetch(url, { headers: { Authorization: token } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !Array.isArray(data.items) || data.items.length === 0) return null;
    // Prefer an exact (case-insensitive) name match; else first by-domain hit.
    const exact = data.items.find(
      (v) => (v.name || '').trim().toLowerCase() === nameLc.toLowerCase()
    );
    return exact || data.items[0];
  } catch (e) {
    return null;
  }
}

async function pbCreateVendor(pbUrl, token, record) {
  const res = await fetch(pbUrl + '/api/collections/vendors/records', {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: token },
    body: JSON.stringify(record),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error('Vendor create failed ' + res.status + ': ' + body.slice(0, 300));
  }
  return res.json();
}

async function pbUpdateVendor(pbUrl, token, id, patch) {
  const res = await fetch(pbUrl + '/api/collections/vendors/records/' + encodeURIComponent(id), {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', Authorization: token },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null; // enrichment is best-effort; never block the bill
  return res.json();
}

// Resolve a vendor for this bill, creating it if absent and back-filling any
// empty enrichment fields when this bill carries new info. Returns vendor id,
// or '' if we couldn't resolve/create one (the invoice still saves, unlinked).
async function resolveOrCreateVendor(pbUrl, token, { ownerId, name, senderDomain, payUrl, phone, address, accountLast4 }) {
  try {
    const existing = await pbFindVendor(pbUrl, token, { ownerId, name, senderDomain });
    if (existing) {
      // Enrich only empty fields — never overwrite something already captured.
      const patch = {};
      if (!existing.senderDomain && senderDomain) patch.senderDomain = senderDomain;
      if (!existing.payUrl && payUrl) patch.payUrl = payUrl;
      if (!existing.phone && phone) patch.phone = phone;
      if (!existing.address && address) patch.address = address;
      if (!existing.accountLast4 && accountLast4) patch.accountLast4 = accountLast4;
      if (Object.keys(patch).length > 0) {
        await pbUpdateVendor(pbUrl, token, existing.id, patch);
      }
      return existing.id;
    }
    const created = await pbCreateVendor(pbUrl, token, {
      ownerId,
      name: name || 'Unknown',
      senderDomain: senderDomain || '',
      payUrl: payUrl || '',
      phone: phone || '',
      address: address || '',
      accountLast4: accountLast4 || '',
    });
    return created.id;
  } catch (e) {
    return ''; // fail open: an unlinked invoice is better than a dropped bill
  }
}

// ── Main handler ───────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 0. Shared-secret guard.
  const expectedSecret = process.env.INBOUND_PARSE_SECRET;
  if (expectedSecret) {
    const gotSecret = (req.query && req.query.key) || '';
    if (gotSecret !== expectedSecret) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const pbUrl = process.env.POCKETBASE_URL;
  const pbEmail = process.env.PB_SERVICE_EMAIL;
  const pbPassword = process.env.PB_SERVICE_PASSWORD;
  if (!apiKey || !pbUrl || !pbEmail || !pbPassword) {
    return res.status(500).json({ error: 'Server not configured (missing env vars)' });
  }

  let fields;
  try {
    ({ fields } = await readForm(req));
  } catch (err) {
    return res.status(400).json({ error: 'Could not read form', detail: String(err) });
  }

  // SendGrid raw mode: the full MIME message is in the "email" field.
  // Fall back to building a minimal message from parsed fields if needed.
  const rawMime = fields.email || '';
  if (!rawMime) {
    // Not in raw mode — SendGrid sent parsed fields. Build a tiny RFC822 so
    // mailparser can still run, using to/from/subject/text/html.
    return res.status(200).json({ ok: false, reason: 'no raw email field — enable POST raw in SendGrid' });
  }

  let extracted;
  try {
    extracted = await extractFromEmail(rawMime);
  } catch (err) {
    return res.status(200).json({ ok: false, reason: 'parse failed', detail: String(err) });
  }

  // Identify owner from the to-address: ceo+<userId>@bills.casaceo.com
  const toRaw = extracted.to || fields.to || '';
  const plusMatch = toRaw.match(/\+([^@>]+)@/);
  const userId = plusMatch ? plusMatch[1].trim() : '';
  if (!userId) {
    return res.status(200).json({ ok: false, reason: 'no userId in to-address', to: toRaw });
  }

  // Build content for Claude: attachment first, else body text.
  let content;
  let usedAttachment = false;
  if (extracted.mediaBlock) {
    content = [extracted.mediaBlock, { type: 'text', text: 'Extract the bill data from the attached file.' }];
    usedAttachment = true;
  } else {
    const combined = ('Subject: ' + extracted.subject + '\n\n' + extracted.bestBody).trim();
    if (!combined) {
      return res.status(200).json({ ok: false, reason: 'no attachment and empty body', userId });
    }
    content = [{ type: 'text', text: 'Extract the bill data from this forwarded email:\n\n' + combined }];
  }

  let parsed;
  try {
    parsed = await extractBillWithClaude(apiKey, content);
  } catch (err) {
    return res.status(502).json({ error: 'Claude extraction failed', detail: String(err) });
  }

  // ── Gate: keep non-bills out of the review queue ─────────────────────────
  // Linking a biller directly means CasaCEO also receives that biller's
  // marketing, receipts, and notices. We classify the document (documentType)
  // and refuse to create an invoice for clear non-bills, so the queue stays
  // trustworthy. FAIL OPEN: we only block when Haiku is confident it's a
  // non-bill AND there is no amount owed. If any positive amount was parsed,
  // we let it through regardless — the cost of dropping a real bill is far
  // worse than one stray row the user can delete. A promo price reads as
  // marketing with amount=null, so it's stopped; an actual bill always carries
  // an amount and passes. The email is still acknowledged (200) so SendGrid
  // doesn't retry; we simply don't write a record.
  const NON_BILL_TYPES = new Set(['marketing', 'receipt', 'notice']);
  const docType = typeof parsed.documentType === 'string' ? parsed.documentType.toLowerCase().trim() : '';
  const hasAmountOwed = typeof parsed.amount === 'number' && parsed.amount > 0;
  if (NON_BILL_TYPES.has(docType) && !hasAmountOwed) {
    return res.status(200).json({
      ok: true,
      saved: false,
      reason: 'not a bill',
      documentType: docType,
      companyName: parsed.companyName || null,
      from: extracted.from || '',
    });
  }

  // Write to PocketBase.
  try {
    const token = await pbAuth(pbUrl, pbEmail, pbPassword);

    const userOk = await pbVerifyUser(pbUrl, token, userId);
    if (!userOk) {
      return res.status(200).json({ ok: false, reason: 'unknown user', userId });
    }

    // Normalize the parsed amount once, so the dedupe check and the record agree.
    const amountNum = typeof parsed.amount === 'number' ? parsed.amount : null;
    const companyName = parsed.companyName || 'Unknown';
    const dueDate = parsed.dueDate || '';

    // ── Guard 1: suppress mechanical duplicates before they hit the queue ──
    // Same payee + amount + due date within the window = the same bill arriving
    // twice. We don't create a second pending bill; we report it as a duplicate.
    const dupe = await pbFindDuplicate(pbUrl, token, {
      ownerId: userId,
      companyName,
      amount: amountNum,
      dueDate,
    });
    if (dupe) {
      return res.status(200).json({
        ok: true,
        saved: false,
        duplicateOf: dupe.id,
        reason: 'duplicate suppressed',
        companyName,
        amount: amountNum,
        dueDate,
      });
    }

    // Confidence in the parsed amount (high|medium|low). Defaults to '' if the
    // model didn't return it, which the UI treats as "no flag."
    const amountConfidence =
      parsed.amountConfidence === 'high' ||
      parsed.amountConfidence === 'medium' ||
      parsed.amountConfidence === 'low'
        ? parsed.amountConfidence
        : '';

    // ── Vendor resolve-or-create ───────────────────────────────────────────
    // Truncate the account number to last-4 BEFORE anything is written. The
    // full number lives only in this function's memory (parsed.accountNumber)
    // and is scrubbed from parsed_raw below, so it never reaches the database.
    const senderDomain = senderDomainFrom(extracted.from || '');
    const accountLast4 = maskAccount(parsed.accountNumber);

    const vendorId = await resolveOrCreateVendor(pbUrl, token, {
      ownerId: userId,
      name: companyName,
      senderDomain,
      payUrl: parsed.payUrl || '',
      phone: parsed.phone || '',
      address: parsed.address || '',
      accountLast4,
    });

    // Strip the raw account number out of what we persist as provenance.
    const safeParsedRaw = scrubParsed(parsed);

    const record = {
      companyName,
      amount: amountNum,
      dueDate,
      category: CATEGORIES.indexOf(parsed.category) !== -1 ? parsed.category : 'Other',
      status: 'pending_review',
      source: 'email',
      parsed_raw: safeParsedRaw,
      amountConfidence,
      ownerId: userId,
      homeId: '',
      senderAddress: extracted.from || '',
      forwardedAt: new Date().toISOString(),
      // Disambiguators — identify THIS bill among same-biller siblings. Plain
      // strings, not secret (unlike accountNumber): stored as-is, capped to a
      // sane length so a malformed parse can't write something huge.
      invoiceNumber: typeof parsed.invoiceNumber === 'string' ? parsed.invoiceNumber.trim().slice(0, 64) : '',
      billingPeriod: typeof parsed.billingPeriod === 'string' ? parsed.billingPeriod.trim().slice(0, 64) : '',
      vendorId: vendorId || '',
    };

    const saved = await pbCreateBill(pbUrl, token, record);
    return res.status(200).json({ ok: true, saved: true, savedId: saved.id, vendorId, usedAttachment, parsed: safeParsedRaw });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save record', detail: String(err) });
  }
}
