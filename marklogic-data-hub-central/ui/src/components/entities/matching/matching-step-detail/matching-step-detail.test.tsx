import React from "react";
import {render, screen, fireEvent, wait, waitForElement} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MatchingStepDetail from "./matching-step-detail";

import {CurationContext} from "../../../../util/curation-context";
import {customerMatchingStep, customerMatchingStepEmpty} from "../../../../assets/mock-data/curation/curation-context-mock";
import {calculateMatchingActivity, getAllExcludeValuesList} from "../../../../api/matching";
import {matchingActivity} from "../../../../assets/mock-data/curation/matching.data";

jest.mock("../../../../api/matching");

const mockCalculateMatchingActivity = calculateMatchingActivity as jest.Mock;
const mockGetAllExcludeValuesList = getAllExcludeValuesList as jest.Mock;

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
    expect(getByText("Test")).toBeDisabled();

    userEvent.click(getByLabelText("allDataRadio"));
    expect(getByLabelText("allDataContent")).toBeInTheDocument();
    expect(getAllByPlaceholderText("Enter URI or Paste URIs")[0]).toBeDisabled();
    expect(getAllByPlaceholderText("Enter URI or Paste URIs")[1]).toBeDisabled();
    // expect(getByLabelText("testMatchTab")).toBeInTheDocument();

  });

  it("Keyboard Navigation sequence is correct", async () => {
    const {getByLabelText} =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <MatchingStepDetail/>
      </CurationContext.Provider>
    );

    let i: number;
    let arrowLeft = getByLabelText("Back");
    let expand = getByLabelText("expandBtn");
    let collapse = getByLabelText("collapseBtn");
    let showMoreThreshold = getByLabelText("threshold-more");
    let addThreshold = getByLabelText("add-threshold");
    let editThreshold = getByLabelText("threshold-scale-switch");
    let showMoreRuleset = getByLabelText("ruleset-more");
    let addRuleset = getByLabelText("add-ruleset");
    let editRuleset = getByLabelText("ruleset-scale-switch");
    let uriOnlyRadio = getByLabelText("inputUriOnlyRadio");
    let uriOnlyInput = getByLabelText("UriOnlyInput");
    let uriOnlyAdd = getByLabelText("addUriOnlyIcon");
    let uriRadio = getByLabelText("inputUriRadio");
    let uriInput = getByLabelText("UriInput");
    let uriAdd = getByLabelText("addUriIcon");
    let allDataRadio = getByLabelText("allDataRadio");
    let testMatch = getByLabelText("testMatchUriButton");

    const matchingPageItems = [
      arrowLeft,
      expand,
      collapse,
      showMoreThreshold,
      addThreshold,
      editThreshold,
      showMoreRuleset,
      addRuleset,
      editRuleset,
      uriOnlyRadio,
      uriOnlyInput,
      uriOnlyAdd,
      uriRadio,
      uriInput,
      uriAdd,
      allDataRadio,
      testMatch
    ];

    // verify element exists and can be focused
    matchingPageItems.forEach((element, i) => async () => {
      element.focus();
      await wait(() => expect(element).toHaveFocus());
    });

    arrowLeft.focus();

    // verify elements tab in given order
    for (i = 1; i < 5; ++i) {
      userEvent.tab();
      expect(matchingPageItems[i]).toHaveFocus();
    }


    // verify elements tab backwards in same order
    for (i = 3; i >= 0; --i) {
      userEvent.tab({shift: true});
      expect(matchingPageItems[i]).toHaveFocus();
    }
  });

  it("can render matching step with rulesets and thresholds and click add single ruleset", async() => {
    mockGetAllExcludeValuesList.mockResolvedValue({status: 200, data: []});
    const {getByLabelText, getByText, queryByLabelText, getAllByPlaceholderText, getByTestId} =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <MatchingStepDetail/>
      </CurationContext.Provider>
    );

    expect(queryByLabelText("threshold-more")).toBeInTheDocument();
    expect(queryByLabelText("ruleset-more")).toBeInTheDocument();

    //Enable threshold switch
    userEvent.click(queryByLabelText("threshold-scale-switch")!);
    expect(queryByLabelText("threshold-scale-switch")).toBeChecked();
    expect(getByTestId("active-threshold-timeline")).toBeInTheDocument();

    //Enable ruleset switch
    userEvent.click(queryByLabelText("ruleset-scale-switch")!);
    expect(queryByLabelText("ruleset-scale-switch")).toBeChecked();
    expect(getByTestId("active-ruleset-timeline")).toBeInTheDocument();


    userEvent.click(document.querySelector("#add-ruleset")!);
    expect(getByLabelText("multiPropertyRulesetOption")).toBeInTheDocument();
    userEvent.click(getByLabelText("singlePropertyRulesetOption"));

    expect(screen.getByTestId("property-to-match-dropdown")).toBeInTheDocument();

    //Verify test match related fields are rendered properly
    expect(getByLabelText("testMatch")).toBeInTheDocument();
    expect(getAllByPlaceholderText("Enter URI or Paste URIs")[1]).toBeDisabled();

    userEvent.click(getByLabelText("inputUriRadio"));
    expect(getAllByPlaceholderText("Enter URI or Paste URIs")[1]).toBeEnabled();
    expect(getAllByPlaceholderText("Enter URI or Paste URIs")[0]).toBeDisabled();
    expect(getByLabelText("UriInput")).toBeInTheDocument();
    expect(getByText("Test")).toBeInTheDocument();
    expect(getByText("Test")).toBeEnabled();

    userEvent.click(getByLabelText("allDataRadio"));
    expect(getByLabelText("allDataContent")).toBeInTheDocument();
  //  expect(getByLabelText("testMatchTab")).toBeInTheDocument();
  });

  it("can render possible combinations of matched rulesets", async() => {
    mockCalculateMatchingActivity.mockResolvedValue({status: 200, data: matchingActivity});
    mockGetAllExcludeValuesList.mockResolvedValue({status: 200, data: []});
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
