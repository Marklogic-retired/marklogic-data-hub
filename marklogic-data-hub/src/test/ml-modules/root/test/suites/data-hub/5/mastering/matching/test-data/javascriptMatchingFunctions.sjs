'use strict';
const test = require('/test/test-helper.xqy');


function quickStartMatchProperties(
  values,
  matchingRule,
  matchingStep
) {
  test.assertTrue(fn.exists(matchingRule.propertyName), `QuickStart property function should use JSON QuickStart options. Options: ${xdmp.toJsonString(matchingRule)}`);
  test.assertEqual("custom-js", matchingRule.algorithmRef, `QuickStart property function should use JSON QuickStart options. Options: ${xdmp.toJsonString(matchingRule)}`);
  test.assertTrue(fn.exists(matchingStep), `QuickStart property function should use JSON QuickStart options. Options: ${xdmp.toJsonString(matchingStep)}`);
  return cts.wordQuery(`QuickStart Match: ${matchingRule.propertyName}`);
}

function hubCentralMatchProperties(
  values,
  matchingRule,
  matchingStep
) {
  test.assertTrue(fn.exists(matchingRule.entityPropertyPath), `Hub Central property function should use JSON Hub Central options. Options: ${xdmp.toJsonString(matchingRule)}`);
  test.assertTrue(fn.exists(matchingStep), `Hub Central property function should use JSON Hub Central options. Options: ${xdmp.toJsonString(matchingStep)}`);
  return cts.wordQuery(`Hub Central Match: ${matchingRule.entityPropertyPath}`);
}

module.exports = {
  quickStartMatchProperties,
  hubCentralMatchProperties
};