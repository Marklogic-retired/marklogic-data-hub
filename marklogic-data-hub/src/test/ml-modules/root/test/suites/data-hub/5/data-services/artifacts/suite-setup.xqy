xdmp:collection-delete("http://marklogic.com/entity-services/models");

xquery version "1.0-ml";

import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

xdmp:invoke-function(function() {
for $filename in ("entities/TestEntity-hasMappingConfig.entity.json", "entities/TestEntity-NoMappingConfig.entity.json")
return
xdmp:document-insert(
"/entities/" || $filename,
test:get-test-file($filename),
xdmp:default-permissions(),
("http://marklogic.com/entity-services/models")
)
},
<options xmlns="xdmp:eval">
<database>{xdmp:database("data-hub-STAGING")}</database>
</options>
),
hub-test:load-artifacts($test:__CALLER_FILE__);
