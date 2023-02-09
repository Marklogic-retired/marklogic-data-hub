const mergeOptions = require('/com.marklogic.smart-mastering/survivorship/merging/options.xqy');
const test = require("/test/test-helper.xqy");

const assertions = [];

const compiledOptions = mergeOptions.compileMergeOptions({
  "targetEntityType": "http://example.org/Test-0.0.1/Test",
  "mergeRules": [
    {"documentXPath": "//Test/title"}
  ]
});

const mergeRuleInfo = fn.head(compiledOptions.mergeRulesInfo);
assertions.push(
  test.assertEqual( "//Test/title", mergeRuleInfo.propertyName)
);

assertions;

