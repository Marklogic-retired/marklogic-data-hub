import React from "react";
import {render, wait, cleanup, fireEvent, screen} from "@testing-library/react";
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

const entityModel = {model: customerEntityDef.definitions};
const defaultProps = {
  mergingStepsArray: mergingStepsArray,
  flows: [{name: "customerJSONFlow"}, {name: "customerXMLFlow"}],
  entityName: customerEntityDef.info.title,
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

  it("can render/edit merging steps with writeMatchMerge authority", () => {
    const deleteMergingArtifact = jest.fn(() => {});
    const {getByText, getByLabelText, getByTestId, queryAllByRole} =  render(
      <Router>
        <MergingCard
          {...defaultProps}
          deleteMergingArtifact={deleteMergingArtifact}
        />
      </Router>
    );

    expect(getByLabelText("icon: plus-circle")).toBeInTheDocument();
    expect(getByText("mergeCustomers")).toBeInTheDocument();
    expect(getByText("mergeCustomersEmpty")).toBeInTheDocument();

    //Verify if the card renders fine
    expect(getByTestId("mergeCustomers-edit")).toBeInTheDocument();
    expect(getByTestId("mergeCustomersEmpty-edit")).toBeInTheDocument();
    expect(queryAllByRole("disabled-delete-merging")).toHaveLength(0);

    // check if delete tooltip appears and user is able to proceed with deletion of the step
    userEvent.hover(getByTestId("mergeCustomers-delete"));
    wait(() => expect(getByText("Delete")).toBeInTheDocument());
    userEvent.click(getByTestId("mergeCustomers-delete"));
    wait(() => expect(getByLabelText("delete-step-text")).toBeInTheDocument());
    userEvent.click(getByText("Yes"));
    expect(deleteMergingArtifact).toBeCalled();
  });

  it("cannot edit/delete merging step without writeMatchMerge authority", () => {
    const deleteMergingArtifact = jest.fn(() => {});
    const {getByText, getByTestId, queryAllByText, queryAllByRole, queryByLabelText, getByLabelText} =  render(
      <Router>
        <MergingCard
          {...defaultProps}
          deleteMergingArtifact={deleteMergingArtifact}
          canWriteMatchMerge={false}
        />
      </Router>
    );

    fireEvent.mouseOver(getByLabelText("add-new-card-disabled"));
    wait(() => expect(getByText("Curate: "+SecurityTooltips.missingPermission)).toBeInTheDocument());
    expect(queryByLabelText("icon: plus-circle")).toBeInTheDocument();
    fireEvent.mouseOver(getByText("mergeCustomers"));
    wait(() => expect(getByText("Curate: "+SecurityTooltips.missingPermission)).toBeInTheDocument());
    expect(getByText("mergeCustomersEmpty")).toBeInTheDocument();

    //Verify if the card renders fine
    expect(getByTestId("mergeCustomers-edit")).toBeEnabled();
    expect(getByTestId("mergeCustomersEmpty-edit")).toBeEnabled();
    expect(queryAllByRole("delete-merging")).toHaveLength(0);

    // check run icon is disabled
    let runIcon = getByTestId("mergeCustomers-disabled-run");
    userEvent.hover(runIcon);
    wait(() => expect(getByText("Run: " + SecurityTooltips.missingPermission)).toBeInTheDocument());

    // check if delete icon displays correct tooltip when disabled
    let disabledDeleteIcon = getByTestId("mergeCustomers-disabled-delete");
    userEvent.hover(disabledDeleteIcon);
    wait(() => expect(getByText("Delete: " + SecurityTooltips.missingPermission)).toBeInTheDocument());
    userEvent.click(disabledDeleteIcon);
    expect(queryAllByText("Yes")).toHaveLength(0);
    expect(deleteMergingArtifact).not.toBeCalled();
  });


  it("can render/edit merge steps with writeMatchMerge authority", () => {
    const deleteMergingArtifact = jest.fn();
    const {getByText, getByLabelText, getByTestId, queryAllByRole} =  render(
      <Router>
        <MergingCard
          {...defaultProps}
          deleteMergingArtifact={deleteMergingArtifact}
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
    wait(() => expect(getByText("Delete")).toBeInTheDocument());
    userEvent.click(getByTestId("mergeCustomers-delete"));
    wait(() => expect(getByLabelText("delete-step-text")).toBeInTheDocument());
    userEvent.click(getByText("Yes"));
    expect(deleteMergingArtifact).toBeCalled();
  });

  it("can add a step to a new flow", () => {
    const {getByText, getByTestId} =  render(
      <Router>
        <MergingCard {...defaultProps}/>
      </Router>
    );

    expect(getByText("mergeCustomers")).toBeInTheDocument();
    fireEvent.mouseOver(getByTestId("Customer-mergeCustomers-step"));

    wait(() => {
      expect(getByText("Add Step to a new flow")).toBeInTheDocument();
      userEvent.click(getByText("Add Step to a new flow"));
    });
    wait(() => {
      expect(screen.getByText("NewFlow")).toBeInTheDocument();
      userEvent.type(screen.getByPlaceholderText("Enter name"), "testFlow");
      userEvent.click(screen.getByText("Save"));
    });
    // Check if the /tiles/run/add route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add"); });
  });

  it("can add a step to new flow from run menu", () => {
    const {getByText, getByTestId} =  render(
      <Router>
        <MergingCard {...defaultProps}/>
      </Router>
    );

    expect(getByText("mergeCustomers")).toBeInTheDocument();
    userEvent.click(getByTestId("mergeCustomers-run"));
    wait(() => {
      expect(getByText("Run Step in a new flow")).toBeInTheDocument();
      userEvent.click(getByText("Run Step in a new flow"));
    });
    wait(() => {
      expect(screen.getByText("NewFlow")).toBeInTheDocument();
      userEvent.type(screen.getByPlaceholderText("Enter name"), "testFlow");
      userEvent.click(screen.getByText("Save"));
    });
    // Check if the /tiles/run/add route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add"); });
  });

  it("can add a step to an existing flow", () => {
    const {getByText, getByTestId, getByLabelText, queryByText} =  render(
      <Router>
        <MergingCard {...defaultProps}/>
      </Router>
    );

    expect(getByText("mergeCustomers")).toBeInTheDocument();

    //mouseover to trigger flow menu
    fireEvent.mouseOver(getByTestId("Customer-mergeCustomers-step"));
    wait(() => {
      expect(getByText("Run Step in an existing flow")).toBeInTheDocument();
      //mouse out for card view
      fireEvent.mouseOut(getByTestId("Customer-mergeCustomers-step"));
    });

    wait(() => {
      expect(queryByText("Run Step in an existing flow")).toBeNull();
      fireEvent.mouseOver(getByTestId("Customer-mergeCustomers-step"));
    });

    wait(() => {
      expect(getByText("Run Step in an existing flow")).toBeInTheDocument();
      userEvent.click(getByTestId("mergeCustomers-flowsList"));
      userEvent.click(getByLabelText("customerJSONFlow-option"));
    });

    wait(() => {
      expect(getByLabelText("step-not-in-flow-run")).toBeInTheDocument();
      userEvent.click(getByTestId("mergeCustomers-to-test-Confirm"));
    });
    // Check if the /tiles/run/add route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add"); });
  });

  it("can add a step to an existing flow from run menu", () => {
    const {getByText, getByTestId, getByLabelText} =  render(
      <Router>
        <MergingCard {...defaultProps}/>
      </Router>
    );

    expect(getByText("mergeCustomers")).toBeInTheDocument();
    userEvent.click(getByTestId("mergeCustomers-run"));
    wait(() => {
      expect(getByText("Run Step in an existing flow")).toBeInTheDocument();
      userEvent.click(getByTestId("mergeCustomers-run-flowsList"));
      userEvent.click(getByLabelText("customerJSONFlow-run-option"));
    });
    wait(() => {
      expect(getByLabelText("step-not-in-flow-run")).toBeInTheDocument();
      userEvent.click(getByTestId("mergeCustomers-to-test-Confirm"));
    });
    // Check if the /tiles/run/add route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add"); });
  });

  it("can open step settings and navigate to merge step details", () => {
    const {getByText, getByTestId} =  render(
      <Router>
        <MergingCard {...defaultProps}/>
      </Router>
    );

    expect(getByText("mergeCustomers")).toBeInTheDocument();
    //open step settings
    userEvent.click(getByTestId("mergeCustomers-edit"));
    wait(() => {
      expect(screen.getByText("Merging Step Settings")).toBeInTheDocument();
      userEvent.click(screen.getByText("Cancel"));
    });
    //open step details
    wait(() => {
      userEvent.click(getByTestId("mergeCustomers-stepDetails"));
    });

    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/curate/merge"); });
  });
});
