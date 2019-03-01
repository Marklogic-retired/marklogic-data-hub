export const matchingData = {
  "propertyDefs": {
    "property": [
      {
        "namespace": "",
        "localname": "ssn",
        "name": "ssn"
      },
      {
        "namespace": "",
        "localname": "firstName",
        "name": "firstName"
      },
      {
        "namespace": "",
        "localname": "lastName",
        "name": "lastName"
      },
      {
        "namespace": "",
        "localname": "addr",
        "name": "addr"
      },
      {
        "namespace": "",
        "localname": "city",
        "name": "city"
      },
      {
        "namespace": "",
        "localname": "state",
        "name": "state"
      },
      {
        "namespace": "",
        "localname": "postal",
        "name": "postal"
      }
    ]
  },
  "algorithms": {
    "algorithm": [
      {
        "name": "standard-reduction",
        "function": "standard-reduction"
      },
      {
        "name": "double-metaphone",
        "at": "/com.marklogic.smart-mastering/algorithms/double-metaphone.xqy",
        "function": "double-metaphone"
      },
      {
        "name": "thesaurus",
        "at": "/com.marklogic.smart-mastering/algorithms/thesaurus.xqy",
        "function": "thesaurus"
      },
      {
        "name": "zip-match",
        "at": "/com.marklogic.smart-mastering/algorithms/zip.xqy",
        "function": "zip-match"
      },
      {
        "name": "customOption",
        "at": "/directory/customOption.sjs",
        "function": "customOption"
      }
    ]
  },
  "collections": {
    "content": [
      "mdm-content"
    ]
  },
  "scoring": {
    "add": [
      {
        "propertyName": "ssn",
        "weight": "10"
      },
      {
        "propertyName": "postal",
        "weight": "5"
      }
    ],
    "expand": [
      {
        "propertyName": "firstName",
        "algorithmRef": "thesaurus",
        "weight": "5",
        "thesaurus": "/directory/thesaurus.xml",
        "filter": ""
      },
      {
        "propertyName": "lastName",
        "algorithmRef": "double-metaphone",
        "weight": "2",
        "dictionary": "/directory/dictionary.xml",
        "distanceThreshold": "30",
        "collation": "http://marklogic.com/collation/codepoint"
      },
      {
        "propertyName": "state",
        "algorithmRef": "customOption",
        "weight": "1"
      },
      {
        "propertyName": "postal",
        "algorithmRef": "zip-match",
        "zip": [
          { "origin": 5, "weight": 3 },
          { "origin": 9, "weight": 2 }
        ]
      }
    ],
    "reduce": [
      {
        "algorithmRef": "standard-reduction",
        "weight": "4",
        "allMatch": {
          "property": [
            "lastName",
            "addr"
          ]
        }
      }
    ]
  },
  "actions": {
    "action": [
      {
        "name": "customAction",
        "at": "/directory/customAction.sjs",
        "function": "customAction"
      }
    ]
  },
  "thresholds": {
    "threshold": [
      {
        "above": "20",
        "label": "Definite Match",
        "action": "merge"
      },
      {
        "above": "10",
        "label": "Likely Match",
        "action": "notify"
      },
      {
        "above": "7",
        "label": "Custom Match",
        "action": "customAction"
      }
    ]
  },
  "tuning": {
    "maxScan": "200"
  }
};
