xquery version "1.0-ml";

import module namespace lib = "http://marklogic.com/datahub/test" at "lib/lib.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";

xdmp:document-insert(
  "/entities/Customer.entity.json",
  test:get-test-file("Customer.entity.json"),
  xdmp:default-permissions(),
  "http://marklogic.com/entity-services/models"
);
xquery version "1.0-ml";

import module namespace lib = "http://marklogic.com/datahub/test" at "lib/lib.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";

for $uri in map:keys($lib:TEST-DATA)
let $doc := test:get-test-file(map:get($lib:TEST-DATA, $uri))
return
xdmp:document-insert(
$uri,
$doc,
xdmp:default-permissions(),
"test-data"
),

xdmp:document-insert(
  "/mappings/CustomerJSON-CustomerJSONMapping/CustomerJSON-CustomerJSONMapping-0.mapping.json",
  test:get-test-file("CustomerJSON-CustomerJSONMapping-0.mapping.json"),
  xdmp:default-permissions(),
  "http://marklogic.com/data-hub/mappings"
),

xdmp:document-insert(
  "/mappings/CustomerXML-CustomerXMLMapping/CustomerXML-CustomerXMLMapping-0.mapping.json",
  test:get-test-file("CustomerXML-CustomerXMLMapping-0.mapping.json"),
  xdmp:default-permissions(),
  "http://marklogic.com/data-hub/mappings"
);
