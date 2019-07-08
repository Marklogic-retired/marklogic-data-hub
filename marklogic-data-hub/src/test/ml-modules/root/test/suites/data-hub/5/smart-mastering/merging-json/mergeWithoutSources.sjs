
const con = require("/com.marklogic.smart-mastering/constants.xqy");

const test = require("/test/test-helper.xqy");
const lib = require("lib/lib.xqy");

let uris = ["/unsourced/doc1.json", "/unsourced/doc2.json"];
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

      let $options as element() := merging:get-options($options-name, $const:FORMAT-XML)
      return
        merging:save-merge-models-by-uri(
          $uris,
          $options)
    `,
    {
      "uri-str": uriStr,
      "options-name": lib['OPTIONS-NAME']
    },
    {
      "isolation": "different-transaction"
    }
  ));

let personName = mergedDoc.envelope.instance.MDM.Person.PersonType.PersonName.PersonNameType;

[].concat(
  test.assertEqual("Billy", personName.PersonGivenName.toString()),
  test.assertEqual("Smith", personName.PersonSurName.toString())
);
