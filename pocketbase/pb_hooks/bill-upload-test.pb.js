/// <reference path="../pb_data/types.d.ts" />

// Upload a bill (hybrid): browser sends base64 (for Claude) + the original file (for storage).
// Extracts via Claude, stores the original in billFile, saves as pending_review.
// Owner = logged-in user. POST multipart form to /casaceo/upload-test with fields:
//   bill       = the original file (image/pdf)
//   billBase64 = base64 string of the file
//   billType   = media type, e.g. "image/png" or "application/pdf"

routerAdd("POST", "/casaceo/upload-test", (e) => {
  const CATEGORIES = ["Electric", "Water", "Internet", "Insurance", "Auto", "Other"];

  const apiKey = $os.getenv("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return e.json(500, { error: "ANTHROPIC_API_KEY not found in environment" });
  }

  // 1. Read the base64 + type from the form (sent by the browser).
  const info = e.requestInfo();
  const body = info.body || {};
  const base64 = body.billBase64 ? String(body.billBase64) : "";
  const billType = body.billType ? String(body.billType) : "image/jpeg";
  if (!base64) {
    return e.json(400, { error: "Missing billBase64" });
  }

  // 2. Build the image-or-pdf block for Claude.
  let mediaBlock;
  if (billType === "application/pdf") {
    mediaBlock = { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } };
  } else {
    mediaBlock = { type: "image", source: { type: "base64", media_type: billType, data: base64 } };
  }

  const systemPrompt =
    "You extract structured data from utility bills, invoices, and receipts. " +
    "Return ONLY a single JSON object, no prose, no markdown, no code fences. " +
    'Schema: {"companyName": string|null, "amount": number|null, "dueDate": "YYYY-MM-DD"|null, ' +
    '"category": one of ' + JSON.stringify(CATEGORIES) + '}. ' +
    "Rules: use null if a field is genuinely absent. amount is the current amount due as a plain number. " +
    "dueDate must be YYYY-MM-DD or null. Output only the JSON object.";

  // 3. Call Claude.
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
        messages: [{ role: "user", content: [mediaBlock, { type: "text", text: "Extract the bill data from the attached file." }] }],
      }),
      timeout: 60,
    });
  } catch (err) {
    return e.json(502, { error: "API request failed", detail: String(err) });
  }

  if (res.statusCode !== 200) {
    return e.json(502, { error: "Anthropic API error", status: res.statusCode, body: res.raw });
  }

  // 4. Parse the JSON.
  let parsed;
  try {
    const data = res.json;
    const rawText = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
    const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    parsed = JSON.parse(cleaned.slice(start, end + 1));
  } catch (err) {
    return e.json(500, { error: "Could not parse model output", detail: String(err) });
  }

  // 5. Save record (with the original file attached, if provided).
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
    record.set("ownerId", e.auth.id);

    // attach the original uploaded file, if present
    try {
      const files = e.findUploadedFiles("bill");
      if (files && files.length > 0) {
        record.set("billFile", files[0]);
      }
    } catch (fileErr) {
      // non-fatal: if file attach fails, still save the extracted data
    }

    $app.save(record);
    savedId = record.id;
  } catch (err) {
    return e.json(500, { error: "Failed to save record", detail: String(err), parsed: parsed });
  }

  return e.json(200, { ok: true, saved: true, savedId: savedId, parsed: parsed });
}, $apis.requireAuth());
