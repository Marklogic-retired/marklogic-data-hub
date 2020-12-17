import React from "react";
import {BrowserRouter as Router} from "react-router-dom";
import {fireEvent, render, wait, waitForElement} from "@testing-library/react";
import CustomCard from "./custom-card";
import axiosMock from "axios";
import data from "../../../assets/mock-data/curation/flows.data";
import {act} from "react-dom/test-utils";
import {AuthoritiesService, AuthoritiesContext} from "../../../util/authorities";
import mocks from "../../../api/__mocks__/mocks.data";
import {AdvCustomTooltips} from "../../../config/tooltips.config";


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

  test("Custom card does not allow edit", async () => {
    let customData = data.customSteps.data.stepsWithEntity[0].artifacts;
    let getByRole, queryAllByRole, getByText, getByTestId;
    await act(async () => {
      const renderResults = render(
        <Router><CustomCard data={customData} canReadOnly={true} canReadWrite={false}/></Router>
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
    await waitForElement(() => getByText(AdvCustomTooltips.viewCustom));
  });

  test("Open advanced settings", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readCustom"]);
    let customData = data.customSteps.data.stepsWithEntity[0].artifacts;
    const {getByText, queryByText, getByLabelText, getByPlaceholderText, getByTestId} = render(
      <Router><AuthoritiesContext.Provider value={authorityService}>
        <CustomCard
          data={customData}
          canReadOnly={true}
          canReadWrite={false}
        />
      </AuthoritiesContext.Provider></Router>);

    await wait(() => {
      fireEvent.click(getByTestId("customJSON-edit"));
    });

    expect(getByText("Custom Step Settings")).toBeInTheDocument();
    expect(getByText("Basic").closest("div")).toHaveClass("ant-tabs-tab-active");
    expect(getByText("Advanced").closest("div")).not.toHaveClass("ant-tabs-tab-active");

    // Basic settings values
    expect(getByPlaceholderText("Enter name")).toHaveValue("customJSON");
    expect(getByPlaceholderText("Enter name")).toBeDisabled();
    expect(getByPlaceholderText("Enter description")).toBeDisabled();
    expect(getByLabelText("Collection")).toBeInTheDocument();
    expect(getByLabelText("Query")).toBeChecked();
    expect(getByPlaceholderText("Enter Source Query")).toHaveTextContent("cts.collectionQuery(['loadCustomerJSON'])");

    // Switch to Advanced settings
    await wait(() => {
      fireEvent.click(getByText("Advanced"));
    });
    expect(getByText("Basic").closest("div")).not.toHaveClass("ant-tabs-tab-active");
    expect(getByText("Advanced").closest("div")).toHaveClass("ant-tabs-tab-active");

    // Advanced settings values
    expect(getByText("Source Database")).toBeInTheDocument();
    expect(getByText("db1")).toBeInTheDocument();
    expect(getByText("Target Database")).toBeInTheDocument();
    expect(getByText("db2")).toBeInTheDocument();
    expect(getByText("Batch Size")).toBeInTheDocument();
    expect(getByPlaceholderText("Please enter batch size")).toHaveValue("50");
    expect(getByPlaceholderText("Please enter batch size")).toBeDisabled();
    expect(getByText("Target Collections")).toBeInTheDocument();
    expect(getByText("Default Collections")).toBeInTheDocument();
    expect(getByTestId("defaultCollections-Customer")).toBeInTheDocument();
    expect(getByTestId("defaultCollections-mapCustomerJSON")).toBeInTheDocument();
    expect(getByText("Target Permissions")).toBeInTheDocument();
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("role1,read,role2,update");
    expect(getByPlaceholderText("Please enter target permissions")).toBeDisabled();
    expect(getByText("Provenance Granularity")).toBeInTheDocument();
    expect(getByText("Processors")).toBeInTheDocument();
    expect(getByText("Custom Hook")).toBeInTheDocument();
    expect(getByText("Additional Settings")).toBeInTheDocument();

    fireEvent.click(getByLabelText("Close"));
    await wait(() => {
      expect(queryByText("Custom Step Settings")).not.toBeInTheDocument();
    });

  });

});
