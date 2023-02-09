xquery version "1.0-ml";

xdmp:invoke-function(function() {
  xdmp:document-delete(
    "/test/custom-null-step/main.mjs"
  ),
    xdmp:document-delete(
    "/test/custom-by-value-step/main.mjs"
  )
},
  map:entry("database", xdmp:modules-database())
)
