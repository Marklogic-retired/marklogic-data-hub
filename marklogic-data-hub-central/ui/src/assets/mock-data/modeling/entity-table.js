export const entityModel = [
  {
      "info": {
          "title": "ProductGroupLicense",
          "version": "0.0.1",
          "baseUri": "http://example.org/"
      },
      "definitions": {
          "ProductGroupLicense": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "ProductGroupLicNo": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ProductGroupLicType": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  }
              }
          }
      }
  },
  {
      "info": {
          "title": "OrderDetail",
          "version": "0.0.1",
          "baseUri": "http://example.org/"
      },
      "definitions": {
          "OrderDetail": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "UnitPrice": {
                      "datatype": "decimal"
                  },
                  "Discount": {
                      "datatype": "int"
                  },
                  "Quantity": {
                      "datatype": "decimal"
                  },
                  "ProductDetails": {
                      "$ref": "#/definitions/ProductDetail"
                  }
              }
          },
          "ProductGroup": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "ProductGroupCode": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ProductGroupName": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ProductGroupLicenseDetail": {
                      "$ref": "#/definitions/ProductGroupLicense"
                  }
              }
          },
          "ProductDetail": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "ProductID": {
                      "datatype": "int"
                  },
                  "ProductCat": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ProductGroups": {
                      "$ref": "#/definitions/ProductGroup"
                  }
              }
          },
          "ProductGroupLicense": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "ProductGroupLicNo": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ProductGroupLicType": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  }
              }
          }
      }
  },
  {
      "info": {
          "title": "ItemType",
          "version": "0.0.1",
          "baseUri": "http://marklogic.com/data-hub/example/"
      },
      "definitions": {
          "ItemType": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "name": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "quantity": {
                      "datatype": "integer"
                  },
                  "price": {
                      "datatype": "decimal"
                  }
              }
          }
      }
  },
  {
      "info": {
          "title": "ProductDetail",
          "version": "0.0.1",
          "baseUri": "http://example.org/"
      },
      "definitions": {
          "ProductGroup": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "ProductGroupCode": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ProductGroupName": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ProductGrouplicenseDetail": {
                      "$ref": "#/definitions/ProductGroupLicense"
                  }
              }
          },
          "ProductDetail": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "ProductID": {
                      "datatype": "int"
                  },
                  "ProductCat": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ProductGroups": {
                      "$ref": "#/definitions/ProductGroup"
                  }
              }
          },
          "ProductGroupLicense": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "ProductGroupLicNo": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ProductGroupLicType": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  }
              }
          }
      }
  },
  {
      "info": {
          "title": "OrderType",
          "version": "0.0.1",
          "baseUri": "http://marklogic.com/data-hub/example/"
      },
      "definitions": {
          "OrderType": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "id": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "purchaseDate": {
                      "datatype": "date"
                  },
                  "orderCost": {
                      "datatype": "decimal"
                  },
                  "items": {
                      "datatype": "array",
                      "items": {
                          "$ref": "#/definitions/ItemType"
                      }
                  },
                  "customer": {
                      "$ref": "#/definitions/CustomerType"
                  }
              }
          },
          "ItemType": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "name": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "quantity": {
                      "datatype": "integer"
                  },
                  "price": {
                      "datatype": "decimal"
                  }
              }
          },
          "CustomerType": {
              "primaryKey": "id",
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "id": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "firstname": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "lastname": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "gender": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "postal": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "phone": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "email": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "updated": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  }
              }
          }
      }
  },
  {
      "info": {
          "title": "Order",
          "version": "0.0.1",
          "baseUri": "http://marklogic.com/",
          "description": "An Order entity"
      },
      "definitions": {
          "Order": {
              "description": "The Order entity root.",
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "OrderID": {
                      "datatype": "string"
                  },
                  "CustomerID": {
                      "datatype": "string"
                  },
                  "ShipCity": {
                      "datatype": "string"
                  },
                  "ShipRegion": {
                      "datatype": "string"
                  },
                  "ShipAddress": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ShipCountry": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "RequiredDate": {
                      "datatype": "dateTime"
                  },
                  "ShipName": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "OrderDetails": {
                      "datatype": "array",
                      "items": {
                          "$ref": "#/definitions/OrderDetail"
                      }
                  },
                  "ShippedDate": {
                      "datatype": "dateTime"
                  },
                  "ShipPostalCode": {
                      "datatype": "int"
                  },
                  "EmployeeID": {
                      "datatype": "int"
                  },
                  "Freight": {
                      "datatype": "decimal"
                  },
                  "ShippedDate2": {
                      "datatype": "dateTime"
                  },
                  "ShipPostalCode2": {
                      "datatype": "int"
                  },
                  "EmployeeID2": {
                      "datatype": "int"
                  },
                  "Freight2": {
                      "datatype": "decimal"
                  },
                  "ShipLicenseNo1": {
                      "datatype": "string"
                  },
                  "ShipLicenseNo2": {
                      "datatype": "string"
                  },
                  "ShipLicenseNo3": {
                      "datatype": "string"
                  },
                  "ShipLicenseNo4": {
                      "datatype": "string"
                  },
                  "ShipLicenseNo5": {
                      "datatype": "string"
                  },
                  "ShipLicenseNo6": {
                      "datatype": "string"
                  },
                  "ShipLicenseNo7": {
                      "datatype": "string"
                  },
                  "ShipLicenseNo8": {
                      "datatype": "string"
                  },
                  "ShipLicenseNo9": {
                      "datatype": "string"
                  },
                  "ShipLicenseNo10": {
                      "datatype": "string"
                  },
                  "ShippingContact1": {
                      "datatype": "string"
                  },
                  "ShippingContact2": {
                      "datatype": "string"
                  },
                  "ShippingContact3": {
                      "datatype": "string"
                  },
                  "ShippingContact4": {
                      "datatype": "string"
                  },
                  "ShippingContact5": {
                      "datatype": "string"
                  },
                  "ShippingContact6": {
                      "datatype": "string"
                  },
                  "ShippingContact7": {
                      "datatype": "string"
                  },
                  "ShippingContact8": {
                      "datatype": "string"
                  },
                  "ShippingContact9": {
                      "datatype": "string"
                  },
                  "ShippingContact10": {
                      "datatype": "string"
                  },
                  "ContractITN1": {
                      "datatype": "string"
                  },
                  "ContractITN2": {
                      "datatype": "string"
                  },
                  "ContractITN3": {
                      "datatype": "string"
                  },
                  "ContractITN4": {
                      "datatype": "string"
                  },
                  "ContractITN5": {
                      "datatype": "string"
                  },
                  "ContractITN6": {
                      "datatype": "string"
                  },
                  "ContractITN7": {
                      "datatype": "string"
                  },
                  "ContractITN8": {
                      "datatype": "string"
                  },
                  "ContractITN9": {
                      "datatype": "string"
                  },
                  "ContractITN10": {
                      "datatype": "string"
                  },
                  "ShippingCarriage1": {
                      "datatype": "string"
                  },
                  "ShippingCarriage2": {
                      "datatype": "string"
                  },
                  "ShippingCarriage3": {
                      "datatype": "string"
                  },
                  "ShippingCarriage4": {
                      "datatype": "string"
                  },
                  "ShippingCarriage5": {
                      "datatype": "string"
                  },
                  "ShippingCarriage6": {
                      "datatype": "string"
                  },
                  "ShippingCarriage7": {
                      "datatype": "string"
                  },
                  "ShippingCarriage8": {
                      "datatype": "string"
                  },
                  "ShippingCarriage9": {
                      "datatype": "string"
                  },
                  "ShippingCarriage10": {
                      "datatype": "string"
                  },
                  "ShippingContainer1": {
                      "datatype": "string"
                  },
                  "ShippingContainer2": {
                      "datatype": "string"
                  },
                  "ShippingContainer3": {
                      "datatype": "string"
                  },
                  "ShippingContainer4": {
                      "datatype": "string"
                  },
                  "ShippingContainer5": {
                      "datatype": "string"
                  },
                  "ShippingContainer6": {
                      "datatype": "string"
                  },
                  "ShippingContainer7": {
                      "datatype": "string"
                  },
                  "ShippingContainer8": {
                      "datatype": "string"
                  },
                  "ShippingContainer9": {
                      "datatype": "string"
                  },
                  "ShippingContainer10": {
                      "datatype": "string"
                  }
              }
          },
          "OrderDetail": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "UnitPrice": {
                      "datatype": "decimal"
                  },
                  "Discount": {
                      "datatype": "int"
                  },
                  "Quantity": {
                      "datatype": "decimal"
                  },
                  "ProductDetails": {
                      "$ref": "#/definitions/ProductDetail"
                  }
              }
          },
          "ProductGroup": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "ProductGroupCode": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ProductGroupName": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ProductGroupLicenseDetail": {
                      "$ref": "#/definitions/ProductGroupLicense"
                  }
              }
          },
          "ProductDetail": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "ProductID": {
                      "datatype": "int"
                  },
                  "ProductCat": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ProductGroups": {
                      "$ref": "#/definitions/ProductGroup"
                  }
              }
          },
          "ProductGroupLicense": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "ProductGroupLicNo": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ProductGroupLicType": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  }
              }
          }
      }
  },
  {
      "info": {
          "title": "ProductGroup",
          "version": "0.0.1",
          "baseUri": "http://example.org/"
      },
      "definitions": {
          "ProductGroup": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "ProductGroupCode": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ProductGroupName": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ProductGroupLicenseDetail": {
                      "$ref": "#/definitions/ProductGroupLicense"
                  }
              }
          },
          "ProductGroupLicense": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "ProductGroupLicNo": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ProductGroupLicType": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  }
              }
          }
      }
  },
  {
      "info": {
          "title": "Protein",
          "version": "0.0.1",
          "baseUri": "http://marklogic.com/data-hub/example/"
      },
      "definitions": {
          "Protein": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "Name": {
                      "datatype": "string",
                      "description": "Protein Name",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ID": {
                      "datatype": "long",
                      "description": "Protein ID"
                  },
                  "Type": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  }
              }
          }
      }
  },
  {
      "info": {
          "title": "Provider",
          "version": "0.0.1",
          "baseUri": "http://example.org/"
      },
      "definitions": {
          "Provider": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "CA_LICENSE_NO": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "NPI": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "FULL_NAME": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ADD_LINE_1": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ADD_LINE_2": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "CITY": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "STATE": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ZIP": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  }
              }
          }
      }
  },
  {
      "info": {
          "title": "TestEntityForMapping",
          "version": "0.0.1",
          "baseUri": "http://example.com/",
          "description": "An TestEntityForMapping entity"
      },
      "definitions": {
          "TestEntityForMapping": {
              "description": "The TestEntityForMapping entity root.",
              "required": [],
              "rangeIndex": [],
              "elementRangeIndex": [],
              "wordLexicon": [],
              "pii": [],
              "properties": {}
          }
      }
  },
  {
      "info": {
          "title": "CustomerType",
          "version": "0.0.1",
          "baseUri": "http://marklogic.com/data-hub/example/",
          "description": "A customer"
      },
      "definitions": {
          "CustomerType": {
              "primaryKey": "id",
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "id": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "firstname": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "lastname": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "gender": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "postal": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "phone": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "email": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "updated": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  }
              }
          }
      }
  },
  {
      "info": {
          "title": "Customer",
          "version": "0.0.1",
          "baseUri": "http://marklogic.com/data-hub/example/"
      },
      "definitions": {
          "Customer": {
              "required": [],
              "pii": [],
              "elementRangeIndex": [],
              "rangeIndex": [],
              "wordLexicon": [],
              "properties": {
                  "Name": {
                      "datatype": "string",
                      "description": "Customer Name",
                      "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "ID": {
                      "datatype": "long",
                      "description": "Customer ID"
                  },
                  "Type": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                  }
              }
          }
      }
  }
];

export const facetValues = [
  {
    "name": "Customer",
    "count": 50,
    "value": "Customer"
  },
  {
    "name": "ProductGroupLicenseFacetValue",
    "count": 1200,
    "value": "ProductGroupLicenseFacetValue"
  },
  {
    "name": "OrderDetail",
    "count": 15000,
    "value": "OrderDetail"
  },
  {
    "name": "ItemType",
    "count": 300,
    "value": "ItemType"
  },
  {
    "name": "ProductDetail",
    "count": 4095,
    "value": "ProductDetail"
  },
  {
    "name": "OrderType",
    "count": 1034,
    "value": "OrderType"
  },
  {
    "name": "Order",
    "count": 2334,
    "value": "Order"
  },
  {
    "name": "ProductGroup",
    "count": 2346,
    "value": "ProductGroup"
  },
  {
    "name": "Protein",
    "count": 607,
    "value": "Protein"
  },
  {
    "name": "Provider",
    "count": 12584,
    "value": "Provider"
  },
  {
    "name": "TestEntityForMapping",
    "count": 100,
    "value": "TestEntityForMapping"
  },
  {
    "name": "CustomerType",
    "count": 999,
    "value": "CustomerType"
  }
];

export const latestJobs = [
  {
    "entityCollection": "Customer",
    "latestJobId": "9722cd55-65ef-4143-9f33-d28ef79e916b",
    "latestJobDateTime": "2019-10-08T14:48:34.868447-07:00"
  },
  {
    "entityCollection": "ProductGroupLicense",
    "latestJobId": "69703071-07c9-46a4-863e-eab5e5629d0c",
    "latestJobDateTime": "2019-10-07T14:43:53.517287-07:00"
  },
  {
    "entityCollection": "OrderDetail",
    "latestJobId": "9722cd55-65ef-4143-9f33-d28ef79e9381",
    "latestJobDateTime": "2020-01-08T14:48:34.868447-07:00"
  },
  {
    "entityCollection": "ItemType",
    "latestJobId": "69703071-07c9-46a4-863e-eab5e5621245",
    "latestJobDateTime": "2020-02-20T14:43:53.517287-07:00"
  },
  {
    "entityCollection": "ProductDetail",
    "latestJobId": "2822cd55-65ef-4143-9f33-d28ef79e9777",
    "latestJobDateTime": "2019-11-08T14:48:34.868447-07:00"
  },
  {
    "entityCollection": "OrderType",
    "latestJobId": "89703071-07c9-46a4-863e-eab5e5629a0b",
    "latestJobDateTime": "2019-12-11T14:43:53.517287-07:00"
  },
  {
    "entityCollection": "Order",
    "latestJobId": "2382cd55-65ef-4143-9f33-d28ef79e9654",
    "latestJobDateTime": "2020-03-08T14:48:34.868447-07:00"
  },
  {
    "entityCollection": "ProductGroup",
    "latestJobId": "88703071-07c9-46a4-863e-eab5e5621789",
    "latestJobDateTime": "2020-03-20T14:43:53.517287-07:00"
  },
  {
    "entityCollection": "Protein",
    "latestJobId": "4562cd55-65ef-4143-9f33-d28ef79e9853",
    "latestJobDateTime": "2019-12-10T14:48:34.868447-07:00"
  },
  {
    "entityCollection": "Provider",
    "latestJobId": "32303071-07c9-46a4-863e-eab5e5629b02",
    "latestJobDateTime": "2019-12-30T14:43:53.517287-07:00"
  },
  {
    "entityCollection": "TestEntityForMapping",
    "latestJobId": "6542cd55-65ef-4143-9f33-d28ef79e9932",
    "latestJobDateTime": "2020-03-05T14:48:34.868447-07:00"
  },
  {
    "entityCollection": "CustomerType",
    "latestJobId": "65703071-07c9-46a4-863e-eab5e5621567",
    "latestJobDateTime": "2020-01-24T14:43:53.517287-07:00"
  }
];
