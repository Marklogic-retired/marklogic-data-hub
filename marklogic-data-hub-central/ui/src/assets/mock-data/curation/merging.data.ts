// Test data for merging

const mergingDataProps = {
  data: [],
  sourceNames: ["less favorite", "more favorite"],
  openAddMergeRuleDialog: true,
  setOpenAddMergeRuleDialog: jest.fn()
};

const editMergingDataProps = {
  sourceNames: ["less favorite", "more favorite"],
  strategyName: "",
  createEditMergeStrategyDialog: true,
  setOpenEditMergeStrategyDialog: jest.fn(),
  isEditStrategy: true
};


const data = {
  mergingDataProps,
  editMergingDataProps
};

export default data;
