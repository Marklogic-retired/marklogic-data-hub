import React from "react";
import {BrowserRouter as Router, MemoryRouter} from "react-router-dom";
import {fireEvent, render, wait, cleanup, waitForElement, screen} from "@testing-library/react";
import MappingCard from "./mapping-card";
import axiosMock from "axios";
import data from "../../../assets/mock-data/curation/flows.data";
import {act} from "react-dom/test-utils";
import {AuthoritiesService, AuthoritiesContext} from "../../../util/authorities";
import mocks from "../../../api/__mocks__/mocks.data";
import {SecurityTooltips} from "../../../config/tooltips.config";
import moment from "moment";

jest.mock("axios");

const mockHistoryPush = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

const getSubElements=(content, node, title) => {
  const hasText = node => node.textContent === title;
  const nodeHasText = hasText(node);
  const childrenDontHaveText = Array.from(node.children).every(
    child => !hasText(child)
  );
  return nodeHasText && childrenDontHaveText;
};

describe("Mapping Card component", () => {

  const mapping = data.mappings.data[0].artifacts;
  const entityModel = data.primaryEntityTypes.data[0];
  const mappingProps = {
    data: mapping,
    flows: data.flows.data,
    entityTypeTitle: entityModel.entityName,
    entityModel: entityModel,
    openStep: {},
    deleteMappingArtifact: jest.fn(() => {}),
    createMappingArtifact: () => {},
    updateMappingArtifact: () => {},
    addStepToFlow: () => {},
    addStepToNew: () => {},
    canReadOnly: false,
    canReadWrite: false,
    canWriteFlow: false,
  };

  beforeEach(() => {
    mocks.curateAPI(axiosMock);
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test("Mapping card does not allow edit without writeMapping authority", async () => {
    const deleteMappingArtifact = jest.fn(() => {});
    let queryAllByText, getByText, getByRole, queryAllByRole, getByTestId, getByLabelText;
    await act(async () => {
      const renderResults = render(
        <Router><MappingCard
          {...mappingProps}
          canReadOnly={true}
          deleteMappingArtifact={deleteMappingArtifact}
        /></Router>
      );
      getByText = renderResults.getByText;
      getByRole = renderResults.getByRole;
      queryAllByText = renderResults.queryAllByText;
      queryAllByRole = renderResults.queryAllByRole;
      getByTestId = renderResults.getByTestId;
      getByLabelText = renderResults.getByLabelText;
    });

    fireEvent.mouseOver(getByLabelText("add-new-card-disabled"));
    await wait(() => expect(getByText("Curate: "+SecurityTooltips.missingPermission)).toBeInTheDocument());

    fireEvent.mouseOver(getByText("Mapping1"));
    wait(() => expect(getByText("Curate: "+SecurityTooltips.missingPermission)).toBeInTheDocument());
    wait(() => expect(getByText("Step Details")).toBeInTheDocument());
    expect(queryAllByRole("delete-mapping")).toHaveLength(0);
    fireEvent.mouseOver(getByRole("edit-mapping"));
    await wait(() => expect(getByText("Step Settings")).toBeInTheDocument());
    fireEvent.mouseOver(getByTestId("Mapping1-stepDetails"));

    // test delete icon displays correct tooltip when disabled
    fireEvent.mouseOver(getByRole("disabled-delete-mapping"));
    await wait(() => expect(getByText("Delete: " + SecurityTooltips.missingPermission)).toBeInTheDocument());

    await fireEvent.click(getByRole("disabled-delete-mapping"));
    expect(queryAllByText("Yes")).toHaveLength(0);
    expect(deleteMappingArtifact).not.toBeCalled();

  });

  test("Mapping card does allow edit with writeMapping authority", async () => {
    const deleteMappingArtifact = jest.fn(() => {});
    let getByText, getByRole, queryAllByRole, getByTestId;
    await act(async () => {
      const renderResults = render(
        <Router><MappingCard
          {...mappingProps}
          canReadOnly={true}
          canReadWrite={true}
          deleteMappingArtifact={deleteMappingArtifact}
        /></Router>
      );
      getByText = renderResults.getByText;
      getByRole = renderResults.getByRole;
      queryAllByRole = renderResults.queryAllByRole;
      getByTestId = renderResults.getByTestId;
    });

    expect(getByRole("edit-mapping")).toBeInTheDocument();
    expect(getByTestId("Mapping1-stepDetails")).toBeInTheDocument();
    expect(queryAllByRole("disabled-delete-mapping")).toHaveLength(0);
    expect(getByRole("delete-mapping")).toBeInTheDocument();

    // check if delete tooltip appears
    fireEvent.mouseOver(getByRole("delete-mapping"));
    await wait(() => expect(getByText("Delete")).toBeInTheDocument());
    await fireEvent.click(getByRole("delete-mapping"));
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, "Are you sure you want to delete the Mapping1 step?");
    })))).toBeInTheDocument();
    await fireEvent.click(getByText("Yes"));
    expect(deleteMappingArtifact).toBeCalled();
  });

  test("Mapping card parses XML appropriately", async () => {
    let getByTestId;
    await act(async () => {
      const renderResults = render(
        <Router><MappingCard
          {...mappingProps}
          canReadOnly={true}
          canReadWrite={true}
        /></Router>);
      getByTestId = renderResults.getByTestId;
    });

    await act(async () => {
      await fireEvent.click(getByTestId("Mapping1-stepDetails"));
    });

    expect(mockHistoryPush).toHaveBeenCalledWith({"pathname": "/tiles/curate/map"});

    wait(async () => {
      const orderDetailsNode = await screen.findByText("OrderDetails");
      expect(orderDetailsNode.parentNode).toHaveTextContent("OrderNS:");
    });
  });

  test("Open step settings", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["writeMapping", "readMapping"]);
    const {getByText, getByLabelText, getByTestId, getByPlaceholderText} = render(
      <Router><AuthoritiesContext.Provider value={authorityService}>
        <MappingCard
          {...mappingProps}
          canReadWrite={true}
          canWriteFlow={true}
        /></AuthoritiesContext.Provider></Router>
    );

    // Open default Basic settings
    await wait(() => {
      fireEvent.click(getByTestId("Mapping1-edit"));
    });
    wait(async () => {
      expect(screen.getByText("Mapping Step Settings")).toBeInTheDocument();
      expect(getByText("Basic").closest("button")).toHaveClass("nav-link active");
      expect(getByText("Advanced").closest("button")).not.toHaveClass("nav-link active");

      // Basic settings values
      expect(getByPlaceholderText("Enter name")).toHaveValue("Mapping1");
      expect(getByPlaceholderText("Enter name")).toBeDisabled();
      expect(getByPlaceholderText("Enter description")).toBeInTheDocument();

      expect(getByLabelText("Collection")).toBeChecked();
      const collInput = document.querySelector(("#collList .ant-input"));
      expect(collInput).toHaveValue("default-ingestion");

      fireEvent.click(getByLabelText("Query"));
      expect(getByPlaceholderText("Enter source query")).toHaveTextContent("cts.collectionQuery(['default-ingestion'])");

      // Switch to Advanced settings
      await wait(() => {
        fireEvent.click(getByText("Advanced"));
      });
      expect(getByText("Basic").closest("button")).not.toHaveClass("nav-link active");
      expect(getByText("Advanced").closest("button")).toHaveClass("nav-link active");

      // Advanced settings values
      expect(getByText("Source Database")).toBeInTheDocument();
      expect(getByText("data-hub-STAGING")).toBeInTheDocument();
      expect(getByText("Target Database")).toBeInTheDocument();
      expect(getByText("data-hub-FINAL")).toBeInTheDocument();
      expect(getByText("Batch Size")).toBeInTheDocument();
      expect(getByPlaceholderText("Please enter batch size")).toHaveValue("50");
      expect(getByText("Target Permissions")).toBeInTheDocument();
      expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("data-hub-common,read,data-hub-common,update");
      expect(getByText("Entity Validation")).toBeInTheDocument();
      expect(getByText("Please select Entity Validation")).toBeInTheDocument();
      expect(getByText("Attach Source Document")).toBeInTheDocument();
      const radio = getByLabelText("No");
      expect(radio["value"]).toBe("false");
      expect(getByText("Please select Entity Validation")).toBeInTheDocument();
      expect(getByText("Header Content")).toBeInTheDocument();
      expect(getByText("Interceptors")).toBeInTheDocument();
      expect(getByText("Custom Hook")).toBeInTheDocument();

      await wait(() => {
        fireEvent.click(getByLabelText("Close"));
      });
    });
  });

  test("Verify Card sort order, adding the step to an existing flow, and running the step in an existing flow where step DOES NOT exist", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping", "writeFlow"]);
    let mapping = data.mappings.data[0].artifacts.concat(data.mappings.data[1].artifacts);
    let getByText, getByLabelText, getByTestId;
    await act(async () => {
      const renderResults = render(
        <MemoryRouter><AuthoritiesContext.Provider value={authorityService}><MappingCard
          {...mappingProps}
          data={mapping}
          canReadWrite={true}
          canWriteFlow={true}
        /></AuthoritiesContext.Provider></MemoryRouter>
      );
      getByText = renderResults.getByText;
      getByLabelText = renderResults.getByLabelText;
      getByTestId = renderResults.getByTestId;
    });

    // Check if the card is rendered properly
    expect(getByText("Add New")).toBeInTheDocument();
    expect(getByText("Mapping1")).toBeInTheDocument();
    let ts: string = mapping[0].lastUpdated; // "2020-04-24T13:21:00.169198-07:00"
    let tsExpected: string = moment(ts).format("MM/DD/YYYY h:mmA");
    expect(getByText("Last Updated: " + tsExpected)).toBeInTheDocument(); // "Last Updated: 04/24/2020 1:21PM"
    expect(getByText("Mapping2")).toBeInTheDocument();
    let ts2: string = mapping[1].lastUpdated; // "2020-10-01T02:38:00.169198-07:00"
    let tsExpected2: string = moment(ts2).format("MM/DD/YYYY h:mmA");
    expect(getByText("Last Updated: " + tsExpected2)).toBeInTheDocument(); // "Last Updated: 10/01/2020 2:38AM"

    // Hover for options
    fireEvent.mouseOver(getByText("Mapping2"));
    expect(getByTestId("Mapping2-toNewFlow")).toBeInTheDocument(); // 'Add to a new Flow'
    expect(getByTestId("Mapping2-toExistingFlow")).toBeInTheDocument(); // 'Add to an existing Flow'

    // Open menu, choose flow
    fireEvent.keyDown(getByLabelText("Mapping2-flowsList"), {key: "ArrowDown"});
    fireEvent.click(getByLabelText("testFlow-option"));

    // Dialog appears, click 'Yes' button
    expect(getByLabelText("step-not-in-flow")).toBeInTheDocument();
    fireEvent.click(getByTestId("Mapping2-to-testFlow-Confirm"));

    // Check if the /tiles/run/add route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add"); });
    // TODO- E2E test to check if the Run tile is loaded or not.


    //Verify run step in an existing flow where step does not exist yet

    //Click play button 'Run' icon
    fireEvent.click(getByTestId("Mapping2-run"));

    //Modal with options to run in an existing or new flow should appear
    expect(getByLabelText("step-in-no-flows-confirmation")).toBeInTheDocument();

    //Select flow to add and run step in
    fireEvent.click(getByTestId("testFlow-run-step"));

    //Check if the /tiles/run/add-run route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add-run"); });

  });

  test("Adding the step to an existing flow and running the step in an existing flow where step DOES exist", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping", "writeFlow"]);
    let getByText, getByLabelText, getByTestId;
    await act(async () => {
      const renderResults = render(
        <MemoryRouter><AuthoritiesContext.Provider value={authorityService}><MappingCard
          {...mappingProps}
          canReadWrite={true}
          canWriteFlow={true}
        /></AuthoritiesContext.Provider></MemoryRouter>
      );
      getByText = renderResults.getByText;
      getByLabelText = renderResults.getByLabelText;
      getByTestId = renderResults.getByTestId;
    });

    // Hover for options, open menu, choose flow
    fireEvent.mouseOver(getByText("Mapping1"));
    fireEvent.keyDown(getByLabelText("Mapping1-flowsList"), {key: "ArrowDown"});
    fireEvent.click(getByText("testFlow"));

    // Dialog appears, click 'Yes'
    expect(getByLabelText("step-in-flow")).toBeInTheDocument();
    fireEvent.click(getByTestId("Mapping1-to-testFlow-Confirm"));

    //Check if the /tiles/run/add route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add"); });
    //TODO- E2E test to check if the Run tile is loaded or not.

    //Verify run step in an existing flow where step does exist

    //Click play button 'Run' icon
    fireEvent.click(getByTestId("Mapping1-run"));

    //Confirmation modal for directly running the step in its flow should appear
    expect(getByLabelText("run-step-one-flow-confirmation")).toBeInTheDocument();

    //Click Continue to confirm
    fireEvent.click(getByLabelText("continue-confirm"));

    //Check if the /tiles/run/run-step route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/run-step"); });

  });


  test("Run step in an existing flow where step exists in MORE THAN ONE flow", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping", "writeFlow"]);
    const mapping = data.mappings.data[2].artifacts;
    const flows = [{name: "testStepInMultFlow", steps: [{stepName: "Mapping3"}]}, {name: "mappingFlow", steps: [{stepName: "Mapping3"}]}];
    let getByLabelText, getByTestId;
    await act(async () => {
      const renderResults = render(
        <MemoryRouter><AuthoritiesContext.Provider value={authorityService}><MappingCard
          {...mappingProps}
          data={mapping}
          flows={flows}
          canReadWrite={true}
          canWriteFlow={true}
        /></AuthoritiesContext.Provider></MemoryRouter>
      );
      getByLabelText = renderResults.getByLabelText;
      getByTestId = renderResults.getByTestId;
    });

    //Verify run step in an existing flow where step exists in more than one flow

    //Click play button 'Run' icon
    fireEvent.click(getByTestId("Mapping3-run"));

    //Modal with list of flows where step exists to select one to run in
    expect(getByLabelText("run-step-mult-flows-confirmation")).toBeInTheDocument();

    //Select flow to run step in
    fireEvent.click(getByTestId("testStepInMultFlow-run-step"));

    //Check if the /tiles/run/add-run route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add-run"); });
  });

  test("Adding the step to a new flow", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping", "writeFlow"]);
    const mapping = data.mappings.data[0].artifacts;
    let getByText, getByTestId;
    await act(async () => {
      const renderResults = render(
        <MemoryRouter><AuthoritiesContext.Provider value={authorityService}><MappingCard
          {...mappingProps}
          data={mapping}
          canReadWrite={true}
          canWriteFlow={true}
        /></AuthoritiesContext.Provider></MemoryRouter>
      );
      getByText = renderResults.getByText;
      getByTestId = renderResults.getByTestId;
    });

    //Check if the card is rendered properly
    expect(getByText("Add New")).toBeInTheDocument();
    let ts: string = mapping[0].lastUpdated; // "2020-04-24T13:21:00.169198-07:00"
    let tsExpected: string = moment(ts).format("MM/DD/YYYY h:mmA");
    expect(getByText("Last Updated: " + tsExpected)).toBeInTheDocument(); // "Last Updated: 04/24/2020 1:21PM"

    fireEvent.mouseOver(getByText("Mapping1")); // Hover over the Map Card to get more options

    //Verify if the flow related options are availble on mouseOver
    expect(getByTestId("Mapping1-toNewFlow")).toBeInTheDocument(); // check if option 'Add to a new Flow' is visible
    expect(getByTestId("Mapping1-toExistingFlow")).toBeInTheDocument(); // check if option 'Add to an existing Flow' is visible

    //Click on the link 'Add step to a new Flow'.
    fireEvent.click(getByTestId("Mapping1-toNewFlow"));

    //Wait for the route to be pushed into History( which means that the route is working fine. Remaining can be verified in E2E test)
    wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add");
    });

  });

  test("Running the step in a new flow", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeMapping", "writeFlow"]);
    const mapping = data.mappings.data[1].artifacts;
    let getByTestId, getByLabelText;
    await act(async () => {
      const renderResults = render(
        <MemoryRouter><AuthoritiesContext.Provider value={authorityService}><MappingCard
          {...mappingProps}
          data={mapping}
          canReadWrite={true}
          canWriteFlow={true}
        /></AuthoritiesContext.Provider></MemoryRouter>
      );
      getByTestId = renderResults.getByTestId;
      getByLabelText = renderResults.getByLabelText;
    });

    //Verify run step in a new flow

    //Click play button 'Run' icon
    fireEvent.click(getByTestId("Mapping2-run"));

    //Modal with option to add and run in a new flow should appear
    expect(getByLabelText("step-in-no-flows-confirmation")).toBeInTheDocument();

    //Select "New Flow" option to add and run in a new flow
    fireEvent.click(getByTestId("Mapping2-run-toNewFlow"));

    //Check if the /tiles/run/add-run route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add-run"); });

  });

  test("Verify Mapping card allows step to be added to flow with writeFlow authority", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "writeFlow"]);
    const mappingStepName = mapping[0].name;
    const mockAddStepToFlow = jest.fn();
    const {getByText, getAllByText, getByTestId, getByLabelText} = render(
      <MemoryRouter><AuthoritiesContext.Provider value={authorityService}><MappingCard
        {...mappingProps}
        canReadOnly={authorityService.canReadMapping()}
        canReadWrite={authorityService.canWriteMapping()}
        canWriteFlow={authorityService.canWriteFlow()}
        addStepToFlow={mockAddStepToFlow}
      />
      </AuthoritiesContext.Provider></MemoryRouter>
    );

    fireEvent.mouseOver(getByText(mappingStepName));

    // test adding to existing flow
    expect(getByTestId(`${mappingStepName}-toExistingFlow`)).toBeInTheDocument();
    fireEvent.keyDown(getByLabelText(`${mappingStepName}-flowsList`), {key: "ArrowDown"});
    fireEvent.click(getByText(data.flows.data[0].name));
    fireEvent.click(getByText("Yes"));
    expect(mockAddStepToFlow).toBeCalledTimes(1);

    // adding to new flow
    const mappingStep = getAllByText(mappingStepName);
    fireEvent.mouseOver(mappingStep[0]);
    expect(getByTestId(`${mappingStepName}-toNewFlow`)).toBeInTheDocument();
    // TODO calling addStepToNew not implemented yet

  });

  test("Verify Mapping card does not allow a step to be added to flow or run in a flow with readFlow authority only", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMapping", "readFlow"]);
    const mappingStepName = mapping[0].name;
    const mockAddStepToFlow = jest.fn();
    const {getByText, queryByText, queryByTestId, getByRole, getByLabelText} = render(
      <MemoryRouter><AuthoritiesContext.Provider value={authorityService}><MappingCard
        {...mappingProps}
        canReadOnly={authorityService.canReadMapping()}
        canReadWrite={authorityService.canWriteMapping()}
        canWriteFlow={authorityService.canWriteFlow()}
        addStepToFlow={mockAddStepToFlow}
      /></AuthoritiesContext.Provider></MemoryRouter>
    );

    fireEvent.mouseOver(getByText(mappingStepName));

    // test adding to existing flow
    expect(queryByTestId(`${mappingStepName}-toExistingFlow`)).toBeInTheDocument();
    fireEvent.keyDown(getByLabelText(`${mappingStepName}-flowsList`), {key: "ArrowDown"});
    expect(queryByText(data.flows.data[0].name)).not.toBeInTheDocument();

    // test adding to new flow
    expect(queryByTestId(`${mappingStepName}-toNewFlow`)).not.toBeInTheDocument();
    expect(queryByTestId(`${mappingStepName}-disabledToNewFlow`)).toBeInTheDocument();

    // test run icon displays correct tooltip when disabled
    fireEvent.mouseOver(getByRole("disabled-run-mapping"));
    await wait(() => expect(getByText("Run: " + SecurityTooltips.missingPermission)).toBeInTheDocument());

    await fireEvent.click(getByRole("disabled-run-mapping"));
    expect(queryByTestId("Mapping1-run-flowsList")).not.toBeInTheDocument();

  });
});
