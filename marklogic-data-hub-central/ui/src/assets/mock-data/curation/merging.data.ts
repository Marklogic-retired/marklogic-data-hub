// Test data for merging

const mergingDataProps = {
    data: [],
    sourceNames: ['less favorite', 'more favorite'],
    openAddMergeRuleDialog: true,
    setOpenAddMergeRuleDialog: jest.fn()
};

const editMergingDataProps = {
    data: [],
    sourceNames: ['less favorite', 'more favorite'],
    strategyName: '',
    editMergeStrategyDialog: true,
    setOpenEditMergeStrategyDialog: jest.fn()
};


const data = {
    mergingDataProps,
    editMergingDataProps
};

export default data;
