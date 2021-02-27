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
  ]
};

