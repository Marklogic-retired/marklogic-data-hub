xquery version "1.0-ml";

import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

xdmp:invoke-function(function() {
  xdmp:collection-delete("http://marklogic.com/entity-services/models")
},
  <options xmlns="xdmp:eval">
    <database>{xdmp:database("data-hub-STAGING")}</database>
  </options>
),
hub-test:delete-artifacts($test:__CALLER_FILE__);
