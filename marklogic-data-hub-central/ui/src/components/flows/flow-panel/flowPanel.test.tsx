
import {RunToolTips} from "../../../config/tooltips.config";
import React from "react";
import {Router} from "react-router";
import {render, fireEvent, wait} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import FlowPanel, {Props} from "./flowPanel";
import data from "../../../assets/mock-data/curation/flows.data";
import {createMemoryHistory} from "history";
const history = createMemoryHistory();


const mockSelectedSteps = {
  testFlow: [
    {
      "stepId": "Mapping1-mapping",
      "stepName": "Mapping1",
      "stepDefinitionType": "mapping",
      "stepNumber": "2",
      "targetFormat": "json",
      "targetEntityType": "http://example.org/Customer-0.0.1/Customer"
    },
    {
      "stepId": "custom1-custom",
      "stepName": "custom1",
      "stepDefinitionType": "custom",
      "stepNumber": "3",
    },
    {
      "stepNumber": "4",
      "stepId": "match-customer-matching",
      "stepName": "match-customer",
      "stepDefinitionType": "matching",
      "targetEntityType": "http://example.org/Customer-0.0.1/Customer"
    },
  ],
  testFlow2: [
    {
      "stepNumber": "4",
      "stepId": "match-person-matching",
      "stepName": "match-person",
      "stepDefinitionType": "matching",
      "targetEntityType": "http://example.org/Customer-0.0.1/Customer"
    },
    {
      "stepNumber": "5",
      "stepId": "merge-person-merging",
      "stepName": "merge-person",
      "stepDefinitionType": "merging",
      "targetEntityType": "http://example.org/Customer-0.0.1/Customer"
    },
  ]
};

jest.mock("axios");

const defaultProps: Props = {
  flow: data.flows.data[0],
  flows: data.flows.data,
  flowRef: {current: ""},
  steps: data.steps.data,
  idx: 1,
  latestJobData: "",
  allSelectedSteps: mockSelectedSteps,
  setAllSelectedSteps: jest.fn(),
  openFilePicker: jest.fn(),
  setRunningStep: jest.fn(),
  setRunningFlow: jest.fn(),
  handleStepDelete: jest.fn(),
  handleRunSingleStep: jest.fn(),
  hasOperatorRole: true,
  getInputProps: jest.fn(),
  getRootProps: jest.fn(),
  setShowUploadError: jest.fn(),
  setSingleIngest: jest.fn(),
  uploadError: "",
  showUploadError: jest.fn(),
  handleStepAdd: jest.fn(),
  handleRunFlow: jest.fn(),
  handleFlowDelete: jest.fn(),
  stopRun: jest.fn(),
  isStepRunning: false,
  flowRunning: {
    name: "",
    steps: []
  },
  reorderFlow: jest.fn(),
  canWriteFlow: true,
  canUserStopFlow: true,
  openFlows: [],
  setOpenFlows: jest.fn(),
  setJobId: jest.fn(),
  getFlowWithJobInfo: jest.fn(),
  setOpenJobResponse: jest.fn(),
  setNewFlow: jest.fn(),
  setFlowData: jest.fn(),
  setTitle: jest.fn(),
};
describe("Flow Panel test suite", () => {
  // Faltan test de reorder
  it("should open and close the panel onClick", () => {
    const {getByText, getByLabelText, getByTestId} = render(
      <Router history={history}>
        <FlowPanel
          {...defaultProps}
          flow={data.flows.data[0]}
        /></Router>
    );
    const flowName = data.flows.data[0].name;
    // Open flow
    const flowButton = getByTestId("accordion-testFlow");
    fireEvent.click(flowButton);
    // @ts-ignore
    const stepName = data.flows.data[0].steps[0].stepName;
    expect(getByText(stepName)).toBeInTheDocument();
    expect(getByLabelText("runStep-" + stepName)).toBeInTheDocument();
    expect(getByLabelText("deleteStep-" + stepName)).toBeInTheDocument();

    expect(getByLabelText("deleteFlow-" + flowName)).toBeInTheDocument();

    // check if delete tooltip appears
    fireEvent.mouseOver(getByLabelText("deleteFlow-" + flowName));
    expect(getByText("Delete Flow")).toBeInTheDocument();
  });
  it("should be able to select steps to run", () => {
    // Select all
    // Deselect all
  });
  it("should add steps to flow", () => {
    const {getByText, getAllByText} = render(
      <Router history={history}>
        <FlowPanel
          {...defaultProps}
          flow={data.flows.data[0]}
        /></Router>
    );
    const addStepName = data.steps.data["ingestionSteps"][0].name;
    // Open Add Step
    let addStep = getAllByText("Add Step")[0];
    fireEvent.click(addStep);
    expect(getByText(addStepName)).toBeInTheDocument();

  });
  it("verify both runFlow and settings button disabled when flow is empty", async () => {
    const {getByText, getByLabelText, getByTestId} = render(
      <Router history={history}>
        <FlowPanel
          {...defaultProps}
          flow={data.flows.data[2]}
        /></Router>
    );

    //verify both runFlow and settings button disabled when flow is empty
    expect(getByTestId("runFlow-emptyFlow")).toBeDisabled();
    expect(getByLabelText("stepSettings-emptyFlow").parentElement).toBeDisabled();
    fireEvent.mouseOver(getByTestId("runFlow-emptyFlow"));
    await wait(() => expect(getByText(RunToolTips.runEmptyFlow)).toBeInTheDocument());

    expect(getByTestId("runFlow-emptyFlow")).toBeDisabled();
    expect(getByLabelText("stepSettings-emptyFlow")).not.toBeDisabled();
  });

  it("verify only runFlow button is disabled when steps exist but none selected", () => {
    const {getByText, getByLabelText, getByTestId} = render(
      <Router history={history}>
        <FlowPanel
          {...defaultProps}
          flow={data.flows.data[0]}
          allSelectedSteps={{}}
        /></Router>
    );

    // verify only runFlow button is disabled when steps exist but none selected
    fireEvent.click(getByLabelText("stepSettings-testFlow"));
    fireEvent.click(getByTestId("select-all-toggle"));
    expect(getByText(RunToolTips.selectAStep)).toBeInTheDocument();
  });
});
