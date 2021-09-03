import React from "react";
import {render, fireEvent, waitForElement, cleanup, wait} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import {AuthoritiesContext, AuthoritiesService} from "../util/authorities";
import axiosMock from "axios";
import mocks from "../api/__mocks__/mocks.data";
import Curate from "./Curate";
import {MemoryRouter} from "react-router-dom";
import tiles from "../config/tiles.config";
import {MissingPagePermission} from "../config/messages.config";
import {CurationContext} from "../util/curation-context";
import {customerMappingStep} from "../assets/mock-data/curation/curation-context-mock";
import userEvent from "@testing-library/user-event";
import {getViewSettings} from "../util/user-context";

jest.mock("axios");

describe("Curate component", () => {

  beforeEach(() => {
    mocks.curateAPI(axiosMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test("Verify readMapping authority can only view mapping configs and settings", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping"]);

    const {getByText, getAllByText, queryByText, getByTestId, queryByTestId} = await render(
      <MemoryRouter><AuthoritiesContext.Provider value={authorityService}>
        <CurationContext.Provider value={customerMappingStep}>
          <Curate />
        </CurationContext.Provider>
      </AuthoritiesContext.Provider></MemoryRouter>);

    expect(await (waitForElement(() => getByText("Customer")))).toBeInTheDocument();

    expect(getByText(tiles.curate.intro)).toBeInTheDocument(); // tile intro text

    // Check for steps to be populated
    expect(axiosMock.get).toBeCalledWith("/api/steps/mapping");
    fireEvent.click(getByText("Customer"));
    //Mapping tab should show. Match/Merge should not
    expect(getByText("Map")).toBeInTheDocument();
    expect(queryByText("Match")).not.toBeInTheDocument();
    expect(queryByText("Merge")).not.toBeInTheDocument();

    expect(getByText("Mapping3")).toBeInTheDocument();

    // test edit
    fireEvent.click(getByTestId("Mapping3-edit"));
    wait(async () => {
      expect(await (waitForElement(() => getByText("Mapping Step Settings")))).toBeInTheDocument();
      expect(getAllByText("Save")[0]).toBeDisabled();
      userEvent.click(getAllByText("Cancel")[0]);
    });

    // test delete
    expect(queryByTestId("Mapping3-delete")).not.toBeInTheDocument();
  });

  test("Verify writeMapping authority can edit mapping configs and settings", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping"]);

    const {getByText, queryByText, getByTestId} = await render(
      <MemoryRouter><AuthoritiesContext.Provider value={authorityService}>
        <CurationContext.Provider value={customerMappingStep}>
          <Curate />
        </CurationContext.Provider>
      </AuthoritiesContext.Provider></MemoryRouter>);

    expect(await (waitForElement(() => getByText("Customer")))).toBeInTheDocument();
    // Check for steps to be populated
    expect(axiosMock.get).toBeCalledWith("/api/steps/mapping");
    fireEvent.click(getByText("Customer"));
    //Mapping tab should show. Match/Merge should not
    expect(getByText("Map")).toBeInTheDocument();
    expect(queryByText("Match")).not.toBeInTheDocument();
    expect(queryByText("Merge")).not.toBeInTheDocument();

    expect(getByText("Mapping1")).toBeInTheDocument();

    // test 'Add New' button
    expect(getByText("Add New")).toBeInTheDocument();

    // test edit
    fireEvent.click(getByTestId("Mapping1-edit"));
    wait(async () => {
      expect(await (waitForElement(() => getByText("Mapping Step Settings")))).toBeInTheDocument();
      expect(getByTestId("mapping-dialog-save")).not.toBeDisabled();
      fireEvent.click(getByTestId("mapping-dialog-cancel"));
    });
    // test delete
    fireEvent.click(getByTestId("Mapping1-delete"));
    await wait(() => {
      fireEvent.click(getByText("No"));
    });
    fireEvent.click(getByTestId("Mapping1-delete"));
    await wait(() => {
      fireEvent.click(getByText("Yes"));
    });
    expect(axiosMock.delete).toHaveBeenNthCalledWith(1, "/api/steps/mapping/Mapping1");
  });

  test("Verify user with no authorities cannot access page", async () => {
    const authorityService = new AuthoritiesService();
    const {getByText, queryByText} = await render(<MemoryRouter><AuthoritiesContext.Provider value={authorityService}><Curate /></AuthoritiesContext.Provider></MemoryRouter>);

    expect(await (waitForElement(() => getByText(MissingPagePermission)))).toBeInTheDocument();

    // entities should not be visible
    expect(queryByText("Customer")).not.toBeInTheDocument();
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

  const mappingStepArtifact = {
    acceptsBatch: true,
    batchSize: 100,
    collections: ["mapped-customers", "map-customers"],
    name: "map-customers",
    permissions: "data-hub-common,read,data-hub-common,update",
    provenanceGranularityLevel: "",
    sourceDatabase: "data-hub-STAGING",
    sourceQuery: "cts.collectionQuery('mapCustomersJSON')",
    stepDefinitionName: "default-mapping",
    stepDefinitionType: "mapping",
    stepId: "map-customers-mapping",
    stepUpdate: false,
    targetDatabase: "data-hub-FINAL",
    targetFormat: "json",
  };

  const mappingModelDefinition = {Customer: {}, Address: {}, Zip: {}};

  const mergingStepArtifact = {
    acceptsBatch: true,
    batchSize: 100,
    collections: ["matched-customers", "match-customers"],
    name: "match-customers",
    permissions: "data-hub-common,read,data-hub-common,update",
    provenanceGranularityLevel: "",
    sourceDatabase: "data-hub-FINAL",
    sourceQuery: "cts.collectionQuery('mapCustomersJSON')",
    stepDefinitionName: "default-matching",
    stepDefinitionType: "matching",
    stepId: "match-customers-matching",
    stepUpdate: false,
    targetDatabase: "data-hub-FINAL",
    targetFormat: "json",
  };

  const mergingModelDefinition = {Customer: {}, Address: {}, Zip: {}};

  const matchingStepArtifact = {
    acceptsBatch: true,
    batchSize: 100,
    collections: ["merged-customers", "merge-customers"],
    name: "merge-customers",
    permissions: "data-hub-common,read,data-hub-common,update",
    provenanceGranularityLevel: "",
    sourceDatabase: "data-hub-FINAL",
    sourceQuery: "cts.collectionQuery('mapCustomersJSON')",
    stepDefinitionName: "default-merging",
    stepDefinitionType: "merging",
    stepId: "merge-customers-merging",
    stepUpdate: false,
    targetDatabase: "data-hub-FINAL",
    targetFormat: "json",
  };

  const matchingModelDefinition = {Customer: {}, Address: {}, Zip: {}};

  // MAPPING
  it("should store mapping session storage info", () => {
    const getItemSpy = jest.spyOn(window.sessionStorage, "getItem");
    window.sessionStorage.setItem("dataHubViewSettings", JSON.stringify({curate: {stepArtifact: mappingStepArtifact, modelDefinition: mappingModelDefinition, entityType: "Customer"}}));
    const actualValue = getViewSettings();
    expect(actualValue).toEqual({curate: {stepArtifact: mappingStepArtifact, modelDefinition: mappingModelDefinition, entityType: "Customer"}});
    expect(getItemSpy).toBeCalledWith("dataHubViewSettings");
  });

  // MERGING
  it("should merging session storage info", () => {
    const getItemSpy = jest.spyOn(window.sessionStorage, "getItem");
    window.sessionStorage.setItem("dataHubViewSettings", JSON.stringify({curate: {stepArtifact: mergingStepArtifact, modelDefinition: mergingModelDefinition, entityType: "Customer"}}));
    const actualValue = getViewSettings();
    expect(actualValue).toEqual({curate: {stepArtifact: mergingStepArtifact, modelDefinition: mergingModelDefinition, entityType: "Customer"}});
    expect(getItemSpy).toBeCalledWith("dataHubViewSettings");
  });

  // MATCHING
  it("should merging session storage info", () => {
    const getItemSpy = jest.spyOn(window.sessionStorage, "getItem");
    window.sessionStorage.setItem("dataHubViewSettings", JSON.stringify({curate: {stepArtifact: matchingStepArtifact, modelDefinition: matchingModelDefinition, entityType: "Customer"}}));
    const actualValue = getViewSettings();
    expect(actualValue).toEqual({curate: {stepArtifact: matchingStepArtifact, modelDefinition: matchingModelDefinition, entityType: "Customer"}});
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
