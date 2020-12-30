const lib = require("lib/reduceTestLib.sjs");
const smTest = require("/test/suites/data-hub/5/smart-mastering/lib/masteringTestLib.sjs");

const convertedOptions = {
  "targetEntityType": "ReducePerson",
  "matchRulesets": [{
    "name": "LastName - Exact",
    "weight": 10,
    "matchRules": [{
      "entityPropertyPath": "lastName",
      "matchType": "exact",
      "options": {}
    }]
  }, {
    "name": "Street - Reduce",
    "weight": 5,
    "reduce": true,
    "matchRules": [{
      "entityPropertyPath": ["street"],
      "matchType": "exact",
      "options": {}
    }]
  }],
  "thresholds": [{
    "thresholdName": "Match",
    "action": "merge",
    "score": 7
  }, {
    "thresholdName": "Possible Match",
    "action": "notify",
    "score": 3
  }]
};

const matchSummary = smTest.match("ReducePerson",
  {
    "firstName": "Jack",
    "lastName": "Turner",
    "street": "123 Main St"
  },
  convertedOptions
);

lib.verifyReduceMatchSummary(matchSummary);
