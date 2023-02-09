xquery version "1.0-ml";

declare variable $permissions := (xdmp:permission("data-hub-common", "read", "object"), xdmp:permission("data-hub-common", "update", "object"));

xdmp:document-insert(
  "/test/dictionary.json",
  xdmp:unquote('{
      "aString": "hello world",
      "aNumber": 3,
      "aBoolean": true,
      "anotherBoolean": false,
      "anObject": {"hello": "world"}
  }'),
  map:entry("permissions", $permissions)
),

xdmp:document-insert(
  "/test/invalidDictionary.json",
  xdmp:unquote('[]'),
  map:entry("permissions", $permissions)
);