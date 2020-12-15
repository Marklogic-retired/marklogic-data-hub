// Test data for merging

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
  toggleIsEditStrategy: jest.fn()
};


const data = {
  mergeRuleDataProps,
  mergeStrategyDataProps
};

export default data;
