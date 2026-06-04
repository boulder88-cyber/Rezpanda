/// <reference path="../pb_data/types.d.ts" />

// Adds a "billFile" file field to service_companies so the ORIGINAL uploaded
// bill (image or PDF) is stored alongside the extracted data.
// Uses the explicit FileField constructor (this PocketBase build rejects plain objects).

migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2488191257"); // service_companies

  collection.fields.add(new FileField({
    "name": "billFile",
    "required": false,
    "presentable": false,
    "system": false,
    "hidden": false,
    "maxSelect": 1,
    "maxSize": 10485760,
    "mimeTypes": [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf"
    ]
  }));

  return app.save(collection);
}, (app) => {
  // ---- revert ----
  const collection = app.findCollectionByNameOrId("pbc_2488191257");
  collection.fields.removeByName("billFile");
  return app.save(collection);
});
