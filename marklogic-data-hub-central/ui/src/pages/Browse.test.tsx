import "@testing-library/jest-dom/extend-expect";

import {ISearchContextInterface, SearchContext, SearchOptionsInterface} from "../util/search-context";
import {fireEvent, render, screen} from "@testing-library/react";

import Browse from "./Browse";
import {MemoryRouter} from "react-router-dom";
import React from "react";
import axiosMock from "axios";
import {exploreModelResponse} from "../../src/assets/mock-data/explore/model-response";

jest.mock("axios");
jest.setTimeout(30000);
jest.mock("../api/modeling");

describe("Explorer Browse page tests ", () => {

  const defaultSearchOptions: SearchOptionsInterface = {
    query: "",
    entityTypeIds: ["Customer"],
    relatedEntityTypeIds: [],
    nextEntityType: "",
    baseEntities: [],
    start: 1,
    pageNumber: 1,
    pageLength: 20,
    pageSize: 20,
    selectedFacets: {},
    maxRowsPerPage: 100,
    sidebarQuery: "Select a saved query",
    selectedQuery: "select a query",
    selectedTableProperties: [],
    view: null,
    tileId: "explore",
    sortOrder: [],
    database: "final",
    datasource: "entities",
    mergeUnmerge: false,
    preselectedFacets: []
  };

  const defaultProps: ISearchContextInterface = {
    searchOptions: defaultSearchOptions,
    greyedOptions: defaultSearchOptions,
    setRelatedEntityTypeIds: jest.fn(),
    setEntity: jest.fn(),
    applySaveQuery: jest.fn(),
    savedNode: undefined,
    setSavedNode: jest.fn(),
    savedQueries: [],
    setSavedQueries: jest.fn(),
    entityInstanceId: undefined,
    entityDefinitionsArray: [],
    setEntityDefinitionsArray: jest.fn(),
    setSearchFromUserPref: jest.fn(),
    setQuery: jest.fn(),
    setPage: jest.fn(),
    toggleMergeUnmerge: jest.fn(),
    setPageLength: jest.fn(),
    setSearchFacets: jest.fn(),
    setEntityTypeIds: jest.fn(),
    setNextEntity: jest.fn(),
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
    setAllGreyedOptions: jest.fn(),
    setQueryGreyedOptions: jest.fn(),
    clearGreyFacet: jest.fn(),
    clearConstraint: jest.fn(),
    clearAllGreyFacets: jest.fn(),
    resetGreyedOptions: jest.fn(),
    setSelectedQuery: jest.fn(),
    setSidebarQuery: jest.fn(),
    setSelectedTableProperties: jest.fn(),
    setBaseEntitiesWithProperties: jest.fn(),
    setView: jest.fn(),
    setPageWithEntity: jest.fn(),
    setSortOrder: jest.fn(),
    setDatabase: jest.fn(),
    setLatestDatabase: jest.fn(),
    setGraphViewOptions: jest.fn(),
    setDatasource: jest.fn(),
    setSearchOptions: jest.fn(),
    setDatabaseAndDatasource: jest.fn(),
  };
  beforeEach(() => {
    axiosMock.get["mockImplementation"]((url) => {
      switch (url) {
      case "/api/models":
        return Promise.resolve({status: 200, data: exploreModelResponse});
      default:
        return Promise.resolve([]);
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Verify collapsible side bar", async () => {
    const {getByLabelText} = render(<MemoryRouter>
      <SearchContext.Provider value={{...defaultProps}}>
        <Browse />
      </SearchContext.Provider></MemoryRouter>);

    expect(screen.getByTestId("icon-collapsed")).toBeInTheDocument();
    await fireEvent.click(getByLabelText("sider-action"));
    expect(screen.getByTestId("icon-expanded")).toBeInTheDocument();
    await fireEvent.click(getByLabelText("sider-action"));
    expect(screen.getByTestId("icon-collapsed")).toBeInTheDocument();
  });

  test("Verify snippet/table view on hover css", async () => {
    const {getByLabelText} = render(<MemoryRouter>
      <SearchContext.Provider value={{...defaultProps}}>
        <Browse />
      </SearchContext.Provider></MemoryRouter>);

    fireEvent.click(document.querySelector("#switch-view-table")!!);
    expect(document.querySelector("#switch-view-table")).toHaveProperty("checked", true);
    expect(document.querySelector("#switch-view-snippet")).toHaveProperty("checked", false);
    fireEvent.mouseOver(document.querySelector("#switch-view-snippet")!!);
    expect(getByLabelText("switch-view-snippet")).toHaveStyle("color: rgb(127, 134, 181");
    fireEvent.click(document.querySelector("#switch-view-snippet")!!);
    expect(document.querySelector("#switch-view-table")).toHaveProperty("checked", false);
    expect(document.querySelector("#switch-view-snippet")).toHaveProperty("checked", true);
    fireEvent.mouseOver(document.querySelector("#switch-view-table")!!);
    expect(document.querySelector("#switch-view-table")).toHaveStyle("color: rgb(127, 134, 181");
  });

});
