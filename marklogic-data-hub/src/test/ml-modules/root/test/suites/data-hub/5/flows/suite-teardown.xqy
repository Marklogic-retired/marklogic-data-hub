xquery version "1.0-ml";

xdmp:invoke-function(function() {
  xdmp:document-delete(
    "/test/custom-null-step/main.sjs"
  ),
    xdmp:document-delete(
    "/test/custom-by-value-step/main.sjs"
  )
},
  map:entry("database", xdmp:modules-database())
)
