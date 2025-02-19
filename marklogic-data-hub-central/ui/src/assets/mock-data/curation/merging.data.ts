// Test data for merging

export const mergingStep = {
  entityType: "Customer",
  entityTypeId: "http://example.org/Customer-0.0.1/Customer",
  artifacts: [
    {
      name: "mergeCustomers",
      stepDefinitionName: "default-merging",
      stepDefinitionType: "merging",
      stepId: "mergeCustomers-merging",
      targetEntityType: "http://example.org/Customer-0.0.1/Customer",
      description: "merge customer description",
      lastUpdated: "2020-09-25T09:40:08.300673-07:00",
      selectedSource: "collection",
      sourceQuery: "cts.collectionQuery(['matchCustomers'])",
      collections: ["mergeCustomers"],
      additionalCollections: [],
      sourceDatabase: "data-hub-FINAL",
      targetDatabase: "data-hub-FINAL",
      targetFormat: "JSON",
      permissions: "data-hub-common,read,data-hub-common-writer,update",
      timestamp: "/envelope/headers/createdOn",
      provenanceGranularityLevel: "fine",
      lastUpdatedLocation: {
        namespaces: {es: "http://marklogic.com/entity-services"},
        documentXPath: "/es:envelope/es:headers/timestamp",
      },
      mergeStrategies: [
        {
          strategyName: "myFavoriteSource",
          maxSources: 1,
          maxValues: 1,
          priorityOrder: {
            lengthWeight: 2,
            sources: [
              {
                sourceName: "favoriteSource",
                weight: 12,
              },
              {
                sourceName: "lessFavoriteSource",
                weight: 8,
              },
            ],
          },
        },
        {
          strategyName: "customMergeStrategy",
          mergeModulePath: "/custom/merge/strategy.sjs",
          mergeModuleFunction: "customMergeFunction",
          mergeModuleNamespace: "",
          options: {},
        },
        {
          strategyName: "testMerge",
          default: true,
          mergeModulePath: "/custom/merge/strategy.sjs",
          mergeModuleFunction: "testMergeFunction",
          mergeModuleNamespace: "",
          options: {},
        },
      ],
      mergeRules: [
        {
          entityPropertyPath: "name",
          mergeType: "strategy",
          mergeStrategyName: "myFavoriteSource",
        },
        {
          entityPropertyPath: "address",
          mergeType: "custom",
          mergeModulePath: "/custom/merge/strategy.sjs",
          mergeModuleNamespace: "",
          mergeModuleFunction: "customMergeFunction",
          options: {},
        },
        {
          entityPropertyPath: "phone",
          mergeType: "property-specific",
          maxSources: 1,
          maxValues: 1,
          priorityOrder: {
            lengthWeight: 12,
            sources: [
              {
                sourceName: "favoritePhoneSource",
                weight: 10,
              },
            ],
          },
        },
        {
          documentXPath: "/envelope/headers/timestamp",
          mergeStrategyName: "myFavoriteSource",
        },
      ],
      targetCollections: {
        onMerge: {
          add: ["sm-Customer-mastered"],
          remove: ["sm-Customer-archived"],
        },
        onArchive: {
          add: ["sm-Customer-archived"],
          remove: ["sm-Customer-mastered"],
        },
        onNoMatch: {
          add: ["sm-Customer-mastered"],
          remove: ["sm-Customer-archived"],
        },
        onNotification: {
          add: ["sm-Customer-notification"],
          remove: [],
        },
      },
    },
    {
      name: "mergeCustomersEmpty",
      stepDefinitionName: "default-merging",
      stepDefinitionType: "merging",
      stepId: "mergeCustomers-merging",
      lastUpdated: "2020-09-25T09:40:08.300673-07:00",
      targetEntityType: "http://example.org/Customer-0.0.1/Customer",
      description: "",
      selectedSource: "collection",
      sourceQuery: "cts.collectionQuery(['matchCustomers'])",
      collections: ["mergeCustomers"],
      additionalCollections: [],
      sourceDatabase: "data-hub-FINAL",
      targetDatabase: "data-hub-FINAL",
      targetFormat: "JSON",
      permissions: "data-hub-common,read,data-hub-common-writer,update",
      timestamp: "/envelope/headers/createdOn",
      provenanceGranularityLevel: "fine",
      lastUpdatedLocation: {
        namespaces: {es: "http://marklogic.com/entity-services"},
        documentXPath: "/es:envelope/es:headers/timestamp",
      },
      mergeStrategies: [],
      mergeRules: [],
    },
    {
      name: "mergeCustomers123",
      stepDefinitionName: "default-merging",
      stepDefinitionType: "merging",
      stepId: "mergeCustomers-merging",
      lastUpdated: "2020-09-25T09:40:08.300673-07:00",
      targetEntityType: "http://example.org/Customer-0.0.1/Customer",
      description: "",
      selectedSource: "collection",
      sourceQuery: "cts.collectionQuery(['matchCustomers'])",
      collections: ["mergeCustomers"],
      additionalCollections: [],
      sourceDatabase: "data-hub-FINAL",
      targetDatabase: "data-hub-FINAL",
      targetFormat: "JSON",
      permissions: "data-hub-common,read,data-hub-common-writer,update",
      timestamp: "/envelope/headers/createdOn",
      provenanceGranularityLevel: "fine",
      lastUpdatedLocation: {
        namespaces: {es: "http://marklogic.com/entity-services"},
        documentXPath: "/es:envelope/es:headers/timestamp",
      },
      mergeStrategies: [],
      mergeRules: [],
    },
  ],
};

const mergeRuleDataProps = {
  sourceNames: ["less favorite", "more favorite"],
  createEditMergeRuleDialog: true,
  setOpenMergeRuleDialog: jest.fn(),
  propertyName: "",
  toggleEditRule: jest.fn(),
  isEditRule: true,
};

const mergeStrategyDataProps = {
  sourceNames: ["less favorite", "more favorite"],
  strategyName: "",
  createEditMergeStrategyDialog: true,
  setOpenEditMergeStrategyDialog: jest.fn(),
  isEditStrategy: true,
  toggleIsEditStrategy: jest.fn(),
};

const compareModal = {
  isVisible: true,
  toggleModal: jest.fn(),
  previewMatchActivity: {},
  uriInfo: [],
  activeStepDetails: [
    {
      "properties": [{name: "customerId", datatype: "integer", ref: ""}],
    },
  ],
  entityDefinitionsArray: [
    {
      "name": "Customer",
      "properties": [{name: "customerId", datatype: "integer", ref: ""}],
    },
  ],
  uriCompared: [],
  entityProperties: [],
  uris: [],
  isPreview: false,
  isMerge: false,
  mergeUris: jest.fn(),
  unmergeUri: jest.fn(),
  originalUri: "/com.marklogic.smart-mastering/merged/8a0b71b0a525ca7449611b2e9786d0cf.json",
  flowName: "",
};

const data = {
  mergeRuleDataProps,
  mergeStrategyDataProps,
  compareModal,
};

export default data;
