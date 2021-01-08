import steps from "./steps.data";

// Shared properties across Advanced props
const advancedProps = {
  tabKey: "2",
  tooltipsData: {},
  openStepSettings: true,
  setOpenStepSettings: jest.fn(),
  updateLoadArtifact: jest.fn(),
  canWrite: true,
  canReadWrite: true,
  canReadOnly: true,
  currentTab: "2",
  setIsValid: jest.fn(),
  resetTabs: jest.fn(),
  setHasChanged: jest.fn(),
  setPayload: jest.fn(),
  createStep: jest.fn(),
  onCancel: jest.fn(),
};

// Advanced Props
const advancedLoad = {
  ...advancedProps,
  isEditing: true,
  stepData: steps.stepLoad,
  activityType: "ingestion",
  defaultCollections: [steps.stepLoad.name]
};

const advancedMapping = {
  ...advancedProps,
  isEditing: true,
  stepData: steps.stepMapping,
  activityType: "mapping",
  defaultCollections: [steps.stepMapping.name, "EntityName"],
  openStepDetails: jest.fn()
};

const advancedMatching = {
  ...advancedProps,
  isEditing: true,
  stepData: steps.stepMatching,
  openAdvancedSettings: true,
  setOpenAdvancedSettings: jest.fn(),
  activityType: "matching",
  defaultCollections: [steps.stepMatching.name]
};

const advancedMerging = {
  ...advancedProps,
  isEditing: true,
  stepData: steps.stepMerging,
  openAdvancedSettings: true,
  setOpenAdvancedSettings: jest.fn(),
  activityType: "merging",
  defaultCollections: [steps.stepMerging.name]
};

const data = {
  advancedLoad: advancedLoad,
  advancedMapping: advancedMapping,
  advancedMatching: advancedMatching,
  advancedMerging: advancedMerging,
  advancedCustomLoad: {...advancedLoad,
    stepData: {
      ...steps.stepLoad,
      name: "CustomLoad",
      stepDefinitionType: "custom",
      stepDefinitionName: "custom-step",
      stepId: "CustomLoad-ingestion",
    }
  }
};

export default data;
