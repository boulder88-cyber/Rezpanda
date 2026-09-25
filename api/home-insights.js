// api/home-insights.js
// ─────────────────────────────────────────────────────────────────────────
// CasaCEO home insights — Vercel serverless function.
//
// Reads ONE home's own bill history and asks Claude for a short list of
// plain-language observations: a bill trending up, an unusually high charge,
// a recurring bill that's gone quiet. Pure SEE — this never recommends
// canceling a vendor, switching providers, or any other action; it points
// at a pattern and leaves the call to the homeowner, same thesis as the
// weather-triggered maintenance strip (api/weather-maintenance.js) and the
// "see, don't do" maintenance-tracking cycle described in
// MaintenanceHelpPanel.jsx.
//
// Security model — deliberately simple: this endpoint takes the CALLER'S OWN
// PocketBase auth token (forwarded as-is from the browser, the same
// Authorization header the frontend already sends when it calls
// pb.collection(...) directly) and uses THAT token — not a service account —
// to read the invoices collection. PocketBase's own owner-scoped API rule on
// "invoices" is what decides whether the caller can see a given record, so
// this function can never return another user's data even if it tried. No
// new secrets or elevated credentials are introduced.
//
// Env vars used (both already configured in Vercel for the bill-extraction
// pipeline in api/inbound-email.js):
//   POCKETBASE_URL     — the PocketBase API base
//   ANTHROPIC_API_KEY  — for the Claude call
//
// Fails soft everywhere: a bad/expired token, a PocketBase hiccup, a Claude
// error, or genuinely too little history all come back as { insights: [] }
// with a 200, never an error the dashboard has to handle specially. Insights
// are a bonus signal, never load-bearing.
//
// Known limitation, noted rather than silently ignored: there's no
// server-side rate limiting on this endpoint. The frontend caches results in
// sessionStorage and only calls this on a real page load or an explicit
// "Refresh" click, which is enough for now — a logged-in user hammering
// their own Refresh button costs at most a few cents in Haiku calls. Worth
// real rate limiting if this ever gets a busier trigger than that.
// ─────────────────────────────────────────────────────────────────────────

const MAX_BILLS = 60;
const MIN_BILLS_FOR_INSIGHTS = 3;

// ── Ask Claude for a short list of observations about this home's bills ────
async function getInsightsFromClaude(apiKey, bills) {
  const systemPrompt =
    'You are a calm, observant assistant inside a home-management app. You will ' +
    'be given a JSON array of one home\'s bill records (company, category, amount, ' +
    'dueDate, whether it was cleared/paid, and when it was created). ' +
    'Find at most 3 genuinely useful observations about spending PATTERNS across ' +
    'these bills — not summaries of individual bills. Good examples: a specific ' +
    'company\'s bills trending noticeably up over time; one bill unusually high ' +
    'compared to that same company\'s history; a bill that used to appear ' +
    'regularly (e.g. monthly) and then stopped, which may mean it lapsed, was ' +
    'cancelled, or is just being paid another way now. ' +
    'Rules: ' +
    '1. Only report a pattern the data actually supports — never invent a company, ' +
    'amount, or trend that is not in the input. ' +
    '2. Reference the real company name and real numbers from the data when you ' +
    'cite one. ' +
    '3. Stay observational, never prescriptive — describe what you noticed, do ' +
    'NOT tell the homeowner to cancel, switch, negotiate, or take any specific ' +
    'action. Frame it as "worth a look," not an instruction. ' +
    '4. Never give financial, legal, or investment advice. ' +
    '5. If there is genuinely nothing notable, return an empty array — do not ' +
    'invent generic filler like "keep tracking your spending." ' +
    '6. Return ONLY a JSON array, no prose, no markdown, no code fences. Each ' +
    'item: {"severity": "medium"|"low", "category": string|null, "title": string ' +
    '(under 60 characters), "detail": string (one or two plain sentences)}. ' +
    'Use "medium" only for something worth a real look (a clear upward trend, a ' +
    'bill that stopped appearing); use "low" for a milder or more speculative ' +
    'observation. Never use "high" — nothing here is an emergency.';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      system: systemPrompt,
      messages: [{ role: 'user', content: JSON.stringify({ bills }) }],
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
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1) return [];
  const parsed = JSON.parse(cleaned.slice(start, end + 1));
  return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ insights: [] });
    return;
  }

  try {
    const token = req.headers.authorization || '';
    const { homeId } = req.body || {};
    const pbUrl = process.env.POCKETBASE_URL;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!token || !homeId || !pbUrl || !apiKey) {
      res.status(200).json({ insights: [] });
      return;
    }

    // Read this home's bills with the CALLER'S OWN token — PocketBase's
    // existing owner-scoped rule on "invoices" enforces access, so this
    // function never needs (and never uses) elevated credentials.
    const filter = `homeId="${homeId}"`;
    const url =
      pbUrl + '/api/collections/invoices/records?perPage=' + MAX_BILLS +
      '&sort=-created&filter=' + encodeURIComponent(filter);
    const billsRes = await fetch(url, { headers: { Authorization: token } });

    if (!billsRes.ok) {
      // Expired/invalid token, or a home this caller can't see — fail soft,
      // no error detail leaked back to the client.
      res.status(200).json({ insights: [] });
      return;
    }

    const billsData = await billsRes.json();
    const bills = (billsData.items || []).map((b) => ({
      company: b.companyName || null,
      category: b.category || null,
      amount: typeof b.amount === 'number' ? b.amount : null,
      dueDate: b.dueDate || null,
      cleared: !!b.cleared,
      created: b.created || null,
    }));

    if (bills.length < MIN_BILLS_FOR_INSIGHTS) {
      // Too little history for a real pattern — say nothing rather than ask
      // Claude to speculate from a handful of records.
      res.status(200).json({ insights: [] });
      return;
    }

    const insights = await getInsightsFromClaude(apiKey, bills);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ insights });
  } catch (e) {
    res.status(200).json({ insights: [], error: String(e).slice(0, 200) });
  }
}
