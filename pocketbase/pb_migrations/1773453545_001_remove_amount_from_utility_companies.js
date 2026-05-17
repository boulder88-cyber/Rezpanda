/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("utility_companies");
  collection.fields.removeByName("amount");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("utility_companies");
  collection.fields.add(new NumberField({
    name: "amount",
    required: false
  }));
  return app.save(collection);
})