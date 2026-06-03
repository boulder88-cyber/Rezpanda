/// <reference path="../pb_data/types.d.ts" />

// Adds email-ingestion + due-date + category support to service_companies.
// Uses explicit Field constructors (this PocketBase build rejects plain objects in fields.add()).

migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2488191257"); // service_companies

  // 1. Make paymentLink optional.
  const paymentLink = collection.fields.getByName("paymentLink");
  if (paymentLink) {
    paymentLink.required = false;
  }

  // 2. Add new fields using proper Field constructors.
  collection.fields.add(new DateField({
    "name": "dueDate",
    "required": false,
    "presentable": false,
    "system": false,
    "hidden": false
  }));

  collection.fields.add(new SelectField({
    "name": "category",
    "required": false,
    "presentable": false,
    "system": false,
    "hidden": false,
    "maxSelect": 1,
    "values": ["Electric", "Water", "Internet", "Insurance", "Auto", "Other"]
  }));

  collection.fields.add(new SelectField({
    "name": "status",
    "required": false,
    "presentable": false,
    "system": false,
    "hidden": false,
    "maxSelect": 1,
    "values": ["pending_review", "confirmed"]
  }));

  collection.fields.add(new SelectField({
    "name": "source",
    "required": false,
    "presentable": false,
    "system": false,
    "hidden": false,
    "maxSelect": 1,
    "values": ["email", "manual", "directory"]
  }));

  collection.fields.add(new JSONField({
    "name": "parsed_raw",
    "required": false,
    "presentable": false,
    "system": false,
    "hidden": false,
    "maxSize": 0
  }));

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
