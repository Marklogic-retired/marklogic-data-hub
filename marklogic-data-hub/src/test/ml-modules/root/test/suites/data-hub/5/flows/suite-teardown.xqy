xquery version "1.0-ml";

import module namespace lib = "http://marklogic.com/datahub/test" at "lib/lib.xqy";

xdmp:invoke-function(function() {
  xdmp:document-delete(
    "/test/custom-null-step/main.sjs"
  )
},
  map:entry("database", xdmp:modules-database())
),
(
  map:keys($lib:TEST-DATA),
  "/mappings/CustomerJSON-CustomerJSONMapping/CustomerJSON-CustomerJSONMapping-0.mapping.json",
  "/flows/CustomerMapping.flow.json",
  "/entities/Customer.entity.json"
) ! xdmp:document-delete(.)
