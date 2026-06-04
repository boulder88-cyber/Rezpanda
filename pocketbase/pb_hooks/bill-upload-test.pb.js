/// <reference path="../pb_data/types.d.ts" />

// DIAGNOSTIC: receives an uploaded file and reports what's available on it.
// No Claude call, no save — just tells us the file API shape. Safe to run.
// POST a multipart form with field name "bill" to /casaceo/upload-test

routerAdd("POST", "/casaceo/upload-test", (e) => {
  try {
    const files = e.findUploadedFiles("bill");
    if (!files || files.length === 0) {
      return e.json(400, { error: "No file under field 'bill'", info: "findUploadedFiles returned empty" });
    }
    const f = files[0];
    // Report what we can see about the file object, without assuming methods.
    const report = {
      originalName: f.originalName,
      size: f.size,
      hasReader: typeof f.reader === "function",
      keys: Object.keys(f),
    };
    return e.json(200, { ok: true, fileCount: files.length, report: report });
  } catch (err) {
    return e.json(500, { error: "diagnostic failed", detail: String(err) });
  }
});
