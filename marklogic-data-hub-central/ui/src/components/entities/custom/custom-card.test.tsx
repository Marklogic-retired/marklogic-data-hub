import React from "react";
import {BrowserRouter as Router} from "react-router-dom";
import {fireEvent, render, wait, waitForElement} from "@testing-library/react";
import CustomCard from "./custom-card";
import axiosMock from "axios";
import data from "../../../assets/mock-data/curation/flows.data";
import {act} from "react-dom/test-utils";
import {AuthoritiesService, AuthoritiesContext} from "../../../util/authorities";
import mocks from "../../../api/__mocks__/mocks.data";
import {CustomStepTooltips} from "../../../config/tooltips.config";


jest.mock("axios");

const mockHistoryPush = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe("Custom Card component", () => {
  beforeEach(() => {
    mocks.curateAPI(axiosMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Open settings in read-write mode", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readCustom", "writeCustom"]);
    let customData = data.customSteps.data.stepsWithEntity[0].artifacts;
    const {getByText, queryByText, getByLabelText, getByPlaceholderText, getByTestId} = render(
      <Router><AuthoritiesContext.Provider value={authorityService}>
        <CustomCard
          data={customData}
          canReadOnly={true}
          canReadWrite={true}
          entityModel={{entityTypeId: "Customer"}}
          getArtifactProps={() => { return customData[0]; }}
        />
      </AuthoritiesContext.Provider></Router>);

    await wait(() => {
      fireEvent.click(getByTestId("customJSON-edit"));
    });

    expect(getByText("Custom Step Settings")).toBeInTheDocument();
    expect(getByText("Basic").closest("button")).toHaveClass("nav-link active");
    expect(getByText("Advanced").closest("button")).not.toHaveClass("nav-link active");

    // Basic settings values
    expect(getByPlaceholderText("Enter name")).toHaveValue("customJSON");
    expect(getByPlaceholderText("Enter name")).toBeDisabled();
    expect(getByPlaceholderText("Enter description")).toBeEnabled();
    expect(getByLabelText("Collection")).toBeInTheDocument();
    expect(getByLabelText("Query")).toBeChecked();
    expect(getByPlaceholderText("Enter source query")).toHaveTextContent("cts.collectionQuery(['loadCustomerJSON'])");

    // Switch to Advanced settings
    await wait(() => {
      fireEvent.click(getByText("Advanced"));
    });
    expect(getByText("Basic").closest("button")).not.toHaveClass("nav-link active");
    expect(getByText("Advanced").closest("button")).toHaveClass("nav-link active");

    // Advanced settings values
    expect(getByText("Source Database:")).toBeInTheDocument();
    const dropdownSourceDatabase = getByLabelText("sourceDatabase-select");
    expect(dropdownSourceDatabase).toBeEnabled();
    expect(getByText("data-hub-STAGING")).toBeInTheDocument();

    expect(getByText("Target Database:")).toBeInTheDocument();
    expect(getByText("data-hub-FINAL")).toBeInTheDocument();
    expect(getByLabelText("targetDatabase-select")).toBeEnabled();

    expect(getByText("Batch Size:")).toBeInTheDocument();
    expect(getByPlaceholderText("Please enter batch size")).toHaveValue("50");
    expect(getByPlaceholderText("Please enter batch size")).toBeEnabled();

    expect(getByText("Target Collections:")).toBeInTheDocument();
    expect(getByLabelText("additionalColl-select")).toBeEnabled();

    expect(getByText("Default Collections:")).toBeInTheDocument();
    expect(getByTestId("defaultCollections-Customer")).toBeInTheDocument();
    expect(getByTestId("defaultCollections-mapCustomerJSON")).toBeInTheDocument();

    expect(getByText("Target Permissions:")).toBeInTheDocument();
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("role1,read,role2,update");
    expect(getByPlaceholderText("Please enter target permissions")).toBeEnabled();

    expect(getByText("Provenance Granularity:")).toBeInTheDocument();
    expect(getByLabelText("provGranularity-select")).toBeEnabled();

    expect(getByText("Interceptors")).toBeInTheDocument();
    expect(getByText("Custom Hook")).toBeInTheDocument();
    expect(getByText("Additional Settings:")).toBeInTheDocument();

    fireEvent.click(getByLabelText("Close"));
    await wait(() => {
      expect(queryByText("Custom Step Settings")).not.toBeInTheDocument();
    });

  });

  test("Open settings in read-only mode", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readCustom"]);
    let customData = data.customSteps.data.stepsWithEntity[0].artifacts;
    const {getByText, queryByText, getByLabelText, getByPlaceholderText, getByTestId} = render(
      <Router><AuthoritiesContext.Provider value={authorityService}>
        <CustomCard
          data={customData}
          canReadOnly={true}
          canReadWrite={false}
          entityModel={{entityTypeId: "Customer"}}
          getArtifactProps={() => { return customData[0]; }}
        />
      </AuthoritiesContext.Provider></Router>);

    await wait(() => {
      fireEvent.click(getByTestId("customJSON-edit"));
    });

    expect(getByText("Custom Step Settings")).toBeInTheDocument();
    expect(getByText("Basic").closest("button")).toHaveClass("nav-link active");
    expect(getByText("Advanced").closest("button")).not.toHaveClass("nav-link active");

    // Basic settings values
    expect(getByPlaceholderText("Enter name")).toHaveValue("customJSON");
    expect(getByPlaceholderText("Enter name")).toBeDisabled();
    expect(getByPlaceholderText("Enter description")).toBeDisabled();
    expect(getByLabelText("Collection")).toBeInTheDocument();
    expect(getByLabelText("Query")).toBeChecked();
    expect(getByPlaceholderText("Enter source query")).toHaveTextContent("cts.collectionQuery(['loadCustomerJSON'])");

    // Switch to Advanced settings
    await wait(() => {
      fireEvent.click(getByText("Advanced"));
    });
    expect(getByText("Basic").closest("button")).not.toHaveClass("nav-link active");
    expect(getByText("Advanced").closest("button")).toHaveClass("nav-link active");

    // Advanced settings values
    expect(getByText("Source Database:")).toBeInTheDocument();
    expect(getByText("data-hub-STAGING")).toBeInTheDocument();
    expect(getByText("Target Database:")).toBeInTheDocument();
    expect(getByText("data-hub-FINAL")).toBeInTheDocument();
    expect(getByText("Batch Size:")).toBeInTheDocument();
    expect(getByPlaceholderText("Please enter batch size")).toHaveValue("50");
    expect(getByPlaceholderText("Please enter batch size")).toBeDisabled();
    expect(getByText("Target Collections:")).toBeInTheDocument();
    expect(getByText("Default Collections:")).toBeInTheDocument();
    expect(getByTestId("defaultCollections-Customer")).toBeInTheDocument();
    expect(getByTestId("defaultCollections-mapCustomerJSON")).toBeInTheDocument();
    expect(getByText("Target Permissions:")).toBeInTheDocument();
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("role1,read,role2,update");
    expect(getByPlaceholderText("Please enter target permissions")).toBeDisabled();
    expect(getByText("Provenance Granularity:")).toBeInTheDocument();
    expect(getByText("Interceptors")).toBeInTheDocument();
    expect(getByText("Custom Hook")).toBeInTheDocument();
    expect(getByText("Additional Settings:")).toBeInTheDocument();

    fireEvent.click(getByLabelText("Close"));
    await wait(() => {
      expect(queryByText("Custom Step Settings")).not.toBeInTheDocument();
    });

  });

  test("Custom card does not allow edit without writeCustom", async () => {
    let customData = data.customSteps.data.stepsWithEntity[0].artifacts;
    let getByRole, queryAllByRole, getByText, getByTestId;
    await act(async () => {
      const renderResults = render(
        <Router><CustomCard data={customData} canReadOnly={true} canReadWrite={false} entityModel={{entityTypeId: "Customer"}}/></Router>
      );
      getByRole = renderResults.getByRole;
      queryAllByRole = renderResults.queryAllByRole;
      getByText=renderResults.getByText;
      getByTestId=renderResults.getByTestId;
    });

    expect(getByRole("edit-custom")).toBeInTheDocument();
    expect(queryAllByRole("delete-custom")).toHaveLength(0);

    let tipIconView = getByTestId("customJSON-edit");
    fireEvent.mouseOver(tipIconView);
    await waitForElement(() => getByText(CustomStepTooltips.viewCustom));
  });

  test("Can add step to flow", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readCustom"]);
    let customData = data.customSteps.data.stepsWithEntity[0].artifacts;
    let flows = data.flows.data;
    const {getByText, getByLabelText, getByTestId} = render(
      <Router><AuthoritiesContext.Provider value={authorityService}>
        <CustomCard
          data={customData}
          flows={flows}
          canReadOnly={true}
          canReadWrite={false}
          canWriteFlow={true}
          entityModel={{entityTypeId: "Customer"}}
          addStepToFlow={() => {}}
          getArtifactProps={() => { return customData[0]; }}
        />
      </AuthoritiesContext.Provider></Router>);

    expect(getByText("customJSON")).toBeInTheDocument();

    // hover over card to see options
    fireEvent.mouseOver(getByText("customJSON"));
    expect(getByTestId("customJSON-toNewFlow")).toBeInTheDocument(); // 'Add to a new Flow'
    expect(getByTestId("customJSON-toExistingFlow")).toBeInTheDocument(); // 'Add to an existing Flow'

    // Open menu, choose flow
    fireEvent.keyDown(getByLabelText("customJSON-flowsList"), {key: "ArrowDown"});
    fireEvent.click(getByLabelText("testFlow-option"));

    // Dialog appears, click 'Yes' button
    expect(getByLabelText("step-not-in-flow")).toBeInTheDocument();
    fireEvent.click(getByTestId("customJSON-to-testFlow-Confirm"));

    // Check if the /tiles/run/add route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add"); });
  });
});
