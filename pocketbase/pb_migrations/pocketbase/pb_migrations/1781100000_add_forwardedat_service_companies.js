/// <reference path="../pb_data/types.d.ts" />

// Adds a "forwardedAt" text field to service_companies.
// This stores an audit timestamp: the moment CasaCEO's inbound hook saved a
// bill that arrived by email (ISO 8601, e.g. "2026-06-20T13:24:05.123Z").
// It's a server-set "received at" value — not pulled from email headers
// (which can be missing or forged), so it's a trustworthy record of when the
// bill actually entered the system. Empty for manually-added bills and for
// older records created before this migration.
// Uses the explicit TextField constructor (this PocketBase build rejects plain objects).

migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2488191257"); // service_companies

  collection.fields.add(new TextField({
    "name": "forwardedAt",
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
  collection.fields.removeByName("forwardedAt");
  return app.save(collection);
});
