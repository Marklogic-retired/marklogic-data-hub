import React from "react";
import {render, fireEvent, screen} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import {MemoryRouter} from "react-router-dom";
import Browse from "./Browse";
import {SearchContext} from "../util/search-context";
import axiosMock from "axios";
import {exploreModelResponse} from "../../src/assets/mock-data/explore/model-response";

jest.mock("axios");
jest.setTimeout(30000);
jest.mock("../api/modeling");

describe("Explorer Browse page tests ", () => {

  const defaultSearchOptions = {
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
    datasource: "entities"
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
      <SearchContext.Provider value={{
        searchOptions: defaultSearchOptions,
        greyedOptions: defaultSearchOptions,
        setRelatedEntityTypeIds: jest.fn(),
        setEntity: jest.fn(),
        applySaveQuery: jest.fn(),
        savedNode: undefined,
        setSavedNode: jest.fn()
      }}>
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
      <SearchContext.Provider value={{
        searchOptions: defaultSearchOptions,
        greyedOptions: defaultSearchOptions,
        setRelatedEntityTypeIds: jest.fn(),
        setEntity: jest.fn(),
        applySaveQuery: jest.fn(),
        savedNode: undefined,
        setSavedNode: jest.fn()
      }}>
        <Browse />
      </SearchContext.Provider></MemoryRouter>);

    fireEvent.click(document.querySelector("#switch-view-table"));
    expect(document.querySelector("#switch-view-table")).toHaveProperty("checked", true);
    expect(document.querySelector("#switch-view-snippet")).toHaveProperty("checked", false);
    fireEvent.mouseOver(document.querySelector("#switch-view-snippet"));
    expect(getByLabelText("switch-view-snippet")).toHaveStyle("color: rgb(127, 134, 181");
    fireEvent.click(document.querySelector("#switch-view-snippet"));
    expect(document.querySelector("#switch-view-table")).toHaveProperty("checked", false);
    expect(document.querySelector("#switch-view-snippet")).toHaveProperty("checked", true);
    fireEvent.mouseOver(document.querySelector("#switch-view-table"));
    expect(document.querySelector("#switch-view-table")).toHaveStyle("color: rgb(127, 134, 181");
  });

});
