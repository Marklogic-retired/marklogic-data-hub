const test = require('/test/test-helper.xqy');
const lib = require('/test/suites/merging-json/lib/lib.xqy');
const merging = require('/com.marklogic.smart-mastering/merging.xqy');
const mergeImpl = require('/com.marklogic.smart-mastering/survivorship/merging/base.xqy');
const con = require('/com.marklogic.smart-mastering/constants.xqy');

/**
 * The purpose of this test is to ensure that arrays don't get converted to
 * objects when there is little or data.
 */

 // Using xdmp.toJSON().root so that we have the same type of JSON objects to
 // compare.
const small =
  xdmp.toJSON(
    {
      "options": {
        "matchOptions": "basic",
        "merging": [
          {
            "propertyName": "address",
            "algorithmRef": "standard",
            "maxValues": "1",
            "maxSources": "1",
            "sourceWeights": [{
              "source": { "name": "SOURCE2", "weight": "10" }
            },{
              "source": { "name": "SOURCE1", "weight": "5" }
            }]
          }
        ],
        "propertyDefs": {
          "properties": [
            { "namespace": "", "localname": "Address", "name": "address" }
          ]
        },
        "algorithms": {
          "custom": [
            {
              "name": "customThing",
              "function": "customThing",
              "at": "/custom-merge-xqy.xqy"
            }
          ]
        }
      }
    }
  ).root;

const xmlSmall = mergeImpl.optionsFromJson(small);
const actualSmall = mergeImpl.optionsToJson(xmlSmall);

const minimal =
  xdmp.toJSON(
    {
      "options": {
        "matchOptions": "basic",
        "propertyDefs": {
          "properties": [
            { "namespace": "", "localname": "Address", "name": "address" }
          ]
        }
      }
    }
  ).root;

const xmlMinimal = mergeImpl.optionsFromJson(minimal);
const actualMinimal = mergeImpl.optionsToJson(xmlMinimal);

[].concat(
  test.assertEqual(small, actualSmall),
  test.assertEqual(minimal, actualMinimal)
);
