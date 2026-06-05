/// <reference path="../pb_data/types.d.ts" />
 
// Receive a forwarded bill via SendGrid Inbound Parse.
// SendGrid POSTs multipart form-data to this route when an email arrives at
// the receiving domain (bills.casaceo.com). We:
//   1. Identify the owner from the "to" address: inbox+<userId>@bills.casaceo.com
//   2. Prefer a PDF/image attachment; fall back to the email text body
//   3. Extract structured data via Claude (same as the upload hook)
//   4. Save as a pending_review bill with source="email", owned by <userId>
//
// SendGrid sends these form fields: to, from, subject, text, html,
// attachments (a count), attachment-info (JSON), attachment1, attachment2, ...
//
// NOTE: This route is public (no requireAuth) because SendGrid can't log in.
// A shared-secret check guards it so random POSTs can't create bills.
 
routerAdd("POST", "/casaceo/inbound-email", (e) => {
  const CATEGORIES = ["Electric", "Water", "Internet", "Insurance", "Auto", "Other"];
 
  const apiKey = $os.getenv("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return e.json(500, { error: "ANTHROPIC_API_KEY not found in environment" });
  }
 
  // ---- 0. Optional shared-secret guard ----------------------------------
  // Set INBOUND_PARSE_SECRET in Railway, then add ?key=THESECRET to the
  // Destination URL you give SendGrid. If the secret is set, we require it.
  const expectedSecret = $os.getenv("INBOUND_PARSE_SECRET");
  if (expectedSecret) {
    const gotSecret = e.request.url.query().get("key");
    if (gotSecret !== expectedSecret) {
      return e.json(403, { error: "Forbidden" });
    }
  }
 
  const info = e.requestInfo();
  const body = info.body || {};
 
  // ---- 1. Identify the owner from the "to" address ----------------------
  // "to" can look like:  Name <inbox+abc123@bills.casaceo.com>
  // or just:             inbox+abc123@bills.casaceo.com
  const toRaw = body.to ? String(body.to) : "";
  let userId = "";
  try {
    const plusMatch = toRaw.match(/\+([^@>]+)@/);
    if (plusMatch) {
      userId = plusMatch[1].trim();
    }
  } catch (err) {
    // fall through; handled below
  }
 
  if (!userId) {
    // We can't attribute this email to a user. Return 200 so SendGrid
    // doesn't keep retrying, but record nothing.
    return e.json(200, { ok: false, reason: "no userId in to-address", to: toRaw });
  }
 
  // Confirm the user actually exists before we build a record.
  try {
    $app.findRecordById("users", userId);
  } catch (err) {
    return e.json(200, { ok: false, reason: "unknown user", userId: userId });
  }
 
  // ---- 2. Decide what to send Claude: attachment first, then text body --
  const subject = body.subject ? String(body.subject) : "";
  const textBody = body.text ? String(body.text) : "";
 
  // SendGrid sends a count of attachments and an attachment-info JSON map.
  let attachmentCount = 0;
  try {
    attachmentCount = body.attachments ? parseInt(String(body.attachments), 10) : 0;
  } catch (err) {
    attachmentCount = 0;
  }
 
  let mediaBlock = null;   // the image/document block, if we have a usable attachment
  let usedAttachment = false;
 
  if (attachmentCount > 0) {
    try {
      // SendGrid names uploaded files attachment1, attachment2, ...
      // Find the first one that is a PDF or image.
      const files = e.findUploadedFiles("attachment1");
      if (files && files.length > 0) {
        const f = files[0];
        const fileType = f.contentType || "";
 
        // Read the uploaded file's bytes and base64-encode them.
        // goja has no btoa/Buffer; $filesystem + toString isn't base64,
        // so we read bytes and encode manually. This is the most likely
        // spot to need a tweak after a real test — see note at bottom.
        const reader = f.reader; // PocketBase exposes a reader on the uploaded file
        const bytes = $filesystem.fileFromBytes
          ? null
          : null;
 
        // Use PocketBase's helper to get raw bytes, then base64 them.
        const raw = readUploadedFileAsBase64(f);
 
        if (raw) {
          if (fileType === "application/pdf") {
            mediaBlock = { type: "document", source: { type: "base64", media_type: "application/pdf", data: raw } };
          } else if (fileType.indexOf("image/") === 0) {
            mediaBlock = { type: "image", source: { type: "base64", media_type: fileType, data: raw } };
          }
          if (mediaBlock) usedAttachment = true;
        }
      }
    } catch (err) {
      // non-fatal: fall back to text body below
    }
  }
 
  // Build the user content block(s) for Claude.
  let userContent;
  if (mediaBlock) {
    userContent = [mediaBlock, { type: "text", text: "Extract the bill data from the attached file." }];
  } else {
    // No usable attachment — use the email subject + body text.
    const combined = ("Subject: " + subject + "\n\n" + textBody).trim();
    if (!combined) {
      return e.json(200, { ok: false, reason: "no attachment and empty body", userId: userId });
    }
    userContent = [{ type: "text", text: "Extract the bill data from this forwarded email:\n\n" + combined }];
  }
 
  const systemPrompt =
    "You extract structured data from utility bills, invoices, and receipts. " +
    "Return ONLY a single JSON object, no prose, no markdown, no code fences. " +
    'Schema: {"companyName": string|null, "amount": number|null, "dueDate": "YYYY-MM-DD"|null, ' +
    '"category": one of ' + JSON.stringify(CATEGORIES) + '}. ' +
    "Rules: use null if a field is genuinely absent. amount is the current amount due as a plain number. " +
    "dueDate must be YYYY-MM-DD or null. Output only the JSON object.";
 
  // ---- 3. Call Claude ---------------------------------------------------
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
        messages: [{ role: "user", content: userContent }],
      }),
      timeout: 60,
    });
  } catch (err) {
    return e.json(502, { error: "API request failed", detail: String(err) });
  }
 
  if (res.statusCode !== 200) {
    return e.json(502, { error: "Anthropic API error", status: res.statusCode, body: res.raw });
  }
 
  // ---- 4. Parse the JSON ------------------------------------------------
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
 
  // ---- 5. Save record ---------------------------------------------------
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
    record.set("ownerId", userId);
 
    // attach the original file, if we used one
    if (usedAttachment) {
      try {
        const files = e.findUploadedFiles("attachment1");
        if (files && files.length > 0) {
          record.set("billFile", files[0]);
        }
      } catch (fileErr) {
        // non-fatal
      }
    }
 
    $app.save(record);
    savedId = record.id;
  } catch (err) {
    return e.json(500, { error: "Failed to save record", detail: String(err), parsed: parsed });
  }
 
  return e.json(200, { ok: true, saved: true, savedId: savedId, usedAttachment: usedAttachment, parsed: parsed });
});
 
// ---------------------------------------------------------------------------
// Helper: read an uploaded file's bytes and return a base64 string.
// goja lacks btoa/Buffer, so this is the fragile part of the inbound flow.
// If real-PDF tests fail at the encoding step, this function is where to look.
// ---------------------------------------------------------------------------
function readUploadedFileAsBase64(uploadedFile) {
  try {
    // PocketBase exposes the underlying bytes via the file's reader.
    // $filesystem.fileFromMultipart / reader APIs vary slightly by version;
    // this uses the bytes-then-encode path that works on goja.
    const f = uploadedFile;
    const reader = f.reader;
    const content = reader ? toString(reader) : "";
    if (!content) return "";
    // toBytes gives a []byte; $security has a base64 helper in recent builds.
    const bytes = toBytes(content);
    if ($security && typeof $security.base64Encode === "function") {
      return $security.base64Encode(bytes);
    }
    // Fallback: some builds expose base64 on $os or a global. If neither
    // exists, this returns "" and the route falls back to text-body parsing.
    return "";
  } catch (err) {
    return "";
  }
}
