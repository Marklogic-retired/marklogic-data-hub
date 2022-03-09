import React from "react";
import {render, cleanup, fireEvent, waitForElement, wait} from "@testing-library/react";
import SystemInfo from "./system-info";
import {AuthoritiesContext, AuthoritiesService} from "../../util/authorities";
import {BrowserRouter as Router} from "react-router-dom";
import data from "../../assets/mock-data/system-info.data";
import axiosMock from "axios";
import mocks from "../../api/__mocks__/mocks.data";
import {SecurityTooltips} from "../../config/tooltips.config";
import userEvent from "@testing-library/user-event";
import curateData from "../../assets/mock-data/curation/flows.data";

jest.mock("axios");

const getSubElements=(content, node, title) => {
  const hasText = node => node.textContent === title;
  const nodeHasText = hasText(node);
  const childrenDontHaveText = Array.from(node.children).every(
    child => !hasText(child)
  );
  return nodeHasText && childrenDontHaveText;
};

Object.assign(navigator, {
  clipboard: {
    writeText: () => {},
  },
});

describe("Update data load settings component", () => {

  beforeEach(() => {
    axiosMock.get["mockImplementation"]((url) => {
      switch (url) {
      case "/api/models/primaryEntityTypes":
        return Promise.resolve({status: 200, data: curateData.primaryEntityTypes.data});
      default:
        return Promise.resolve([]);
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test("Verify project info display, user with no authority to have \"Download\" and \"Clear\" button disabled", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities([""]);
    const {getByText, getByTestId} = render(<Router><AuthoritiesContext.Provider value={authorityService}>
      <SystemInfo {...data.environment}
        systemInfoVisible={true}
        setSystemInfoVisible={jest.fn()}
      />
    </AuthoritiesContext.Provider></Router>);

    expect(getByText(data.environment.serviceName)).toBeInTheDocument();
    expect(getByText("Data Hub Version:")).toBeInTheDocument();
    expect(getByText(data.environment.dataHubVersion)).toBeInTheDocument();
    expect(getByText("MarkLogic Version:")).toBeInTheDocument();
    expect(getByText(data.environment.marklogicVersion)).toBeInTheDocument();
    expect(getByText("Download Hub Central Files")).toBeInTheDocument();
    expect(getByText("Download Project Files")).toBeInTheDocument();
    expect(getByTestId("clearData")).toBeInTheDocument();
    expect(getByText("Download a zip file containing only artifacts (models, steps, and flows) that were created or modified through Hub Central. You can apply these files to an existing local project.")).toBeInTheDocument();
    expect(getByText("Download a zip file containing all Data Hub project files (project configurations) and artifacts (models, steps, and flows) that were created or modified through Hub Central. You can use these files to set up the project locally and check them into a version control system.")).toBeInTheDocument();
    expect(getByText("Delete all user data in the STAGING, FINAL, and JOBS databases. Project files and artifacts remain.")).toBeInTheDocument();
    expect(getByTestId("downloadProjectFiles")).toBeDisabled();
    expect(getByTestId("downloadHubCentralFiles")).toBeDisabled();
    expect(getByTestId("clearUserData")).toBeDisabled();
  });

  test("Verify project info display, user with \"Download\" button enabled, and copy service name to clipboard", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["downloadProjectFiles"]);

    const {getByText, getByTestId} = render(<Router><AuthoritiesContext.Provider value={authorityService}>
      <SystemInfo {...data.environment}
        systemInfoVisible={true}
        setSystemInfoVisible={jest.fn()}
      />
    </AuthoritiesContext.Provider></Router>);

    expect(getByTestId("downloadProjectFiles")).toBeEnabled();
    expect(getByTestId("downloadHubCentralFiles")).toBeEnabled();
    expect(getByTestId("clearUserData")).toBeDisabled();

    //verify copy icon and tooltip
    fireEvent.mouseOver(getByTestId("copyServiceName"));
    await waitForElement(() => getByText("Copy to clipboard"));
    jest.spyOn(navigator.clipboard, "writeText");
    fireEvent.click(getByTestId("copyServiceName"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(data.environment.serviceName);

  });

  test("Verify project info display, user with \"Clear\" button enabled and deletes all data", async () => {
    mocks.clearUserDataAPI(axiosMock);

    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["clearUserData"]);
    const {getByText, getByTestId, getByLabelText} = render(<Router><AuthoritiesContext.Provider value={authorityService}>
      <SystemInfo
        systemInfoVisible={true}
        setSystemInfoVisible={jest.fn()}
      />
    </AuthoritiesContext.Provider></Router>);

    expect(getByTestId("downloadProjectFiles")).toBeDisabled();
    expect(getByTestId("downloadHubCentralFiles")).toBeDisabled();
    expect(getByTestId("clearUserData")).toBeEnabled();

    //Verify confirmation modal appears when Clear button is clicked
    let clearBtn = getByTestId("clearUserData");
    fireEvent.click(clearBtn);

    expect(getByText(`Are you sure you want to clear all user data? This action will reset your instance to a state similar to a newly created DHS instance with your project artifacts.`));
    let confirm = getByLabelText("Yes");
    fireEvent.click(confirm);
    expect(axiosMock.post).toBeCalledWith("/api/environment/clearUserData", {});

    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, "Clear All User Data completed successfully");
    })))).toBeInTheDocument();
  });

  test("Verify project info display, user with \"Clear\" button enabled and options work correctly", async () => {
    mocks.clearUserDataAPI(axiosMock);
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["clearUserData"]);

    const {getByText, getByTestId, getByLabelText, getByPlaceholderText} = render(<Router><AuthoritiesContext.Provider value={authorityService}>
      <SystemInfo
        systemInfoVisible={true}
        setSystemInfoVisible={jest.fn()}
      />
    </AuthoritiesContext.Provider></Router>);

    await(() => expect(axiosMock.get).toHaveBeenCalledTimes(1));

    await wait(()  => {
      expect(getByTestId("clearUserData")).toBeEnabled();
      expect(getByTestId("deleteAll")).toBeChecked();
      expect(getByText("Select a Database:")).toBeInTheDocument();
      expect(getByLabelText("targetDatabase-select")).not.toBeEnabled();
      expect(getByLabelText("targetBasedOn-select")).not.toBeEnabled();

      fireEvent.click(getByTestId("deleteSubset"));
      expect(getByTestId("deleteSubset")).toBeChecked();

      expect(getByLabelText("targetDatabase-select")).toBeEnabled();
      expect(getByLabelText("targetBasedOn-select")).toBeEnabled();
      expect(getByTestId("targetBasedOnOptions-None")).toBeInTheDocument();
      expect(getByTestId("clearUserData")).toBeEnabled();

      fireEvent.keyDown(getByLabelText("targetBasedOn-select"), {key: "ArrowDown"});
      expect(getByText("Collection")).toBeInTheDocument();
      fireEvent.click(getByText("Collection"));
      const collectionsInput = getByPlaceholderText("Search collections");
      expect(collectionsInput).toBeInTheDocument();

      expect(getByTestId("clearUserData")).not.toBeEnabled();
      fireEvent.keyDown(getByLabelText("targetBasedOn-select"), {key: "ArrowDown"});
      expect(getByText("Entity")).toBeInTheDocument();
      fireEvent.click(getByText("Entity"));
      const entitiesInput = getByPlaceholderText("Search entities");
      expect(entitiesInput).toBeInTheDocument();
      expect(getByTestId("clearUserData")).not.toBeEnabled();

      userEvent.type(entitiesInput, "cust");
      expect(getByLabelText("Customer")).toBeInTheDocument();
      fireEvent.click(getByLabelText("Customer"));

      let clearBtn = getByTestId("clearUserData");
      expect(clearBtn).toBeEnabled();
      fireEvent.click(clearBtn);

      //TODO DHFPROD-8576 to add the validation to get the new modal texts.

      let confirm = getByLabelText("Yes");
      fireEvent.click(confirm);
      expect(axiosMock.post).toBeCalledWith("/api/environment/clearUserData",
        {targetCollection: "Customer", targetDatabase: "data-hub-STAGING"});

      expect(getByText((content, node) => {
        return getSubElements(content, node, "Clear All User Data completed successfully");
      })).toBeInTheDocument();
    });

  });

  test("Verify user with incorrect permissions sees security permissions tooltip and buttons are disabled", () => {
    const authorityService = new AuthoritiesService();
    const {getByText, getByTestId} = render(<Router><AuthoritiesContext.Provider value={authorityService}>
      <SystemInfo
        systemInfoVisible={true}
        setSystemInfoVisible={jest.fn()}
      />
    </AuthoritiesContext.Provider></Router>);

    fireEvent.mouseOver(getByTestId("downloadHubCentralFiles"));
    wait(() => expect(getByText(SecurityTooltips.missingPermission)).toBeInTheDocument());
    expect(getByTestId("downloadHubCentralFiles")).toBeDisabled();

    fireEvent.mouseOver(getByTestId("downloadProjectFiles"));
    wait(() => expect(getByText(SecurityTooltips.missingPermission)).toBeInTheDocument());
    expect(getByTestId("downloadProjectFiles")).toBeDisabled();

    fireEvent.mouseOver(getByTestId("clearUserData"));
    wait(() => expect(getByText(SecurityTooltips.missingPermission)).toBeInTheDocument());
    expect(getByTestId("clearUserData")).toBeDisabled();
  });
});
