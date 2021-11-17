import React from "react";
import {render, fireEvent, screen} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import {MemoryRouter} from "react-router-dom";
import Browse from "./Browse";
import {SearchContext} from "../util/search-context";

jest.mock("axios");
jest.setTimeout(30000);


describe("Explorer Browse page tests ", () => {
  const defaultSearchOptions = {
    query: "",
    entityTypeIds: [],
    nextEntityType: "",
    start: 1,
    pageNumber: 1,
    pageLength: 20,
    pageSize: 20,
    selectedFacets: {},
    maxRowsPerPage: 100,
    selectedQuery: "select a query",
    zeroState: false,
    selectedTableProperties: [],
    view: null,
    sortOrder: [],
    database: "final"
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Verify collapsible side bar", async () => {
    const {getByLabelText} = render(<MemoryRouter>
      <SearchContext.Provider value={{
        searchOptions: defaultSearchOptions,
        greyedOptions: defaultSearchOptions,
        setEntity: jest.fn(),
        applySaveQuery: jest.fn()
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
        setEntity: jest.fn(),
        applySaveQuery: jest.fn()
      }}>
        <Browse />
      </SearchContext.Provider></MemoryRouter>);

    fireEvent.click(getByLabelText("switch-view-table"));
    expect(getByLabelText("switch-view-table")).toHaveProperty("checked", true);
    expect(getByLabelText("switch-view-snippet")).toHaveProperty("checked", false);
    fireEvent.mouseOver(getByLabelText("switch-view-snippet"));
    expect(getByLabelText("switch-view-snippet")).toHaveStyle("color: rgb(127, 134, 181");
    fireEvent.click(getByLabelText("switch-view-snippet"));
    expect(getByLabelText("switch-view-table")).toHaveProperty("checked", false);
    expect(getByLabelText("switch-view-snippet")).toHaveProperty("checked", true);
    fireEvent.mouseOver(getByLabelText("switch-view-table"));
    expect(getByLabelText("switch-view-table")).toHaveStyle("color: rgb(127, 134, 181");
  });
});
