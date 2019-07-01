xquery version "1.0-ml";

import module namespace lib = "http://marklogic.com/datahub/test" at "lib/lib.xqy";

(
  map:keys($lib:TEST-DATA),
  "/mappings/CustomerJSON-CustomerJSONMapping/CustomerJSON-CustomerJSONMapping-0.mapping.json",
  "/flows/CustomerMapping.flow.json",
  "/entities/Customer.entity.json"
) ! xdmp:document-delete(.),

xdmp:invoke-function(function() {
  try {
    xdmp:collection-delete("http://marklogic.com/provenance-services/record")
  } catch * {()},
  xdmp:collection-delete("Jobs")
}, map:entry("database", xdmp:database("data-hub-JOBS")));
