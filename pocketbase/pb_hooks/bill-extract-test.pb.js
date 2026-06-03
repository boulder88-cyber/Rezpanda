/// <reference path="../pb_data/types.d.ts" />

// TEST HOOK — extraction only, no database writes, no login required.
// Open this link in a browser to run it:
//   https://rezpanda-production.up.railway.app/casaceo/extract-test
// Delete this file once extraction is verified.

routerAdd("GET", "/casaceo/extract-test", (e) => {
  const CATEGORIES = ["Electric", "Water", "Internet", "Insurance", "Auto", "Other"];

  const apiKey = $os.getenv("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return e.json(500, { error: "ANTHROPIC_API_KEY not found in environment" });
  }

  const billText =
    "Xcel Energy\n" +
    "Account: 1234567\n" +
    "Amount due: $142.18\n" +
    "Due date: 06/15/2026";

  const systemPrompt =
    "You extract structured data from utility bills, invoices, and receipts. " +
    "Return ONLY a single JSON object, no prose, no markdown, no code fences. " +
    'Schema: {"companyName": string|null, "amount": number|null, "dueDate": "YYYY-MM-DD"|null, ' +
    '"category": one of ' + JSON.stringify(CATEGORIES) + '}. ' +
    "Rules: use null if a field is genuinely absent. amount is the current amount due as a plain number. " +
    "dueDate must be YYYY-MM-DD or null. Output only the JSON object.";

  let res;
  try {
    res = $http.send({
      url: "https://api.anthropic.com/v1/messages",
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: "user", content: "Bill content:\n\n" + billText }],
      }),
      timeout: 30,
    });
  } catch (err) {
    console.log("EXTRACT-TEST request failed:", String(err));
    return e.json(502, { error: "API request failed", detail: String(err) });
  }

  console.log("EXTRACT-TEST status:", res.statusCode);
  console.log("EXTRACT-TEST raw response:", res.raw);

  if (res.statusCode !== 200) {
    return e.json(502, { error: "Anthropic API error", status: res.statusCode, body: res.raw });
  }

  let parsed;
  try {
    const data = res.json;
    const rawText = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    parsed = JSON.parse(cleaned.slice(start, end + 1));
  } catch (err) {
    console.log("EXTRACT-TEST parse failed:", String(err));
    return e.json(500, { error: "Could not parse model output", detail: String(err) });
  }

  console.log("EXTRACT-TEST parsed:", JSON.stringify(parsed));
  return e.json(200, { ok: true, parsed: parsed });
});
