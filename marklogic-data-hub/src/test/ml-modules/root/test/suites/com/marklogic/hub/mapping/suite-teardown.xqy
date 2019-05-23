xquery version "1.0-ml";

import module namespace lib = "http://marklogic.com/datahub/test" at "lib/lib.xqy";

(
  map:keys($lib:TEST-DATA),
  "/mappings/CustomerJSON-CustomerJSONMapping/CustomerJSON-CustomerJSONMapping-0.mapping.json",
  "/mappings/CustomerXML-CustomerXMLMapping/CustomerXML-CustomerXMLMapping-0.mapping.json",
  "/entities/Customer.entity.json"
) ! xdmp:document-delete(.)
