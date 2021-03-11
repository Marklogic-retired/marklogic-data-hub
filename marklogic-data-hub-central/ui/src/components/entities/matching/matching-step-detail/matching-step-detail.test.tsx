import React from "react";
import {render, screen, fireEvent, wait} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MatchingStepDetail from "./matching-step-detail";

import {CurationContext} from "../../../../util/curation-context";
import {customerMatchingStep, customerMatchingStepEmpty} from "../../../../assets/mock-data/curation/curation-context-mock";
import {updateMatchingArtifact, calculateMatchingActivity} from "../../../../api/matching";
import {matchingActivity} from "../../../../assets/mock-data/curation/matching.data";

jest.mock("../../../../api/matching");

const mockMatchingUpdate = updateMatchingArtifact as jest.Mock;
const mockCalculateMatchingActivity = calculateMatchingActivity as jest.Mock;

describe("Matching Step Detail view component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("can render matching step with no rulesets or thresholds and click less/more text", () => {

    const {getByLabelText, queryByLabelText, getByTestId, getByPlaceholderText, getByText} =  render(
      <CurationContext.Provider value={customerMatchingStepEmpty}>
        <MatchingStepDetail/>
      </CurationContext.Provider>
    );

    expect(queryByLabelText("threshold-more")).toBeNull();
    expect(queryByLabelText("ruleset-more")).toBeNull();
    expect(getByTestId("threshold-slider-rail")).toBeInTheDocument();
    expect(getByTestId("threshold-slider-ticks")).toBeInTheDocument();
    expect(getByTestId("threshold-slider-options")).toBeInTheDocument();
    expect(getByTestId("ruleSet-slider-rail")).toBeInTheDocument();
    expect(getByTestId("ruleSet-slider-options")).toBeInTheDocument();
    expect(getByTestId("ruleSet-slider-ticks")).toBeInTheDocument();

    userEvent.click(getByLabelText("threshold-less"));
    expect(queryByLabelText("threshold-more")).toBeInTheDocument();

    userEvent.click(getByLabelText("ruleset-less"));
    expect(queryByLabelText("ruleset-more")).toBeInTheDocument();

    expect(getByLabelText("matchCombinationsHeading")).toBeInTheDocument();
    expect(getByLabelText("noMatchedCombinations")).toBeInTheDocument();

    expect(getByLabelText("testMatch")).toBeInTheDocument();
    userEvent.click(getByLabelText("inputUriRadio"));
    expect(getByPlaceholderText("Enter URI or Paste URIs")).toBeEnabled();
    expect(getByLabelText("UriInput")).toBeInTheDocument();
    expect(getByLabelText("addUriIcon")).toBeInTheDocument();
    expect(getByText("Test")).toBeInTheDocument();

    userEvent.click(getByLabelText("allDataRadio"));
    expect(getByLabelText("allDataContent")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter URI or Paste URIs")).toBeDisabled();
    expect(getByLabelText("testMatchTab")).toBeInTheDocument();
  });

  it("can render matching step with rulesets and thresholds and click add single ruleset", async() => {

    const {getByLabelText, getByText, queryByLabelText, getByPlaceholderText} =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <MatchingStepDetail/>
      </CurationContext.Provider>
    );

    expect(queryByLabelText("threshold-more")).toBeInTheDocument();
    expect(queryByLabelText("ruleset-more")).toBeInTheDocument();
    //Verify threshold options are rendered on the slider
    expect(getByText("sameThreshold")).toBeInTheDocument();
    expect(getByText("similarThreshold")).toBeInTheDocument();
    expect(getByText("household")).toBeInTheDocument();

    userEvent.click(getByLabelText("add-ruleset"));
    //Verify ruleset options are rendered on the slider
    expect(getByText("name")).toBeInTheDocument();
    expect(getByText("lastName")).toBeInTheDocument();
    expect(getByText("billingAddress")).toBeInTheDocument();
    expect(getByText("shippingAddress")).toBeInTheDocument();

    //Verify tooltips are highlighted on hover
    //TODO in e2e
    /* userEvent.hover(getByTestId('sameThreshold-tooltip'));
    await(waitForElement(() => expect(getByTestId('sameThreshold-tooltip')).toHaveStyle({backgroundColor:'#444'})))
    expect(getByTestId('sameThreshold-tooltip')).toHaveStyle('background-color: rgb(233, 247, 254)');*/

    //Verify handles are draggable
    fireEvent.dragStart(screen.getByTestId("sameThreshold-active"), {clientX: 0, clientY: 0});
    fireEvent.drop(screen.getByTestId("sameThreshold-active"), {clientX: 0, clientY: 1});
    expect(screen.getByText("Select property")).toBeInTheDocument();

    //Verify test match related fields are rendered properly
    expect(getByLabelText("testMatch")).toBeInTheDocument();
    userEvent.click(getByLabelText("inputUriRadio"));
    expect(getByPlaceholderText("Enter URI or Paste URIs")).toBeInTheDocument();
    expect(getByLabelText("UriInput")).toBeInTheDocument();
    expect(getByText("Test")).toBeInTheDocument();

    userEvent.click(getByLabelText("allDataRadio"));
    expect(getByLabelText("allDataContent")).toBeInTheDocument();
    expect(getByLabelText("testMatchTab")).toBeInTheDocument();
  });

  it("can render matching step with rulesets and thresholds and click add single ruleset", async() => {

    const {getByLabelText, getByText, queryByLabelText} =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <MatchingStepDetail/>
      </CurationContext.Provider>
    );

    expect(queryByLabelText("threshold-more")).toBeInTheDocument();
    expect(queryByLabelText("ruleset-more")).toBeInTheDocument();
    //Verify threshold options are rendered on the slider
    expect(getByText("sameThreshold")).toBeInTheDocument();
    expect(getByText("similarThreshold")).toBeInTheDocument();
    expect(getByText("household")).toBeInTheDocument();

    userEvent.click(getByLabelText("add-threshold"));
    //Verify ruleset options are rendered on the slider
    expect(getByText("name")).toBeInTheDocument();
    expect(getByText("lastName")).toBeInTheDocument();
    expect(getByText("billingAddress")).toBeInTheDocument();
    expect(getByText("shippingAddress")).toBeInTheDocument();

    //Verify handles are draggable
    fireEvent.dragStart(screen.getByTestId("sameThreshold-active"), {clientX: 0, clientY: 0});
    fireEvent.drop(screen.getByTestId("sameThreshold-active"), {clientX: 0, clientY: 1});
  });

  it("can edit a threshold slider value", async() => {
    const {getByTestId} =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <MatchingStepDetail/>
      </CurationContext.Provider>
    );

    userEvent.click(getByTestId("edit-sameThreshold"));
    expect(screen.getByText("Edit Match Threshold")).toBeInTheDocument();
  });

  it("can delete a threshold slider value", async() => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});

    const {getByTestId} =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <MatchingStepDetail/>
      </CurationContext.Provider>
    );

    userEvent.click(getByTestId("delete-sameThreshold"));
    expect(screen.getByText("sameThreshold - merge")).toBeInTheDocument();
    userEvent.click(screen.getByText("Yes"));
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
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
