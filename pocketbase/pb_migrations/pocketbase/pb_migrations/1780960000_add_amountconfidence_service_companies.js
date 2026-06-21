/// <reference path="../pb_data/types.d.ts" />

// Adds an "amountConfidence" text field to service_companies.
// Stores the AI's self-graded confidence in the parsed amount: "high",
// "medium", or "low" (empty for manually-added bills and for older records
// created before this migration). The amount is the costliest field to parse
// wrong, so the review panel uses this to flag low-confidence amounts amber,
// pointing the human's attention at exactly the bills worth double-checking.
// The full reason text lives inside parsed_raw.amountReason; this top-level
// field exists so the frontend can style/filter without parsing the JSON blob.
// Uses the explicit TextField constructor (this PocketBase build rejects plain objects).

migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2488191257"); // service_companies

  collection.fields.add(new TextField({
    "name": "amountConfidence",
    "required": false,
    "presentable": false,
    "system": false,
    "hidden": false,
    "max": 0,
    "min": 0,
    "pattern": ""
  }));

  return app.save(collection);
}, (app) => {
  // ---- revert ----
  const collection = app.findCollectionByNameOrId("pbc_2488191257");
  collection.fields.removeByName("amountConfidence");
  return app.save(collection);
});
