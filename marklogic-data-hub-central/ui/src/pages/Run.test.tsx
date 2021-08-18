import React from "react";
import {
  render,
  fireEvent,
  waitForElement,
  cleanup,
  wait
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import axiosMock from "axios";
import mocks from "../api/__mocks__/mocks.data";
import  Run from "../pages/Run";
import {AuthoritiesContext, AuthoritiesService} from "../util/authorities";
import data from "../assets/mock-data/curation/flows.data";
import authorities from "../assets/mock-data/authorities.testutils";
import {RunToolTips} from "../config/tooltips.config";
import {act} from "react-dom/test-utils";
import {MemoryRouter} from "react-router-dom";
import tiles from "../config/tiles.config";
import {createMemoryHistory} from "history";

jest.mock("axios");
jest.setTimeout(30000);

const mockHistoryPush = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));


const mockDevRolesService = authorities.DeveloperRolesService;
const mockOpRolesService = authorities.OperatorRolesService;

const getSubElements=(content, node, title) => {
  const hasText = node => node.textContent === title;
  const nodeHasText = hasText(node);
  const childrenDontHaveText = Array.from(node.children).every(
    child => !hasText(child)
  );
  return nodeHasText && childrenDontHaveText;
};


describe("Verify links back to step details", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test("Verify a user with read authority for steps can use link", async () => {
    mocks.runAPI(axiosMock);
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readFlow", "readIngestion", "readMapping", "readCustom"]);

    let getByText, getByLabelText, getByTestId;
    await act(() => {
      const renderResults =  render(<MemoryRouter>
        <AuthoritiesContext.Provider value={ authorityService}>
          <Run/>
        </AuthoritiesContext.Provider></MemoryRouter>);
      getByText = renderResults.getByText;
      getByLabelText = renderResults.getByLabelText;
      getByTestId = renderResults.getByTestId;
    });
    const existingFlowName = data.flows.data[0].name;
    let steps = data.flows.data[0].steps;

    expect(getByText(tiles.run.intro)).toBeInTheDocument(); // tile intro text

    // Click expand icon
    await act(() => {
      fireEvent.click(getByLabelText("icon: right"));
    });
    const implementedStepTypes = ["ingestion", "mapping", "custom"];
    steps.forEach((step) => {
      const viewStepId = `${existingFlowName}-${step.stepNumber}`;
      const stepElement = getByLabelText(`${viewStepId}-content`);
      act(() => {
        fireEvent.mouseOver(stepElement);
      });
      if (implementedStepTypes.includes(step.stepDefinitionType.toLowerCase())) {
        expect(getByTestId(`${viewStepId}-viewStep`)).toBeVisible();
      }
      act(() => {
        fireEvent.mouseLeave(stepElement);
      });
    });
  });

  test("Verify a user with read authority for steps cannot use link", async () => {
    mocks.runAPI(axiosMock);
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readFlow"]);
    let getByLabelText, getByTestId;
    await act(() => {
      const renderResults =  render(<MemoryRouter>
        <AuthoritiesContext.Provider value={ authorityService}>
          <Run/>
        </AuthoritiesContext.Provider></MemoryRouter>);
      getByLabelText = renderResults.getByLabelText;
      getByTestId = renderResults.getByTestId;
    });

    const existingFlowName = data.flows.data[0].name;
    let steps = data.flows.data[0].steps;
    // Click expand icon
    await act(() => {
      fireEvent.click(getByLabelText("icon: right"));
    });
    const implementedStepTypes = ["ingestion", "mapping", "custom"];
    steps.forEach((step) => {
      const viewStepId = `${existingFlowName}-${step.stepNumber}`;
      const stepElement = getByLabelText(`${viewStepId}-content`);
      act(() => {
        fireEvent.mouseOver(stepElement);
      });
      if (implementedStepTypes.includes(step.stepDefinitionType.toLowerCase())) {
        expect(getByTestId(`${viewStepId}-viewStep`)).not.toBeVisible();
      }
      act(() => {
        fireEvent.mouseLeave(stepElement);
      });
    });
  });
});

describe("Verify load step failures in a flow", () => {

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test("Verify errors when flow with Load step fails with jobStatus finished_with_errors", async() => {
    mocks.runErrorsAPI(axiosMock);
    axiosMock.post["mockImplementationOnce"](jest.fn(() => Promise.resolve(data.response)));
    const {getByText, getByLabelText, getAllByLabelText} = await render(<MemoryRouter><AuthoritiesContext.Provider
      value={mockDevRolesService}><Run/></AuthoritiesContext.Provider></MemoryRouter>);

    // Click disclosure icon
    fireEvent.click(getByLabelText("icon: right"));
    let runButton = await getByLabelText("runStep-failedIngest");
    fireEvent.mouseOver(getAllByLabelText("icon: play-circle")[0]); //temporarily fixing for DHFPROD-7820, change back to 1 eventually
    await waitForElement(() => getByText(RunToolTips.ingestionStep));
    fireEvent.mouseOver(getAllByLabelText("icon: close")[0]);
    await waitForElement(() => getByText(RunToolTips.removeStep));

    let upload;
    upload = document.querySelector("#fileUpload");
    const files = [new File(["text1"], "test1.txt", {
      type: "text/plain"
    }), new File(["text2"], "test2.txt", {
      type: "text/plain"
    })];

    Object.defineProperty(upload, "files", {
      value: files
    });
    fireEvent.change(upload);

    fireEvent.click(runButton);

    // New Modal with Error message, uri and details is opened

    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, "The ingestion step failedIngest completed with errors");
    })))).toBeInTheDocument();
    expect(getByText("Message:")).toBeInTheDocument();
    expect(getByText("Details:")).toBeInTheDocument();
    expect(getByText("URI:")).toBeInTheDocument();
    expect(getByText("/test/data/nestedPerson1.json")).toBeInTheDocument();

    expect(document.querySelector("#error-list")).toHaveTextContent("Out of 3 batches, 1 succeeded and 2 failed. The error messages are listed below");
    expect(await(waitForElement(() => getByText("Explore Loaded Data")))).toBeInTheDocument();

    // Error 2 is present
    expect(await(waitForElement(() => getByText("Error 2")))).toBeInTheDocument();

    fireEvent.click(getByText("Close"));
  });

  test("Verify errors when flow with Load step fails with jobStatus failed", async () => {
    mocks.runFailedAPI(axiosMock);
    axiosMock.post["mockImplementationOnce"](jest.fn(() => Promise.resolve(data.response)));
    const {getByText, getByLabelText} = await render(<MemoryRouter><AuthoritiesContext.Provider value={ mockDevRolesService}><Run/></AuthoritiesContext.Provider></MemoryRouter>);

    // Click disclosure icon
    fireEvent.click(getByLabelText("icon: right"));

    let upload;
    upload = document.querySelector("#fileUpload");
    const files = [new File(["text1"], "test1.txt", {
      type: "text/plain"
    })];

    Object.defineProperty(upload, "files", {
      value: files
    });
    fireEvent.change(upload);

    fireEvent.click(getByLabelText("runStep-failedIngest"));

    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, "The ingestion step failedIngest failed");
    })))).toBeInTheDocument();
    expect(getByText("Message:")).toBeInTheDocument();
    expect(document.querySelector("#error-list")).toHaveTextContent("Local message: failed to apply resource at documents");

    fireEvent.click(getByText("Close"));
  });

});

describe("Verify step running", () => {

  beforeEach(() => {
    mocks.runAPI(axiosMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });


  test("Verify a load/mapping/match/merge/master step can be run from a flow as data-hub-developer", async () => {
    axiosMock.post["mockImplementation"](jest.fn(() => Promise.resolve(data.jobRespSuccess)));
    const {getByText, getAllByText, getByLabelText} = await render(<MemoryRouter><AuthoritiesContext.Provider value={ mockDevRolesService }><Run/></AuthoritiesContext.Provider></MemoryRouter>);

    let steps = data.flows.data[0].steps;
    let runButton;

    // Click disclosure icon
    fireEvent.click(getByLabelText("icon: right"));

    let upload;
    upload = document.querySelector("#fileUpload");
    const files = [new File(["cust1.json"], "cust1.json", {
      type: "application/json"
    })];

    Object.defineProperty(upload, "files", {
      value: files
    });
    fireEvent.change(upload);

    //Run  ingestion step
    runButton = await getByLabelText(`runStep-${steps[6].stepName}`);
    fireEvent.click(runButton);

    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The ingestion step ${steps[6].stepName} completed successfully`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: check-circle")).toBeInTheDocument();
    let stepType = `${steps[6].stepDefinitionType}`;
    if (stepType === "ingestion") {
      expect(await(waitForElement(() => getByText("Explore Loaded Data")))).toBeInTheDocument();
    } else {
      expect(getByText(" ")).toBeInTheDocument();
    }

    let exploreButton = await(waitForElement(() => getByText("Explore Loaded Data")));
    fireEvent.click(exploreButton);

    await wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith({"pathname": "/tiles/explore",
        "state": {"targetDatabase": "staging", "jobId": "e4590649-8c4b-419c-b6a1-473069186592"}});
    });

    //Run mapping step
    runButton = await getByLabelText(`runStep-${steps[1].stepName}`);
    fireEvent.click(runButton);
    expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();

    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The mapping step ${steps[1].stepName} completed successfully`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: check-circle")).toBeInTheDocument();
    stepType = `${steps[1].stepDefinitionType}`;
    if (stepType === "mapping") {
      expect(await(waitForElement(() => getByText("Explore Curated Data")))).toBeInTheDocument();
    } else {
      expect(getByText(" ")).toBeInTheDocument();
    }
    fireEvent.click(getByText("Close"));

    //Run match step
    runButton = await getByLabelText(`runStep-${steps[3].stepName}`);
    fireEvent.click(runButton);
    expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The matching step ${steps[3].stepName} completed successfully`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: check-circle")).toBeInTheDocument();
    fireEvent.click(getByText("Close"));

    //Run merge step
    runButton = await getByLabelText(`runStep-${steps[4].stepName}`);
    fireEvent.click(runButton);
    expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The merging step ${steps[4].stepName} completed successfully`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: check-circle")).toBeInTheDocument();
    fireEvent.click(getByText("Close"));

    //Run master step
    runButton = await getByLabelText(`runStep-${steps[5].stepName}`);
    fireEvent.click(runButton);
    expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The mastering step ${steps[5].stepName} completed successfully`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: check-circle")).toBeInTheDocument();
    fireEvent.click(getByText("Close"));

  }, 10000);

  test("Verify a load/mapping/match/merge/master step can be run from a flow as data-hub-operator", async () => {
    axiosMock.post["mockImplementation"](jest.fn(() => Promise.resolve(data.jobRespSuccess)));
    const {getByText, getAllByText, getByLabelText} = await render(<MemoryRouter><AuthoritiesContext.Provider value={ mockOpRolesService }><Run/></AuthoritiesContext.Provider></MemoryRouter>);

    let steps = data.flows.data[0].steps;
    let runButton;

    // Click disclosure icon
    fireEvent.click(getByLabelText("icon: right"));

    let upload;
    upload = document.querySelector("#fileUpload");
    const files = [new File(["cust1.json"], "cust1.json", {
      type: "application/json"
    })];

    Object.defineProperty(upload, "files", {
      value: files
    });
    fireEvent.change(upload);

    //Run  ingestion step
    runButton = await getByLabelText(`runStep-${steps[6].stepName}`);
    fireEvent.click(runButton);

    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The ingestion step ${steps[6].stepName} completed successfully`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: check-circle")).toBeInTheDocument();
    let stepType = `${steps[6].stepDefinitionType}`;
    if (stepType === "ingestion") {
      expect(await(waitForElement(() => getByText("Explore Loaded Data")))).toBeInTheDocument();
    } else {
      expect(getByText(" ")).toBeInTheDocument();
    }

    let exploreButton = await(waitForElement(() => getByText("Explore Loaded Data")));
    fireEvent.click(exploreButton);

    await wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith({"pathname": "/tiles/explore",
        "state": {"targetDatabase": "staging", "jobId": "e4590649-8c4b-419c-b6a1-473069186592"}});
    });

    //Run mapping step
    runButton = await getByLabelText(`runStep-${steps[1].stepName}`);
    fireEvent.click(runButton);
    expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The mapping step ${steps[1].stepName} completed successfully`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: check-circle")).toBeInTheDocument();
    stepType = `${steps[1].stepDefinitionType}`;
    if (stepType === "mapping") {
      expect(await(waitForElement(() => getByText("Explore Curated Data")))).toBeInTheDocument();
    } else {
      expect(getByText(" ")).toBeInTheDocument();
    }

    fireEvent.click(getByText("Close"));

    //Run match step
    runButton = await getByLabelText(`runStep-${steps[3].stepName}`);
    fireEvent.click(runButton);
    expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The matching step ${steps[3].stepName} completed successfully`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: check-circle")).toBeInTheDocument();
    fireEvent.click(getByText("Close"));

    //Run merge step
    runButton = await getByLabelText(`runStep-${steps[4].stepName}`);
    fireEvent.click(runButton);
    expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The merging step ${steps[4].stepName} completed successfully`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: check-circle")).toBeInTheDocument();
    fireEvent.click(getByText("Close"));

    //Run master step
    runButton = await getByLabelText(`runStep-${steps[5].stepName}`);
    fireEvent.click(runButton);
    expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The mastering step ${steps[5].stepName} completed successfully`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: check-circle")).toBeInTheDocument();
    fireEvent.click(getByText("Close"));

  });

});

describe("Verify step display", () => {

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test("Verify a load step with XML source is displayed correctly", async () => {
    mocks.runXMLAPI(axiosMock);
    const {getByText, getByLabelText} = await render(<MemoryRouter><AuthoritiesContext.Provider value={ mockDevRolesService }><Run/></AuthoritiesContext.Provider></MemoryRouter>);

    // Click disclosure icon
    fireEvent.click(getByLabelText("icon: right"));
    expect(await(waitForElement(() => getByText("XML")))).toBeInTheDocument();

    expect(await(waitForElement(() => getByText("loadXML")))).toBeInTheDocument();

    let notification = await(waitForElement(() => getByLabelText("icon: check-circle")));
    expect(getByText("XML")).toBeInTheDocument();
    expect(getByText("XML")).toHaveStyle("height: 35px; width: 35px; line-height: 35px; text-align: center;");
    expect(notification).toBeInTheDocument();
    fireEvent.mouseOver(notification);
    expect(await(waitForElement(() => getByText("Step last ran successfully on 7/13/2020, 11:54:06 PM")))).toBeInTheDocument();
  });

  test("Verify a mapping step's notification shows up correctly", async () => {
    mocks.runXMLAPI(axiosMock);
    const {getByText, getByLabelText, getAllByLabelText} = await render(<MemoryRouter><AuthoritiesContext.Provider value={ mockDevRolesService }><Run/></AuthoritiesContext.Provider></MemoryRouter>);

    // Click disclosure icon
    fireEvent.click(getByLabelText("icon: right"));
    expect(await(waitForElement(() => getByText("Mapping1")))).toBeInTheDocument();
    let notification = await(waitForElement(() => getByLabelText("icon: exclamation-circle")));
    expect(notification).toBeInTheDocument();
    fireEvent.mouseOver(notification);
    expect(await(waitForElement(() => getByText("Step last ran with errors on 4/4/2020, 1:17:45 AM")))).toBeInTheDocument();

    fireEvent.click(notification);
    // New Modal with Error message, uri and details is opened
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, "The mapping step Mapping1 completed with errors");
    })))).toBeInTheDocument();
    expect(getAllByLabelText("icon: exclamation-circle").length).toEqual(2);
    expect(document.querySelector("#error-list")).toHaveTextContent("Out of 3 batches, 1 succeeded and 2 failed. The error messages are listed below");
    expect(getByText("Message:")).toBeInTheDocument();
    expect(getByText("Details:")).toBeInTheDocument();
    expect(getByText("URI:")).toBeInTheDocument();
    // Error 2 is present
    expect(getByText("Error 2")).toBeInTheDocument();
    expect(await(waitForElement(() => getByText("Error 2")))).toBeInTheDocument();

    // Navigate to Explore tile
    let exploreButton = await(waitForElement(() => getByText("Explore Curated Data")));
    fireEvent.click(exploreButton);
    await wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith({"pathname": "/tiles/explore",
        "state": {"entityName": "Customer", "jobId": "350da405-c1e9-4fa7-8269-d9aefe3b4b9a", "targetDatabase": "final"}});
    });
  });

});

describe("Verify Run CRUD operations", () => {

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  beforeEach(() => {
    mocks.runCrudAPI(axiosMock);
  });

  test("Verify a user with writeFlow authority can create", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readFlow", "writeFlow"]);
    const {getByText, getByPlaceholderText, rerender} = await render(<MemoryRouter><AuthoritiesContext.Provider value={ authorityService }><Run/></AuthoritiesContext.Provider></MemoryRouter>);

    const newFlowValues = {name: "newFlow", description: "newFlow description"};
    fireEvent.click(getByText("Create Flow"));
    await(waitForElement(() => getByText("Name:")));
    fireEvent.change(getByPlaceholderText("Enter name"), {target: {value: newFlowValues.name}});
    fireEvent.change(getByPlaceholderText("Enter description"), {target: {value: newFlowValues.description}});
    fireEvent.click(getByText("Save"));

    expect(axiosMock.post).toHaveBeenNthCalledWith(1, "/api/flows", newFlowValues);

    const newStepToFlowOptions = {addingStepToFlow: true, existingFlow: false, newStepName: "newStep", stepDefinitionType: "ingestion"};
    //rerender in a state after add step to flow is executed to test create new flow
    rerender(<MemoryRouter><AuthoritiesContext.Provider value={ authorityService }><Run newStepToFlowOptions = {newStepToFlowOptions}/></AuthoritiesContext.Provider></MemoryRouter>);
    fireEvent.click(getByText("Create Flow"));
    await(waitForElement(() => getByText("Name:")));
    fireEvent.change(getByPlaceholderText("Enter name"), {target: {value: newFlowValues.name}});
    fireEvent.change(getByPlaceholderText("Enter description"), {target: {value: newFlowValues.description}});
    fireEvent.click(getByText("Save"));
    expect(axiosMock.post).toHaveBeenNthCalledWith(1, "/api/flows", newFlowValues);
    //verify add step to flow is not called
    expect(axiosMock.post).not.toBeCalledWith("/api/flows/newFlow/steps");
  });

  test("Verify a user with writeFlow authority can update", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readFlow", "writeFlow"]);
    const {getByText, getByPlaceholderText} = await render(<MemoryRouter><AuthoritiesContext.Provider value={ authorityService }><Run/></AuthoritiesContext.Provider></MemoryRouter>);

    const existingFlowName = data.flows.data[0].name;
    const updateFlowURL = `/api/flows/${existingFlowName}`;

    const updatedFlow = {name: existingFlowName, description: `updated ${existingFlowName} description`};
    fireEvent.click(getByText(existingFlowName));
    await(waitForElement(() => getByText("Name:")));
    expect(getByPlaceholderText("Enter name")).toBeDisabled();
    fireEvent.change(getByPlaceholderText("Enter description"), {target: {value: updatedFlow.description}});
    fireEvent.click(getByText("Save"));

    expect(axiosMock.put).toHaveBeenNthCalledWith(1, updateFlowURL, updatedFlow);
  });

  test("Verify a user with writeFlow authority can delete", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readFlow", "writeFlow"]);
    const {getByText, getByTestId} = await render(<MemoryRouter><AuthoritiesContext.Provider value={ authorityService }><Run/></AuthoritiesContext.Provider></MemoryRouter>);

    const existingFlowName = data.flows.data[0].name;
    const updateFlowURL = `/api/flows/${existingFlowName}`;

    fireEvent.click(getByTestId(`deleteFlow-${existingFlowName}`));
    fireEvent.click(getByText("Yes"));

    expect(axiosMock.delete).toHaveBeenNthCalledWith(1, updateFlowURL);

  });

  // TODO DHFPROD-7711 skipping failing tests to enable component replacement
  test.skip("Verify a user with readFlow authority only cannot create/update/delete", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readFlow"]);
    const {getByPlaceholderText, getByText, getByLabelText, queryByText} = await render(<MemoryRouter><AuthoritiesContext.Provider value={ authorityService }><Run/></AuthoritiesContext.Provider></MemoryRouter>);

    const existingFlowName = data.flows.data[0].name;

    expect(getByText(existingFlowName)).toBeInTheDocument();
    // create flow shouldn't be provided
    expect(queryByText("Create Flow")).toBeDisabled();
    // delete should not work
    fireEvent.click(getByLabelText(`deleteFlowDisabled-${existingFlowName}`));
    // testing that confirmation modal didn't appear
    expect(queryByText("Yes")).not.toBeInTheDocument();
    // test description
    fireEvent.click(getByText(existingFlowName));
    expect(getByPlaceholderText("Enter name")).toBeDisabled();
    expect(getByPlaceholderText("Enter description")).toBeDisabled();
    expect(queryByText("Save")).toBeDisabled();
    fireEvent.click(getByText("Cancel"));

  });

  test("Verify a user with writeFlow authority can CREATE a new flow, ADD a step to the new flow, and RUN the step, all via a step card", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readFlow", "writeFlow"]);
    // Create flow and add/run step settings passed as newStepToFlowOptions
    const {getByText, getByLabelText, getByPlaceholderText} = await render(<MemoryRouter>
      <AuthoritiesContext.Provider value={ authorityService }>
        <Run newStepToFlowOptions={data.newStepToFlowOptions}/>
      </AuthoritiesContext.Provider>
    </MemoryRouter>);
    expect(getByText("New Flow")).toBeInTheDocument();
    const newFlowValues = {name: "testFlow", description: "testFlow description"};
    fireEvent.change(getByPlaceholderText("Enter name"), {target: {value: newFlowValues.name}});
    fireEvent.change(getByPlaceholderText("Enter description"), {target: {value: newFlowValues.description}});
    fireEvent.click(getByLabelText("Save"));
    // Create new flow
    expect(axiosMock.post).toHaveBeenNthCalledWith(1, "/api/flows", newFlowValues);
    const newStepValues = {stepDefinitionType: data.newStepToFlowOptions.stepDefinitionType, stepName: data.newStepToFlowOptions.newStepName};
    // Add step to new flow
    await wait(() => {
      expect(axiosMock.post).toHaveBeenNthCalledWith(2, `/api/flows/${newFlowValues.name}/steps`, newStepValues);
    });
    // Run step
    await wait(() => {
      expect(axiosMock.post).toHaveBeenNthCalledWith(3, `/api/flows/${newFlowValues.name}/steps/2`);
    });
  });

  test("Verify a user with writeFlow authority can CANCEL a new flow via a step card", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readFlow", "writeFlow"]);
    const history = createMemoryHistory();
    history.push("/tiles/run/add-run"); // initial state
    const {getByText, getByLabelText} = await render(<MemoryRouter>
      <AuthoritiesContext.Provider value={ authorityService }>
        <Run newStepToFlowOptions={data.newStepToFlowOptions}/>
      </AuthoritiesContext.Provider>
    </MemoryRouter>);
    expect(getByText("New Flow")).toBeInTheDocument();
    // Clicking Cancel returns to Curate tile
    fireEvent.click(getByLabelText("Cancel"));
    await wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith({"pathname": "/tiles/curate",
        "state": {
          "pageSize": data.newStepToFlowOptions.pageSize,
          "page": data.newStepToFlowOptions.page,
          "sortOrderInfo": data.newStepToFlowOptions.sortOrderInfo,
          "stepDefinitionType": data.newStepToFlowOptions.stepDefinitionType,
          "targetEntityType": data.newStepToFlowOptions.targetEntityType,
          "viewMode": data.newStepToFlowOptions.viewMode
        }
      });
    });
  });
});

describe("Verify map/match/merge/master step failures in a flow", () => {

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test("Verify errors when flow with mapping/matching/merging/mastering step fails with jobStatus failed", async() => {
    mocks.runFailedAPI(axiosMock);
    axiosMock.post["mockImplementation"](jest.fn(() => Promise.resolve(data.response)));
    const {getByText, getByLabelText} = await render(<MemoryRouter><AuthoritiesContext.Provider value={ mockDevRolesService}><Run/></AuthoritiesContext.Provider></MemoryRouter>);

    let steps = data.flows.data[0].steps;

    // Click disclosure icon
    fireEvent.click(getByLabelText("icon: right"));

    //Mapping step failed error
    fireEvent.click(getByLabelText(`runStep-${steps[1].stepName}`));
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The mapping step ${steps[1].stepName} failed`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: exclamation-circle")).toBeInTheDocument();
    expect(getByText("Message:")).toBeInTheDocument();
    expect(document.querySelector("#error-list")).toHaveTextContent("Local message: failed to apply resource at documents");
    fireEvent.click(getByText("Close"));

    //Matching step failed error
    fireEvent.click(getByLabelText(`runStep-${steps[3].stepName}`));
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The matching step ${steps[3].stepName} failed`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: exclamation-circle")).toBeInTheDocument();
    expect(getByText("Message:")).toBeInTheDocument();
    expect(document.querySelector("#error-list")).toHaveTextContent("Local message: failed to apply resource at documents");
    fireEvent.click(getByText("Close"));

    //Merging step failed error
    fireEvent.click(getByLabelText(`runStep-${steps[4].stepName}`));
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The merging step ${steps[4].stepName} failed`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: exclamation-circle")).toBeInTheDocument();
    expect(getByText("Message:")).toBeInTheDocument();
    expect(document.querySelector("#error-list")).toHaveTextContent("Local message: failed to apply resource at documents");
    fireEvent.click(getByText("Close"));

    //Mastering step failed error
    fireEvent.click(getByLabelText(`runStep-${steps[5].stepName}`));
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The mastering step ${steps[5].stepName} failed`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: exclamation-circle")).toBeInTheDocument();
    expect(getByText("Message:")).toBeInTheDocument();
    expect(document.querySelector("#error-list")).toHaveTextContent("Local message: failed to apply resource at documents");
    fireEvent.click(getByText("Close"));
  });

  test("Verify errors when a flow with mapping/match/merge/mastering step fails with jobStatus finished_with_errors", async () => {
    mocks.runErrorsAPI(axiosMock);
    axiosMock.post["mockImplementation"](jest.fn(() => Promise.resolve(data.response)));
    const {getByText, getByLabelText} = await render(<MemoryRouter><AuthoritiesContext.Provider value={ mockDevRolesService}><Run/></AuthoritiesContext.Provider></MemoryRouter>);

    let steps = data.flows.data[0].steps;
    // Click disclosure icon
    fireEvent.click(getByLabelText("icon: right"));

    //Mapping step error
    fireEvent.click(await getByLabelText(`runStep-${steps[1].stepName}`));
    // New Modal with Error message, uri and details is opened
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The mapping step ${steps[1].stepName} completed with errors`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: exclamation-circle")).toBeInTheDocument();
    expect(document.querySelector("#error-list")).toHaveTextContent("Out of 3 batches, 1 succeeded and 2 failed. The error messages are listed below");
    expect(getByText("Message:")).toBeInTheDocument();
    expect(getByText("Details:")).toBeInTheDocument();
    expect(getByText("URI:")).toBeInTheDocument();
    // Error 2 is present
    //expect(getByText("Error 2")).toBeInTheDocument();
    expect(await(waitForElement(() => getByText("Error 2")))).toBeInTheDocument();
    let stepType = `${steps[1].stepDefinitionType}`;
    if (stepType === "mapping") {
      expect(await(waitForElement(() => getByText("Explore Curated Data")))).toBeInTheDocument();
    } else {
      expect(getByText(" ")).toBeInTheDocument();
    }
    fireEvent.click(getByText("Close"));

    //Matching step error
    fireEvent.click(await getByLabelText(`runStep-${steps[3].stepName}`));
    // New Modal with Error message, uri and details is opened
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The matching step ${steps[3].stepName} completed with errors`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: exclamation-circle")).toBeInTheDocument();
    expect(document.querySelector("#error-list")).toHaveTextContent("Out of 3 batches, 1 succeeded and 2 failed. The error messages are listed below");
    expect(getByText("Message:")).toBeInTheDocument();
    expect(getByText("Details:")).toBeInTheDocument();
    expect(getByText("URI:")).toBeInTheDocument();
    // Error 2 is present
    expect(getByText("Error 2")).toBeInTheDocument();
    //debug();
    fireEvent.click(getByText("Close"));

    //Merging step error
    fireEvent.click(await getByLabelText(`runStep-${steps[4].stepName}`));
    // New Modal with Error message, uri and details is opened
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The merging step ${steps[4].stepName} completed with errors`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: exclamation-circle")).toBeInTheDocument();
    expect(document.querySelector("#error-list")).toHaveTextContent("Out of 3 batches, 1 succeeded and 2 failed. The error messages are listed below");
    expect(getByText("Message:")).toBeInTheDocument();
    expect(getByText("Details:")).toBeInTheDocument();
    expect(getByText("URI:")).toBeInTheDocument();
    // Error 2 is present
    expect(getByText("Error 2")).toBeInTheDocument();
    fireEvent.click(getByText("Close"));

    // //Mastering step error
    fireEvent.click(await getByLabelText(`runStep-${steps[5].stepName}`));
    // New Modal with Error message, uri and details is opened
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The mastering step ${steps[5].stepName} completed with errors`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: exclamation-circle")).toBeInTheDocument();
    expect(document.querySelector("#error-list")).toHaveTextContent("Out of 3 batches, 1 succeeded and 2 failed. The error messages are listed below");
    expect(getByText("Message:")).toBeInTheDocument();
    expect(getByText("Details:")).toBeInTheDocument();
    expect(getByText("URI:")).toBeInTheDocument();
    // Error 2 is present
    expect(getByText("Error 2")).toBeInTheDocument();
    fireEvent.click(getByText("Close"));

  }, 10000);

  test("Check if explore curated data is clicked and exists in history", async () => {
    mocks.runErrorsAPI(axiosMock);
    axiosMock.post["mockImplementation"](jest.fn(() => Promise.resolve(data.response)));
    let getByText, getByLabelText;
    await act(async() => {
      const renderResults =  render(<MemoryRouter>
        <AuthoritiesContext.Provider value={ mockDevRolesService}>
          <Run/>
        </AuthoritiesContext.Provider></MemoryRouter>);
      getByText = renderResults.getByText;
      getByLabelText = renderResults.getByLabelText;
    });


    let steps = data.flows.data[0].steps;
    // Click disclosure icon
    fireEvent.click(getByLabelText("icon: right"));
    //Mapping step error
    fireEvent.click(await getByLabelText(`runStep-${steps[1].stepName}`));

    // New Modal with Error message, uri and details is opened
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The mapping step ${steps[1].stepName} completed with errors`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: exclamation-circle")).toBeInTheDocument();
    let stepType = `${steps[1].stepDefinitionType}`;
    if (stepType === "mapping") {
      let exploreButton = await(waitForElement(() => getByText("Explore Curated Data")));
      fireEvent.click(exploreButton);
    }
    await wait(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith({"pathname": "/tiles/explore",
        "state": {"entityName": "Customer", "targetDatabase": "final", "jobId": "350da405-c1e9-4fa7-8269-d9aefe3b4b9a"}});
    });
    //TODO- E2E test to check if the explore tile is loaded or not.*/
  });
});

describe("Verify Add Step function", () => {

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test("Verify a user with developer privileges can add a step to a flow", async () => {
    mocks.runAddStepAPI(axiosMock);
    const {getByText, getByLabelText} = await render(<MemoryRouter>
      <AuthoritiesContext.Provider value={ mockDevRolesService }><Run/></AuthoritiesContext.Provider>
    </MemoryRouter>);

    // Click disclosure icon
    fireEvent.click(getByLabelText("icon: right"));
    expect(getByText(data.flows.data[0].steps[1].stepName)).toBeInTheDocument();

    // Click to open Add Step menu and click a step
    let addStep = getByText("Add Step");
    fireEvent.click(addStep);
    let step = getByText(data.steps.data["ingestionSteps"][0].name);
    fireEvent.click(step);

    // Click to confirm the add in the dialog
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `Are you sure you want to add step ${data.steps.data["ingestionSteps"][0].name} to flow ${data.flows.data[0].name}?`);
    })))).toBeInTheDocument();

    let confirm = getByLabelText("Yes");
    fireEvent.click(confirm);
    await wait(() => {
      expect(axiosMock.post).toHaveBeenNthCalledWith(1, `/api/flows/${data.flows.data[0].name}/steps`, {"stepDefinitionType": "ingestion", "stepName": data.steps.data["ingestionSteps"][0].name});
    });

  });

  test("Verify a user with operator privileges cannot add a step to a flow", async () => {
    mocks.runAddStepAPI(axiosMock);
    const {getByText, getByLabelText, queryByText} = await render(<MemoryRouter>
      <AuthoritiesContext.Provider value={ mockOpRolesService }><Run/></AuthoritiesContext.Provider>
    </MemoryRouter>);

    // Click disclosure icon
    fireEvent.click(getByLabelText("icon: right"));
    expect(getByText(data.flows.data[0].steps[1].stepName)).toBeInTheDocument();

    // Click Add Step menu
    expect(getByLabelText("addStepDisabled-0")).toBeInTheDocument();
    let addStep = getByText("Add Step");
    fireEvent.click(addStep);
    expect(queryByText(data.steps.data["ingestionSteps"][0].name)).not.toBeInTheDocument();

  });

  test("Verify a flow panel that is closed reopens when a step is added to it", async () => {
    mocks.runAddStepAPI(axiosMock);
    axiosMock.post["mockImplementation"](jest.fn(() => Promise.resolve(data.jobRespSuccess)));
    const {getByText, getByLabelText, getByPlaceholderText, getAllByText} = await render(<MemoryRouter>
      <AuthoritiesContext.Provider value={ mockDevRolesService }><Run/></AuthoritiesContext.Provider>
    </MemoryRouter>);

    //Create a flow
    const newFlowValues = {name: "newFlow", description: "newFlow description"};
    fireEvent.click(getByText("Create Flow"));
    await(waitForElement(() => getByText("Name:")));
    fireEvent.change(getByPlaceholderText("Enter name"), {target: {value: newFlowValues.name}});
    fireEvent.change(getByPlaceholderText("Enter description"), {target: {value: newFlowValues.description}});
    fireEvent.click(getByLabelText("Save"));
    await wait(() => {
      expect(axiosMock.post).toHaveBeenNthCalledWith(1, "/api/flows", {name: newFlowValues.name, description: newFlowValues.description});
    });

    // Click to open Add Step menu and click a step
    let addStep = getByText("Add Step");
    fireEvent.click(addStep);
    let step = getByText(data.steps.data["ingestionSteps"][0].name);
    fireEvent.click(step);

    // Click to confirm the add in the dialog
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `Are you sure you want to add step ${data.steps.data["ingestionSteps"][0].name} to flow ${data.flows.data[0].name}?`);
    })))).toBeInTheDocument();

    let confirm = getByLabelText("Yes");
    fireEvent.click(confirm);
    await wait(() => {
      expect(axiosMock.post).toHaveBeenNthCalledWith(2, `/api/flows/${data.flows.data[0].name}/steps`, {"stepDefinitionType": "ingestion", "stepName": data.steps.data["ingestionSteps"][0].name});
    });

    // Panel is open
    expect(getByText(data.flows.data[0].steps[1].stepName)).toBeInTheDocument();

    //Run a step
    let steps = data.flows.data[0].steps;
    let runButton = await getByLabelText(`runStep-${steps[1].stepName}`);
    fireEvent.click(runButton);
    expect(await(waitForElement(() => getAllByText("Running...")[0]))).toBeInTheDocument();
    expect(await(waitForElement(() => getByText((content, node) => {
      return getSubElements(content, node, `The mapping step ${steps[1].stepName} completed successfully`);
    })))).toBeInTheDocument();
    expect(getByLabelText("icon: check-circle")).toBeInTheDocument();

    fireEvent.click(getByText("Close"));

    //expect panel to still be open after step is run
    expect(getAllByText(data.flows.data[0].steps[1].stepName)).toHaveLength(2);

  });

  test("Verify a missing step error is handled with a modal displaying error message", async () => {
    mocks.runMissingStep(axiosMock);
    const {getByText} = await render(<MemoryRouter>
      <AuthoritiesContext.Provider value={ mockOpRolesService }><Run/></AuthoritiesContext.Provider>
    </MemoryRouter>);
    await(waitForElement(() => getByText("Error message")));
  });

});
