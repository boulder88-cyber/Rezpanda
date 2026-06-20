/// <reference path="../pb_data/types.d.ts" />

// Adds structured address fields to the `homes` collection:
//   street · city · state (2-letter) · zip (5-digit)
// The existing single `address` field is LEFT IN PLACE — display code across
// the app reads home.address directly, and the form now auto-composes it from
// the parts on save. So this migration is purely additive and non-breaking.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("homes");

  // street — address line 1 (freeform; "123 Main St", "456 Oak Ave Apt 4B")
  collection.fields.add(new TextField({
    name: "street",
    required: false,
    max: 200,
  }));

  // city — freeform
  collection.fields.add(new TextField({
    name: "city",
    required: false,
    max: 100,
  }));

  // state — stored as 2-letter code ("GA"); the form supplies a dropdown so
  // the value is always clean/normalized.
  collection.fields.add(new TextField({
    name: "state",
    required: false,
    max: 2,
  }));

  // zip — 5-digit US ZIP; pattern enforces exactly five digits when present.
  collection.fields.add(new TextField({
    name: "zip",
    required: false,
    pattern: "^\\d{5}$",
    max: 5,
  }));

  return app.save(collection);
}, (app) => {
  // Down-migration: remove the four fields, restoring the original shape.
  const collection = app.findCollectionByNameOrId("homes");

  ["street", "city", "state", "zip"].forEach((fieldName) => {
    const field = collection.fields.getByName(fieldName);
    if (field) collection.fields.removeById(field.id);
  });

  return app.save(collection);
});
