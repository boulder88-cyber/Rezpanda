/// <reference path="../pb_data/types.d.ts" />

// Adds an optional "ownerPersonId" text field to homes.
//
// Lets a property carry a link to a person (a people record) — e.g. a home the
// user manages on someone else's behalf ("Mom's house"). With this set, bills
// landing against that property can be understood as belonging to that person
// without each bill needing its own personId. Optional and empty by default;
// most homes the user owns themselves won't set it.
//
// Stored as a plain text id (the people record's id), matching the ownerId /
// homeId text-id convention used across the schema. Empty for every existing
// home. Uses the explicit TextField constructor (this PocketBase build rejects
// plain objects on the fields.add path).

migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_9721319599"); // homes

  collection.fields.add(new TextField({
    "name": "ownerPersonId",
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
  const collection = app.findCollectionByNameOrId("pbc_9721319599");
  collection.fields.removeByName("ownerPersonId");
  return app.save(collection);
});
