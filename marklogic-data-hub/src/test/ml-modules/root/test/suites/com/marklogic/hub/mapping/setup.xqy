xquery version "1.0-ml";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";

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
)
