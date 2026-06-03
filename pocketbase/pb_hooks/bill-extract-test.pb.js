/// <reference path="../pb_data/types.d.ts" />

// TEST HOOK — extracts AND saves a bill to service_companies. No login (test only).
// Test by putting bill text in the URL after ?text= , for example:
//   https://rezpanda-production.up.railway.app/casaceo/extract-test?text=Comcast%20Amount%20due%20$89.99%20Due%2007/01/2026
// The saved bill is owned by the hard-coded TEST_OWNER_ID below (test only).
// Delete this file once verified; the real version gets the owner from email/login.

routerAdd("GET", "/casaceo/extract-test", (e) => {
  const CATEGORIES = ["Electric", "Water", "Internet", "Insurance", "Auto", "Other"];
  const TEST_OWNER_ID = "v41fdvkhgnvpjrt";

  const apiKey = $os.getenv("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return e.json(500, { error: "ANTHROPIC_API_KEY not found in environment" });
  }

  let billText = e.request.url.query().get("text") || "";
  if (!billText.trim()) {
    billText = "Xcel Energy\nAccount: 1234567\nAmount due: $142.18\nDue date: 06/15/2026";
  }

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
    return e.json(502, { error: "API request failed", detail: String(err) });
  }

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
    return e.json(500, { error: "Could not parse model output", detail: String(err) });
  }

  // ---- SAVE to service_companies ----
  let savedId = null;
  try {
    const collection = $app.findCollectionByNameOrId("service_companies");
    const record = new Record(collection);
    record.set("companyName", parsed.companyName || "Unknown");
    record.set("amount", typeof parsed.amount === "number" ? parsed.amount : null);
    record.set("dueDate", parsed.dueDate || "");
    record.set("category", CATEGORIES.indexOf(parsed.category) !== -1 ? parsed.category : "Other");
    record.set("paymentLink", "");
    record.set("status", "pending_review");
    record.set("source", "email");
    record.set("parsed_raw", parsed);
    record.set("ownerId", TEST_OWNER_ID);
    $app.save(record);
    savedId = record.id;
  } catch (err) {
    return e.json(500, { error: "Failed to save record", detail: String(err), parsed: parsed });
  }

  return e.json(200, { ok: true, saved: true, savedId: savedId, parsed: parsed });
});
