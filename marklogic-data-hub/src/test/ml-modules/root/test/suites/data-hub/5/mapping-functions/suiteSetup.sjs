declareUpdate();

const permissions = [xdmp.permission("data-hub-common", "read"), xdmp.permission("data-hub-common", "update")];

xdmp.documentInsert(
  "/test/dictionary.json",
  {
    "aString": "hello world",
    "aNumber": 3,
    "aBoolean": true,
    "anotherBoolean": false,
    "anObject": {"hello": "world"}
  },
  permissions
);

xdmp.documentInsert(
  "/test/invalidDictionary.json",
  [],
  permissions
);
