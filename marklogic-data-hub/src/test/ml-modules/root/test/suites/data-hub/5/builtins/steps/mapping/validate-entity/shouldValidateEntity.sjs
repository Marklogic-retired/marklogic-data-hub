const test = require("/test/test-helper.xqy");
const entityValidationLib = require("/data-hub/5/builtins/steps/mapping/entity-services/entity-validation-lib.sjs");

function shouldValidate(validateEntityValue) {
  return entityValidationLib.shouldValidateEntity({
    validateEntity: validateEntityValue
  });
}

[
  test.assertTrue(shouldValidate("accept")),
  test.assertTrue(shouldValidate("ACCEPT")),
  test.assertTrue(shouldValidate("reject")),
  test.assertTrue(shouldValidate("REJECT")),
  test.assertFalse(shouldValidate(null)),
  test.assertFalse(shouldValidate(undefined)),
  test.assertFalse(shouldValidate(false)),
  test.assertFalse(shouldValidate("false")),
  test.assertFalse(shouldValidate(true)),
  test.assertFalse(shouldValidate("true"))
]
