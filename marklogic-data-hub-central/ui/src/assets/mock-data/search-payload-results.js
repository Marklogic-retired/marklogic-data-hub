const searchPayloadResults = [
  {
    "index": 1,
    "uri": "/Users/ban/Documents/Projects/dhf-files/store-data/customers/715d4384-b51c-4cd7-b897-579be97e25f3.json",
    "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/customers/715d4384-b51c-4cd7-b897-579be97e25f3.json\")",
    "score": 0,
    "confidence": 0,
    "fitness": 0,
    "href": "/v1/documents?uri=%2FUsers%2Fban%2FDocuments%2FProjects%2Fdhf-files%2Fstore-data%2Fcustomers%2F715d4384-b51c-4cd7-b897-579be97e25f3.json",
    "mimetype": "application/json",
    "format": "json",
    "matches": [
      {
        "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/customers/715d4384-b51c-4cd7-b897-579be97e25f3.json\")/object-node()",
        "match-text": [
          "Ingest 2019-10-02T12:11:36.479997-07:00 admin /Users/ban/Documents/Projects/dhf-files/store-data/customers/customers.csv 876 Marco SMITH M 68636 Todd Squares Suite 177 South Kimberlyview, Florida..."
        ]
      }
    ],
    "extracted": {
      "kind": "array",
      "content": [
        {
          "headers": {
            "sources": [
              {
                "name": "Ingest"
              }
            ],
            "createdOn": "2019-10-02T12:11:36.479997-07:00",
            "createdBy": "admin",
            "createdUsingFile": "/Users/ban/Documents/Projects/dhf-files/store-data/customers/customers.csv"
          }
        },
        {
          "Customer": {
            "id": "876",
            "first_name": "Marco",
            "last_name": "SMITH",
            "gender": "M",
            "billing_address": "68636 Todd Squares Suite 177 South Kimberlyview, Florida 29597",
            "shipping_address": "68636 Todd Squares Suite 177 South Kimberlyview, Florida 29597",
            "credit_score": "713",
            "sales_region": "Florida",
            "activity_tier": "1.0"
          }
        }
      ]
    }
  },
  {
    "index": 2,
    "uri": "/Users/ban/Documents/Projects/dhf-files/store-data/products/games/92a95902-ee18-49b1-bb16-6c4320b02da5.json",
    "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/products/games/92a95902-ee18-49b1-bb16-6c4320b02da5.json\")",
    "score": 0,
    "confidence": 0,
    "fitness": 0,
    "href": "/v1/documents?uri=%2FUsers%2Fban%2FDocuments%2FProjects%2Fdhf-files%2Fstore-data%2Fproducts%2Fgames%2F92a95902-ee18-49b1-bb16-6c4320b02da5.json",
    "mimetype": "application/json",
    "format": "json",
    "matches": [
      {
        "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/products/games/92a95902-ee18-49b1-bb16-6c4320b02da5.json\")/object-node()",
        "match-text": [
          "Ingest 2019-10-02T12:11:37.037324-07:00 admin /Users/ban/Documents/Projects/dhf-files/store-data/products/games/board_games.csv 1000204 122231313553 african tail 2–4 Board Game|Strategic thought 2..."
        ]
      }
    ],
    "extracted": {
      "kind": "array",
      "content": [
        {
          "headers": {
            "sources": [
              {
                "name": "Ingest"
              }
            ],
            "createdOn": "2019-10-02T12:11:37.037324-07:00",
            "createdBy": "admin",
            "createdUsingFile": "/Users/ban/Documents/Projects/dhf-files/store-data/products/games/board_games.csv"
          }
        },
        {
          "Product": {
            "id": "1000204",
            "sku": "122231313553",
            "title": "african tail",
            "players": "2–4",
            "category": "Board Game|Strategic thought",
            "popularity_tier": "2",
            "playing_time": "60–90 minutes",
            "probability_accessories": "0.75"
          }
        }
      ]
    }
  },
  {
    "index": 3,
    "uri": "/Users/ban/Documents/Projects/dhf-files/store-data/customers/8856bf54-099a-4243-aa17-9d8c63e90ea8.json",
    "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/customers/8856bf54-099a-4243-aa17-9d8c63e90ea8.json\")",
    "score": 0,
    "confidence": 0,
    "fitness": 0,
    "href": "/v1/documents?uri=%2FUsers%2Fban%2FDocuments%2FProjects%2Fdhf-files%2Fstore-data%2Fcustomers%2F8856bf54-099a-4243-aa17-9d8c63e90ea8.json",
    "mimetype": "application/json",
    "format": "json",
    "matches": [
      {
        "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/customers/8856bf54-099a-4243-aa17-9d8c63e90ea8.json\")/object-node()",
        "match-text": [
          "Ingest 2019-10-02T12:11:35.318739-07:00 admin /Users/ban/Documents/Projects/dhf-files/store-data/customers/customers.csv 209 Hudson DILLON M 33224 Greer Ports Apt. 263 Lake Angelica, Oregon 96096..."
        ]
      }
    ],
    "extracted": {
      "kind": "array",
      "content": [
        {
          "headers": {
            "sources": [
              {
                "name": "Ingest"
              }
            ],
            "createdOn": "2019-10-02T12:11:35.318739-07:00",
            "createdBy": "admin",
            "createdUsingFile": "/Users/ban/Documents/Projects/dhf-files/store-data/customers/customers.csv"
          }
        },
        {
          "Customer": {
            "id": "209",
            "first_name": "Hudson",
            "last_name": "DILLON",
            "gender": "M",
            "billing_address": "33224 Greer Ports Apt. 263 Lake Angelica, Oregon 96096",
            "shipping_address": "33224 Greer Ports Apt. 263 Lake Angelica, Oregon 96096",
            "credit_score": "389",
            "sales_region": "Oregon",
            "activity_tier": "1.0"
          }
        }
      ]
    }
  },
  {
    "index": 4,
    "uri": "/Users/ban/Documents/Projects/dhf-files/store-data/orders/280bfefa-aaf9-4cf0-be53-a08666699a33.json",
    "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/orders/280bfefa-aaf9-4cf0-be53-a08666699a33.json\")",
    "score": 0,
    "confidence": 0,
    "fitness": 0,
    "href": "/v1/documents?uri=%2FUsers%2Fban%2FDocuments%2FProjects%2Fdhf-files%2Fstore-data%2Forders%2F280bfefa-aaf9-4cf0-be53-a08666699a33.json",
    "mimetype": "application/json",
    "format": "json",
    "matches": [
      {
        "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/orders/280bfefa-aaf9-4cf0-be53-a08666699a33.json\")/object-node()",
        "match-text": [
          "Ingest 2019-10-02T12:11:37.863841-07:00 admin /Users/ban/Documents/Projects/dhf-files/store-data/orders/orders.csv 335 404 06/18/2017 06/23/2017 1000111 132362551004 10.0 alert doubling 1.0 7.0..."
        ]
      }
    ],
    "extracted": {
      "kind": "array",
      "content": [
        {
          "headers": {
            "sources": [
              {
                "name": "Ingest"
              }
            ],
            "createdOn": "2019-10-02T12:11:37.863841-07:00",
            "createdBy": "admin",
            "createdUsingFile": "/Users/ban/Documents/Projects/dhf-files/store-data/orders/orders.csv"
          }
        },
        {
          "Order": {
            "id": "335",
            "customer": "404",
            "order_date": "06/18/2017",
            "ship_date": "06/23/2017",
            "product_id": "1000111",
            "sku": "132362551004",
            "price": "10.0",
            "title": "alert doubling",
            "quantity": "1.0",
            "discounted_price": "7.0"
          }
        }
      ]
    }
  },
  {
    "index": 5,
    "uri": "/Users/ban/Documents/Projects/dhf-files/store-data/orders/3d3bd331-ac03-4a84-ae03-33199efaeffe.json",
    "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/orders/3d3bd331-ac03-4a84-ae03-33199efaeffe.json\")",
    "score": 0,
    "confidence": 0,
    "fitness": 0,
    "href": "/v1/documents?uri=%2FUsers%2Fban%2FDocuments%2FProjects%2Fdhf-files%2Fstore-data%2Forders%2F3d3bd331-ac03-4a84-ae03-33199efaeffe.json",
    "mimetype": "application/json",
    "format": "json",
    "matches": [
      {
        "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/orders/3d3bd331-ac03-4a84-ae03-33199efaeffe.json\")/object-node()",
        "match-text": [
          "Ingest 2019-10-02T12:11:38.303424-07:00 admin /Users/ban/Documents/Projects/dhf-files/store-data/orders/orders.csv 544 398 07/27/2017 08/06/2017 1000066 118675935929 33.99 stingy sharon 1.0 29.62..."
        ]
      }
    ],
    "extracted": {
      "kind": "array",
      "content": [
        {
          "headers": {
            "sources": [
              {
                "name": "Ingest"
              }
            ],
            "createdOn": "2019-10-02T12:11:38.303424-07:00",
            "createdBy": "admin",
            "createdUsingFile": "/Users/ban/Documents/Projects/dhf-files/store-data/orders/orders.csv"
          }
        },
        {
          "Order": {
            "id": "544",
            "customer": "398",
            "order_date": "07/27/2017",
            "ship_date": "08/06/2017",
            "product_id": "1000066",
            "sku": "118675935929",
            "price": "33.99",
            "title": "stingy sharon",
            "quantity": "1.0",
            "discounted_price": "29.62"
          }
        }
      ]
    }
  },
  {
    "index": 6,
    "uri": "/Users/ban/Documents/Projects/dhf-files/store-data/customers/557b44f0-ecae-4f9e-ba20-1cca2ea4f9ef.json",
    "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/customers/557b44f0-ecae-4f9e-ba20-1cca2ea4f9ef.json\")",
    "score": 0,
    "confidence": 0,
    "fitness": 0,
    "href": "/v1/documents?uri=%2FUsers%2Fban%2FDocuments%2FProjects%2Fdhf-files%2Fstore-data%2Fcustomers%2F557b44f0-ecae-4f9e-ba20-1cca2ea4f9ef.json",
    "mimetype": "application/json",
    "format": "json",
    "matches": [
      {
        "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/customers/557b44f0-ecae-4f9e-ba20-1cca2ea4f9ef.json\")/object-node()",
        "match-text": [
          "Ingest 2019-10-02T12:11:35.976585-07:00 admin /Users/ban/Documents/Projects/dhf-files/store-data/customers/customers.csv 721 Nathan SILVA M 5348 Robert Skyway Suite 805 Serranohaven, North Dakota..."
        ]
      }
    ],
    "extracted": {
      "kind": "array",
      "content": [
        {
          "headers": {
            "sources": [
              {
                "name": "Ingest"
              }
            ],
            "createdOn": "2019-10-02T12:11:35.976585-07:00",
            "createdBy": "admin",
            "createdUsingFile": "/Users/ban/Documents/Projects/dhf-files/store-data/customers/customers.csv"
          }
        },
        {
          "Customer": {
            "id": "721",
            "first_name": "Nathan",
            "last_name": "SILVA",
            "gender": "M",
            "billing_address": "5348 Robert Skyway Suite 805 Serranohaven, North Dakota 67524",
            "shipping_address": "5348 Robert Skyway Suite 805 Serranohaven, North Dakota 67524",
            "credit_score": "501",
            "sales_region": "North Dakota",
            "activity_tier": "2.0"
          }
        }
      ]
    }
  },
  {
    "index": 7,
    "uri": "/Users/ban/Documents/Projects/dhf-files/store-data/orders/4a171d7f-1c70-4afd-904c-69a526b7afb5.json",
    "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/orders/4a171d7f-1c70-4afd-904c-69a526b7afb5.json\")",
    "score": 0,
    "confidence": 0,
    "fitness": 0,
    "href": "/v1/documents?uri=%2FUsers%2Fban%2FDocuments%2FProjects%2Fdhf-files%2Fstore-data%2Forders%2F4a171d7f-1c70-4afd-904c-69a526b7afb5.json",
    "mimetype": "application/json",
    "format": "json",
    "matches": [
      {
        "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/orders/4a171d7f-1c70-4afd-904c-69a526b7afb5.json\")/object-node()",
        "match-text": [
          "Ingest 2019-10-02T12:11:37.865345-07:00 admin /Users/ban/Documents/Projects/dhf-files/store-data/orders/orders.csv 417 59 07/05/2017 07/16/2017 1000258 167784852301 35.0 big steamroller 1.0 24.5..."
        ]
      }
    ],
    "extracted": {
      "kind": "array",
      "content": [
        {
          "headers": {
            "sources": [
              {
                "name": "Ingest"
              }
            ],
            "createdOn": "2019-10-02T12:11:37.865345-07:00",
            "createdBy": "admin",
            "createdUsingFile": "/Users/ban/Documents/Projects/dhf-files/store-data/orders/orders.csv"
          }
        },
        {
          "Order": {
            "id": "417",
            "customer": "59",
            "order_date": "07/05/2017",
            "ship_date": "07/16/2017",
            "product_id": "1000258",
            "sku": "167784852301",
            "price": "35.0",
            "title": "big steamroller",
            "quantity": "1.0",
            "discounted_price": "24.5"
          }
        }
      ]
    }
  },
  {
    "index": 8,
    "uri": "/Users/ban/Documents/Projects/dhf-files/store-data/customers/b0832561-0d70-4596-bd52-560f3cf4968e.json",
    "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/customers/b0832561-0d70-4596-bd52-560f3cf4968e.json\")",
    "score": 0,
    "confidence": 0,
    "fitness": 0,
    "href": "/v1/documents?uri=%2FUsers%2Fban%2FDocuments%2FProjects%2Fdhf-files%2Fstore-data%2Fcustomers%2Fb0832561-0d70-4596-bd52-560f3cf4968e.json",
    "mimetype": "application/json",
    "format": "json",
    "matches": [
      {
        "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/customers/b0832561-0d70-4596-bd52-560f3cf4968e.json\")/object-node()",
        "match-text": [
          "Ingest 2019-10-02T12:11:36.488802-07:00 admin /Users/ban/Documents/Projects/dhf-files/store-data/customers/customers.csv 957 Isabel GUTIERREZ F 903 Roberts Mountain South Natalieview, New Mexico..."
        ]
      }
    ],
    "extracted": {
      "kind": "array",
      "content": [
        {
          "headers": {
            "sources": [
              {
                "name": "Ingest"
              }
            ],
            "createdOn": "2019-10-02T12:11:36.488802-07:00",
            "createdBy": "admin",
            "createdUsingFile": "/Users/ban/Documents/Projects/dhf-files/store-data/customers/customers.csv"
          }
        },
        {
          "Customer": {
            "id": "957",
            "first_name": "Isabel",
            "last_name": "GUTIERREZ",
            "gender": "F",
            "billing_address": "903 Roberts Mountain South Natalieview, New Mexico 74425",
            "shipping_address": "903 Roberts Mountain South Natalieview, New Mexico 74425",
            "credit_score": "740",
            "sales_region": "New Mexico",
            "activity_tier": "4.0"
          }
        }
      ]
    }
  },
  {
    "index": 9,
    "uri": "/Users/ban/Documents/Projects/dhf-files/store-data/customers/dc7cd24c-350b-408b-8b19-17ec497d9ee5.json",
    "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/customers/dc7cd24c-350b-408b-8b19-17ec497d9ee5.json\")",
    "score": 0,
    "confidence": 0,
    "fitness": 0,
    "href": "/v1/documents?uri=%2FUsers%2Fban%2FDocuments%2FProjects%2Fdhf-files%2Fstore-data%2Fcustomers%2Fdc7cd24c-350b-408b-8b19-17ec497d9ee5.json",
    "mimetype": "application/json",
    "format": "json",
    "matches": [
      {
        "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/customers/dc7cd24c-350b-408b-8b19-17ec497d9ee5.json\")/object-node()",
        "match-text": [
          "Ingest 2019-10-02T12:11:35.320741-07:00 admin /Users/ban/Documents/Projects/dhf-files/store-data/customers/customers.csv 36 Elizabeth BENTLEY F 51057 Hernandez Garden Suite 488 New Melissaview,..."
        ]
      }
    ],
    "extracted": {
      "kind": "array",
      "content": [
        {
          "headers": {
            "sources": [
              {
                "name": "Ingest"
              }
            ],
            "createdOn": "2019-10-02T12:11:35.320741-07:00",
            "createdBy": "admin",
            "createdUsingFile": "/Users/ban/Documents/Projects/dhf-files/store-data/customers/customers.csv"
          }
        },
        {
          "Customer": {
            "id": "36",
            "first_name": "Elizabeth",
            "last_name": "BENTLEY",
            "gender": "F",
            "billing_address": "51057 Hernandez Garden Suite 488 New Melissaview, Minnesota 68819",
            "shipping_address": "51057 Hernandez Garden Suite 488 New Melissaview, Minnesota 68819",
            "credit_score": "510",
            "sales_region": "Minnesota",
            "activity_tier": "4.0"
          }
        }
      ]
    }
  },
  {
    "index": 10,
    "uri": "/Users/ban/Documents/Projects/dhf-files/store-data/customers/6d15e1ce-97ef-473e-a2eb-3fb351793bd7.json",
    "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/customers/6d15e1ce-97ef-473e-a2eb-3fb351793bd7.json\")",
    "score": 0,
    "confidence": 0,
    "fitness": 0,
    "href": "/v1/documents?uri=%2FUsers%2Fban%2FDocuments%2FProjects%2Fdhf-files%2Fstore-data%2Fcustomers%2F6d15e1ce-97ef-473e-a2eb-3fb351793bd7.json",
    "mimetype": "application/json",
    "format": "json",
    "matches": [
      {
        "path": "fn:doc(\"/Users/ban/Documents/Projects/dhf-files/store-data/customers/6d15e1ce-97ef-473e-a2eb-3fb351793bd7.json\")/object-node()",
        "match-text": [
          "Ingest 2019-10-02T12:11:35.317848-07:00 admin /Users/ban/Documents/Projects/dhf-files/store-data/customers/customers.csv 357 Michelle CHARLES F 172 Lisa Brooks Apt. 967 Johntown, South Dakota 77675..."
        ]
      }
    ],
    "extracted": {
      "kind": "array",
      "content": [
        {
          "headers": {
            "sources": [
              {
                "name": "Ingest"
              }
            ],
            "createdOn": "2019-10-02T12:11:35.317848-07:00",
            "createdBy": "admin",
            "createdUsingFile": "/Users/ban/Documents/Projects/dhf-files/store-data/customers/customers.csv"
          }
        },
        {
          "Customer": {
            "id": "357",
            "first_name": "Michelle",
            "last_name": "CHARLES",
            "gender": "F",
            "billing_address": "172 Lisa Brooks Apt. 967 Johntown, South Dakota 77675",
            "shipping_address": "172 Lisa Brooks Apt. 967 Johntown, South Dakota 77675",
            "credit_score": "338",
            "sales_region": "South Dakota",
            "activity_tier": "2.0"
          }
        }
      ]
    }
  }
];

export default searchPayloadResults;