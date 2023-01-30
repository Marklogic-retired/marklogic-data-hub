const con = require("/com.marklogic.smart-mastering/constants.xqy");

const test = require("/test/test-helper.xqy");
const lib = require("lib/lib.xqy");

let uris = ["/nested/doc1.json", "/nested/doc2.json"];
let uriStr = uris.join('##');

// Merge the nested docs
let mergedDoc =
  fn.head(xdmp.xqueryEval(
    `
      import module namespace merging = "http://marklogic.com/smart-mastering/merging"
        at "/com.marklogic.smart-mastering/merging.xqy";
      import module namespace const = "http://marklogic.com/smart-mastering/constants"
        at "/com.marklogic.smart-mastering/constants.xqy";
      declare variable $uri-str as xs:string external;
      declare variable $uris as xs:string* := fn:tokenize($uri-str, "##");
      declare variable $options-name as xs:string external;

      let $options := merging:get-JSON-options($options-name)
      return
        merging:save-merge-models-by-uri(
          $uris,
          $options)
    `,
    {
      "uri-str": uriStr,
      "options-name": "nested-options"
    },
    {
      "isolation": "different-transaction",
      "update": "true"
    }
  ));

try {
    [].concat(
        test.assertEqual("another string", mergedDoc.envelope.instance.TopProperty.LowerProperty1.EvenLowerProperty.LowestProperty1.toString(), `Expected LowestProperty1 to have value 'another string'. Returned: ${JSON.stringify(mergedDoc.envelope.instance.TopProperty.LowerProperty1.EvenLowerProperty.LowestProperty1)}`),
        test.assertEqual("some string", mergedDoc.envelope.instance.TopProperty.LowerProperty1.EvenLowerProperty.LowestProperty2.toString(), `Expected LowestProperty2 to have value 'some string'. Returned: ${JSON.stringify(mergedDoc.envelope.instance.TopProperty.LowerProperty1.EvenLowerProperty.LowestProperty2)}`),
        test.assertEqual(2, mergedDoc.envelope.instance.TopProperty.LowerProperty1.EvenLowerProperty.LowestProperty3.length, `Expected LowestProperty3 to have 2 values. Returned: ${JSON.stringify(mergedDoc.envelope.instance.TopProperty.LowerProperty1.EvenLowerProperty.LowestProperty3)}`),
        test.assertEqual('another string 1', mergedDoc.envelope.instance.TopProperty.LowerProperty1.EvenLowerProperty.LowestProperty3[0].toString(), `Expected LowestProperty3 to have 'another string 1' as first value. Returned: ${JSON.stringify(mergedDoc.envelope.instance.TopProperty.LowerProperty1.EvenLowerProperty.LowestProperty3)}`),
        test.assertEqual('another string 2', mergedDoc.envelope.instance.TopProperty.LowerProperty1.EvenLowerProperty.LowestProperty3[1].toString(), `Expected LowestProperty3 to have 'another string 2' as second value. Returned: ${JSON.stringify(mergedDoc.envelope.instance.TopProperty.LowerProperty1.EvenLowerProperty.LowestProperty3)}`),
        test.assertEqual(123, mergedDoc.envelope.instance.TopProperty.EntityReference.PropValue.valueOf(), `Expected PropValue to have value 123. Returned: ${JSON.stringify(mergedDoc.envelope.instance.TopProperty.EntityReference)}`)
    )
} catch (e) {
    test.fail(`Unexpected missing values in merged document. Returned: ${JSON.stringify(mergedDoc)}. Exception: ${e.message}`);
}
