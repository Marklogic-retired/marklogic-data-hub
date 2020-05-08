xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
hub-test:reset-hub();

xquery version "1.0-ml";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

xdmp:invoke-function(function() {
  for $filename in ("mapping-job1.json", "mastering-job1.json", "mastering-job2.json")
  return
    xdmp:document-insert(
      "/jobs/" || $filename,
      test:get-test-file($filename),
      xdmp:default-permissions(),
      ("Jobs", "Job")
    )
},
  <options xmlns="xdmp:eval">
    <database>{xdmp:database("data-hub-JOBS")}</database>
  </options>
)

