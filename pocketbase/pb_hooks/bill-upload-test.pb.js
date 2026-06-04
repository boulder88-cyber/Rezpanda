/// <reference path="../pb_data/types.d.ts" />

// PHASE: photo/PDF upload — TEST hook. Accepts an uploaded file (image or PDF),
// extracts the bill via Claude, saves as pending_review. No login (test only).
// Owned by the hard-coded TEST_OWNER_ID. Delete/lock down after verifying.
// Test endpoint (POST, multipart form, field name "bill"): /casaceo/upload-test

routerAdd("POST", "/casaceo/upload-test", (e) => {
  const CATEGORIES = ["Electric", "Water", "Internet", "Insurance", "Auto", "Other"];
  const TEST_OWNER_ID = "v41fdvkhgnvpjrt";

  const apiKey = $os.getenv("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return e.json(500, { error: "ANTHROPIC_API_KEY not found in environment" });
  }

  // 1. Read the uploaded file from the multipart form (field name "bill").
  let fileBytes, filename;
  try {
    const files = e.findUploadedFiles("bill");
    if (!files || files.length === 0) {
      return e.json(400, { error: "No file uploaded under field name 'bill'" });
    }
    const f = files[0];
    filename = f.originalName || "upload";
    // Read the file's bytes.
    const reader = f.reader();
    const bytes = toBytes(reader); // helper below
    fileBytes = bytes;
  } catch (err) {
    return e.json(500, { error: "Could not read uploaded file", detail: String(err) });
  }

  // 2. Base64-encode and decide image vs pdf from the filename extension.
  const base64 = bytesToBase64(fileBytes);
  const lower = (filename || "").toLowerCase();
  let mediaBlock;
  if (lower.endsWith(".pdf")) {
    mediaBlock = {
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: base64 },
    };
  } else {
    let mt = "image/jpeg";
    if (lower.endsWith(".png")) mt = "image/png";
    else if (lower.endsWith(".webp")) mt = "image/webp";
    else if (lower.endsWith(".gif")) mt = "image/gif";
    mediaBlock = {
      type: "image",
      source: { type: "base64", media_type: mt, data: base64 },
    };
  }

  const systemPrompt =
    "You extract structured data from utility bills, invoices, and receipts. " +
    "Return ONLY a single JSON object, no prose, no markdown, no code fences. " +
    'Schema: {"companyName": string|null, "amount": number|null, "dueDate": "YYYY-MM-DD"|null, ' +
    '"category": one of ' + JSON.stringify(CATEGORIES) + '}. ' +
    "Rules: use null if a field is genuinely absent. amount is the current amount due as a plain number. " +
    "dueDate must be YYYY-MM-DD or null. Output only the JSON object.";

  // 3. Call Claude with the file.
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

  // 4. Parse the JSON out of the response.
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

  // 5. Save as pending_review.
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

  return e.json(200, { ok: true, saved: true, savedId: savedId, filename: filename, parsed: parsed });
});

// ---- helpers ----
function toBytes(reader) {
  // Reads all bytes from a file reader into a byte array.
  return readerToBytes(reader);
}
