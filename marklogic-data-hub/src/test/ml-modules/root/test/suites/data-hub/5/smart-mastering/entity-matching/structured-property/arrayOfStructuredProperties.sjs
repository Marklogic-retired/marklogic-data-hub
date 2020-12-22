const smTest = require("/test/suites/data-hub/5/smart-mastering/lib/masteringTestLib.sjs");

const inputProperties = {
  "shipping": [
    {
      "Address": {
        "city": "Osprey",
        "state": "Florida"
      }
    }
  ]
};

const options = {
  "targetEntityType": "http://example.org/Customer-0.0.1/Customer",
  "matchRulesets": [
    {
      "name": "shippingCityState",
      "weight": 5,
      "matchRules": [
        {
          "entityPropertyPath": "shipping.city",
          "matchType": "exact"
        },
        {
          "entityPropertyPath": "shipping.state",
          "matchType": "exact"
        }
      ]
    }
  ],
  "thresholds": [
    {
      "thresholdName": "mergeThreshold",
      "action": "merge",
      "score": 5
    }
  ]
};

const matchSummary = smTest.match("Customer", inputProperties, options);

// Should not match on shippingSeparateOspreyFlorida because the occurrences of Osprey and Florida
// are in separate shipping addresses
smTest.assertMatchExists(matchSummary, "/content/shippingOspreyFlorida.json");
