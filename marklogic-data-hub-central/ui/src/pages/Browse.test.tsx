import React from "react";
import {render, fireEvent, screen} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import {MemoryRouter} from "react-router-dom";
import Browse from "./Browse";
import {SearchContext} from "../util/search-context";
import userEvent from "@testing-library/user-event";
import axiosMock from "axios";
import {act} from "react-dom/test-utils";
import {getHubCentralConfig} from "../api/modeling";
import {mockHubCentralConfig} from "../../src/assets/mock-data/modeling/modeling";
import {exploreModelResponse} from "../../src/assets/mock-data/explore/model-response";

jest.mock("axios");
jest.setTimeout(30000);
jest.mock("../api/modeling");
const mockGetHubCentralConfig = getHubCentralConfig as jest.Mock;

describe("Explorer Browse page tests ", () => {

  const defaultSearchOptions = {
    query: "",
    entityTypeIds: [],
    relatedEntityTypeIds: [],
    nextEntityType: [],
    start: 1,
    pageNumber: 1,
    pageLength: 20,
    pageSize: 20,
    selectedFacets: {},
    maxRowsPerPage: 100,
    selectedQuery: "select a query",
    selectedTableProperties: [],
    view: null,
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
        setRelatedEntityTypeIds: jest.fn(),
        setEntity: jest.fn(),
        applySaveQuery: jest.fn()
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

  test("can close entity icon sidebar", async () => {
    mockGetHubCentralConfig.mockResolvedValueOnce({status: 200, data: mockHubCentralConfig});

    let getByLabelText;
    let queryByText;
    await act(async () => {
      const result = render(<MemoryRouter>
        <SearchContext.Provider value={{
          searchOptions: defaultSearchOptions,
          greyedOptions: defaultSearchOptions,
          setRelatedEntityTypeIds: jest.fn(),
          setEntity: jest.fn(),
          applySaveQuery: jest.fn()
        }}>
          <Browse />
        </SearchContext.Provider></MemoryRouter>);

      getByLabelText = result.getByLabelText;
      queryByText = result.queryByText;

    });
    expect(axiosMock.get).toHaveBeenCalledWith("/api/models");
    const baseEntity = getByLabelText("base-entities-Customer");
    userEvent.click(baseEntity);
    expect(getByLabelText("specif-sidebar-Customer")).toBeInTheDocument();
    const close = getByLabelText("base-entity-icons-list-close");
    userEvent.click(close);
    expect(queryByText("base-entities-Customer")).toBeNull();
  });
});
