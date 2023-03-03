import React from "react";
import {Router} from "react-router";
import {render, fireEvent, cleanup, wait, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";
import {createMemoryHistory} from "history";
const history = createMemoryHistory();
import {Flow} from "../../types/run-types";
import axiosMock from "axios";
import data from "../../assets/mock-data/curation/flows.data";
import Flows, {Props} from "./flows";
import {SecurityTooltips} from "../../config/tooltips.config";
// import {getViewSettings} from "../../util/user-context";

jest.mock("axios");

describe("Flows component", () => {

  let flowsProps: Props = {
    flows: data.flows.data as Flow[],
    steps: data.steps.data,
    deleteFlow: () => null,
    createFlow: () => null,
    updateFlow: jest.fn(),
    deleteStep: () => null,
    runStep: () => null,
    runFlowSteps: () => null,
    flowRunning: {name: "", steps: []},
    uploadError: "",
    newStepToFlowOptions: () => null,
    addStepToFlow: () => null,
    flowsDefaultActiveKey: [],
    runEnded: {},
    setJobId: () => null,
    setOpenJobResponse: () => null,
    isStepRunning: false,
    stopRun: jest.fn(),
    canReadFlow: true,
    canWriteFlow: true,
    canUserStopFlow: true,
    hasOperatorRole: true,
  };
  const flowName = data.flows.data[0].name;
  // @ts-ignore
  const flowStepName = data.flows.data[0].steps[1].stepName;
  const addStepName = data.steps.data["ingestionSteps"][0].name;

  beforeEach(() => {
    axiosMock.get["mockImplementationOnce"](jest.fn(() => Promise.resolve({})));
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("Verifies input format names and type circles", () => {
    const allKindsOfIngestInAFlow = [{name: "allInputFormats", steps: [{
      "stepDefinitionType": "ingestion",
      "sourceFormat": "csv"
    }, {
      "stepDefinitionType": "ingestion",
      "sourceFormat": "binary"
    }, {
      "stepDefinitionType": "ingestion",
      "sourceFormat": "text"
    }, {
      "stepDefinitionType": "ingestion",
      "sourceFormat": "json"
    }, {
      "stepDefinitionType": "ingestion",
      "sourceFormat": "xml"}
    ]
    }];
    const {getByText} = render(
      <Router history={history}>
        <Flows {...flowsProps}
          flows={allKindsOfIngestInAFlow as Flow[]}
        />
      </Router>);
    let flowButton = document.querySelector(".accordion-button")!;
    userEvent.click(flowButton);
    ["CSV", "BIN", "TXT", "JSON", "XML"].forEach(format => {
      expect(getByText(format)).toBeInTheDocument();
      expect(getByText(format)).toHaveStyle("height: 35px; width: 35px; line-height: 35px; text-align: center;");
    });
  });

  it("user with flow read, write, and operator privileges can view, edit, and run", async () => {
    const {getByText, getByLabelText} = render(
      <Router history={history}><Flows
        {...flowsProps}
      /></Router>
    );

    expect(getByText(flowName)).toBeInTheDocument();
    expect(getByLabelText("create-flow")).toBeInTheDocument();
  });

  it("user without flow write privileges cannot edit", async () => {
    const {getByText, getByLabelText, queryByLabelText, getAllByText} = render(
      <Router history={history}><Flows
        {...flowsProps}
        canWriteFlow={false}
      /></Router>
    );

    let flowButton = document.querySelector(".accordion-button")!;
    expect(getByText(flowName)).toBeInTheDocument();
    expect(getByLabelText("create-flow-disabled")).toBeInTheDocument();
    expect(getByLabelText("deleteFlowDisabled-" + flowName)).toBeInTheDocument();

    // test delete, create flow, add step buttons display correct tooltip when disabled
    fireEvent.mouseOver(getByLabelText("deleteFlowDisabled-" + flowName));
    expect(await screen.findAllByText("Delete Flow: " + SecurityTooltips.missingPermission)).toHaveLength(1);
    fireEvent.mouseOver(getAllByText("Add Step")[0]);
    expect(await screen.findAllByText(SecurityTooltips.missingPermission)).toHaveLength(1);
    fireEvent.mouseOut(getAllByText("Add Step")[0]);
    fireEvent.mouseOver(getByLabelText("create-flow-disabled"));
    await wait(() => expect(getByText(SecurityTooltips.missingPermission)).toBeInTheDocument());

    // Open flow
    fireEvent.click(flowButton);
    expect(getByText(flowStepName)).toBeInTheDocument();
    expect(getByLabelText("runStep-" + flowStepName)).toBeInTheDocument(); // Has operator priv's, can still run
    expect(getByLabelText("deleteStepDisabled-" + flowStepName)).toBeInTheDocument();

    // Open Add Step
    let addStep = getAllByText("Add Step")[0];
    fireEvent.click(addStep);
    expect(queryByLabelText(addStepName)).not.toBeInTheDocument();

  });

  it("user without flow write or operator privileges cannot edit or run", () => {
    const {getByText, getByLabelText, queryByLabelText, getAllByText} = render(
      <Router history={history}><Flows
        {...flowsProps}
        canReadFlow={true}
        canWriteFlow={false}
        hasOperatorRole={false}
      /></Router>
    );

    let flowButton = document.querySelector(".accordion-button")!;
    expect(getByText(flowName)).toBeInTheDocument();
    expect(getByLabelText("create-flow-disabled")).toBeInTheDocument();
    expect(getByLabelText("deleteFlowDisabled-" + flowName)).toBeInTheDocument();

    // Open flow
    fireEvent.click(flowButton);
    expect(getByText(flowStepName)).toBeInTheDocument();
    expect(getByLabelText("runStepDisabled-" + flowStepName)).toBeInTheDocument();
    expect(getByLabelText("deleteStepDisabled-" + flowStepName)).toBeInTheDocument();

    // Open Add Step
    let addStep = getAllByText("Add Step")[0];
    fireEvent.click(addStep);
    expect(queryByLabelText(addStepName)).not.toBeInTheDocument();

  });

  it("user without flow read, write, or operator privileges cannot view, edit, or run", () => {
    const {queryByText, queryByLabelText} = render(
      <Router history={history}><Flows
        {...flowsProps}
        canReadFlow={false}
        canWriteFlow={false}
        hasOperatorRole={false}
      /></Router>
    );

    // Nothing shown, including Create button
    expect(queryByLabelText("(\"icon: right")).not.toBeInTheDocument();
    expect(queryByText(flowName)).not.toBeInTheDocument();

  });

  it("create flow button can be focused and pressed by keyboard", async () => {
    const {getByText, getByLabelText} = render(
      <Router history={history}><Flows
        {...flowsProps}
      /></Router>
    );

    let flowButton = getByLabelText("create-flow");
    expect(flowButton).toBeInTheDocument();
    flowButton.focus();
    expect(flowButton).toHaveFocus();

    // button should be focusable
    // verified by tabbing away and tabbing back
    userEvent.tab();
    expect(flowButton).not.toHaveFocus();
    userEvent.tab({shift: true});
    expect(flowButton).toHaveFocus();

    // pressing enter on button should bring up New Flow dialogue box
    fireEvent.keyDown(flowButton, {key: "Enter", code: "Enter"});
    expect(getByText("New Flow")).toBeInTheDocument();

  });

  it("user with write privileges can reorder a flow", () => {
    const {getByText, getByLabelText, queryByLabelText} = render(
      <Router history={history}><Flows
        {...flowsProps}
      /></Router>
    );

    let flowButton = document.querySelector(".accordion-button")!;
    fireEvent.click(flowButton);
    expect(getByText(flowStepName)).toBeInTheDocument();

    // Middle step(s) have both left and right arrows
    expect(getByLabelText("rightArrow-" + flowStepName)).toBeInTheDocument();
    expect(getByLabelText("leftArrow-" + flowStepName)).toBeInTheDocument();

    // First step only has right arrow, and no left arrow
    // @ts-ignore
    const firstFlowStep = data.flows.data[0].steps[0].stepName;
    expect(getByLabelText("rightArrow-" + firstFlowStep)).toBeInTheDocument();
    expect(queryByLabelText("leftArrow-" + firstFlowStep)).not.toBeInTheDocument();

    // Last step only has left arrow, and no right arrow
    // @ts-ignore
    const lastFlowStep = data.flows.data[0].steps[data.flows.data[0].steps.length - 1].stepName;
    expect(getByLabelText("leftArrow-" + lastFlowStep)).toBeInTheDocument();
    expect(queryByLabelText("rightArrow-" + lastFlowStep)).not.toBeInTheDocument();

  });

  it("user without write privileges can't reorder a flow", () => {
    const {getByText, queryByLabelText} = render(
      <Router history={history}><Flows
        {...flowsProps}
        canWriteFlow={false}
      /></Router>
    );

    let flowButton = document.querySelector(".accordion-button")!;
    fireEvent.click(flowButton);
    expect(getByText(flowStepName)).toBeInTheDocument();
    expect(queryByLabelText("rightArrow-" + flowStepName)).not.toBeInTheDocument();
    expect(queryByLabelText("leftArrow-" + flowStepName)).not.toBeInTheDocument();
  });
});

/*  Commenting Local Storage testing util local storage functionality is re added
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

  it("should get stored flows from session storage", () => {
    const getItemSpy = jest.spyOn(window.sessionStorage, "getItem");
    window.sessionStorage.setItem("dataHubViewSettings", JSON.stringify({run: {openFlows: ["0", "1", "2"]}}));
    const actualValue = getViewSettings();
    expect(actualValue).toEqual({run: {openFlows: ["0", "1", "2"]}});
    expect(getItemSpy).toBeCalledWith("dataHubViewSettings");
  });

  it("should get stored flows from session storage", () => {
    const getItemSpy = jest.spyOn(window.sessionStorage, "getItem");
    window.sessionStorage.setItem("dataHubViewSettings", JSON.stringify({run: {openFlows: ["0"]}}));
    const actualValue = getViewSettings();
    expect(actualValue).toEqual({run: {openFlows: ["0"]}});
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
 */
