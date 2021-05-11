(:
Uses the Data Hub test helper library to prepare the staging, final, and job databases before each test module is run.
If you need this functionality instead at the suite level, just remove the code below and modify the generated
suite-setup.xqy file.
If you do not need this functionality, it is safe to delete the code below and/or this module.
:)

import module namespace dhmut = "http://marklogic.com/data-hub/marklogic-unit-test"
  at "/data-hub/public/test/hub-test-helper.xqy";

dhmut:prepare-databases()
