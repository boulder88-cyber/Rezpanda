/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("utility_companies");
  collection.fields.removeByName("phone");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("utility_companies");
  collection.fields.add(new TextField({
    name: "phone",
    required: false
  }));
  return app.save(collection);
})