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
            "owner": "admin",
            "systemMetadata": {
                "createdBy": "admin",
                "createdDateTime": "2020-04-20T16:37:19.603846-07:00",
                "lastUpdatedBy": "admin",
                "lastUpdatedDateTime": "2020-04-20T16:37:19.603846-07:00"
            }
        }
    }]

    //save query 
    export const query = 
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
        }

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
                "owner": "admin",
                "systemMetadata": {
                    "createdBy": "admin",
                    "createdDateTime": "2020-04-20T16:37:19.603846-07:00",
                    "lastUpdatedBy": "admin",
                    "lastUpdatedDateTime": "2020-04-20T16:37:19.603846-07:00"
                }
            }
        };

    //DELETE
    export const deleteQueryResponse = {};
