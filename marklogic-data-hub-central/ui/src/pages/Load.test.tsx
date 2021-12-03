import React from "react";
import {render, fireEvent, wait, waitForElement, act, cleanup} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import {AuthoritiesContext, AuthoritiesService} from "../util/authorities";
import axiosMock from "axios";
import mocks from "../api/__mocks__/mocks.data";
import Load from "./Load";
import {MemoryRouter} from "react-router-dom";
import tiles from "../config/tiles.config";
import {getViewSettings} from "../util/user-context";
import moment from "moment";
import loadData from "../assets/mock-data/curation/ingestion.data";

jest.mock("axios");
jest.setTimeout(30000);


const DEFAULT_VIEW = "card";

describe("Load component", () => {

  beforeEach(() => {
    mocks.loadAPI(axiosMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test("Verify cannot edit with only readIngestion authority", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion"]);

    const {baseElement, getByText, getByPlaceholderText, getByLabelText, getByTestId, queryByTestId, queryByTitle} = render(
      <MemoryRouter><AuthoritiesContext.Provider value={authorityService}><Load/></AuthoritiesContext.Provider></MemoryRouter>
    );

    expect(await(waitForElement(() => getByLabelText("switch-view-list")))).toBeInTheDocument();

    // Check for steps to be populated
    expect(axiosMock.get).toBeCalledWith("/api/steps/ingestion");
    expect(getByText("testLoad")).toBeInTheDocument();

    // Check list view
    fireEvent.click(getByLabelText("switch-view-list"));

    // Open settings
    await act(async () => {
      await fireEvent.click(getByText("testLoad"));
    });
    expect(getByText("Loading Step Settings")).toBeInTheDocument();
    expect(getByText("Basic").closest("button")).toHaveClass("nav-link active");
    expect(getByText("Advanced").closest("button")).not.toHaveClass("nav-link active");

    // Basic settings
    expect(getByPlaceholderText("Enter name")).toHaveValue("testLoad");
    expect(getByPlaceholderText("Enter name")).toBeDisabled();
    expect(getByPlaceholderText("Enter description")).toBeDisabled();
    expect(baseElement.querySelector("#sourceFormat")).toHaveProperty("disabled");
    expect(baseElement.querySelector("#targetFormat")).toHaveProperty("disabled");
    expect(baseElement.querySelector("#outputUriPrefix")).toHaveProperty("disabled");

    // Advanced settings
    await wait(() => {
      fireEvent.click(getByText("Advanced"));
    });
    expect(getByText("Basic").closest("button")).not.toHaveClass("nav-link active");
    expect(getByText("Advanced").closest("button")).toHaveClass("nav-link active");

    expect(await(waitForElement(() => getByText("Target Database:")))).toBeInTheDocument();
    expect(getByLabelText("headers-textarea")).toBeDisabled();
    fireEvent.click(getByText("Interceptors"));
    expect(getByLabelText("interceptors-textarea")).toBeDisabled();
    fireEvent.click(getByText("Custom Hook"));
    expect(getByLabelText("customHook-textarea")).toBeDisabled();
    expect(getByTestId("testLoad-save-settings")).toBeDisabled();
    await act(async () => {
      await fireEvent.click(getByTestId("testLoad-cancel-settings"));
    });

    // test delete
    expect(queryByTestId("testLoad-delete")).not.toBeInTheDocument();

    // Check card layout
    fireEvent.click(getByLabelText("switch-view-card"));


    // test delete
    expect(queryByTitle("delete")).not.toBeInTheDocument();
  });

  test("Verify edit with readIngestion and writeIngestion authorities", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "writeIngestion"]);

    const {baseElement, getByText, getAllByText, getByLabelText, getByPlaceholderText, getByTestId, queryAllByText} = render(
      <MemoryRouter><AuthoritiesContext.Provider value={authorityService}><Load/></AuthoritiesContext.Provider></MemoryRouter>
    );

    expect(await(waitForElement(() => getByLabelText("switch-view-list")))).toBeInTheDocument();

    // Check for steps to be populated
    expect(axiosMock.get).toBeCalledWith("/api/steps/ingestion");
    expect(getByText("testLoad")).toBeInTheDocument();

    // Check list view
    fireEvent.click(getByLabelText("switch-view-list"));
    // test 'Add New' button
    expect(getByText("Add New")).toBeInTheDocument();

    // Open settings
    await act(async () => {
      await fireEvent.click(getByText("testLoad"));
    });
    expect(getByText("Loading Step Settings")).toBeInTheDocument();
    expect(getByText("Basic").closest("button")).toHaveClass("nav-link active");
    expect(getByText("Advanced").closest("button")).not.toHaveClass("nav-link active");

    // Basic settings
    expect(getByPlaceholderText("Enter name")).toHaveValue("testLoad");
    expect(getByPlaceholderText("Enter name")).toBeDisabled();
    expect(getByPlaceholderText("Enter description")).toBeEnabled();
    expect(baseElement.querySelector("#sourceFormat")).not.toHaveClass("ant-select-disabled");
    expect(baseElement.querySelector("#targetFormat")).not.toHaveClass("ant-select-disabled");
    expect(baseElement.querySelector("#outputUriPrefix")).not.toHaveClass("ant-input-disabled");

    // Advanced settings
    await wait(() => {
      fireEvent.click(getByText("Advanced"));
    });
    expect(getByText("Basic").closest("button")).not.toHaveClass("nav-link active");
    expect(getByText("Advanced").closest("button")).toHaveClass("nav-link active");
    expect(getByLabelText("headers-textarea")).not.toBeDisabled();
    fireEvent.click(getByText("Interceptors"));
    expect(getByLabelText("interceptors-textarea")).not.toBeDisabled();
    fireEvent.click(getByText("Custom Hook"));
    expect(getByLabelText("customHook-textarea")).not.toBeDisabled();

    // No JSON (empty field)
    fireEvent.change(getByLabelText("headers-textarea"), {target: {value: ""}});
    expect(queryAllByText("Invalid JSON").length === 0);
    fireEvent.change(getByLabelText("interceptors-textarea"), {target: {value: ""}});
    expect(queryAllByText("Invalid JSON").length === 0);
    fireEvent.change(getByLabelText("customHook-textarea"), {target: {value: ""}});
    expect(queryAllByText("Invalid JSON").length === 0);

    // Invalid JSON
    fireEvent.change(getByLabelText("headers-textarea"), {target: {value: "{\"badJSON\": \"noClosingBracket\""}});
    expect(queryAllByText("Invalid JSON").length === 1);
    fireEvent.change(getByLabelText("interceptors-textarea"), {target: {value: "{\"badJSON\": \"noClosingBracket\""}});
    expect(queryAllByText("Invalid JSON").length === 2);
    fireEvent.change(getByLabelText("customHook-textarea"), {target: {value: "{\"badJSON\": \"noClosingBracket\""}});
    expect(queryAllByText("Invalid JSON").length === 3);

    // Valid JSON
    fireEvent.change(getByLabelText("headers-textarea"), {target: {value: "{\"goodJSON\": true}"}});
    expect(queryAllByText("Invalid JSON").length === 2);
    fireEvent.change(getByLabelText("interceptors-textarea"), {target: {value: "{\"goodJSON\": true}"}});
    expect(queryAllByText("Invalid JSON").length === 1);
    getByLabelText("customHook-textarea").focus();
    fireEvent.change(getByLabelText("customHook-textarea"), {target: {value: "{\"goodJSON\": true}"}});
    expect(queryAllByText("Invalid JSON").length === 0);
    getByLabelText("customHook-textarea").blur();

    expect(getByTestId("testLoad-save-settings")).not.toBeDisabled();
    fireEvent.click(getByTestId("testLoad-cancel-settings"));
    fireEvent.click(getAllByText("No")[0]); // Handle cancel confirmation

    // test delete
    fireEvent.click(getByTestId("testLoad-delete"));
    fireEvent.click(getAllByText("No")[1]);

    // Check card layout
    fireEvent.click(getByLabelText("switch-view-card"));
    // test 'Add New' button
    expect(getByText("Add New")).toBeInTheDocument();

    // test delete
    fireEvent.click(getByTestId("testLoad-delete"));
    expect(await(waitForElement(() => getByText("Yes")))).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(getByText("Yes"));
    });
    expect(axiosMock.delete).toHaveBeenNthCalledWith(1, "/api/steps/ingestion/testLoad");
  });

  test("Verify list and card views", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "writeIngestion"]);

    const {getByText, getAllByText, getByLabelText, getByTestId} = render(
      <MemoryRouter><AuthoritiesContext.Provider value={authorityService}><Load/></AuthoritiesContext.Provider></MemoryRouter>
    );

    expect(await(waitForElement(() => getByLabelText("switch-view-list")))).toBeInTheDocument();

    expect(getByText(tiles.load.intro)).toBeInTheDocument(); // tile intro text

    // Check for steps to be populated in default view
    expect(axiosMock.get).toBeCalledWith("/api/steps/ingestion");
    expect(getByText("testLoad")).toBeInTheDocument();
    expect(getByLabelText("load-" + DEFAULT_VIEW)).toBeInTheDocument();

    // Check list view
    fireEvent.click(getByLabelText("switch-view-list"));
    expect(getByText("testLoad")).toBeInTheDocument();
    expect(getByText("Test JSON.")).toBeInTheDocument();
    expect(getAllByText("json").length > 0);
    let ts: string = loadData.loads.data[0].lastUpdated; // "2000-01-01T12:00:00.000000-00:00"
    let tsExpected: string = moment(ts).format("MM/DD/YYYY H:mmA");
    expect(getByText(tsExpected)).toBeInTheDocument(); // "01/01/2000 4:00AM"
    expect(getByLabelText("icon: delete")).toBeInTheDocument();

    // Check card view
    fireEvent.click(getByLabelText("switch-view-card"));
    expect(getByText("testLoad")).toBeInTheDocument();
    expect(getByText("JSON")).toBeInTheDocument();
    let ts2: string = loadData.loads.data[0].lastUpdated; // "2000-01-01T12:00:00.000000-00:00"
    let tsExpected2: string = moment(ts2).format("MM/DD/YYYY H:mmA");
    expect(getByText("Last Updated: " + tsExpected2)).toBeInTheDocument(); // "Last Updated: 01/01/2000 4:00AM"
    expect(getByTestId("testLoad-edit")).toBeInTheDocument();
    expect(getByLabelText("icon: delete")).toBeInTheDocument();

  });

});


describe("getViewSettings", () => {
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

  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock
  });

  it("should get page number from session storage", () => {
    const getItemSpy = jest.spyOn(window.sessionStorage, "getItem");
    window.sessionStorage.setItem("dataHubViewSettings", JSON.stringify({load: {page: 2}}));
    const actualValue = getViewSettings();
    expect(actualValue).toEqual({load: {page: 2}});
    expect(getItemSpy).toBeCalledWith("dataHubViewSettings");
  });

  it("should get view mode from session storage", () => {
    const getItemSpy = jest.spyOn(window.sessionStorage, "getItem");
    window.sessionStorage.setItem("dataHubViewSettings", JSON.stringify({load: {viewMode: "list"}}));
    let actualValue = getViewSettings();
    expect(actualValue).toEqual({load: {viewMode: "list"}});
    expect(getItemSpy).toBeCalledWith("dataHubViewSettings");

    window.sessionStorage.setItem("dataHubViewSettings", JSON.stringify({load: {viewMode: "card"}}));
    actualValue = getViewSettings();
    expect(actualValue).toEqual({load: {viewMode: "card"}});
    expect(getItemSpy).toBeCalledWith("dataHubViewSettings");
  });

  it("should get sort order from session storage", () => {
    const getItemSpy = jest.spyOn(window.sessionStorage, "getItem");
    window.sessionStorage.setItem("dataHubViewSettings", JSON.stringify({load: {columnKey: "name", order: "ascend"}}));
    let actualValue = getViewSettings();
    expect(actualValue).toEqual({load: {columnKey: "name", order: "ascend"}});
    expect(getItemSpy).toBeCalledWith("dataHubViewSettings");

    window.sessionStorage.setItem("dataHubViewSettings", JSON.stringify({load: {columnKey: "name", order: "descend"}}));
    actualValue = getViewSettings();
    expect(actualValue).toEqual({load: {columnKey: "name", order: "descend"}});
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
