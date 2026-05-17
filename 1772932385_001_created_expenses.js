/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("utility_companies");

  const existing = collection.fields.getByName("payment_portal_url");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("payment_portal_url"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "payment_portal_url",
    required: true
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("utility_companies");
  collection.fields.removeByName("payment_portal_url");
  return app.save(collection);
})