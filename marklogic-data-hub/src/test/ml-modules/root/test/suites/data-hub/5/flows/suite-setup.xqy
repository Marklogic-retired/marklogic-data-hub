xquery version "1.0-ml";

import module namespace lib = "http://marklogic.com/datahub/test" at "lib/lib.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";

xdmp:invoke-function(function() {
  xdmp:document-insert(
    "/test/custom-null-step/main.sjs",
    test:get-test-file("nullStep.sjs"),
    (xdmp:default-permissions(),xdmp:permission("flow-operator-role","execute"),xdmp:permission("flow-developer-role","execute")),
    ()
  )
},
map:entry("database", xdmp:modules-database())
),
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
  "/flows/CustomerMapping.flow.json",
  test:get-test-file("CustomerMapping.flow.json"),
  xdmp:default-permissions(),
  "http://marklogic.com/data-hub/flow"
),

xdmp:document-insert(
  "/step-definitions/CustomerMapping.step.json",
  test:get-test-file("CustomerMapping.step.json"),
  xdmp:default-permissions(),
  "http://marklogic.com/data-hub/step-definition"
),

xdmp:document-insert(
  "/flows/CustomerNull.flow.json",
  test:get-test-file("CustomerNull.flow.json"),
  xdmp:default-permissions(),
  "http://marklogic.com/data-hub/flow"
),

xdmp:document-insert(
  "/step-definitions/CustomerNull.step.json",
  test:get-test-file("CustomerNull.step.json"),
  xdmp:default-permissions(),
  "http://marklogic.com/data-hub/step-definition"
),

xdmp:document-insert(
  "/entities/Customer.entity.json",
  test:get-test-file("Customer.entity.json"),
  xdmp:default-permissions(),
  "http://marklogic.com/entity-services/models"
)
