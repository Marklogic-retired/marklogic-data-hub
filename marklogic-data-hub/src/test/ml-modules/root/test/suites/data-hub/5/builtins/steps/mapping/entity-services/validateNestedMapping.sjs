const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

function invalidProperty() {
  let mapping = {
    targetEntityType: "http://marklogic.com/data-hub/example/Person-1.0.0/Person",
    properties: {
      id: {
        sourcedFrom: "concat(id,"
      },
      name: {
        sourcedFrom: "concat(someName,",
        targetEntityType: "#/definitions/Name",
        properties: {
          first: {
            sourcedFrom: "theFirstName",
            targetEntityType: "#/definitions/FirstName",
            properties: {
              value: {
                sourcedFrom: "concat(theValue"
              },
              prefix: {
                sourcedFrom: "thePrefix"
              }
            }
          },
          middle : {
            sourcedFrom : "theMiddle"
          },
          last: {
            sourcedFrom: "concat(lastName, "
          }
        }
      },
      nickname : {
        sourcedFrom : "theNickname"
      }
    }
  };

  let result = esMappingLib.validateMapping(mapping);

  return [
    test.assertEqual("http://marklogic.com/data-hub/example/Person-1.0.0/Person", result.targetEntityType),

    test.assertTrue(result.properties.id.hasOwnProperty("errorMessage")),
    test.assertEqual("Invalid XPath expression: 'concat(id,'. Cause: Unexpected character.", result.properties.id.errorMessage),
    test.assertFalse(result.properties.nickname.hasOwnProperty("errorMessage"), "The nickname expression is valid"),

    test.assertEqual("concat(someName,", result.properties.name.sourcedFrom),
    test.assertEqual("Invalid XPath expression: 'concat(someName,'. Cause: Unexpected character.", result.properties.name.errorMessage),
    test.assertEqual("http://marklogic.com/data-hub/example/Person-1.0.0/Name", result.properties.name.targetEntityType),

    test.assertEqual("Invalid XPath expression: 'concat(lastName, '. Cause: Unexpected character.", result.properties.name.properties.last.errorMessage),
    test.assertFalse(result.properties.name.properties.middle.hasOwnProperty("errorMessage"), "The name/middle expression is valid"),

    test.assertEqual("http://marklogic.com/data-hub/example/Person-1.0.0/FirstName", result.properties.name.properties.first.targetEntityType),
    test.assertEqual("Invalid XPath expression: 'concat(theValue'. Cause: Missing right parenthesis.", result.properties.name.properties.first.properties.value.errorMessage),
    test.assertFalse(result.properties.name.properties.first.properties.prefix.hasOwnProperty("errorMessage"), "The name/first/prefix expression is valid")
  ];
}

invalidProperty();

