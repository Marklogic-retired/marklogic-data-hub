xdmp:invoke-function(function() {
  xdmp:document-delete("/matching/test-schema.xsd")
}, map:entry("database", xdmp:schema-database()) => map:with("update","true"))