import React from "react";
import {render, wait, cleanup, fireEvent} from "@testing-library/react";
import {BrowserRouter as Router} from "react-router-dom";
import userEvent from "@testing-library/user-event";
import MergingCard from "./merging-card";
import {mergingStep} from "../../../assets/mock-data/curation/merging.data";
import {customerEntityDef} from "../../../assets/mock-data/curation/entity-definitions-mock";
import {SecurityTooltips} from "../../../config/tooltips.config";

const mergingStepsArray = mergingStep.artifacts;
const mockHistoryPush = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

const entityModel = {model: customerEntityDef[0]["entityModel"].definitions};
const defaultProps = {
  mergingStepsArray: mergingStepsArray,
  flows: [{name: "customerJSONFlow", steps: [{stepName: "mergeCustomers"}, {stepName: "mergeCustomers123"}]}, {name: "customerXMLFlow", steps: [{stepName: "mergeCustomers123"}]}],
  entityName: customerEntityDef[0]["entityModel"].info.title,
  deleteMergingArtifact: jest.fn(),
  createMergingArtifact: jest.fn(),
  canReadMatchMerge: true,
  canWriteMatchMerge: true,
  entityModel: entityModel,
  canWriteFlow: true,
  addStepToFlow: jest.fn(),
  addStepToNew: jest.fn()
};

describe("Merging cards view component", () => {

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it("can render merging steps with writeMatchMerge authority", async () => {
    const deleteMergingArtifact = jest.fn(() => { });
    const {getByText, getByLabelText, getByTestId, queryAllByRole} = render(
      <Router>
        <MergingCard
          {...defaultProps}
          deleteMergingArtifact={deleteMergingArtifact}
          canWriteMatchMerge={true}
          mergingStepsArray={mergingStepsArray}
          flows={defaultProps.flows}
          entityName={defaultProps.entityName}
          entityModel={defaultProps.entityModel}
          canReadMatchMerge={true}
          createMergingArtifact={jest.fn()}
          updateMergingArtifact={jest.fn()}
          addStepToFlow={jest.fn()}
          addStepToNew={jest.fn()}
          canWriteFlow={jest.fn()}
        />
      </Router>
    );

    expect(getByLabelText("icon: plus-circle")).toBeInTheDocument();
    expect(getByText("mergeCustomers")).toBeInTheDocument();
    expect(getByText("mergeCustomersEmpty")).toBeInTheDocument();
    expect(getByText("mergeCustomers123")).toBeInTheDocument();

    //Verify if the card renders fine
    expect(getByTestId("mergeCustomers-edit")).toBeInTheDocument();
    expect(getByTestId("mergeCustomersEmpty-edit")).toBeInTheDocument();
    expect(getByTestId("mergeCustomers123-edit")).toBeInTheDocument();
    expect(queryAllByRole("disabled-delete-merging")).toHaveLength(0);

    // check if delete tooltip appears and user is able to proceed with deletion of the step
    userEvent.hover(getByTestId("mergeCustomers-delete"));
    await wait(() => expect(getByText("Delete")).toBeInTheDocument());
    userEvent.click(getByTestId("mergeCustomers-delete"));
    await wait(() => expect(getByLabelText("delete-step-text")).toBeInTheDocument());
    userEvent.click(getByText("Yes"));
    expect(deleteMergingArtifact).toBeCalled();
  });

  it("cannot delete merging step without writeMatchMerge authority", async () => {
    const deleteMergingArtifact = jest.fn(() => { });
    const {getByText, getByTestId, queryAllByText, queryAllByRole, queryByLabelText, getByLabelText} = render(
      <Router>
        <MergingCard
          {...defaultProps}
          deleteMergingArtifact={deleteMergingArtifact}
          canWriteMatchMerge={false}
          mergingStepsArray={mergingStepsArray}
          flows={defaultProps.flows}
          entityName={defaultProps.entityName}
          entityModel={defaultProps.entityModel}
          canReadMatchMerge={true}
          createMergingArtifact={jest.fn()}
          updateMergingArtifact={jest.fn()}
          addStepToFlow={jest.fn()}
          addStepToNew={jest.fn()}
          canWriteFlow={jest.fn()}
        />
      </Router>
    );

    fireEvent.mouseOver(getByLabelText("add-new-card-disabled"));
    await wait(() => expect(getByText("Curate: " + SecurityTooltips.missingPermission)).toBeInTheDocument());
    expect(queryByLabelText("icon: plus-circle")).toBeInTheDocument();
    fireEvent.mouseOver(getByText("mergeCustomers"));
    expect(getByText("mergeCustomersEmpty")).toBeInTheDocument();

    //Verify if the card renders fine
    expect(getByTestId("mergeCustomers-edit")).toBeEnabled();
    expect(getByTestId("mergeCustomersEmpty-edit")).toBeEnabled();
    expect(queryAllByRole("delete-merging")).toHaveLength(0);

    // check run icon is disabled
    let runIcon = getByTestId("mergeCustomers-disabled-run");
    userEvent.hover(runIcon);
    await wait(() => expect(getByText("Run: " + SecurityTooltips.missingPermission)).toBeInTheDocument());

    // check if delete icon displays correct tooltip when disabled
    let disabledDeleteIcon = getByTestId("mergeCustomers-disabled-delete");
    userEvent.hover(disabledDeleteIcon);
    await wait(() => expect(getByText("Delete: " + SecurityTooltips.missingPermission)).toBeInTheDocument());
    userEvent.click(disabledDeleteIcon);
    expect(queryAllByText("Yes")).toHaveLength(0);
    expect(deleteMergingArtifact).not.toBeCalled();

  });

  it("can render/edit merge steps with writeMatchMerge authority", async () => {
    const deleteMergingArtifact = jest.fn();
    const {getByText, getByLabelText, getByTestId, queryAllByRole} = render(
      <Router>
        <MergingCard
          {...defaultProps}
          deleteMergingArtifact={deleteMergingArtifact}
          mergingStepsArray={mergingStepsArray}
          flows={defaultProps.flows}
          entityName={defaultProps.entityName}
          entityModel={defaultProps.entityModel}
          canReadMatchMerge={true}
          canWriteMatchMerge={true}
          createMergingArtifact={jest.fn()}
          updateMergingArtifact={jest.fn()}
          addStepToFlow={jest.fn()}
          addStepToNew={jest.fn()}
          canWriteFlow={jest.fn()}
        />
      </Router>
    );

    expect(getByLabelText("icon: plus-circle")).toBeInTheDocument();
    expect(getByText("mergeCustomers")).toBeInTheDocument();

    //Verify if the card renders fine
    expect(getByTestId("mergeCustomers-edit")).toBeInTheDocument();
    expect(queryAllByRole("disabled-delete-merging")).toHaveLength(0);

    // check if delete tooltip appears and user is able to proceed with deletion of the step
    userEvent.hover(getByTestId("mergeCustomers-delete"));
    await wait(() => expect(getByText("Delete")).toBeInTheDocument());
    userEvent.click(getByTestId("mergeCustomers-delete"));
    await wait(() => expect(getByLabelText("delete-step-text")).toBeInTheDocument());
    userEvent.click(getByText("Yes"));
    expect(deleteMergingArtifact).toBeCalled();
  });

  it("can add a step to a new flow", async () => {
    const {getByText, getByTestId, getByLabelText} = render(
      <Router>
        <MergingCard {...defaultProps}
          mergingStepsArray={mergingStepsArray}
          flows={defaultProps.flows}
          entityName={defaultProps.entityName}
          entityModel={defaultProps.entityModel}
          canReadMatchMerge={true}
          canWriteMatchMerge={true}
          createMergingArtifact={jest.fn()}
          updateMergingArtifact={jest.fn()}
          addStepToFlow={jest.fn()}
          addStepToNew={jest.fn()}
          canWriteFlow={jest.fn()}
        />
      </Router>
    );

    expect(getByText("mergeCustomers")).toBeInTheDocument();
    fireEvent.mouseOver(getByLabelText("mergeCustomers-step-label"));

    await wait(() => { expect(getByTestId("mergeCustomers-toNewFlow")).toBeInTheDocument(); });
    fireEvent.click(getByTestId("mergeCustomers-toNewFlow"));

    // Check if the /tiles/run/add route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add"); });
  });

  it("can add/run a step in a new flow from run button", () => {
    const {getByTestId, getByLabelText} = render(
      <Router>
        <MergingCard {...defaultProps}
          mergingStepsArray={mergingStepsArray}
          flows={defaultProps.flows}
          entityName={defaultProps.entityName}
          entityModel={defaultProps.entityModel}
          canReadMatchMerge={true}
          canWriteMatchMerge={true}
          createMergingArtifact={jest.fn()}
          updateMergingArtifact={jest.fn()}
          addStepToFlow={jest.fn()}
          addStepToNew={jest.fn()}
          canWriteFlow={jest.fn()}
        />
      </Router>
    );

    fireEvent.click(getByTestId("mergeCustomersEmpty-run"));
    expect(getByLabelText("step-in-no-flows-confirmation")).toBeInTheDocument();
    userEvent.click(getByTestId("mergeCustomersEmpty-run-toNewFlow"));

    // Check if the /tiles/run/add route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add"); });
  });

  it("can add a step to an existing flow", () => {
    const {getByText, getByTestId, getByLabelText} = render(
      <Router>
        <MergingCard {...defaultProps}
          mergingStepsArray={mergingStepsArray}
          flows={defaultProps.flows}
          entityName={defaultProps.entityName}
          entityModel={defaultProps.entityModel}
          canReadMatchMerge={true}
          canWriteMatchMerge={true}
          createMergingArtifact={jest.fn()}
          updateMergingArtifact={jest.fn()}
          addStepToFlow={jest.fn()}
          addStepToNew={jest.fn()}
          canWriteFlow={jest.fn()}
        />
      </Router>
    );

    expect(getByText("mergeCustomersEmpty")).toBeInTheDocument();

    //mouseover to trigger flow menu
    fireEvent.mouseOver(getByText("mergeCustomersEmpty"));
    fireEvent.keyDown(getByLabelText("mergeCustomersEmpty-flowsList"), {key: "ArrowDown"});
    expect(getByLabelText("customerJSONFlow-option")).toBeInTheDocument();
    fireEvent.click(getByLabelText("customerJSONFlow-option"));

    expect(getByLabelText("step-not-in-flow")).toBeInTheDocument();
    fireEvent.click(getByTestId("mergeCustomersEmpty-to-customerJSONFlow-Confirm"));

    // Check if the /tiles/run/add route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add"); });
  });

  it("can run a step in an existing flow where step DOES NOT exist", () => {
    const {getByText, getByTestId, getByLabelText} = render(
      <Router>
        <MergingCard {...defaultProps}
          mergingStepsArray={mergingStepsArray}
          flows={defaultProps.flows}
          entityName={defaultProps.entityName}
          entityModel={defaultProps.entityModel}
          canReadMatchMerge={true}
          canWriteMatchMerge={true}
          createMergingArtifact={jest.fn()}
          updateMergingArtifact={jest.fn()}
          addStepToFlow={jest.fn()}
          addStepToNew={jest.fn()}
          canWriteFlow={jest.fn()}
        />
      </Router>
    );

    expect(getByText("mergeCustomersEmpty")).toBeInTheDocument();
    //Click play button 'Run' icon
    fireEvent.click(getByTestId("mergeCustomersEmpty-run"));

    //Modal with options to run in an existing or new flow should appear
    expect(getByLabelText("step-in-no-flows-confirmation")).toBeInTheDocument();

    //Select flow to add and run step in
    fireEvent.click(getByTestId("customerJSONFlow-run-step"));

    //Check if the /tiles/run/add-run route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add-run"); });
  });

  it("can run a step in an existing flow where step DOES exist", () => {
    const {getByText, getByTestId, getByLabelText} = render(
      <Router>
        <MergingCard {...defaultProps}
          mergingStepsArray={mergingStepsArray}
          flows={defaultProps.flows}
          entityName={defaultProps.entityName}
          entityModel={defaultProps.entityModel}
          canReadMatchMerge={true}
          canWriteMatchMerge={true}
          createMergingArtifact={jest.fn()}
          updateMergingArtifact={jest.fn()}
          addStepToFlow={jest.fn()}
          addStepToNew={jest.fn()}
          canWriteFlow={jest.fn()}
        />
      </Router>
    );

    expect(getByText("mergeCustomers")).toBeInTheDocument();
    //Click play button 'Run' icon
    fireEvent.click(getByTestId("mergeCustomers-run"));

    //Confirmation modal for directly running the step in its flow should appear
    expect(getByLabelText("run-step-one-flow-confirmation")).toBeInTheDocument();

    //Click Continue to confirm
    fireEvent.click(getByLabelText("continue-confirm"));

    //Check if the /tiles/run/run-step route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/run-step"); });
  });

  it("can run a step in an existing flow where step exists in MORE THAN ONE flow", () => {
    const {getByText, getByTestId, getByLabelText} = render(
      <Router>
        <MergingCard {...defaultProps}
          mergingStepsArray={mergingStepsArray}
          flows={defaultProps.flows}
          entityName={defaultProps.entityName}
          entityModel={defaultProps.entityModel}
          canReadMatchMerge={true}
          canWriteMatchMerge={true}
          createMergingArtifact={jest.fn()}
          updateMergingArtifact={jest.fn()}
          addStepToFlow={jest.fn()}
          addStepToNew={jest.fn()}
          canWriteFlow={jest.fn()}
        />
      </Router>
    );

    expect(getByText("mergeCustomers123")).toBeInTheDocument();
    //Click play button 'Run' icon
    fireEvent.click(getByTestId("mergeCustomers123-run"));

    //Modal with list of flows where step exists to select one to run in
    expect(getByLabelText("run-step-mult-flows-confirmation")).toBeInTheDocument();

    //Select flow to run step in
    fireEvent.click(getByTestId("customerXMLFlow-run-step"));

    //Check if the /tiles/run/add-run route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add-run"); });
  });

  it("can open step settings, edit and navigate to merge step details with WriteMatchMerge authority", async () => {
    const {getByText, getByTestId, getByLabelText} = render(
      <Router>
        <MergingCard {...defaultProps}
          mergingStepsArray={mergingStepsArray}
          flows={defaultProps.flows}
          entityName={defaultProps.entityName}
          entityModel={defaultProps.entityModel}
          canReadMatchMerge={true}
          canWriteMatchMerge={true}
          createMergingArtifact={jest.fn()}
          updateMergingArtifact={jest.fn()}
          addStepToFlow={jest.fn()}
          addStepToNew={jest.fn()}
          canWriteFlow={jest.fn()}
        />
      </Router>
    );

    expect(getByText("mergeCustomers")).toBeInTheDocument();
    //open step settings
    userEvent.click(getByTestId("mergeCustomers-edit"));
    await wait(() => {
      expect(getByText("Merging Step Settings")).toBeInTheDocument();
      expect(getByTestId("merging-dialog-save")).toBeEnabled();
    });
    userEvent.click(getByLabelText("Cancel"));

    //open step details
    userEvent.click(getByTestId("mergeCustomers-stepDetails"));

    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/curate/merge"); });
  });

  it("cannot edit merging step with ReadMatchMerge authority but the modal is enabled for view", async () => {
    const {getByTestId, getByText} = render(
      <Router>
        <MergingCard
          {...defaultProps}
          mergingStepsArray={mergingStepsArray}
          flows={defaultProps.flows}
          entityName={defaultProps.entityName}
          entityModel={defaultProps.entityModel}
          canReadMatchMerge={true}
          canWriteMatchMerge={false}
          createMergingArtifact={jest.fn()}
          updateMergingArtifact={jest.fn()}
          addStepToFlow={jest.fn()}
          addStepToNew={jest.fn()}
          canWriteFlow={jest.fn()}
        />
      </Router>
    );

    // check if save button in edit modal is disabled
    userEvent.click(getByTestId("mergeCustomers-edit"));
    await wait(() => {
      expect(getByText("Merging Step Settings")).toBeInTheDocument();
      expect(getByTestId("merging-dialog-save")).toBeDisabled();
    });
    userEvent.click(getByTestId("merging-dialog-cancel"));
  });
});