const mappingArtifactCommonProps = {
  "stepDefinitionName": "entity-services-mapping",
  "stepDefinitionType": "mapping",
  "targetEntityType": "http://example.org/Customer-0.0.1/Customer",
  "description": "",
  "lastUpdated": "2020-09-25T09:40:08.300673-07:00",
  "selectedSource": "collection",
  "sourceQuery": "cts.collectionQuery(['Customer'])",
  "collections": ["mapCustomers"],
  "additionalCollections": [],
  "sourceDatabase": "data-hub-STAGING",
  "targetDatabase": "data-hub-FINAL",
  "targetFormat": "JSON",
  "permissions": "data-hub-common,read,data-hub-operator,update",
  "provenanceGranularityLevel": "coarse",
  "interceptors": [],
  "customHook": {},
  "validateEntity": "doNotValidate"
};

export const mappingStep = {
  "entityType": "Person",
  "entityTypeId": "http://example.org/Customer-0.0.1/Customer",
  "artifacts": [
    {
      "name": "mapCustomers",
      ...mappingArtifactCommonProps,
      "stepId": "mapCustomers-mapping",
      "properties": {
        propId: {sourcedFrom: "id"},
        propName: {sourcedFrom: "testNameInExp"},
        propAttribute: {sourcedFrom: "placeholderAttribute"},
        items: {
          sourcedFrom: "",
          properties: {
            itemTypes: {sourcedFrom: ""}
          },
          targetEntityType: "#/definitions/ItemType"
        }
      },
    },
    {
      "name": "mapPersonWithRelated",
      ...mappingArtifactCommonProps,
      "stepId": "mapPersonWithRelated-mapping",
      "properties": {
        propId: {sourcedFrom: "id"},
        propName: {sourcedFrom: "testNameInExp"},
        propAttribute: {sourcedFrom: "placeholderAttribute"},
        items: {
          sourcedFrom: "",
          properties: {
            itemTypes: {sourcedFrom: ""}
          },
          targetEntityType: "#/definitions/ItemType"
        }
      },
      relatedEntityMappings: [
        {
          relatedEntityMappingId: "Person.items:Order",
          collections: ["mapPersonWithRelated", "Order"],
          expressionContext: "/Orders",
          uriExpression: "",
          permissions: "data-hub-common,read,data-hub-common,update",
          properties: {
            orderId: {sourcedFrom: "id"},
            propName: {sourcedFrom: "testNameInExp"},
            propAttribute: {sourcedFrom: "placeholderAttribute"},
            items: {
              sourcedFrom: "",
              properties: {
                itemTypes: {sourcedFrom: ""}
              },
              targetEntityType: "#/definitions/ItemType"
            }
          },
          targetEntityType: "http://example.org/Order-0.0.1/Order"
        },
        {
          relatedEntityMappingId: "Person.items:BabyRegistry",
          collections: ["mapPersonWithRelated", "BabyRegistry"],
          permissions: "data-hub-common,read,data-hub-common,update",
          expressionContext: "/",
          uriExpression: "",
          properties: {
            babyRegistryId: {sourcedFrom: ""},
            arrivalDate: {sourcedFrom: ""},
            items: {
              sourcedFrom: "",
              properties: {
                itemTypes: {sourcedFrom: ""}
              },
              targetEntityType: "#/definitions/ItemType"
            }
          },
          targetEntityType: "http://example.org/BabyRegistry-0.0.1/BabyRegistry"
        },
        {
          relatedEntityMappingId: "Person.items:Order.lineItem.orderIncludes:Product",
          collections: ["mapPersonWithRelated", "Product"],
          permissions: "data-hub-common,read,data-hub-common,update",
          expressionContext: "/Orders/Products",
          uriExpression: "",
          properties: {
            productId: {sourcedFrom: ""},
            productName: {sourcedFrom: ""},
          },
          targetEntityType: "http://example.org/Product-0.0.1/Product"
        },
        {
          relatedEntityMappingId: "Person.items:BabyRegistry.hasProduct:Product",
          collections: ["mapPersonWithRelated", "Product"],
          permissions: "data-hub-common,read,data-hub-common,update",
          expressionContext: "/Orders/Products",
          uriExpression: "",
          properties: {
            productId: {sourcedFrom: ""},
            productName: {sourcedFrom: ""},
          },
          targetEntityType: "http://example.org/Product-0.0.1/Product"
        }
      ]
    },
    {
      "name": "mapCustomersEmpty",
      "stepId": "mapCustomersEmpty-mapping",
      ...mappingArtifactCommonProps,
      "properties": {}
    },
    {
      "name": "mapProductsXML",
      "stepId": "mapProductsXML-mapping",
      ...mappingArtifactCommonProps,
      "targetFormat": "XML",
      "properties": {},
      "namespaces": {
        "entity-services": "http://marklogic.com/entity-services"
      }
    },
    {
      "name": "mapCustomers",
      ...mappingArtifactCommonProps,
      "stepId": "mapCustomers-mapping",
      "properties": {
        propId: {sourcedFrom: "id"},
        propName: {sourcedFrom: "testNameInExp"},
        propAttribute: {sourcedFrom: "placeholderAttribute"},
        items: {
          sourcedFrom: "",
          properties: {
            itemTypes: {sourcedFrom: ""}
          },
          targetEntityType: "#/definitions/ItemType"
        }
      },
      "interceptors": [
        {
          path: "/custom-modules/step-interceptors/updateCustomerId.sjs",
          when: "beforeMain"
        }
      ]
    }
  ]
};

export const mappingStepPerson = {
  "entityType": "Person",
  "entityTypeId": "http://example.org/Person-0.0.1/Person",
  "artifacts": [
    {
      "name": "mapTruncatedJSONResponse",
      ...mappingArtifactCommonProps,
      "properties": {
        "propName": {output: "extremelylongusername@marklogic.com", sourcedFrom: "proteinId"},
        "propAttribute": {output: ["s@ml.com", "", "t@ml.com", "u@ml.com", "v@ml.com", "w@ml.com", "x@ml.com", "y@ml.com", "z@ml.com"], sourcedFrom: "proteinType"},
      },
      "targetEntityType": "http://example.org/Person-0.0.1/Person",
      "sourceQuery": "cts.collectionQuery(['Person'])"
    },
    {
      "name": "testJSONResponse",
      ...mappingArtifactCommonProps,
      "properties": {
        "propName": {output: "123EAC", sourcedFrom: "proteinId"},
        "propAttribute": {output: "home", sourcedFrom: "proteinType"},
      },
      "targetEntityType": "http://example.org/Person-0.0.1/Person",
      "sourceQuery": "cts.collectionQuery(['Person'])"
    },
    {
      "name": "testJSONResponseWithFunctions",
      ...mappingArtifactCommonProps,
      "properties": {
        "propName": {output: "123EAC", sourcedFrom: "proteinId"},
        "propAttribute": {output: "home-NEW", sourcedFrom: "concat(proteinType,'NEW')"},
      },
      "targetEntityType": "http://example.org/Person-0.0.1/Person",
      "sourceQuery": "cts.collectionQuery(['Person'])"
    },
    {
      "name": "errorJSONResponse",
      ...mappingArtifactCommonProps,
      "properties": {
        "propId": {errorMessage: "Invalid lexical value: \"123EACtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest\"", sourcedFrom: "proteinId"},
        "propAttribute": {output: "home", sourcedFrom: "proteinType"},
      },
      "targetEntityType": "http://example.org/Person-0.0.1/Person",
      "sourceQuery": "cts.collectionQuery(['Person'])"
    },
    {
      "name": "mapXMLPersonResponse",
      ...mappingArtifactCommonProps,
      "properties": {},
      "targetEntityType": "http://example.org/Person-0.0.1/Person",
      "sourceQuery": "cts.collectionQuery(['Person'])"
    },
    {
      "name": "testPersonJSONResponseWithRelatedEntities",
      ...mappingArtifactCommonProps,
      "uriExpression": {output: "/Person/personWithRelatedEntities.json"},
      "properties": {
        "propName": {output: "123EAC", sourcedFrom: "proteinId"},
        "propAttribute": {output: "home", sourcedFrom: "proteinType"},
      },
      "relatedEntityMappings": [{
        relatedEntityMappingId: "Order:Person.items",
        collections: ["mapPersonWithRelated", "Order"],
        expressionContext: "/Orders",
        uriExpression: {output: "/Order/301.json"},
        permissions: "data-hub-common,read,data-hub-common,update",
        properties: {
          orderId: {sourcedFrom: "id"},
          propName: {sourcedFrom: "testNameInExp"},
          propAttribute: {sourcedFrom: "placeholderAttribute"},
          items: {
            sourcedFrom: "",
            properties: {
              itemTypes: {sourcedFrom: ""}
            },
            targetEntityType: "#/definitions/ItemType"
          }
        },
        targetEntityType: "http://example.org/Order-0.0.1/Order"
      },
      {
        relatedEntityMappingId: "BabyRegistry:Person.items",
        collections: ["mapPersonWithRelated", "BabyRegistry"],
        permissions: "data-hub-common,read,data-hub-common,update",
        expressionContext: "/",
        uriExpression: {errorMessage: "Invalid XPath expression: ###"},
        properties: {
          babyRegistryId: {output: "3039", sourcedFrom: "BabyRegistryId"},
          arrivalDate: {output: "2021-01-07-07:00", sourcedFrom: "Arrival_Date"},
          items: {
            sourcedFrom: "",
            properties: {
              itemTypes: {sourcedFrom: ""}
            },
            targetEntityType: "#/definitions/ItemType"
          }
        },
        targetEntityType: "http://example.org/BabyRegistry-0.0.1/BabyRegistry"
      },
      {
        relatedEntityMappingId: "Product:Order.lineItem.orderIncludes",
        collections: ["mapPersonWithRelated", "Product"],
        permissions: "data-hub-common,read,data-hub-common,update",
        expressionContext: "/Orders/Products",
        uriExpression: {output: "/Product/6322.json"},
        properties: {
          productId: {sourcedFrom: ""},
          productName: {sourcedFrom: ""}
        },
        targetEntityType: "http://example.org/Product-0.0.1/Product"
      },
      {
        relatedEntityMappingId: "Product:BabyRegistry.hasProduct",
        collections: ["mapPersonWithRelated", "Product"],
        permissions: "data-hub-common,read,data-hub-common,update",
        expressionContext: "/Orders/Products",
        uriExpression: {output: "/Product/6455.json"},
        properties: {
          productId: {sourcedFrom: ""},
          productName: {sourcedFrom: ""}
        },
        targetEntityType: "http://example.org/Product-0.0.1/Product"
      }
      ],
      "targetEntityType": "http://example.org/Person-0.0.1/Person",
      "sourceQuery": "cts.collectionQuery(['Person'])"
    },
  ]
};

