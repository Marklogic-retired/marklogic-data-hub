import smTest from "/test/suites/data-hub/5/smart-mastering/lib/masteringTestLib.mjs";
import lib from "./lib/reduceTestLib.mjs";

const legacyOptions = {
  "targetEntity": "ReducePerson",
  "matchOptions": {
    "dataFormat": "json",
    "propertyDefs": {
      "property": [
        {
          "localname": "lastName",
          "name": "lastName"
        },
        {
          "localname": "street",
          "name": "street"
        }
      ]
    },
    "algorithms": {
      "algorithm": [
        {
          "name": "standard-reduction",
          "function": "standard-reduction"
        }
      ]
    },
    "scoring": {
      "add": [
        {
          "propertyName": "lastName",
          "weight": "10"
        }
      ],
      "reduce": [{
        "allMatch": {
          "property": ["street"]
        },
        "algorithmRef": "standard-reduction",
        "weight": "5"
      }]
    },
    "thresholds": {
      "threshold": [
        {
          "above": "7",
          "label": "Match",
          "action": "merge"
        },
        {
          "above": "3",
          "label": "Possible Match",
          "action": "notify"
        }
      ]
    }
  }
};

const matchSummary = smTest.match("ReducePerson",
  {
    "firstName": "Jack",
    "lastName": "Turner",
    "street": "123 Main St"
  },
  legacyOptions
);

lib.verifyReduceMatchSummary(matchSummary);
