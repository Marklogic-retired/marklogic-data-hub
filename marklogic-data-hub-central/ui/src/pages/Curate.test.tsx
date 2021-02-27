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
    const mockStepSettingsOpen = customerMappingStep.setStepOpenOptions;

    const {getByText, getAllByText, queryByText, getByTestId, queryByTestId} = await render(
      <MemoryRouter><AuthoritiesContext.Provider value={authorityService}>
        <CurationContext.Provider value={customerMappingStep}>
          <Curate/>
        </CurationContext.Provider>
      </AuthoritiesContext.Provider></MemoryRouter>);

    expect(await(waitForElement(() => getByText("Customer")))).toBeInTheDocument();

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
    expect(await(waitForElement(() => (mockStepSettingsOpen)))).toHaveBeenCalledWith({isEditing: true, openStepSettings: true}); //Indicates that the mapping settings modal is opened.
    wait(async () => {
      expect(await(waitForElement(() => getByText("Mapping Step Settings")))).toBeInTheDocument();
      expect(getAllByText("Save")[0]).toBeDisabled();
      userEvent.click(getAllByText("Cancel")[0]);
    });

    // test delete
    expect(queryByTestId("Mapping3-delete")).not.toBeInTheDocument();
  });

  test("Verify writeMapping authority can edit mapping configs and settings", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping"]);
    const mockStepSettingsOpen = customerMappingStep.setStepOpenOptions;

    const {getByText, queryByText, getByTestId} = await render(
      <MemoryRouter><AuthoritiesContext.Provider value={authorityService}>
        <CurationContext.Provider value={customerMappingStep}>
          <Curate/>
        </CurationContext.Provider>
      </AuthoritiesContext.Provider></MemoryRouter>);

    expect(await(waitForElement(() => getByText("Customer")))).toBeInTheDocument();
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
    expect(await(waitForElement(() => (mockStepSettingsOpen)))).toHaveBeenCalledWith({isEditing: true, openStepSettings: true}); //Indicates that the mapping settings modal is opened.
    wait(async () => {
      expect(await(waitForElement(() => getByText("Mapping Step Settings")))).toBeInTheDocument();
      expect(getByTestId("mapping-dialog-save")).not.toBeDisabled();
      fireEvent.click(getByTestId("mapping-dialog-cancel"));
    });
    // test delete
    fireEvent.click(getByTestId("Mapping1-delete"));
    fireEvent.click(getByText("No"));
    fireEvent.click(getByTestId("Mapping1-delete"));
    fireEvent.click(getByText("Yes"));
    expect(axiosMock.delete).toHaveBeenNthCalledWith(1, "/api/steps/mapping/Mapping1");
  });

  test("Verify user with no authorities cannot access page", async () => {
    const authorityService = new AuthoritiesService();
    const {getByText, queryByText} = await render(<MemoryRouter><AuthoritiesContext.Provider value={authorityService}><Curate/></AuthoritiesContext.Provider></MemoryRouter>);

    expect(await(waitForElement(() => getByText(MissingPagePermission)))).toBeInTheDocument();

    // entities should not be visible
    expect(queryByText("Customer")).not.toBeInTheDocument();
  });
});
