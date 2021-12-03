import React from "react";
import {render, fireEvent, wait, within, cleanup, waitForElement} from "@testing-library/react";
import LoadList from "./load-list";
import data from "../../assets/mock-data/curation/common.data";
import axiosMock from "axios";
import mocks from "../../api/__mocks__/mocks.data";
import loadData from "../../assets/mock-data/curation/ingestion.data";
import {MemoryRouter} from "react-router-dom";
import {AuthoritiesService, AuthoritiesContext} from "../../util/authorities";
import {validateTableRow} from "../../util/test-utils";
import {SecurityTooltips} from "../../config/tooltips.config";
import {LoadingContext} from "../../util/loading-context";
import moment from "moment";

jest.mock("axios");

const mockHistoryPush = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe("Load data component", () => {

  beforeEach(() => {
    mocks.loadAPI(axiosMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test("Verify Load list view renders correctly with no data", () => {
    const {getByText} = render(<MemoryRouter><LoadList {...data.loadData} data={[]} /></MemoryRouter>);
    const tableColumns = within(getByText("Name").closest("tr"));

    expect(getByText("Add New")).toBeInTheDocument();
    expect(tableColumns.getByText("Name")).toBeInTheDocument();
    expect(tableColumns.getByText("Description")).toBeInTheDocument();
    expect(tableColumns.getByText("Source Format")).toBeInTheDocument();
    expect(tableColumns.getByText("Target Format")).toBeInTheDocument();
    expect(tableColumns.getByText("Last Updated")).toBeInTheDocument();
    expect(tableColumns.getByText("Action")).toBeInTheDocument();
    expect(getByText("No Data")).toBeInTheDocument();
  });

  test("Verify Load list view renders correctly with data", async () => {
    const {getByText, getByTestId} = render(<MemoryRouter><LoadList {...data.loadData} /></MemoryRouter>);
    const dataRow = within(getByText("testLoadXML").closest("tr"));
    expect(dataRow.getByText(data.loadData.data[1].name)).toBeInTheDocument();
    expect(dataRow.getByText(data.loadData.data[1].description)).toBeInTheDocument();
    expect(dataRow.getByText(data.loadData.data[1].sourceFormat)).toBeInTheDocument();
    expect(dataRow.getByText(data.loadData.data[1].targetFormat)).toBeInTheDocument();
    let ts: string = data.loadData.data[1].lastUpdated; // "2020-04-15T14:22:54.057519-07:00"
    let tsExpected: string = moment(ts).format("MM/DD/YYYY h:mmA");
    expect(dataRow.getByText(tsExpected)).toBeInTheDocument(); // "04/15/2020 2:22PM"
    expect(dataRow.getByTestId(`${data.loadData.data[1].name}-delete`)).toBeInTheDocument();

    // check if delete tooltip appears
    fireEvent.mouseOver(getByTestId(data.loadData.data[1].name + "-delete"));
    await wait(() => expect(getByText("Delete")).toBeInTheDocument());

    //verify load list table enforces last updated sort order by default
    let loadTable: any = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(loadTable, ["testLoadXML", "testLoad123", "testLoad"]);
    //verify load list table enforces sorting by ascending date updated as well
    let loadTableSort = getByTestId("loadTableDate");
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(loadTable, ["testLoad", "testLoad123", "testLoadXML"]);
    //verify third click does not return to default, but returns to descending order
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(loadTable, ["testLoadXML", "testLoad123", "testLoad"]);

    //verify load list table enforces sorting by name alphabetically in ascending order
    loadTableSort = getByTestId("loadTableName");
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(loadTable, ["testLoad", "testLoad123", "testLoadXML"]);
    //verify load list table enforces sorting by name alphabetically in descending order
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(loadTable, ["testLoadXML", "testLoad123", "testLoad"]);
    //verify third click does not return to default, but returns to ascending order
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(loadTable, ["testLoad", "testLoad123", "testLoadXML"]);

    //verify load list table enforces sorting by source format alphabetically in ascending order
    loadTableSort = getByTestId("loadTableSourceFormat");
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(loadTable, ["testLoad123", "testLoad", "testLoadXML"]);
    //verify load list table enforces sorting by source format alphabetically in descending order
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(loadTable, ["testLoad", "testLoadXML", "testLoad123"]);
    //verify third click does not return to default, but returns to ascending order
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(loadTable, ["testLoad123", "testLoad", "testLoadXML"]);

    //verify load list table enforces sorting by target format alphabetically in ascending order
    loadTableSort = getByTestId("loadTableTargetFormat");
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(loadTable, ["testLoad123", "testLoad", "testLoadXML"]);
    //verify load list table enforces sorting by target format alphabetically in descending order
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(loadTable, ["testLoadXML", "testLoad", "testLoad123"]);
    //verify third click does not return to default, but returns to ascending order
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(loadTable, ["testLoad123", "testLoad", "testLoadXML"]);

    //verify load list table enforces sorting by Description alphabetically in ascending order
    loadTableSort = getByTestId("loadTableDescription");
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(loadTable, ["testLoad123", "testLoad", "testLoadXML"]);
    //verify load list table enforces sorting by Description alphabetically in descending order
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(loadTable, ["testLoadXML", "testLoad", "testLoad123"]);
    //verify third click does not return to default, but returns to ascending order
    fireEvent.click(loadTableSort);
    loadTable = document.querySelectorAll(".ant-table-row-level-0");
    validateTableRow(loadTable, ["testLoad123", "testLoad", "testLoadXML"]);
  });

  test("Verify Load settings from list view renders correctly", async () => {
    const {getByText, getAllByText, getByTestId, queryByTitle, getByPlaceholderText} = render(
      <MemoryRouter><LoadList {...data.loadData} /></MemoryRouter>
    );

    // Click name to open default Basic settings
    await wait(() => {
      fireEvent.click(getByText(data.loadData.data[0].name));
    });
    expect(getByText("Basic").closest("button")).toHaveClass("nav-link active");
    expect(getByText("Advanced").closest("div")).not.toHaveClass("nav-link active");

    // Basic settings values
    expect(getAllByText("testLoad")[0]).toBeInTheDocument();
    expect(getByPlaceholderText("Enter description")).toBeInTheDocument();
    expect(getAllByText("JSON").length === 2);
    expect(getByPlaceholderText("Enter URI Prefix")).toBeInTheDocument();
    // Note: Can't test mock API call since is being called by <Load> parent, which isn't being rendered in this test

    // Switch to Advanced settings
    await wait(() => {
      fireEvent.click(getByText("Advanced"));
    });
    expect(getByText("Basic").closest("button")).not.toHaveClass("nav-link active");
    expect(getByText("Advanced").closest("button")).toHaveClass("nav-link active");
    let saveButton = getAllByText("Save"); // Each tab has a Save button
    expect(saveButton.length > 0);
    let stepName = loadData.loads.data[0].name;
    let targetCollection = getByText("addedCollection"); // Additional target collection (Added by user)

    // Advanced settings values
    expect(getByText("Target Collections:")).toBeInTheDocument();
    expect(targetCollection).toBeInTheDocument(); //Should be available in the document
    expect(targetCollection).not.toBe(stepName); //Should not be same as the default collection
    expect(getByText("Default Collections:")).toBeInTheDocument();
    expect(getByTestId("defaultCollections-" + stepName)).toBeInTheDocument();
    expect(queryByTitle(stepName)).not.toBeInTheDocument();  // The default collection should not be a part of the Target Collection list
    expect(getByText("Batch Size:")).toBeInTheDocument();
    expect(getByPlaceholderText("Please enter batch size")).toHaveValue("35");

    // Update permissions
    let targetPermissions = getByPlaceholderText("Please enter target permissions");

    fireEvent.change(targetPermissions, {target: {value: "role1"}}); // BAD permissions
    expect(targetPermissions).toHaveValue("role1");
    fireEvent.blur(targetPermissions);

    //TODO: Test with reference rather than hardcoded string.
    expect(getByTestId("validationError")).toHaveTextContent("The format of the string is incorrect. The required format is role,capability,role,capability,....");

    fireEvent.change(targetPermissions, {target: {value: "role1,reader"}}); // BAD permissions
    expect(targetPermissions).toHaveValue("role1,reader");
    fireEvent.blur(targetPermissions);

    //TODO: Test with reference rather than hardcoded string.
    expect(getByTestId("validationError")).toHaveTextContent("The string contains invalid capabilities. Capabilities must be read, insert, update, or execute.");

    fireEvent.change(targetPermissions, {target: {value: "  "}}); // BAD permissions
    expect(targetPermissions).toHaveValue("  ");
    fireEvent.blur(targetPermissions);

    //TODO: Test with reference rather than hardcoded string.
    expect(getByTestId("validationError")).toHaveTextContent("The format of the string is incorrect. The required format is role,capability,role,capability,....");

    fireEvent.change(targetPermissions, {target: {value: "role1,read"}}); // GOOD permissions
    expect(targetPermissions).toHaveValue("role1,read");
    fireEvent.blur(targetPermissions);
    expect(getByTestId("validationError")).toHaveTextContent("");

  });

  test("Load List - Add step to an existing flow where step DOES NOT exist", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "writeIngestion", "writeFlow"]);
    const {getByText, getByLabelText, getByTestId} = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadList
            {...data.loadData}
            flows={data.flowsAdd}
            canWriteFlow={true}
            addStepToFlow={jest.fn()}
            addStepToNew={jest.fn()} />
        </AuthoritiesContext.Provider>
      </MemoryRouter>
    );

    //Check if the list is rendered properly
    expect(getByText("testLoadXML")).toBeInTheDocument();

    fireEvent.click(getByLabelText("testLoadXML-add-icon")); // Click the Add to Flow Icon to get more options

    //Verify if the flow related options are availble on click
    await waitForElement(() => expect(getByTestId(`testLoadXML-toNewFlow`))); // check if option 'Add to a new Flow' is visible
    await waitForElement(() => expect(getByTestId(`testLoadXML-toExistingFlow`))); // check if option 'Add to an existing Flow' is visible

    //Click on the select field to open the list of existing flows.
    fireEvent.keyDown(getByLabelText("testLoadXML-flowsList"), {key: "ArrowDown"});

    //Choose FlowStepNoExist from the dropdown
    fireEvent.click(getByText("FlowStepNoExist"));

    //Dialog appears, click 'Yes' button
    expect(getByLabelText("step-not-in-flow")).toBeInTheDocument();
    fireEvent.click(getByLabelText("Yes"));

    //Check if the /tiles/run/add route has been called
    wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add");
    });
    //TODO- E2E test to check if the Run tile is loaded or not.

  });

  test("Load List - Add step to an existing flow where step DOES exist", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "writeIngestion", "writeFlow"]);
    const {getByText, getByLabelText, getByTestId} = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadList
            {...data.loadData}
            flows={data.flowsAdd}
            canWriteFlow={true}
            addStepToFlow={jest.fn()}
            addStepToNew={jest.fn()} />
        </AuthoritiesContext.Provider>
      </MemoryRouter>
    );

    fireEvent.click(getByLabelText("testLoadXML-add-icon")); // Clik over the Add to Flow Icon to get more options

    //Verify if the flow related options are availble on click
    await waitForElement(() => expect(getByTestId(`testLoadXML-toNewFlow`))); // check if option 'Add to a new Flow' is visible
    await waitForElement(() => expect(getByTestId(`testLoadXML-toExistingFlow`))); // check if option 'Add to an existing Flow' is visible

    //Click on the select field to open the list of existing flows.
    fireEvent.keyDown(getByLabelText("testLoadXML-flowsList"), {key: "ArrowDown"});

    //Choose FlowStepExist from the dropdown
    fireEvent.click(getByText("FlowStepExist"));

    //Dialog appears, click 'Yes' button
    expect(getByLabelText("step-in-flow")).toBeInTheDocument();
    fireEvent.click(getByLabelText("Yes"));

  });

  test("Load List - Run step in an existing flow where step DOES NOT exist", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "writeIngestion", "writeFlow"]);
    const {getByLabelText, getByTestId} = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadList
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

  test("Load List - Run step in an existing flow where step DOES exist", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "writeIngestion", "writeFlow"]);
    const {getByLabelText, getByTestId} = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadList
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

  test("Load List - Run step in an existing flow where step exists in MORE THAN ONE flow", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "writeIngestion", "writeFlow"]);
    const {getByLabelText, getByTestId} = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadList
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

  test("Load List - Add step to an new Flow", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "writeIngestion", "writeFlow"]);
    const {getByText, getByLabelText, getByTestId} = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadList
            {...data.loadData}
            flows={data.flows}
            canWriteFlow={true}
            addStepToFlow={jest.fn()}
            addStepToNew={jest.fn()} />
        </AuthoritiesContext.Provider>
      </MemoryRouter>
    );

    //Check if the list is rendered properly
    expect(getByText("testLoadXML")).toBeInTheDocument();

    fireEvent.click(getByLabelText("testLoadXML-add-icon")); // Click over the Add to Flow Icon to get more options

    //Verify if the flow related options are availble on mouseOver
    await waitForElement(() => expect(getByTestId(`testLoadXML-toNewFlow`))); // check if option 'Add to a new Flow' is visible
    await waitForElement(() => expect(getByTestId(`testLoadXML-toExistingFlow`))); // check if option 'Add to an existing Flow' is visible

    //Click on the select field to open the list of existing flows.
    fireEvent.click(getByTestId("testLoadXML-toNewFlow"));

    //Check if the /tiles/run/add route has been called
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

  test("Verify Load list allows step to be added to flow with writeFlow authority", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "writeFlow"]);
    const mockAddStepToFlow = jest.fn();
    const mockAddStepToNew = jest.fn();
    const mockCreateLoadArtifact = jest.fn();
    const mockDeleteLoadArtifact = jest.fn();
    const {getByText, getByLabelText, getByTestId} = render(<MemoryRouter><AuthoritiesContext.Provider value={authorityService}><LoadList
      addStepToFlow={mockAddStepToFlow}
      addStepToNew={mockAddStepToNew}
      canReadOnly={authorityService.canReadLoad()}
      canReadWrite={authorityService.canWriteLoad()}
      canWriteFlow={authorityService.canWriteFlow()}
      createLoadArtifact={mockCreateLoadArtifact}
      data={data.loadData.data}
      deleteLoadArtifact={mockDeleteLoadArtifact}
      flows={data.flows} />
    </AuthoritiesContext.Provider></MemoryRouter>);

    const loadStepName = data.loadData.data[0].name;

    fireEvent.click(getByLabelText("testLoad-add-icon"));

    //verify components and text appear on click
    await waitForElement(() => expect(getByTestId(`${loadStepName}-toNewFlow`)));
    await waitForElement(() => expect(getByTestId(`${loadStepName}-toExistingFlow`)));
    await waitForElement(() => expect(getByLabelText(`${loadStepName}-flowsList`)));
    await waitForElement(() => expect(getByText("Add step to a new flow")));
    await waitForElement(() => expect(getByText("Add step to an existing flow")));

    // test adding to existing flow
    fireEvent.keyDown(getByLabelText(`${loadStepName}-flowsList`), {key: "ArrowDown"});
    fireEvent.click(getByText(data.flows[0].name));
    fireEvent.click(getByText("Yes"));
    expect(mockAddStepToFlow).toBeCalledTimes(1);

    //TODO: Mock addStepToNew not implemented yet
  });

  test("Verify Load list does not allow a step to be added to flow or run in a flow with readFlow authority only", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "readFlow"]);
    const mockAddStepToFlow = jest.fn();
    const mockAddStepToNew = jest.fn();
    const mockCreateLoadArtifact = jest.fn();
    const mockDeleteLoadArtifact = jest.fn();
    const {getByText, queryByTestId, getByLabelText, getByTestId, queryByText} = render(<MemoryRouter><AuthoritiesContext.Provider value={authorityService}><LoadList
      addStepToFlow={mockAddStepToFlow}
      addStepToNew={mockAddStepToNew}
      canReadOnly={authorityService.canReadLoad()}
      canReadWrite={authorityService.canWriteLoad()}
      canWriteFlow={authorityService.canWriteFlow()}
      createLoadArtifact={mockCreateLoadArtifact}
      data={data.loadData.data}
      deleteLoadArtifact={mockDeleteLoadArtifact}
      flows={data.flows} />
    </AuthoritiesContext.Provider></MemoryRouter>);
    const loadStepName = data.loadData.data[0].name;
    // adding to new flow icon is disabled and shows correct tooltip
    fireEvent.mouseOver(getByLabelText(`${loadStepName}-disabled-add-icon`));
    await wait(() => expect(getByText("Add to Flow: " + SecurityTooltips.missingPermission)).toBeInTheDocument());


    // test adding to existing flow option does not appear
    expect(queryByTestId(`${loadStepName}-toExistingFlow`)).not.toBeInTheDocument();
    expect(queryByText(data.flows[0].name)).not.toBeInTheDocument();

    // test adding to new flow option does not appear
    expect(queryByTestId(`${loadStepName}-toNewFlow`)).not.toBeInTheDocument();

    // test delete icon displays correct tooltip when disabled
    fireEvent.mouseOver(getByTestId(loadStepName + "-disabled-delete"));
    await wait(() => expect(getByText("Delete: " + SecurityTooltips.missingPermission)).toBeInTheDocument());

    // test run icon displays correct tooltip when disabled
    fireEvent.mouseOver(getByTestId(loadStepName + "-disabled-run"));
    await wait(() => expect(getByText("Run: " + SecurityTooltips.missingPermission)).toBeInTheDocument());

    await fireEvent.click(getByTestId(loadStepName + "-disabled-run"));
    expect(queryByTestId(`${loadStepName}-run-flowsList`)).not.toBeInTheDocument();
  });


  describe("Verify Load List pagination", () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "writeIngestion", "writeFlow"]);
    const setPage = (pageNumber: number) => { };
    const setPageSize = (current: number, pageSize: number) => { };
    const setPageMock = setPage as jest.MockedFunction<typeof setPage>;
    const setPageSizeMock = setPageSize as jest.MockedFunction<typeof setPageSize>;
    let loadingOptions = {
      start: 1,
      pageNumber: 1,
      pageSize: 10,
    };
    it("Verify multiples pages", async () => {
      const {container} = render(
        <MemoryRouter>
          <AuthoritiesContext.Provider value={authorityService}>
            <LoadingContext.Provider value={{
              loadingOptions: loadingOptions,
              setPage: setPageMock,
              setPageSize: setPageSizeMock,
            }}>
              <LoadList
                {...data.loadDataPagination}
                flows={data.flowsAdd}
                sortOrderInfo
                canWriteFlow={true}
                addStepToFlow={jest.fn()}
                addStepToNew={jest.fn()} />
            </LoadingContext.Provider >
          </AuthoritiesContext.Provider>
        </MemoryRouter>
      );

      expect(container.querySelector(".react-bootstrap-table-page-btns-ul li[title=\"1\"]")).toBeInTheDocument();
      expect(container.querySelector(".react-bootstrap-table-page-btns-ul li[title=\"2\"]")).toBeInTheDocument();
      expect(container.querySelector(".react-bootstrap-table-page-btns-ul li[title=\"3\"]")).not.toBeInTheDocument();
      expect(container.querySelector(".react-bootstrap-table-pagination #size-per-page")).toHaveTextContent("10 / page");
      expect(container.querySelectorAll(".hc-table_row")).toHaveLength(10);
    });
    it("Verify single pages", async () => {
      loadingOptions.pageSize = 20;
      const {container} = render(
        <MemoryRouter>
          <AuthoritiesContext.Provider value={authorityService}>
            <LoadingContext.Provider value={{
              loadingOptions: loadingOptions,
              setPage: setPageMock,
              setPageSize: setPageSizeMock,
            }}>
              <LoadList
                {...data.loadDataPagination}
                flows={data.flowsAdd}
                sortOrderInfo
                canWriteFlow={true}
                addStepToFlow={jest.fn()}
                addStepToNew={jest.fn()} />
            </LoadingContext.Provider >
          </AuthoritiesContext.Provider>
        </MemoryRouter>
      );
      expect(container.querySelector(".react-bootstrap-table-page-btns-ul li[title=\"1\"]")).toBeInTheDocument();
      expect(container.querySelector(".react-bootstrap-table-page-btns-ul li[title=\"2\"]")).not.toBeInTheDocument();
      expect(container.querySelector(".react-bootstrap-table-pagination #size-per-page")).toHaveTextContent("20 / page");
      expect(container.querySelectorAll(".hc-table_row")).toHaveLength(12);
    });

  });

  test("Verify Load List pagination hiding", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readIngestion", "writeIngestion", "writeFlow"]);
    const {container} = render(
      <MemoryRouter>
        <AuthoritiesContext.Provider value={authorityService}>
          <LoadingContext.Provider value={{
            loadingOptions: {
              start: 1,
              pageNumber: 1,
              pageSize: 10
            },
            setPageSize: jest.fn(),
          }}>
            <LoadList

              {...data.loadData}
              flows={data.flowsAdd}
              sortOrderInfo
              canWriteFlow={true}
              addStepToFlow={jest.fn()}
              addStepToNew={jest.fn()} />
          </LoadingContext.Provider >
        </AuthoritiesContext.Provider>
      </MemoryRouter>
    );

    expect(container.querySelector(".ant-pagination")).toBeNull();
  });
});



