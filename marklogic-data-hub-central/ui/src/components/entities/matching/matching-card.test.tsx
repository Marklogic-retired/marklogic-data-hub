import React from "react";
import {fireEvent, render, wait, screen} from "@testing-library/react";
import {BrowserRouter as Router} from "react-router-dom";
import userEvent from "@testing-library/user-event";

import MatchingCard from "./matching-card";

import {matchingStep} from "../../../assets/mock-data/curation/matching";
import {customerEntityDef} from "../../../assets/mock-data/curation/entity-definitions-mock";
import {MatchingStep} from "../../../types/curation-types";
import {SecurityTooltips} from "../../../config/tooltips.config";

const mockHistoryPush = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

const matchingStepsArray: MatchingStep[] = matchingStep.artifacts;
const entityModel = {model: customerEntityDef.definitions};
const defaultProps = {
  matchingStepsArray: matchingStepsArray,
  flows: [{name: "customerJSONFlow"}, {name: "customerXMLFlow"}],
  entityName: customerEntityDef.info.title,
  deleteMatchingArtifact: jest.fn(),
  createMatchingArtifact: jest.fn(),
  canReadMatchMerge: true,
  canWriteMatchMerge: true,
  entityModel: entityModel,
  canWriteFlow: true,
  addStepToFlow: jest.fn(),
  addStepToNew: jest.fn()
};

describe("Matching cards view component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("can render matching steps", () => {
    const {getByText} =  render(
      <Router>
        <MatchingCard {...defaultProps}/>
      </Router>
    );

    expect(getByText("matchCustomers")).toBeInTheDocument();
    expect(getByText("matchCustomersEmpty")).toBeInTheDocument();
  });

  it("can render/edit match steps with writeMatchMerge authority", () => {
    const deleteMatchingArtifact = jest.fn();
    const {getByText, getByLabelText, getByTestId, queryAllByRole} =  render(
      <Router>
        <MatchingCard
          {...defaultProps}
          deleteMatchingArtifact={deleteMatchingArtifact}
        />
      </Router>
    );

    expect(getByLabelText("icon: plus-circle")).toBeInTheDocument();
    expect(getByText("matchCustomers")).toBeInTheDocument();
    expect(getByText("matchCustomersEmpty")).toBeInTheDocument();

    //Verify if the card renders fine
    expect(getByTestId("matchCustomers-edit")).toBeInTheDocument();
    expect(getByTestId("matchCustomersEmpty-edit")).toBeInTheDocument();
    expect(queryAllByRole("disabled-delete-matching")).toHaveLength(0);

    // check if delete tooltip appears and user is able to proceed with deletion of the step
    userEvent.hover(getByTestId("matchCustomers-delete"));
    wait(() => expect(getByText("Delete")).toBeInTheDocument());
    userEvent.click(getByTestId("matchCustomers-delete"));
    wait(() => expect(getByLabelText("delete-step-text")).toBeInTheDocument());
    userEvent.click(getByText("Yes"));
    expect(deleteMatchingArtifact).toBeCalled();
  });

  it("cannot edit/delete match step without writeMatchMerge authority", () => {
    const deleteMatchingArtifact = jest.fn();
    const {getByText, getByTestId, queryAllByText, queryAllByRole, queryByLabelText, getByLabelText} =  render(
      <Router>
        <MatchingCard
          {...defaultProps}
          deleteMatchingArtifact={deleteMatchingArtifact}
          canWriteMatchMerge={false}
        />
      </Router>
    );

    expect(queryByLabelText("icon: plus-circle")).toBeInTheDocument();
    expect(getByText("matchCustomers")).toBeInTheDocument();
    fireEvent.mouseOver(getByLabelText("add-new-card-disabled"));
    wait(() => expect(getByText("Curate: "+SecurityTooltips.missingPermission)).toBeInTheDocument());
    expect(queryByLabelText("icon: plus-circle")).toBeInTheDocument();
    fireEvent.mouseOver(getByText("matchCustomers"));
    wait(() => expect(getByText("Curate: "+SecurityTooltips.missingPermission)).toBeInTheDocument());
    expect(getByText("matchCustomersEmpty")).toBeInTheDocument();

    //Verify if the card renders fine
    expect(getByTestId("matchCustomers-edit")).toBeEnabled();
    expect(getByTestId("matchCustomersEmpty-edit")).toBeEnabled();
    expect(queryAllByRole("delete-matching")).toHaveLength(0);

    // check run icon is disabled
    let runIcon = getByTestId("matchCustomers-disabled-run");
    userEvent.hover(runIcon);
    wait(() => expect(getByText("Run: " + SecurityTooltips.missingPermission)).toBeInTheDocument());

    // check if delete icon displays correct tooltip when disabled
    let disabledDeleteIcon = getByTestId("matchCustomers-disabled-delete");
    userEvent.hover(disabledDeleteIcon);
    wait(() => expect(getByText("Delete: " + SecurityTooltips.missingPermission)).toBeInTheDocument());
    userEvent.click(disabledDeleteIcon);
    expect(queryAllByText("Yes")).toHaveLength(0);
    expect(deleteMatchingArtifact).not.toBeCalled();
  });

  it("can render/edit match steps with writeMatchMerge authority", () => {
    const deleteMatchingArtifact = jest.fn();
    const {getByText, getByLabelText, getByTestId, queryAllByRole} =  render(
      <Router>
        <MatchingCard
          {...defaultProps}
          deleteMatchingArtifact={deleteMatchingArtifact}
        />
      </Router>
    );

    expect(getByLabelText("icon: plus-circle")).toBeInTheDocument();
    expect(getByText("matchCustomers")).toBeInTheDocument();
    expect(getByText("matchCustomersEmpty")).toBeInTheDocument();

    //Verify if the card renders fine
    expect(getByTestId("matchCustomers-edit")).toBeInTheDocument();
    expect(getByTestId("matchCustomersEmpty-edit")).toBeInTheDocument();
    expect(queryAllByRole("disabled-delete-matching")).toHaveLength(0);

    // check if delete tooltip appears and user is able to proceed with deletion of the step
    userEvent.hover(getByTestId("matchCustomers-delete"));
    wait(() => expect(getByText("Delete")).toBeInTheDocument());
    userEvent.click(getByTestId("matchCustomers-delete"));
    wait(() => expect(getByLabelText("delete-step-text")).toBeInTheDocument());
    userEvent.click(getByText("Yes"));
    expect(deleteMatchingArtifact).toBeCalled();
  });

  it("can add a step to a new flow", () => {
    const {getByText, getByTestId} =  render(
      <Router>
        <MatchingCard {...defaultProps}/>
      </Router>
    );

    expect(getByText("matchCustomers")).toBeInTheDocument();
    expect(getByText("matchCustomersEmpty")).toBeInTheDocument();
    fireEvent.mouseOver(getByTestId("Customer-matchCustomers-step"));

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
        <MatchingCard {...defaultProps}/>
      </Router>
    );

    expect(getByText("matchCustomers")).toBeInTheDocument();
    expect(getByText("matchCustomersEmpty")).toBeInTheDocument();
    userEvent.click(getByTestId("matchCustomers-run"));
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
        <MatchingCard {...defaultProps}/>
      </Router>
    );

    expect(getByText("matchCustomers")).toBeInTheDocument();

    //mouseover to trigger flow menu
    fireEvent.mouseOver(getByTestId("Customer-matchCustomers-step"));
    wait(() => {
      expect(getByText("Run Step in an existing flow")).toBeInTheDocument();
      //mouse out for card view
      fireEvent.mouseOut(getByTestId("Customer-matchCustomers-step"));
    });

    wait(() => {
      expect(queryByText("Run Step in an existing flow")).toBeNull();
      fireEvent.mouseOver(getByTestId("Customer-matchCustomers-step"));
    });

    wait(() => {
      expect(getByText("Run Step in an existing flow")).toBeInTheDocument();
      userEvent.click(getByTestId("matchCustomers-flowsList"));
      userEvent.click(getByLabelText("customerJSONFlow-option"));
    });

    wait(() => {
      expect(getByLabelText("step-not-in-flow-run")).toBeInTheDocument();
      userEvent.click(getByTestId("matchCustomers-to-test-Confirm"));
    });
    // Check if the /tiles/run/add route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add"); });
  });

  it("can add a step to an existing flow from run menu", () => {
    const {getByText, getByTestId, getByLabelText} =  render(
      <Router>
        <MatchingCard {...defaultProps}/>
      </Router>
    );

    expect(getByText("matchCustomers")).toBeInTheDocument();
    expect(getByText("matchCustomersEmpty")).toBeInTheDocument();
    userEvent.click(getByTestId("matchCustomers-run"));
    wait(() => {
      expect(getByText("Run Step in an existing flow")).toBeInTheDocument();
      userEvent.click(getByTestId("matchCustomers-run-flowsList"));
      userEvent.click(getByLabelText("customerJSONFlow-run-option"));
    });
    wait(() => {
      expect(getByLabelText("step-not-in-flow-run")).toBeInTheDocument();
      userEvent.click(getByTestId("matchCustomers-to-test-Confirm"));
    });
    // Check if the /tiles/run/add route has been called
    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/run/add"); });
  });

  it("can open step settings and navigate to match step details", () => {
    const {getByText, getByTestId} =  render(
      <Router>
        <MatchingCard {...defaultProps}/>
      </Router>
    );

    expect(getByText("matchCustomers")).toBeInTheDocument();
    //open step settings
    userEvent.click(getByTestId("matchCustomers-edit"));
    wait(() => {
      expect(screen.getByText("Matching Step Settings")).toBeInTheDocument();
      userEvent.click(screen.getByText("Cancel"));
    });
    //open step details
    wait(() => {
      userEvent.click(getByTestId("matchCustomers-stepDetails"));
    });

    wait(() => { expect(mockHistoryPush).toHaveBeenCalledWith("/tiles/curate/match"); });
  });
});
