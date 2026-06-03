/// <reference path="../pb_data/types.d.ts" />

// Adds email-ingestion + due-date + category support to service_companies.
//
// Changes (up):
//   - dueDate     : date   (optional)   -- fixes page bug; page reads c.dueDate
//   - category    : select (optional)   -- stored category; mirrors page keyword buckets
//   - status      : select (optional)   -- review/confirm state for ingested bills
//   - source      : select (optional)   -- capture channel (email/manual/directory)
//   - parsed_raw  : json   (optional)   -- raw extraction output for the correction loop
//   - paymentLink : required -> optional -- forwarded bills rarely contain a pay URL
//
// Down reverts every change.

migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2488191257"); // service_companies

  // 1. Make paymentLink optional (a forwarded utility bill rarely has a pay URL).
  const paymentLink = collection.fields.getByName("paymentLink");
  if (paymentLink) {
    paymentLink.required = false;
  }

  // 2. Add new fields. add() replaces by name if it already exists, so this is idempotent.
  collection.fields.add(
    {
      "name": "dueDate",
      "type": "date",
      "required": false,
      "presentable": false,
      "system": false,
      "hidden": false,
      "min": "",
      "max": ""
    },
    {
      "name": "category",
      "type": "select",
      "required": false,
      "presentable": false,
      "system": false,
      "hidden": false,
      "maxSelect": 1,
      "values": ["Electric", "Water", "Internet", "Insurance", "Auto", "Other"]
    },
    {
      "name": "status",
      "type": "select",
      "required": false,
      "presentable": false,
      "system": false,
      "hidden": false,
      "maxSelect": 1,
      "values": ["pending_review", "confirmed"]
    },
    {
      "name": "source",
      "type": "select",
      "required": false,
      "presentable": false,
      "system": false,
      "hidden": false,
      "maxSelect": 1,
      "values": ["email", "manual", "directory"]
    },
    {
      "name": "parsed_raw",
      "type": "json",
      "required": false,
      "presentable": false,
      "system": false,
      "hidden": false,
      "maxSize": 0
    }
  );

  return app.save(collection);
}, (app) => {
  // ---- revert ----
  const collection = app.findCollectionByNameOrId("pbc_2488191257");

  const paymentLink = collection.fields.getByName("paymentLink");
  if (paymentLink) {
    paymentLink.required = true;
  }

  collection.fields.removeByName("dueDate");
  collection.fields.removeByName("category");
  collection.fields.removeByName("status");
  collection.fields.removeByName("source");
  collection.fields.removeByName("parsed_raw");

  return app.save(collection);
});
