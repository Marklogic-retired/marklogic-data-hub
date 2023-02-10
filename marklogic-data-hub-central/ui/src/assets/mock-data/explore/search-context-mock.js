import Curate from "../../../pages/Curate";
import Load from "../../../pages/Load";
import Run from "../../../pages/Run";
import React from "react";


const searchOptionDefault = {
  query: "",
  entityTypeIds: [],
  baseEntities: [], //list of entities
  relatedEntityTypeIds: [],
  conceptFilterTypeIds: [],
  nextEntityType: "", //This can change to a boolean for the All Data/All Entities toggle.
  start: 0,
  pageNumber: 0,
  mergeUnmerge: false,
  pageLength: 0,
  pageSize: 0,
  selectedFacets: "",
  maxRowsPerPage: 0,
  selectedQuery: "",
  sidebarQuery: "",
  selectedTableProperties: "",
  tileId: "",
  sortOrder: "",
  database: "",
  datasource: "",
  preselectedFacets: [],
  view: null,
};

const mockInterfase = {
  setSearchFromUserPref: jest.fn(),
  setQuery: jest.fn(),
  setPage: jest.fn(),
  setPageLength: jest.fn(),
  toggleMergeUnmerge: jest.fn(),
  setSearchFacets: jest.fn(),
  setEntity: jest.fn(),
  setEntityTypeIds: jest.fn(),
  setNextEntity: jest.fn(),
  setRelatedEntityTypeIds: jest.fn(),
  setConceptFilterTypeIds: jest.fn(),
  setAllFilterTypeIds: jest.fn(),
  setEntityClearQuery: jest.fn(),
  setLatestJobFacet: jest.fn(),
  clearFacet: jest.fn(),
  clearAllFacets: jest.fn(),
  clearAllFacetsLS: jest.fn(),
  clearDateFacet: jest.fn(),
  clearRangeFacet: jest.fn(),
  clearGreyDateFacet: jest.fn(),
  clearGreyRangeFacet: jest.fn(),
  resetSearchOptions: jest.fn(),
  setAllSearchFacets: jest.fn(),
  greyedOptions: searchOptionDefault,
  setAllGreyedOptions: jest.fn(),
  setQueryGreyedOptions: jest.fn(),
  clearGreyFacet: jest.fn(),
  clearConstraint: jest.fn(),
  clearAllGreyFacets: jest.fn(),
  resetGreyedOptions: jest.fn(),
  applySaveQuery: jest.fn(),
  setSelectedQuery: jest.fn(),
  setSidebarQuery: jest.fn(),
  setSelectedTableProperties: jest.fn(),
  setBaseEntitiesWithProperties: jest.fn(),
  setView: jest.fn(),
  setPageWithEntity: jest.fn(),
  setSortOrder: jest.fn(),
  savedQueries: "",
  setSavedQueries: jest.fn(),
  setDatabase: jest.fn(),
  setLatestDatabase: jest.fn(),
  entityDefinitionsArray: [],
  setEntityDefinitionsArray: jest.fn(),
  setGraphViewOptions: jest.fn(),
  setDatasource: jest.fn(),
  savedNode: "",
  setSavedNode: jest.fn(),
  setSearchOptions: jest.fn(),
  entityInstanceId: "",
  setDatabaseAndDatasource: jest.fn()
};

export const setViewLoadFunction = {
  searchOptions: {
    ...searchOptionDefault,
    view: <Load />
  },
  setView: jest.fn(),
  ...mockInterfase,
};

export const setViewCurateFunction = {
  searchOptions: {
    ...searchOptionDefault,
    view: <Curate />
  },
  setView: jest.fn(),
  ...mockInterfase,
};

export const setViewRunFunction = {
  searchOptions: {
    ...searchOptionDefault,
    view: <Run />

  },
  setView: jest.fn(),
  ...mockInterfase,
};