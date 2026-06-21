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
    'Schema: {"companyName": string|null, "amount": number|null, "dueDate": "YYYY-MM-DD"|null, ' +
    '"category": one of ' + JSON.stringify(CATEGORIES) + '}. ' +
    'Rules: use null only if a field is truly not present anywhere in the document. ' +
    'amount = the total current amount the customer must pay now. It may be labeled ' +
    "'Amount Due', 'Total Due', 'Total Amount Due', 'Please Pay', 'Pay This Amount', " +
    "'Balance Due', 'Current Charges', 'New Charges', or appear in a payment/remittance " +
    'stub near the bottom or in a summary box. Return it as a plain number with no ' +
    'currency symbol or commas (e.g. 1234.56). If several totals appear, prefer the one ' +
    'the customer is asked to pay by the due date, not the prior balance or a past-due subtotal. ' +
    "dueDate = the date payment is due, often labeled 'Due Date', 'Payment Due', 'Pay By', " +
    "or 'Please Pay By'. Convert it to YYYY-MM-DD. If only a service period appears and no " +
    'explicit due date, use null. Output only the JSON object.';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
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

async function pbCreateBill(pbUrl, token, record) {
  const res = await fetch(pbUrl + '/api/collections/service_companies/records', {
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

  // Write to PocketBase.
  try {
    const token = await pbAuth(pbUrl, pbEmail, pbPassword);

    const userOk = await pbVerifyUser(pbUrl, token, userId);
    if (!userOk) {
      return res.status(200).json({ ok: false, reason: 'unknown user', userId });
    }

    const record = {
      companyName: parsed.companyName || 'Unknown',
      amount: typeof parsed.amount === 'number' ? parsed.amount : null,
      dueDate: parsed.dueDate || '',
      category: CATEGORIES.indexOf(parsed.category) !== -1 ? parsed.category : 'Other',
      paymentLink: '',
      status: 'pending_review',
      source: 'email',
      parsed_raw: parsed,
      ownerId: userId,
      homeId: '',
      senderAddress: extracted.from || '',
      forwardedAt: new Date().toISOString(),
    };

    const saved = await pbCreateBill(pbUrl, token, record);
    return res.status(200).json({ ok: true, saved: true, savedId: saved.id, usedAttachment, parsed });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save record', detail: String(err) });
  }
}
