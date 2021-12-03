import React from "react";
import {cleanup, render, screen, wait, within} from "@testing-library/react";
import {waitFor, fireEvent} from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

import RulesetSingleModal from "./ruleset-single-modal";

import {CurationContext} from "../../../../util/curation-context";
import {updateMatchingArtifact} from "../../../../api/matching";
import {customerMatchingStep} from "../../../../assets/mock-data/curation/curation-context-mock";

jest.mock("../../../../api/matching");

const mockMatchingUpdate = updateMatchingArtifact as jest.Mock;

describe("Matching Ruleset Single Modal component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("can select an property to match and match type and click cancel", () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    const {queryByText, getByText, getByTestId, getByLabelText, queryByLabelText, rerender} = render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={false}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText("Add Match Ruleset for Single Property")).toBeNull();

    rerender(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText("Add Match Ruleset for Single Property")).toBeInTheDocument();
    expect(getByText("Reduce Weight")).toBeInTheDocument();
    expect(getByLabelText("reduceToggle")).toBeInTheDocument();

    userEvent.click(getByTestId("property-to-match-dropdown"));
    wait(() => { userEvent.click(getByText("customerId")); });

    fireEvent.keyDown(screen.getByLabelText("match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(screen.getByText("Exact"));

    userEvent.click(getByText("Cancel"));
    expect(screen.getByLabelText("confirm-body")).toBeInTheDocument();
    userEvent.click(screen.getByText("Yes"));

    // To verify delete icon is not present for new single ruleset modal
    expect(queryByLabelText("editSingleRulesetDeleteIcon")).not.toBeInTheDocument();

    expect(toggleModalMock).toHaveBeenCalledTimes(1);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);
  });

  it("can select an property to match and Zip match type and click save", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    const {queryByText, getByText, getByTestId, getByLabelText, rerender} = render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={false}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText("Add Match Ruleset for Single Property")).toBeNull();

    rerender(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText("Add Match Ruleset for Single Property")).toBeInTheDocument();
    expect(getByText("Reduce Weight")).toBeInTheDocument();
    expect(getByLabelText("reduceToggle")).toBeInTheDocument();

    await userEvent.click(getByTestId("property-to-match-dropdown"));

    fireEvent.keyDown(screen.getByLabelText("match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(screen.getByText("Zip"));

    userEvent.click(getByText("Save"));

    wait(() => {
      expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
      expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(1);
      expect(toggleModalMock).toHaveBeenCalledTimes(1);
    });

  });

  it("can select Synonym ruleset type and click save", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    const {queryByText, getByText, getByTestId, getByLabelText} = render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText("Add Match Ruleset for Single Property")).toBeInTheDocument();
    expect(getByText("Reduce Weight")).toBeInTheDocument();
    expect(getByLabelText("reduceToggle")).toBeInTheDocument();

    userEvent.click(getByTestId("property-to-match-dropdown"));
    wait(() => { userEvent.click(getByText("nicknames")); });

    fireEvent.keyDown(screen.getByLabelText("match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(screen.getByText("Synonym"));
    userEvent.type(getByLabelText("thesaurus-uri-input"), "/Users/jsmith/Documents/sample-data/4feec983");
    userEvent.type(getByLabelText("filter-input"), "<thsr:qualifier>birds</thsr:qualifier>");


    userEvent.click(getByText("Save"));
    wait(() => {
      expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
      expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(1);
      expect(toggleModalMock).toHaveBeenCalledTimes(1);
    });

  });

  it("can select Double Metaphone ruleset type and click save", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    const {queryByText, getByText, getByTestId, getByLabelText} = render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText("Add Match Ruleset for Single Property")).toBeInTheDocument();
    expect(getByText("Reduce Weight")).toBeInTheDocument();
    expect(getByLabelText("reduceToggle")).toBeInTheDocument();

    userEvent.click(getByTestId("property-to-match-dropdown"));
    wait(() => { userEvent.click(getByText("orders")); });

    fireEvent.keyDown(screen.getByLabelText("match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(screen.getByText("Double Metaphone"));
    userEvent.type(getByLabelText("dictionary-uri-input"), "/Users/jsmith/Documents/sample-data/123ABC");
    userEvent.type(getByLabelText("distance-threshold-input"), "100");

    userEvent.click(getByText("Save"));

    wait(() => {
      expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
      expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(1);
      expect(toggleModalMock).toHaveBeenCalledTimes(1);
    });

  });

  it("can select Custom ruleset type and click save", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    const {queryByText, getByText, getByTestId, getByLabelText} = render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText("Add Match Ruleset for Single Property")).toBeInTheDocument();
    expect(getByText("Reduce Weight")).toBeInTheDocument();
    expect(getByLabelText("reduceToggle")).toBeInTheDocument();

    userEvent.click(getByTestId("property-to-match-dropdown"));
    wait(() => { userEvent.click(getByText("nicknames")); });

    fireEvent.keyDown(screen.getByLabelText("match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(screen.getByText("Custom"));
    userEvent.type(getByLabelText("uri-input"), "/custom-modules/matching/nameMatch.xqy");
    userEvent.type(getByLabelText("function-input"), "nameMatch");
    userEvent.type(getByLabelText("namespace-input"), "http://example.org/custom-modules/matching/nameMatch");


    userEvent.click(getByText("Save"));
    wait(() => {
      expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
      expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(1);
      expect(toggleModalMock).toHaveBeenCalledTimes(1);
    });
  });

  it("can toggle Reduce ruleset, select Exact ruleset type and click save", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    const {queryByText, getByText, getByTestId} = render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText("Add Match Ruleset for Single Property")).toBeInTheDocument();
    expect(getByText("Reduce Weight")).toBeInTheDocument();
    let reduceInfoCircleIcon = screen.getByLabelText("icon: question-circle");
    userEvent.hover(reduceInfoCircleIcon);
    await waitFor(() => expect(screen.getByLabelText("reduce-tooltip-text")));

    userEvent.click(screen.getByLabelText("reduceToggle"));

    userEvent.click(getByTestId("property-to-match-dropdown"));
    wait(() => { userEvent.click(getByText("nicknames")); });

    fireEvent.keyDown(screen.getByLabelText("match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(screen.getByText("Exact"));

    userEvent.click(getByText("Save"));
    wait(() => {
      const expectedMatchStep = {...customerMatchingStep.curationOptions.activeStep.stepArtifact};
      expectedMatchStep.matchRulesets = [...expectedMatchStep.matchRulesets, {
        name: "nicknames - Exact",
        reduce: true,
        weight: 0,
        matchRules: [
          {
            entityPropertyPath: "nicknames",
            matchType: "exact",
            options: {}
          }
        ]
      }];
      expect(mockMatchingUpdate).toHaveBeenCalledWith(expectedMatchStep);
      expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(1);
      expect(toggleModalMock).toHaveBeenCalledTimes(1);
    });
  });

  it("can do input validation", () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    const {queryByText, getByText, rerender} = render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={false}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText("Add Match Ruleset for Single Property")).toBeNull();

    rerender(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText("Add Match Ruleset for Single Property")).toBeInTheDocument();

    userEvent.click(getByText("Save"));

    expect(getByText("A property to match is required")).toBeInTheDocument();
    expect(getByText("A match type is required")).toBeInTheDocument();

    expect(toggleModalMock).toHaveBeenCalledTimes(0);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);
  });

  it("can edit a double metaphone ruleset and change to an exact ruleset", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();
    let editSynonym = {
      ...customerMatchingStep.curationOptions.activeStep.stepArtifact.matchRulesets[0],
      index: 0
    };

    const {queryByText, getByText, getByLabelText} = render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editRuleset={editSynonym}
        />
      </CurationContext.Provider>
    );

    expect(queryByText("Edit Match Ruleset for Single Property")).toBeInTheDocument();
    expect(getByText("name")).toBeInTheDocument();
    expect(getByText("Double Metaphone")).toBeInTheDocument();

    userEvent.click(screen.getByText("name"));
    userEvent.click(screen.getByText("orders"));
    fireEvent.keyDown(screen.getByLabelText("match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(screen.getByText("Exact"));

    // To verify delete icon is present for editing single ruleset modal
    expect(getByLabelText("editSingleRulesetDeleteIcon")).toBeInTheDocument();

    userEvent.click(screen.getByText("Save"));

    wait(() => {
      expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
      expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(1);
      expect(toggleModalMock).toHaveBeenCalledTimes(1);
    });
  });

  it("can select structured property and click save", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    const {queryByText, getByText, getByTestId, getByLabelText} = render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText("Add Match Ruleset for Single Property")).toBeInTheDocument();
    expect(getByText("Reduce Weight")).toBeInTheDocument();
    expect(getByLabelText("reduceToggle")).toBeInTheDocument();

    userEvent.click(getByTestId("property-to-match-dropdown"));
    wait(() => { userEvent.click(within(getByLabelText("shipping-option")).getByLabelText("icon: caret-down")); });
    wait(() => { userEvent.click(within(getByLabelText("shipping > street-option")).getByLabelText("street-option")); });

    fireEvent.keyDown(screen.getByLabelText("match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(screen.getByText("Synonym"));
    userEvent.type(getByLabelText("thesaurus-uri-input"), "/Users/jsmith/Documents/sample-data/4feec983");
    userEvent.type(getByLabelText("filter-input"), "<thsr:qualifier>birds</thsr:qualifier>");


    userEvent.click(getByText("Save"));
    wait(() => {
      expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
      expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(1);
      expect(toggleModalMock).toHaveBeenCalledTimes(1);
    });
  });

  it("can expand/collapse structured property by simply clicking on its label", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    const {queryByText, getByText, getByTestId, getByLabelText, queryByLabelText} = render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText("Add Match Ruleset for Single Property")).toBeInTheDocument();
    userEvent.click(getByTestId("property-to-match-dropdown"));

    wait(() => {
      userEvent.click(getByText("shipping"));
      expect(getByLabelText("shipping > street-option")).toBeInTheDocument();
      expect(getByLabelText("shipping > city-option")).toBeInTheDocument();
      expect(getByLabelText("shipping > state-option")).toBeInTheDocument();
      userEvent.click(screen.getByText("zip"));
      expect(getByLabelText("shipping > zip > fiveDigit-option")).toBeInTheDocument();
      expect(getByLabelText("shipping > zip > plusFour-option")).toBeInTheDocument();
      userEvent.click(screen.getByText("zip"));
      expect(queryByLabelText("shipping > zip > fiveDigit-option")).not.toBeInTheDocument();
      expect(queryByLabelText("shipping > zip > plusFour-option")).not.toBeInTheDocument();

      userEvent.click(screen.getByText("shipping"));
      expect(queryByLabelText("shipping > street-option")).not.toBeInTheDocument();
      expect(queryByLabelText("shipping > city-option")).not.toBeInTheDocument();
      expect(queryByLabelText("shipping > state-option")).not.toBeInTheDocument();

      userEvent.click(screen.getByText("shipping"));
      userEvent.click(within(getByLabelText("shipping > street-option")).getByLabelText("street-option"));

      fireEvent.keyDown(screen.getByLabelText("match-type-dropdown"), {key: "ArrowDown"});
      userEvent.click(screen.getByText("Exact"));
      userEvent.click(getByText("Save"));
    });
  });
});
