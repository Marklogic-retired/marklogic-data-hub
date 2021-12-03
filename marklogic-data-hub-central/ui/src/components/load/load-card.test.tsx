import React from "react";
import {render, fireEvent, wait, cleanup, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import LoadCard from "./load-card";
import data from "../../assets/mock-data/curation/common.data";
import ingestionData from "../../assets/mock-data/curation/ingestion.data";
import axiosMock from "axios";
import mocks from "../../api/__mocks__/mocks.data";
import {AuthoritiesService, AuthoritiesContext} from "../../util/authorities";
import {SecurityTooltips} from "../../config/tooltips.config";
import moment from "moment";
jest.mock("axios");

const mockHistoryPush = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe("Load Card component", () => {

  beforeEach(() => {
    mocks.loadAPI(axiosMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test("Load Card - Add step to an existing flow and run step in an existing flow where step DOES NOT exist", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "writeIngestion", "writeFlow"]);
    const {getByText, getByLabelText, getByTestId} = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadCard
            {...data.loadData}
            flows={data.flowsAdd}
            canWriteFlow={true}
            addStepToFlow={jest.fn()}
            addStepToNew={jest.fn()} />
        </AuthoritiesContext.Provider>
      </MemoryRouter>
    );

    //Check if the card is rendered properly
    expect(getByText("Add New")).toBeInTheDocument();
    expect(getByText("testLoadXML")).toBeInTheDocument();
    expect(getByLabelText("testLoadXML-sourceFormat")).toBeInTheDocument();
    let ts: string = data.loadData.data[1].lastUpdated; // "2020-04-15T14:22:54.057519-07:00"
    let tsExpected: string = moment(ts).format("MM/DD/YYYY h:mmA");
    expect(getByText("Last Updated: " + tsExpected)).toBeInTheDocument(); // "Last Updated: 04/15/2020 2:22PM"

    fireEvent.mouseOver(getByText("testLoadXML")); // Hover over the Load Card to get more options

    //Verify if the flow related options are availble on mouseOver
    expect(getByTestId("testLoadXML-toNewFlow")).toBeInTheDocument(); // check if option 'Add to a new Flow' is visible
    expect(getByTestId("testLoadXML-toExistingFlow")).toBeInTheDocument(); // check if option 'Add to an existing Flow' is visible

    //Click on the select field to open the list of existing flows.
    fireEvent.keyDown(getByLabelText("testLoadXML-flowsList"), {key: "ArrowDown"});

    //Choose FlowStepNoExist from the dropdown
    fireEvent.click(getByText("FlowStepNoExist"));

    //Dialog appears, click 'Yes' button
    expect(getByLabelText("step-not-in-flow")).toBeInTheDocument();
    fireEvent.click(getByTestId("testLoadXML-to-FlowStepNoExist-Confirm"));

    //Check if the /tiles/run/add route has been called
    wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add");
    });
    //TODO- E2E test to check if the Run tile is loaded or not.

  });

  test("Load Card - Run step in an existing flow where step DOES NOT exist", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "writeIngestion", "writeFlow"]);
    const {getByLabelText, getByTestId} = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadCard
            {...data.loadData}
            flows={data.flowsAdd}
            canWriteFlow={true}
            addStepToFlow={jest.fn()}
            addStepToNew={jest.fn()} />
        </AuthoritiesContext.Provider>
      </MemoryRouter>
    );

    //Verify run step in an existing flow where step does not exist yet

    //Click play button 'Run' icon
    fireEvent.click(getByTestId("testLoad123-run"));

    //Modal with options to run in an existing or new flow should appear
    expect(getByLabelText("step-in-no-flows-confirmation")).toBeInTheDocument();

    //Select flow to add and run step in
    fireEvent.click(getByTestId("FlowStepNoExist-run-step"));

    //Check if the /tiles/run/add-run route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add-run"); });

  });

  test("Load Card - Add step to an existing flow where step DOES exist", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "writeIngestion", "writeFlow"]);
    const {getByText, getByLabelText, getByTestId} = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadCard
            {...data.loadData}
            flows={data.flowsAdd}
            canWriteFlow={true}
            addStepToFlow={jest.fn()}
            addStepToNew={jest.fn()} />
        </AuthoritiesContext.Provider>
      </MemoryRouter>
    );

    fireEvent.mouseOver(getByText("testLoadXML")); // Hover over the Load Card to get more options

    //Click on the select field to open the list of existing flows.
    fireEvent.keyDown(getByLabelText("testLoadXML-flowsList"), {key: "ArrowDown"});

    //Choose FlowStepExist from the dropdown
    fireEvent.click(getByText("FlowStepExist"));

    //Dialog appears, click 'Yes' button
    expect(getByLabelText("step-in-flow")).toBeInTheDocument();
    fireEvent.click(getByTestId("testLoadXML-to-FlowStepExist-Confirm"));
  });

  test("Load Card - Run step in an existing flow where step DOES exist", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "writeIngestion", "writeFlow"]);
    const {getByLabelText, getByTestId} = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadCard
            {...data.loadData}
            flows={data.flowsAdd}
            canWriteFlow={true}
            addStepToFlow={jest.fn()}
            addStepToNew={jest.fn()} />
        </AuthoritiesContext.Provider>
      </MemoryRouter>
    );

    //Click play button 'Run' icon
    fireEvent.click(getByTestId("testLoadXML-run"));

    //Confirmation modal for directly running the step in its flow should appear
    expect(getByLabelText("run-step-one-flow-confirmation")).toBeInTheDocument();

    //Click Continue to confirm
    fireEvent.click(getByLabelText("continue-confirm"));

    //Check if the /tiles/run/run-step route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/run-step"); });

  });

  test("Load Card - Run step in an existing flow where step exists in MORE THAN ONE flow", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "writeIngestion", "writeFlow"]);
    const {getByLabelText, getByTestId} = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadCard
            {...data.loadData}
            flows={data.flowsAdd}
            canWriteFlow={true}
            addStepToFlow={jest.fn()}
            addStepToNew={jest.fn()} />
        </AuthoritiesContext.Provider>
      </MemoryRouter>
    );

    //Verify run step in an existing flow where step exists in more than one flow

    //Click play button 'Run' icon
    fireEvent.click(getByTestId("testLoad-run"));

    //Modal with list of flows where step exists to select one to run in
    expect(getByLabelText("run-step-mult-flows-confirmation")).toBeInTheDocument();

    //Select flow to run step in
    fireEvent.click(getByTestId("FlowStepMultExist-run-step"));

    //Check if the /tiles/run/add-run route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add-run"); });
  });

  test("Load Card - Verify card sort order, Add step to a new Flow, and Run step in a new Flow", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "writeIngestion", "writeFlow"]);
    const {getByText, getByLabelText, getByTestId} = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadCard
            {...data.loadData}
            flows={data.flows}
            canWriteFlow={true}
            addStepToFlow={jest.fn()}
            addStepToNew={jest.fn()} />
        </AuthoritiesContext.Provider>
      </MemoryRouter>
    );

    //Check if the card is rendered properly
    expect(getByText("Add New")).toBeInTheDocument();
    expect(getByText("testLoadXML")).toBeInTheDocument();
    expect(getByLabelText("testLoadXML-sourceFormat")).toBeInTheDocument();
    let ts: string = data.loadData.data[1].lastUpdated; // "2020-04-15T14:22:54.057519-07:00"
    let tsExpected: string = moment(ts).format("MM/DD/YYYY h:mmA");
    expect(getByText("Last Updated: " + tsExpected)).toBeInTheDocument(); // "Last Updated: 04/15/2020 2:22PM"

    fireEvent.mouseOver(getByText("testLoadXML")); // Hover over the Load Card to get more options

    //Verify if the flow related options are availble on mouseOver
    expect(getByTestId("testLoadXML-toNewFlow")).toBeInTheDocument(); // check if option 'Add to a new Flow' is visible
    expect(getByTestId("testLoadXML-toExistingFlow")).toBeInTheDocument(); // check if option 'Add to an existing Flow' is visible

    // check if delete tooltip appears
    fireEvent.mouseOver(getByTestId("testLoadXML-delete"));
    await wait(() => expect(getByText("Delete")).toBeInTheDocument());

    //Click on the select field to open the list of existing flows.
    fireEvent.click(getByTestId("testLoadXML-toNewFlow"));

    //Wait for the route to be pushed into History(which means that the route is working fine. Remaining can be verified in E2E test)
    wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add");
    });
    //TODO- E2E test to check if the Run tile is loaded or not.


    //Verify run step in a new flow

    //Click play button 'Run' icon
    fireEvent.click(getByTestId("testLoadXML-run"));

    //Modal with option to add and run in a new flow should appear
    expect(getByLabelText("step-in-no-flows-confirmation")).toBeInTheDocument();

    //Select "New Flow" option to add and run in a new flow
    fireEvent.click(getByTestId("testLoadXML-run-toNewFlow"));

    //Check if the /tiles/run/add-run route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add-run"); });

  });

  test("Verify Load card allows step to be added to flow with writeFlow authority", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "writeFlow"]);
    const mockAddStepToFlow = jest.fn();
    const mockAddStepToNew = jest.fn();
    const mockCreateLoadArtifact = jest.fn();
    const mockDeleteLoadArtifact = jest.fn();
    const {getByText, getAllByText, getByTestId, getByLabelText} = render(<MemoryRouter><AuthoritiesContext.Provider value={authorityService}><LoadCard
      addStepToFlow={mockAddStepToFlow}
      addStepToNew={mockAddStepToNew}
      canReadOnly={authorityService.canReadLoad()}
      canReadWrite={authorityService.canWriteLoad()}
      canWriteFlow={authorityService.canWriteFlow()}
      createLoadArtifact={mockCreateLoadArtifact}
      data={data.loadData.data}
      deleteLoadArtifact={mockDeleteLoadArtifact}
      flows={data.flows}/>
    </AuthoritiesContext.Provider></MemoryRouter>);

    const loadStepName = data.loadData.data[0].name;
    fireEvent.mouseOver(getByText(loadStepName));

    // test adding to existing flow
    expect(getByTestId(`${loadStepName}-toExistingFlow`)).toBeInTheDocument();
    fireEvent.keyDown(getByLabelText(`${loadStepName}-flowsList`), {key: "ArrowDown"});
    fireEvent.click(getByText(data.flows[0].name));
    fireEvent.click(getByText("Yes"));
    expect(mockAddStepToFlow).toBeCalledTimes(1);
    // adding to new flow
    const loadSteps = getAllByText(loadStepName);
    fireEvent.mouseOver(loadSteps[0]);
    expect(getByTestId(`${loadStepName}-toNewFlow`)).toBeInTheDocument();
    // TODO calling addStepToNew not implemented yet
  });

  test("Verify Load card does not allow a step to be added to flow and run in a flow with readFlow authority only", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "readFlow"]);
    const {getByText, queryByTestId, getByTestId, queryByText, queryByLabelText, getByLabelText} = render(<MemoryRouter><AuthoritiesContext.Provider value={authorityService}><LoadCard
      {...ingestionData.loadCardProps}
      data={data.loadData.data}
      flows={data.flows}/>
    </AuthoritiesContext.Provider></MemoryRouter>);

    fireEvent.mouseOver(getByText(data.loadData.data[0].name));

    const loadStepName = data.loadData.data[0].name;

    //test tooltip over disabled add new card
    fireEvent.mouseOver(getByTestId("disabledAddNewCard"));
    wait(() => expect(screen.getByText("Load: " + SecurityTooltips.missingPermission)).toBeInTheDocument());

    //test tooltip over disabled card
    fireEvent.mouseOver(getByText(loadStepName));
    wait(() => expect(screen.getByText("Load: " + SecurityTooltips.missingPermission)).toBeInTheDocument());

    // test delete icon displays correct tooltip when disabled
    fireEvent.mouseOver(getByTestId(loadStepName + "-disabled-delete"));
    await wait(() => expect(screen.getByText("Delete: " + SecurityTooltips.missingPermission)).toBeInTheDocument());

    // test run icon displays correct tooltip when disabled
    fireEvent.mouseOver(getByTestId(`${loadStepName}-disabled-run`));
    await wait(() => expect(getByText("Run: " + SecurityTooltips.missingPermission)).toBeInTheDocument());

    await fireEvent.click(getByTestId(`${loadStepName}-disabled-run`));
    expect(queryByLabelText("step-in-no-flows-confirmation")).not.toBeInTheDocument();

    // adding to new flow
    fireEvent.mouseOver(getByText(loadStepName));
    // test adding to existing flow
    expect(queryByTestId(`${loadStepName}-toExistingFlow`)).toBeInTheDocument();
    fireEvent.keyDown(getByLabelText(`${loadStepName}-flowsList`), {key: "ArrowDown"});
    expect(queryByText(data.flows[0].name)).not.toBeInTheDocument();

    // test adding to new flow
    fireEvent.mouseOver(getByText(loadStepName));
    fireEvent.click(getByTestId(`${loadStepName}-toNewFlow`));
    await wait(() => {
      expect(mockHistoryPush).not.toHaveBeenCalledWith("/tiles/run/add");
    });
  });
});
