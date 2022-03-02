const smUtil = require("/com.marklogic.smart-mastering/impl/util.xqy");
const test = require("/test/test-helper.xqy");

const assertions = [];

function verifyResults(results, expectedTitle) {
  assertions.push(
    test.assertEqual(1, fn.count(results), `There should only be one title returned. Results: ${xdmp.describe(results)}`),
    test.assertEqual(expectedTitle, fn.string(results), `Title should be '${expectedTitle}'. Results: ${xdmp.describe(results)}`)
  );
}

const propertyToExtractionFunctions = smUtil.propertiesToValuesFunctions(null, null, "http://example.org/TestTitle-0.0.1/TestTitle", true, null);

const jsonDoc = xdmp.toJSON({
  "envelope": {
    "instance": {
      "info": {
        "title": "TestTitle"
      },
      "TestTitle": {
        "title": "jsonTitle"
      }
    }
  }
});

const jsonResults = xdmp.apply(propertyToExtractionFunctions.title, jsonDoc);
verifyResults(jsonResults, "jsonTitle");

const xmlDoc = fn.head(xdmp.unquote(`<envelope xmlns="http://marklogic.com/entity-services">
    <instance>
        <info>
            <title>TestTitle</title>
        </info>
        <TestTitle xmlns="">
            <title>xmlTitle</title>
        </TestTitle>
    </instance>
    <attachments/>
</envelope>`));

const xmlResults = xdmp.apply(propertyToExtractionFunctions.title, xmlDoc);
verifyResults(xmlResults, "xmlTitle");


assertions;