/// <reference path="../pb_data/types.d.ts" />

// Adds a "senderAddress" text field to service_companies.
// This stores the raw "from" address of an inbound email bill (e.g.
// "billing@comcast.com" or "Jane Doe <jane@gmail.com>"). It powers the
// biller-connect feature: a bill that arrives FROM the biller's own domain
// means the user has pointed that utility straight at CasaCEO (connected);
// a bill forwarded from a consumer domain (gmail, etc.) is not yet connected.
// Empty for manually-added bills and for older records created before this.
// Uses the explicit TextField constructor (this PocketBase build rejects plain objects).

migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2488191257"); // service_companies

  collection.fields.add(new TextField({
    "name": "senderAddress",
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
  collection.fields.removeByName("senderAddress");
  return app.save(collection);
});
