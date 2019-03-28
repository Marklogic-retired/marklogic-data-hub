export const mergingData = {
  "matchOptions": "matchOptions",
  "propertyDefs": {
    "properties": [
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
    ],
    "namespaces": { }
  },
  "algorithms": {
    "stdAlgorithm": {
      "namespaces": { },
      "timestamp": {
        "path": "/path/to/timestamp"
      }
    },
    "custom": [],
    "collections": {
      "onMerge": {
        "add": {
          "collection": [
            "coll-to-add"
          ]
        },
        "remove": {
          "collection": [
            "coll-to-remove"
          ]
        }
      },
      "onNoMatch": {
        "set": {
          "collection": [
            "coll-to-set"
          ]
        }      },
      "onNotification": {
        "add": {
          "collection": [
            "coll3",
            "coll4"
          ]
        }
      },
      "onArchive": {
        "remove": {
          "collection": [
            "arch-coll"
          ]
        }
      }
    }
  },
  "mergeStrategies": [
    {
      "name": "CRM Source",
      "algorithmRef": "standard",
      "sourceWeights": [
        {
          "source": {
            "name": "CRM",
            "weight": "3"
          }
        },
        {
          "source": {
            "name": "ERP",
            "weight": "1"
          }
        }
      ]
    },
    {
      "name": "Length-Weight",
      "algorithmRef": "standard",
      "length": {
        "weight": "12"
      }
    }
  ],
  "merging": [
    {
      "propertyName": "ssn",
      "maxValues": "1",
      "length": {
        "weight": "5"
      }
    },
    {
      "propertyName": "firstName",
      "maxValues": "2",
      "sourceWeights": [
        {
          "source": {
            "name": "Oracle",
            "weight": "20"
          }
        }
      ]
    },
    {
      "propertyName": "state",
      "strategy": "CRM Source"
    },
    {
      "propertyName": "postal",
      "strategy": "Length-Weight"
    },
    {
      "default": "true",
      "maxValues": "10",
      "maxSources": "5"
    }
  ],
  "tripleMerge": { }
};
