xquery version "1.0-ml";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";

xdmp:document-insert(
  "/entities/CustomerType.entity.json",
  test:get-test-file("entities/CustomerType.entity.json"),
  xdmp:default-permissions(),
  "http://marklogic.com/entity-services/models"
),
xdmp:document-insert(
  "/entities/ItemType.entity.json",
  test:get-test-file("entities/ItemType.entity.json"),
  xdmp:default-permissions(),
  "http://marklogic.com/entity-services/models"
),
xdmp:document-insert(
  "/entities/OrderType.entity.json",
  test:get-test-file("entities/OrderType.entity.json"),
  xdmp:default-permissions(),
  "http://marklogic.com/entity-services/models"
);
xquery version "1.0-ml";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";


xdmp:document-insert(
  "/mappings/CustomersMapping/CustomersMapping-1.mapping.json",
  test:get-test-file("mappings/CustomersMapping/CustomersMapping-1.mapping.json"),
  xdmp:default-permissions(),
  "http://marklogic.com/data-hub/mappings"
),
xdmp:document-insert(
  "/mappings/OrdersMapping/OrdersMapping-1.mapping.json",
  test:get-test-file("mappings/OrdersMapping/OrdersMapping-1.mapping.json"),
  xdmp:default-permissions(),
  "http://marklogic.com/data-hub/mappings"
),
xdmp:document-insert(
  "/mappings/ItemsMapping/ItemsMapping-1.mapping.json",
  test:get-test-file("mappings/ItemsMapping/ItemsMapping-1.mapping.json"),
  xdmp:default-permissions(),
  "http://marklogic.com/data-hub/mappings"
);
