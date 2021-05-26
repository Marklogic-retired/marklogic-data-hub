import React from "react";
import {render, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import {MemoryRouter} from "react-router-dom";
import Browse from "./Browse";
import {SearchContext} from "../util/search-context";
import {getViewSettings} from "../util/user-context";

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

    expect(document.querySelector("[data-icon=\"angle-double-left\"]")).toBeInTheDocument();
    await fireEvent.click(getByLabelText("expanded"));
    expect(document.querySelector("[data-icon=\"angle-double-right\"]")).toBeInTheDocument();
    await fireEvent.click(getByLabelText("collapsed"));
    expect(document.querySelector("[data-icon=\"angle-double-left\"]")).toBeInTheDocument();
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

describe.only("getViewSettings", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    jest.restoreAllMocks();
  });

  const sessionStorageMock = (() => {
    let store = {};

    return {
      getItem(key) {
        return store[key] || null;
      },
      setItem(key, value) {
        store[key] = value.toString();
      },
      removeItem(key) {
        delete store[key];
      },
      clear() {
        store = {};
      }
    };
  })();

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
    zeroState: true,
    selectedTableProperties: [],
    view: null,
    tileId: "",
    sortOrder: [],
    database: "final"
  };

  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock
  });

  it("should get search options from session storage", () => {
    const getItemSpy = jest.spyOn(window.sessionStorage, "getItem");
    window.sessionStorage.setItem("dataHubViewSettings", JSON.stringify({explore: {searchOptions: defaultSearchOptions}}));
    const actualValue = getViewSettings();
    expect(actualValue).toEqual({explore: {searchOptions: defaultSearchOptions}});
    expect(getItemSpy).toBeCalledWith("dataHubViewSettings");
  });

  it("should get empty object if no info in session storage", () => {
    const getItemSpy = jest.spyOn(window.sessionStorage, "getItem");
    const actualValue = getViewSettings();
    expect(actualValue).toEqual({});
    expect(window.sessionStorage.getItem).toBeCalledWith("dataHubViewSettings");
    expect(getItemSpy).toBeCalledWith("dataHubViewSettings");
  });
});
