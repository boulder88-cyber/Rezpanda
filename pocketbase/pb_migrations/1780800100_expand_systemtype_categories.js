/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_8627211072");

  const field = collection.fields.find((f) => f.name === "systemType");
  if (!field) {
    console.log("Field 'systemType' not found, skipping");
    return;
  }

  field.values = [
    "HVAC",
    "Plumbing",
    "Electrical",
    "Roofing",
    "Landscaping",
    "Pest Control",
    "Appliances",
    "Pool/Spa",
    "Security",
    "Gutters",
    "Painting",
    "Foundation",
    "Insulation",
    "Windows",
    "Doors",
    "General"
  ];

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_8627211072");
  const field = collection.fields.find((f) => f.name === "systemType");
  if (field) {
    field.values = [
      "HVAC",
      "plumbing",
      "roof",
      "appliances",
      "electrical",
      "foundation",
      "insulation",
      "windows",
      "doors",
      "other"
    ];
    return app.save(collection);
  }
})
