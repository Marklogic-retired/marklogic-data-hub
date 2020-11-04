// Test data for merging

const mergingDataProps = {
    data: [],
    openAddMergeRuleDialog: true,
    setOpenAddMergeRuleDialog: jest.fn()
};

const editMergingDataProps = {
    data: [],
    strategyName: '',
    editMergeStrategyDialog: true,
    setOpenEditMergeStrategyDialog: jest.fn()
};


const data = {
    mergingDataProps,
    editMergingDataProps
};

export default data;
