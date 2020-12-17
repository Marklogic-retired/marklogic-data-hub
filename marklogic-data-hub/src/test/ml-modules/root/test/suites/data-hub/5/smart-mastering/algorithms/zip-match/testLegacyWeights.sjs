const zipAlgorithm = require("/com.marklogic.smart-mastering/algorithms/zip.xqy");
const test = require("/test/test-helper.xqy");

const assertions = [];

const options = xdmp.toJSON({
    "targetEntityType": "http://example.org/Address-0.0.1/Address",
    // explicitly defining the data format here as JSON
    // normally this would be determined dynamically prior to reaching the match function
    "dataFormat": "json",
    "expand": [
        {
            "propertyName": "zip",
            "algorithmRef": "zip",
            "weight": "6",
            "zip": [
                {
                    "origin": 5,
                    "weight": 2
                },
                {
                    "origin": 9,
                    "weight": 4
                }
            ]
        }
    ]
}).root;

const matchRule = fn.head(options.xpath("/expand"));
const fiveDigitZip = xdmp.toJSON({"zip": "12345"}).xpath("zip");
const fiveDigitZipQuery = zipAlgorithm.zip(fiveDigitZip, matchRule, options);
const fiveDigitZipQueryValues = cts.jsonPropertyValueQueryValue(fiveDigitZipQuery).toArray();
const fiveDigitZipQueryWeight = cts.jsonPropertyValueQueryWeight(fiveDigitZipQuery);

const fiveDigitZipQueryDescription = xdmp.describe(fiveDigitZipQuery, xdmp.arrayValues([]), xdmp.arrayValues([]));

assertions.push(
    test.assertEqual(2, fiveDigitZipQueryValues.length, `The 5-digit query should return 2 values. Query: ${fiveDigitZipQueryDescription}`),
    test.assertTrue(fiveDigitZipQueryValues.some((val) => val === "12345"), `One 5-digit query value should be the 5-digit zip code. Query: ${fiveDigitZipQueryDescription}`),
    test.assertTrue(fiveDigitZipQueryValues.some((val) => val === "12345-*"), `One 5-digit query value should be a wildcard to match a 9-digit zip code. Query: ${fiveDigitZipQueryDescription}`),
    test.assertEqual(2, fiveDigitZipQueryWeight, `5-digit query weight should be 2. Query: ${fiveDigitZipQueryDescription}`)
);

const nineDigitZip = xdmp.toJSON({"zip": "12345-6789"}).xpath("zip");
const nineDigitZipQuery = zipAlgorithm.zip(nineDigitZip, matchRule, options);
const nineDigitZipQueryValues = cts.jsonPropertyValueQueryValue(nineDigitZipQuery).toArray();
const nineDigitZipQueryWeight = cts.jsonPropertyValueQueryWeight(nineDigitZipQuery);
const nineDigitZipQueryDescription = xdmp.describe(nineDigitZipQuery, xdmp.arrayValues([]), xdmp.arrayValues([]));

assertions.push(
    test.assertEqual(2, nineDigitZipQueryValues.length, `The 9-digit query should return 2 values. Query: ${nineDigitZipQueryDescription}`),
    test.assertTrue(nineDigitZipQueryValues.some((val) => val === "12345"), `One 9-digit query value should be the 5-digit zip code. Query: ${nineDigitZipQueryDescription}`),
    test.assertTrue(nineDigitZipQueryValues.some((val) => val === "12345-6789"), `One 9-digit query value should be the 9-digit zip code. Query: ${nineDigitZipQueryDescription}`),
    test.assertEqual(4, nineDigitZipQueryWeight, `9-digit query weight should be 4. Query: ${nineDigitZipQueryDescription}`)
);

assertions;
