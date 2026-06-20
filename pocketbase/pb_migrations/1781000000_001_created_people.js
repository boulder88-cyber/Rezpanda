/// <reference path="../pb_data/types.d.ts" />

// Creates the "people" collection.
//
// A person is someone a bill can belong to instead of (or alongside) a
// property — e.g. "Mom", whose bills the user manages on her behalf. This is
// the backing store for the "Belongs to → A person" option in bill review.
//
// Shape (kept deliberately small for v1):
//   • name    — the person's display name ("Mom", "Dad", "Unit B tenant")
//   • ownerId — the CasaCEO user who manages this person (text id, matching
//               the ownerId convention used by homes / service_companies)
//   • created / updated — autodates
//
// Ownership + access rules mirror homes and service_companies exactly: a user
// can only see and touch their own people records. Format copied from the
// working created_maintenance_tasks migration (plain-object fields inside
// new Collection({...}) — this is the form that creates collections cleanly
// on this PocketBase build).

migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != ''",
    "deleteRule": "ownerId = @request.auth.id",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3920016401",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "text5102994388",
        "name": "name",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text",
        "autogeneratePattern": "",
        "max": 0,
        "min": 0,
        "pattern": ""
      },
      {
        "hidden": false,
        "id": "text7740028365",
        "name": "ownerId",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text",
        "autogeneratePattern": "",
        "max": 0,
        "min": 0,
        "pattern": ""
      },
      {
        "hidden": false,
        "id": "autodate2611998812",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate4493771559",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_7010002003",
    "indexes": [],
    "listRule": "ownerId = @request.auth.id",
    "name": "people",
    "system": false,
    "type": "base",
    "updateRule": "ownerId = @request.auth.id",
    "viewRule": "ownerId = @request.auth.id"
  });

  try {
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("Collection name must be unique")) {
      console.log("Collection already exists, skipping");
      return;
    }
    throw e;
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("pbc_7010002003");
    return app.delete(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
});
