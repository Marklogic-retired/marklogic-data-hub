// Shared properties across steps
const stepData = {
  description: "",
  additionalCollections: ["addedCollection"],
  batchSize: 35,
  permissions: "data-hub-common,read,data-hub-common,update",
  lastUpdated: "2020-01-01T00:00:00.000001-07:00",
  processors: {
    "processor": true
  },
  customHook: {
    "hook": true
  }
};

// Step data
const stepLoad = {
  ...stepData,
  name: "AdvancedLoad",
  collections: ["AdvancedLoad"],
  sourceFormat: "json",
  targetFormat: "json",
  provenanceGranularityLevel: "coarse",
  outputURIPrefix: "",
  stepDefinitionName: "default-ingestion",
  stepDefinitionType: "ingestion",
  stepId: "AdvancedLoad-ingestion",
  targetDatabase: "data-hub-STAGING",
  headers: {
    "header": true
  }
};

const stepMapping = {
  ...stepData,
  name: "AdvancedMapping",
  collections: ["AdvancedMapping"],
  provenanceGranularityLevel: "coarse",
  targetEntityType: "http://example.org/EntityName-0.0.1/EntityName",
  selectedSource: "collection",
  sourceQuery: "cts.collectionQuery(['test'])",
  stepDefinitionName: "entity-services-mapping",
  stepDefinitionType: "mapping",
  stepId: "AdvancedMapping-mapping",
  sourceDatabase: "data-hub-STAGING",
  targetDatabase: "data-hub-FINAL",
  targetFormat: "JSON",
  validateEntity: "doNotValidate",
  headers: {
    "header": true
  }
};

const stepMatching = {
  ...stepData,
  name: "AdvancedMatching",
  collections: ["AdvancedMatching"],
  provenanceGranularityLevel: "fine",
  targetEntityType: "http://example.org/Address-0.0.1/Test",
  selectedSource: "collection",
  sourceQuery: "cts.collectionQuery(['test'])",
  stepDefinitionName: "default-matching",
  stepDefinitionType: "matching",
  stepId: "AdvancedMatching-matching",
  sourceDatabase: "data-hub-FINAL",
  targetDatabase: "data-hub-FINAL"
};

const stepMerging = {
  ...stepData,
  name: "AdvancedMerging",
  provenanceGranularityLevel: "fine",
  targetEntityType: "http://example.org/Address-0.0.1/Test",
  targetCollections: {
    onMerge: {"add": ["merged"]},
    onNoMatch: {"add": ["noMatch"]},
    onArchive: {"add": ["archived"]},
    onNotification: {"add": ["notification"]}
  },
  selectedSource: "collection",
  sourceQuery: "cts.collectionQuery(['test'])",
  stepDefinitionName: "default-merging",
  stepDefinitionType: "merging",
  stepId: "AdvancedMerging-merging",
  sourceDatabase: "data-hub-FINAL",
  targetDatabase: "data-hub-FINAL"
};

const stepCustom = {
  ...stepData,
  name: "CustomLoad",
  provenanceGranularityLevel: "coarse",
  stepDefinitionType: "custom",
  stepDefinitionName: "custom-step",
  stepId: "CustomLoad-ingestion"
};

const defaultTargetCollections = {"data":
    {
      "onMerge": ["sm-Test-merged", "sm-Test-mastered"],
      "onNoMatch": ["sm-Test-mastered"],
      "onArchive": ["sm-Test-archived"],
      "onNotification": ["sm-Test-notification"]
    },
"status": 200
};

// Shared edit props
const stepsProps = {
  isEditing: true,
  createStep: jest.fn(),
  updateStep: jest.fn(),
  stepData: {},
  sourceDatabase: "",
  canReadWrite: true,
  canReadOnly: true,
  tooltipsData: {},
  openStepSettings: true,
  setOpenStepSettings: jest.fn(),
  activityType: "",
  canWrite: true,
  openStepDetails: jest.fn()
};

const editLoad = {
  ...stepsProps,
  activityType: "ingestion",
  stepData: stepLoad
};

const editMapping = {
  ...stepsProps,
  activityType: "mapping",
  stepData: stepMapping,
  targetEntityName: "entityName"
};

const editMatching = {
  ...stepsProps,
  activityType: "matching",
  stepData: stepMatching
};

const editMerging = {
  ...stepsProps,
  activityType: "merging",
  stepData: stepMatching
};

const editCustom = {
  ...stepsProps,
  activityType: "custom",
  stepData: stepCustom
};

const newLoad = {
  ...editLoad,
  isEditing: false,
  stepData: {},
  defaultCollections: []
};

const newMapping = {
  ...editMapping,
  isEditing: false,
  stepData: {},
  defaultCollections: []
};

const newMatching = {
  ...editMatching,
  isEditing: false,
  stepData: {},
  defaultCollections: []
};

const newMerging = {
  ...editMerging,
  isEditing: false,
  stepData: {},
  defaultCollections: []
};

const data = {
  stepLoad: stepLoad,
  stepMapping: stepMapping,
  stepMatching: stepMatching,
  stepMerging: stepMerging,
  stepCustom: stepCustom,
  editLoad: editLoad,
  editMapping: editMapping,
  editMatching: editMatching,
  editMerging: editMerging,
  editCustom: editCustom,
  newLoad: newLoad,
  newMapping: newMapping,
  newMatching: newMatching,
  newMerging: newMerging,
  defaultTargetCollections: defaultTargetCollections
};

export default data;