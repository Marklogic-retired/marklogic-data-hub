const test = require("/test/test-helper.xqy");
const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const entityValidationLib = mjsProxy.requireMjsModule("/data-hub/5/builtins/steps/mapping/entity-services/entity-validation-lib.mjs");

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
  test.assertFalse(shouldValidate("doNotValidate")),
  test.assertFalse(shouldValidate(false)),
  test.assertFalse(shouldValidate("false")),
  test.assertFalse(shouldValidate(true)),
  test.assertFalse(shouldValidate("true"))
]
