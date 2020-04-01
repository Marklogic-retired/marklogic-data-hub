// Test data

const newMatching = {
  title: 'New Matching',
  newMatching: true,
  setNewMatching: jest.fn(),
  canReadWrite: true,
  isMatchingNameTouched: false,
  isDescriptionTouched: false,
  isSelectedSourceTouched: false,
  isCollectionsTouched: false,
  isSrcQueryTouched: false,
  deleteDialogVisible: false
};


const editMatching = {
  title: 'Edit Matching',
  newMatching: true,
  matchingData: {
    name: 'testMatching',
    description: 'Description of testMatching',
    targetEntityType: 'Person',
    selectedSource: 'collection',
    sourceQuery: "cts.collectionQuery(['matching-collection'])",
  },
  canReadWrite: true
};

const data = {
  data: {
    canReadOnly: false,
    canReadWrite: true
  },
  newMatching: newMatching,
  editMatching: editMatching
};

export default data;
