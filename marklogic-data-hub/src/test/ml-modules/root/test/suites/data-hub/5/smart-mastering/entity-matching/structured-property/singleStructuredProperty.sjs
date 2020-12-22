const smTest = require("/test/suites/data-hub/5/smart-mastering/lib/masteringTestLib.sjs");

const inputProperties = {
  "billing": {
    "Address": {
      "city": "Osprey",
      "state": "Florida"
    }
  }
};

const options = {
  "targetEntityType": "http://example.org/Customer-0.0.1/Customer",
  "matchRulesets": [
    {
      "name": "billingCityState",
      "weight": 5,
      "matchRules": [
        {
          "entityPropertyPath": "billing.city",
          "matchType": "exact"
        },
        {
          "entityPropertyPath": "billing.state",
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

// Not expecting a match on OspreyGeorgia or MiamiFlorida; those only have one matching property on their billing address
smTest.assertMatchExists(matchSummary, "/content/billingOspreyFlorida.json");
