xquery version "1.0-ml";

import module namespace entityTrigger = "http://marklogic.com/data-hub/entity-trigger"
  at "/data-hub/4/triggers/entity-model-validate-trigger-lib.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

let $model-with-null-ref-uri := "/content/modelWithNullRef.json"
return (
  (: Test validating draft with null $ref :)
  try {
    entityTrigger:entity-validate($model-with-null-ref-uri),
    test:assert-true(fn:true(), "A null $ref should not fail to validate model.")
  } catch * {
    test:assert-false(fn:true(), "A null $ref should not fail to validate model.")
  }
)