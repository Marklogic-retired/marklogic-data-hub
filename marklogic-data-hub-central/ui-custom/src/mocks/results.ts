export const searchResults = {
  "snippet-format": "snippet",
  "total": 3, // Filled in dynamically
  "start": 1, // Filled in dynamically
  "page-length": 10, // Filled in dynamically
  "results": [], // Filled in dynamically
  "facets": {
    "Entities": {
      "type": "xs:string",
      "facetValues": [
        {
          "name": "Person",
          "count": 7853548,
          "value": "Person"
        },
        {
          "name": "Place",
          "count": 2566911,
          "value": "Place"
        },
        {
          "name": "Thing",
          "count": 4890720,
          "value": "Thing"
        }
      ]
    },
    "Sources": {
      "type": "xs:string",
      "facetValues": [
        {
          "name": "New York Times",
          "count": 1422088,
          "value": "New York Times"
        },
        {
          "name": "USA Today",
          "count": 568221,
          "value": "Place"
        },
        {
          "name": "Chicago Tribune",
          "count": 43276,
          "value": "Chicago Tribune"
        },
        {
          "name": "Wall Street Journal",
          "count": 12983,
          "value": "Wall Street Journal"
        },
        {
          "name": "Los Angeles Times",
          "count": 11554,
          "value": "Los Angeles Times"
        },
        {
          "name": "Washington Post",
          "count": 8306,
          "value": "Washington Post"
        }
      ]
    },
    "CreatedOn": {
      "type": "xs:date",
      "facetValues": []
    },
    "Status": {
      "type": "xs:string",
      "facetValues": [
        {
          "name": "Active",
          "count": 13028854,
          "value": "Active"
        },
        {
          "name": "Inactive",
          "count": 2053269,
          "value": "Inactive"
        }
      ]
    }
  },
  "qtext": "entityType:\"Person\" hideHubArtifacts:true",
  "metrics": {
    "query-resolution-time": "PT0.055947S",
    "facet-resolution-time": "PT0.029286S",
    "snippet-resolution-time": "PT0.005214S",
    "total-time": "PT0.093637S"
  },
  "selectedPropertyDefinitions": [],
  "entityPropertyDefinitions": []
};
