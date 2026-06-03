/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/hello", (e) => {
  return e.json(200, { message: "routing works" });
});

routerAdd("GET", "/api/hello", (e) => {
  return e.json(200, { message: "api routing works" });
});
