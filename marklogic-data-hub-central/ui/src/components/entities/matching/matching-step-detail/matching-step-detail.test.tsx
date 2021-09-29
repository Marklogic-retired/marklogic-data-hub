import React from "react";
import {render, screen, fireEvent, wait, waitForElement} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MatchingStepDetail from "./matching-step-detail";

import {CurationContext} from "../../../../util/curation-context";
import {customerMatchingStep, customerMatchingStepEmpty} from "../../../../assets/mock-data/curation/curation-context-mock";
import {calculateMatchingActivity} from "../../../../api/matching";
import {matchingActivity} from "../../../../assets/mock-data/curation/matching.data";

jest.mock("../../../../api/matching");

const mockCalculateMatchingActivity = calculateMatchingActivity as jest.Mock;


describe("Matching Step Detail view component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("can render matching step with no rulesets or thresholds and click less/more text", async() => {

    const {getByLabelText, queryByLabelText, getByTestId, getAllByPlaceholderText, getByText} =  render(
      <CurationContext.Provider value={customerMatchingStepEmpty}>
        <MatchingStepDetail/>
      </CurationContext.Provider>
    );

    expect(queryByLabelText("threshold-more")).toBeNull();
    expect(queryByLabelText("ruleset-more")).toBeNull();
    expect(queryByLabelText("threshold-scale-switch")).not.toBeChecked();
    expect(queryByLabelText("ruleset-scale-switch")).not.toBeChecked();
    expect(getByTestId("default-ruleset-timeline")).toBeInTheDocument();
    expect(getByTestId("default-threshold-timeline")).toBeInTheDocument();
    fireEvent.mouseOver(getByTestId("info-tooltip-threshold"));
    await(waitForElement(() => (getByText("Enable the scale to position, edit or delete thresholds."))));
    fireEvent.mouseOver(getByTestId("info-tooltip-ruleset"));
    await(waitForElement(() => (getByText("Enable the scale to position, edit or delete rulesets."))));

    userEvent.click(getByLabelText("threshold-less"));
    expect(queryByLabelText("threshold-more")).toBeInTheDocument();

    userEvent.click(getByLabelText("ruleset-less"));
    expect(queryByLabelText("ruleset-more")).toBeInTheDocument();

    expect(getByLabelText("matchCombinationsHeading")).toBeInTheDocument();
    expect(getByLabelText("noMatchedCombinations")).toBeInTheDocument();

    expect(getByLabelText("testMatch")).toBeInTheDocument();
    // To test inputUriOnlyRadio is selected by default
    userEvent.click(getByLabelText("inputUriOnlyRadio"));
    expect(getAllByPlaceholderText("Enter URI or Paste URIs")[0]).toBeEnabled();
    expect(getAllByPlaceholderText("Enter URI or Paste URIs")[1]).toBeDisabled();

    userEvent.click(getByLabelText("inputUriRadio"));
    expect(getAllByPlaceholderText("Enter URI or Paste URIs")[1]).toBeEnabled();
    expect(getAllByPlaceholderText("Enter URI or Paste URIs")[0]).toBeDisabled();
    expect(getByLabelText("UriInput")).toBeInTheDocument();
    expect(getByLabelText("addUriIcon")).toBeInTheDocument();
    expect(getByText("Test")).toBeInTheDocument();

    userEvent.click(getByLabelText("allDataRadio"));
    expect(getByLabelText("allDataContent")).toBeInTheDocument();
    expect(getAllByPlaceholderText("Enter URI or Paste URIs")[0]).toBeDisabled();
    expect(getAllByPlaceholderText("Enter URI or Paste URIs")[1]).toBeDisabled();
    // expect(getByLabelText("testMatchTab")).toBeInTheDocument();
  });

  it("can render matching step with rulesets and thresholds and click add single ruleset", async() => {

    const {getByLabelText, getByText, queryByLabelText, getAllByPlaceholderText, getByTestId} =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <MatchingStepDetail/>
      </CurationContext.Provider>
    );

    expect(queryByLabelText("threshold-more")).toBeInTheDocument();
    expect(queryByLabelText("ruleset-more")).toBeInTheDocument();

    //Enable threshold switch
    userEvent.click(queryByLabelText("threshold-scale-switch"));
    expect(queryByLabelText("threshold-scale-switch")).toBeChecked();
    expect(getByTestId("active-threshold-timeline")).toBeInTheDocument();

    //Enable ruleset switch
    userEvent.click(queryByLabelText("ruleset-scale-switch"));
    expect(queryByLabelText("ruleset-scale-switch")).toBeChecked();
    expect(getByTestId("active-ruleset-timeline")).toBeInTheDocument();


    userEvent.click(document.querySelector("#add-ruleset"));
    expect(getByLabelText("multiPropertyRulesetOption")).toBeInTheDocument();
    userEvent.click(getByLabelText("singlePropertyRulesetOption"));

    expect(screen.getByText("Select property")).toBeInTheDocument();

    //Verify test match related fields are rendered properly
    expect(getByLabelText("testMatch")).toBeInTheDocument();
    expect(getAllByPlaceholderText("Enter URI or Paste URIs")[0]).toBeEnabled();
    expect(getAllByPlaceholderText("Enter URI or Paste URIs")[1]).toBeDisabled();

    userEvent.click(getByLabelText("inputUriRadio"));
    expect(getAllByPlaceholderText("Enter URI or Paste URIs")[1]).toBeEnabled();
    expect(getAllByPlaceholderText("Enter URI or Paste URIs")[0]).toBeDisabled();
    expect(getByLabelText("UriInput")).toBeInTheDocument();
    expect(getByText("Test")).toBeInTheDocument();

    userEvent.click(getByLabelText("allDataRadio"));
    expect(getByLabelText("allDataContent")).toBeInTheDocument();
  //  expect(getByLabelText("testMatchTab")).toBeInTheDocument();
  });

  it("can render possible combinations of matched rulesets", async() => {
    mockCalculateMatchingActivity.mockResolvedValue({status: 200, data: matchingActivity});
    const {getByLabelText, rerender} =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <MatchingStepDetail/>
      </CurationContext.Provider>
    );
    expect(mockCalculateMatchingActivity).toHaveBeenCalledTimes(1);

    expect(getByLabelText("matchCombinationsHeading")).toBeInTheDocument();

    wait(() => {
      expect(getByLabelText("combinationLabel-sameThreshold")).toBeInTheDocument();
      expect(getByLabelText("combinationLabel-similarThreshold")).toBeInTheDocument();
    });

    //Verify if no match combinations label is displayed properly for no matches.
    rerender(
      <CurationContext.Provider value={customerMatchingStepEmpty}>
        <MatchingStepDetail/>
      </CurationContext.Provider>
    );

    expect(getByLabelText("matchCombinationsHeading")).toBeInTheDocument();
    expect(getByLabelText("noMatchedCombinations")).toBeInTheDocument();
  });
});
