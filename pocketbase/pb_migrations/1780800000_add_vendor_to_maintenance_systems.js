/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_8627211072");

  // Skip if the field already exists (safe to re-run)
  if (collection.fields.find((f) => f.name === "vendor")) {
    console.log("Field 'vendor' already exists, skipping");
    return;
  }

  collection.fields.add(new TextField({
    "hidden": false,
    "id": "text1947300018",
    "name": "vendor",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "autogeneratePattern": "",
    "max": 0,
    "min": 0,
    "pattern": ""
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_8627211072");
  const field = collection.fields.find((f) => f.name === "vendor");
  if (field) {
    collection.fields.removeById(field.id);
    return app.save(collection);
  }
})
