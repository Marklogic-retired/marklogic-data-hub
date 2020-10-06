//GET
export const getQueriesResponse = [
  {
    "savedQuery": {
      "id": "edf7b2d1-62d2-481d-9bb0-2145b023ca5e",
      "name": "Order",
      "description": "saved order query",
      "query": {
        "searchText": "10253",
        "entityTypeIds": [
          "Order"
        ],
        "selectedFacets": {
          "orderDate": {
            "dataType": "date",
            "rangeValues": {
              "lowerBound": "1994-03-01",
              "upperBound": "2020-05-01"
            }
          },
          "city": {
            "dataType": "xs:string",
            "stringValues": [
              "Rio de Janeiro"
            ]
          }
        }
      },
      "propertiesToDisplay": [
        "facet1",
        "EntityTypeProperty1"
      ],
      "owner": "dh-dev",
      "systemMetadata": {
        "createdBy": "dh-dev",
        "createdDateTime": "2020-04-20T16:37:19.603846-07:00",
        "lastUpdatedBy": "dh-dev",
        "lastUpdatedDateTime": "2020-04-20T16:37:19.603846-07:00"
      }
    }
  }];

//save new query
export const saveQueryResponse =
  {
    "savedQuery": {
      "id": "",
      "name": "Order query",
      "description": "saved order query",
      "query": {
        "searchText": "10253",
        "entityTypeIds": [
          "Order"
        ],
        "selectedFacets": {
          "orderDate": {
            "dataType": "date",
            "rangeValues": {
              "lowerBound": "1994-03-01",
              "upperBound": "2020-05-01"
            }
          },
          "city": {
            "dataType": "xs:string",
            "stringValues": [
              "Rio de Janeiro"
            ]
          }
        }
      },
      "propertiesToDisplay": [
        "facet1",
        "EntityTypeProperty1"
      ]
    }
  };

//PUT
export const putQueryResponse =
  {
    "savedQuery": {
      "id": "edf7b2d1-62d2-481d-9bb0-2145b023ca5e",
      "name": "Order query",
      "description": "saved order query",
      "query": {
        "searchText": "10253",
        "entityTypeIds": [
          "Order"
        ],
        "selectedFacets": {
          "orderDate": {
            "dataType": "date",
            "rangeValues": {
              "lowerBound": "1994-03-01",
              "upperBound": "2020-05-01"
            }
          },
          "city": {
            "dataType": "xs:string",
            "stringValues": [
              "Rio de Janeiro"
            ]
          }
        }
      },
      "propertiesToDisplay": [
        "facet1",
        "EntityTypeProperty1"
      ],
      "owner": "dh-dev",
      "systemMetadata": {
        "createdBy": "dh-dev",
        "createdDateTime": "2020-04-20T16:37:19.603846-07:00",
        "lastUpdatedBy": "dh-dev",
        "lastUpdatedDateTime": "2020-04-20T16:37:19.603846-07:00"
      }
    }
  };

//DELETE
export const deleteQueryResponse = {};

//Get query by Id
export const fetchQueryByResponse = {

  "savedQuery": {
    "id": "bf62c825-9365-4d3b-80f1-2cfeca376cb6",
    "name": "t2",
    "description": "t2",
    "query": {
      "searchText": "",
      "entityTypeIds": [
        "Customer"
      ],
      "selectedFacets": {
        "firstname": {
          "dataType": "xs:string",
          "stringValues": [
            "Kelley"
          ]
        }
      }
    },
    "propertiesToDisplay": [
      ""
    ],
    "owner": "dh-dev",
    "systemMetadata": {
      "createdBy": "dh-dev",
      "createdDateTime": "2020-04-23T13:05:31.368912-07:00",
      "lastUpdatedBy": "dh-dev",
      "lastUpdatedDateTime": "2020-04-23T13:05:31.368912-07:00"
    }
  }

};

export const duplicateQueryNameErrorResponse = {
  "code": 400,
  "message": "You already have a saved query with a name of edit new query",
  "suggestion": "Resend the request in the correct format.",
  "details": "You already have a saved query with a name of edit new query"
};