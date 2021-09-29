import React from "react";
import {Router} from "react-router";
import {render, fireEvent, cleanup} from "@testing-library/react";
import {waitFor} from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";
import {createMemoryHistory} from "history";
const history = createMemoryHistory();
import axiosMock from "axios";
import data from "../../assets/mock-data/curation/flows.data";
import Flows from "./flows";
import {SecurityTooltips} from "../../config/tooltips.config";
import {getViewSettings} from "../../util/user-context";

jest.mock("axios");

describe("Flows component", () => {

  let flowsProps = {
    flows: data.flows.data,
    steps: data.steps.data,
    deleteFlow: () => null,
    createFlow: () => null,
    updateFlow: () => null,
    deleteStep: () => null,
    runStep: () => null,
    running: [],
    uploadError: "",
    newStepToFlowOptions: () => null,
    addStepToFlow: () => null,
    flowsDefaultActiveKey: [],
    showStepRunResponse: () => null,
    runEnded: {},
    onReorderFlow: () => null,
  };
  const flowName = data.flows.data[0].name;
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
        <Flows {...data.flowProps} flows={allKindsOfIngestInAFlow} />
      </Router>);
    userEvent.click(document.querySelector(".accordion-button"));
    ["CSV", "BIN", "TXT", "JSON", "XML"].forEach(format => {
      expect(getByText(format)).toBeInTheDocument();
      expect(getByText(format)).toHaveStyle("height: 35px; width: 35px; line-height: 35px; text-align: center;");
    });
  });

  it("user with flow read, write, and operator privileges can view, edit, and run", async () => {
    const {getByText, getByLabelText} = render(
      <Router history={history}><Flows
        {...flowsProps}
        canReadFlow={true}
        canWriteFlow={true}
        hasOperatorRole={true}
      /></Router>
    );

    let flowButton = document.querySelector(".accordion-button");
    expect(getByText(flowName)).toBeInTheDocument();
    expect(getByLabelText("create-flow")).toBeInTheDocument();
    expect(getByLabelText("deleteFlow-"+flowName)).toBeInTheDocument();

    // check if delete tooltip appears
    fireEvent.mouseOver(getByLabelText("deleteFlow-"+flowName));
    await waitFor(() => expect(getByText("Delete Flow")).toBeInTheDocument());


    // Open flow
    fireEvent.click(flowButton);
    expect(getByText(flowStepName)).toBeInTheDocument();
    expect(getByLabelText("runStep-"+flowStepName)).toBeInTheDocument();
    expect(getByLabelText("deleteStep-"+flowStepName)).toBeInTheDocument();

    // Open Add Step
    let addStep = getByText("Add Step");
    fireEvent.click(addStep);
    expect(getByText(addStepName)).toBeInTheDocument();

  });

  it("user without flow write privileges cannot edit", async () => {
    const {getByText, getByLabelText, queryByLabelText} = render(
      <Router history={history}><Flows
        {...flowsProps}
        canReadFlow={true}
        canWriteFlow={false}
        hasOperatorRole={true}
      /></Router>
    );

    let flowButton = document.querySelector(".accordion-button");
    expect(getByText(flowName)).toBeInTheDocument();
    expect(getByLabelText("create-flow-disabled")).toBeInTheDocument();
    expect(getByLabelText("deleteFlowDisabled-"+flowName)).toBeInTheDocument();

    // test delete, create flow, add step buttons display correct tooltip when disabled
    fireEvent.mouseOver(getByLabelText("deleteFlowDisabled-"+flowName));
    await waitFor(() => expect(getByText("Delete Flow: " + SecurityTooltips.missingPermission)).toBeInTheDocument());
    fireEvent.mouseOver(getByText("Add Step"));
    await waitFor(() => expect(getByText(SecurityTooltips.missingPermission)).toBeInTheDocument());
    fireEvent.mouseOver(getByLabelText("create-flow-disabled"));
    await waitFor(() => expect(getByText(SecurityTooltips.missingPermission)).toBeInTheDocument());

    // Open flow
    fireEvent.click(flowButton);
    expect(getByText(flowStepName)).toBeInTheDocument();
    expect(getByLabelText("runStep-"+flowStepName)).toBeInTheDocument(); // Has operator priv's, can still run
    expect(getByLabelText("deleteStepDisabled-"+flowStepName)).toBeInTheDocument();

    // Open Add Step
    let addStep = getByText("Add Step");
    fireEvent.click(addStep);
    expect(queryByLabelText(addStepName)).not.toBeInTheDocument();

  });

  it("user without flow write or operator privileges cannot edit or run", () => {
    const {getByText, getByLabelText, queryByLabelText} = render(
      <Router history={history}><Flows
        {...flowsProps}
        canReadFlow={true}
        canWriteFlow={false}
        hasOperatorRole={false}
      /></Router>
    );

    let flowButton = document.querySelector(".accordion-button");
    expect(getByText(flowName)).toBeInTheDocument();
    expect(getByLabelText("create-flow-disabled")).toBeInTheDocument();
    expect(getByLabelText("deleteFlowDisabled-"+flowName)).toBeInTheDocument();

    // Open flow
    fireEvent.click(flowButton);
    expect(getByText(flowStepName)).toBeInTheDocument();
    expect(getByLabelText("runStepDisabled-"+flowStepName)).toBeInTheDocument();
    expect(getByLabelText("deleteStepDisabled-"+flowStepName)).toBeInTheDocument();

    // Open Add Step
    let addStep = getByText("Add Step");
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
        canReadFlow={true}
        canWriteFlow={true}
        hasOperatorRole={true}
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

  it("links for steps lead to correct path", async () => {
    const {getByLabelText} = render(
      <Router history={history}><Flows
        {...flowsProps}
        canReadFlow={true}
        canWriteFlow={true}
        hasOperatorRole={true}
      /></Router>
    );

    let i : number;

    userEvent.click(document.querySelector(".accordion-button"));
    for (i = 1; i < data.flows.data[0].steps.length + 1; ++i) {
      const pathname = `http://localhost/tiles/${data.flows.data[0].steps[i-1]["stepDefinitionType"] === "ingestion" ? "load": "curate"}`;
      expect(getByLabelText(`${flowName}-${i}-cardlink`).firstChild.href).toBe(pathname);
    }

  });


  it("user with write privileges can reorder a flow", () => {
    const {getByText, getByLabelText, queryByLabelText} = render(
      <Router history={history}><Flows
        {...flowsProps}
        canReadFlow={true}
        canWriteFlow={true}
        hasOperatorRole={true}
      /></Router>
    );

    let flowButton = document.querySelector(".accordion-button");
    fireEvent.click(flowButton);
    expect(getByText(flowStepName)).toBeInTheDocument();

    // Middle step(s) have both left and right arrows
    expect(getByLabelText("rightArrow-"+flowStepName)).toBeInTheDocument();
    expect(getByLabelText("leftArrow-"+flowStepName)).toBeInTheDocument();

    // First step only has right arrow, and no left arrow
    const firstFlowStep = data.flows.data[0].steps[0].stepName;
    expect(getByLabelText("rightArrow-"+firstFlowStep)).toBeInTheDocument();
    expect(queryByLabelText("leftArrow-"+firstFlowStep)).not.toBeInTheDocument();

    // Last step only has left arrow, and no right arrow
    const lastFlowStep = data.flows.data[0].steps[data.flows.data[0].steps.length-1].stepName;
    expect(getByLabelText("leftArrow-"+lastFlowStep)).toBeInTheDocument();
    expect(queryByLabelText("rightArrow-"+lastFlowStep)).not.toBeInTheDocument();

  });

  it("user without write privileges can't reorder a flow", () => {
    const {getByText, queryByLabelText} = render(
      <Router history={history}><Flows
        {...flowsProps}
        canReadFlow={true}
        canWriteFlow={false}
        hasOperatorRole={true}
      /></Router>
    );

    let flowButton = document.querySelector(".accordion-button");
    fireEvent.click(flowButton);
    expect(getByText(flowStepName)).toBeInTheDocument();
    expect(queryByLabelText("rightArrow-"+flowStepName)).not.toBeInTheDocument();
    expect(queryByLabelText("leftArrow-"+flowStepName)).not.toBeInTheDocument();
  });

  it("reorder flow buttons can be focused and pressed by keyboard", async () => {
    const {getByLabelText} = render(
      <Router history={history}><Flows
        {...flowsProps}
        canReadFlow={true}
        canWriteFlow={true}
        hasOperatorRole={true}
      /></Router>
    );
    let flowButton = document.querySelector(".accordion-button");
    fireEvent.click(flowButton);

    const rightArrowButton = getByLabelText("rightArrow-"+flowStepName);
    expect(rightArrowButton).toBeInTheDocument();
    rightArrowButton.focus();
    expect(rightArrowButton).toHaveFocus();

    userEvent.tab();
    expect(rightArrowButton).not.toHaveFocus();
    userEvent.tab({shift: true});
    expect(rightArrowButton).toHaveFocus();

    const leftArrowButton = getByLabelText("leftArrow-"+flowStepName);
    expect(leftArrowButton).toBeInTheDocument();
    leftArrowButton.focus();
    expect(leftArrowButton).toHaveFocus();

    userEvent.tab();
    expect(leftArrowButton).not.toHaveFocus();
    userEvent.tab({shift: true});
    expect(leftArrowButton).toHaveFocus();

    // Verifying a user can press enter to reorder steps in a flow
    rightArrowButton.onkeydown = jest.fn();
    fireEvent.keyDown(rightArrowButton, {key: "Enter", code: "Enter"});
    expect(rightArrowButton.onkeydown).toHaveBeenCalledTimes(1);

    leftArrowButton.onkeydown = jest.fn();
    fireEvent.keyDown(leftArrowButton, {key: "Enter", code: "Enter"});
    expect(leftArrowButton.onkeydown).toHaveBeenCalledTimes(1);
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
