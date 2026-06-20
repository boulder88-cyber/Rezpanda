/// <reference path="../pb_data/types.d.ts" />

// Adds an optional "personId" text field to service_companies.
//
// A bill belongs to EITHER a property (homeId) or a person (personId). Most
// bills are property-bound, so personId is empty for them — it's only set when
// the user assigns a bill to someone they manage bills for ("Mom"). Stored as
// a plain text id (the people record's id), matching the homeId convention.
//
// Empty for every existing bill and for all property-bound bills going forward.
// Uses the explicit TextField constructor (this PocketBase build rejects plain
// objects on the fields.add path).

migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2488191257"); // service_companies

  collection.fields.add(new TextField({
    "name": "personId",
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
  collection.fields.removeByName("personId");
  return app.save(collection);
});
