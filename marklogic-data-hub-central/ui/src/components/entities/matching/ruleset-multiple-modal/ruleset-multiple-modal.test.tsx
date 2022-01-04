import React from "react";
import {act, render, screen, wait} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RulesetMultipleModal from "./ruleset-multiple-modal";

import {CurationContext} from "../../../../util/curation-context";
import {updateMatchingArtifact} from "../../../../api/matching";
import {customerMatchingStep, customerMatchStepWithLargePropCount} from "../../../../assets/mock-data/curation/curation-context-mock";
import {within, fireEvent} from "@testing-library/dom";

jest.mock("../../../../api/matching");
jest.setTimeout(30000);

const mockMatchingUpdate = updateMatchingArtifact as jest.Mock;

describe("Matching Multiple Rulesets Modal component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("can view multiple rulesets modal properties, select match type and click cancel", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();
    let editRuleset = {
      ...customerMatchingStep.curationOptions.activeStep.stepArtifact.matchRulesets[0],
      index: 0
    };

    const {queryByText, getByText, getByLabelText, queryByLabelText, rerender} =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetMultipleModal
          isVisible={false}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText("Add Match Ruleset for Multiple Properties")).toBeNull();

    rerender(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetMultipleModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    expect(queryByText("Add Match Ruleset for Multiple Properties")).toBeInTheDocument();
    expect(getByLabelText("titleDescription")).toBeInTheDocument();
    expect(getByLabelText("rulesetName-input")).toBeInTheDocument();
    expect(getByText("Reduce Weight")).toBeInTheDocument();
    expect(getByLabelText("reduceToggle")).toBeInTheDocument();

    // To verify delete icon is not present for new add multiple ruleset modal
    expect(queryByLabelText("editMultipleRulesetDeleteIcon")).not.toBeInTheDocument();

    let reduceInfoCircleIcon = screen.getByLabelText("icon: question-circle");
    userEvent.hover(reduceInfoCircleIcon);
    await wait(() => expect(screen.getByLabelText("reduce-tooltip-text")));

    expect(getByText("Match on:")).toBeInTheDocument();
    expect(getByLabelText("modalTitleLegend")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByLabelText("customerId-match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(screen.getByText("Exact"));

    userEvent.click(getByText("Cancel"));
    expect(screen.getByLabelText("confirm-body")).toBeInTheDocument();
    userEvent.click(screen.getByText("Yes"));

    expect(toggleModalMock).toHaveBeenCalledTimes(1);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);

    // To verify delete icon is present for editing multiple ruleset modal
    rerender(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetMultipleModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editRuleset={{editRuleset}}
        />
      </CurationContext.Provider>
    );
    expect(queryByLabelText("editMultipleRulesetDeleteIcon")).toBeInTheDocument();
  });

  it("can select Match type and view properties in match type details column", () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    const {getByText} =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetMultipleModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    fireEvent.keyDown(screen.getByLabelText("customerId-match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(screen.getByLabelText("synonym-option"));
    expect(screen.getByLabelText("customerId-thesaurus-uri-input")).toBeInTheDocument();
    expect(screen.getByLabelText("customerId-filter-input")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByLabelText("customerId-match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(screen.getByLabelText("doubleMetaphone-option"));
    expect(screen.getByLabelText("customerId-dictionary-uri-input")).toBeInTheDocument();
    expect(screen.getByLabelText("customerId-distance-threshold-input")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByLabelText("customerId-match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(screen.getAllByLabelText("synonym-option")[1]); // This is getting the selected option as well
    expect(screen.getByLabelText("customerId-thesaurus-uri-input")).toBeInTheDocument();
    expect(screen.getByLabelText("customerId-filter-input")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByLabelText("customerId-match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(screen.getByLabelText("custom-option"));
    expect(screen.getByLabelText("customerId-uri-input")).toBeInTheDocument();
    expect(screen.getByLabelText("customerId-function-input")).toBeInTheDocument();
    expect(screen.getByLabelText("customerId-namespace-input")).toBeInTheDocument();

    userEvent.click(getByText("Cancel"));
    expect(screen.getByLabelText("confirm-body")).toBeInTheDocument();
    userEvent.click(screen.getByText("Yes"));

    expect(toggleModalMock).toHaveBeenCalledTimes(1);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);
  });

  it("can select every properties using row selection checkboxes, except the ones that are parent", async () => {
    mockMatchingUpdate.mockResolvedValue({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    await act(async () => {
      render(
        <CurationContext.Provider value={customerMatchingStep}>
          <RulesetMultipleModal
            isVisible={true}
            toggleModal={toggleModalMock}
            editRuleset={{}}
          />
        </CurationContext.Provider>
      );
    });

    //Check if the select all checkbox works

    let customerId = document.querySelector(`[name="customerId"]`);
    let name = document.querySelector(`[name="name"]`);
    let nicknames = document.querySelector(`[name="nicknames"]`);
    let shipping = document.querySelector(`[name="shipping"]`);
    let billing = document.querySelector(`[name="billing"]`);

    //All properties are not checked by default
    expect(customerId).not.toBeChecked();
    expect(name).not.toBeChecked();
    expect(nicknames).not.toBeChecked();

    //Checkboxes for ParentProperties are not available to check
    expect(shipping).toBeNull();
    expect(billing).toBeNull();

    let allZipExpandIcon: any = document.querySelectorAll(`svg[data-testid^="zip"]`);
    userEvent.click(allZipExpandIcon[0]);
    userEvent.click(allZipExpandIcon[1]);

    let selectAllCheckbox:any = document.querySelector(`.selection-cell-header input[type="checkbox"]`);
    expect(selectAllCheckbox).not.toBeChecked();
    await wait(() => userEvent.click(selectAllCheckbox));

    // Check if all the properties are selected now.
    expect(customerId).toBeChecked();
    expect(name).toBeChecked();
    expect(nicknames).toBeChecked();

    expect(document.querySelector(`[name="shipping.street"]`)).toBeChecked(); //ShippingStreet
    expect(document.querySelector(`[name="shipping.city"]`)).toBeChecked(); //ShippingCity
    expect(document.querySelector(`[name="shipping.state"]`)).toBeChecked(); // ShippingState

    let shippingZipCheckbox = document.querySelector(`[name="shipping.zip.zip"]`);
    expect(shippingZipCheckbox).toBeNull(); //Zip Checkbox is not available to check

    expect(document.querySelector(`[name="shipping.zip.fiveDigit"]`)).toBeChecked(); //Shipping > Zip > fiveDigit
    expect(document.querySelector(`[name="shipping.zip.plusFour"]`)).toBeChecked(); //Shipping > Zip > plusFour

    expect(document.querySelector(`[name="billing.street"]`)).toBeChecked(); //BillingStreet
    expect(document.querySelector(`[name="billing.city"]`)).toBeChecked(); //BillingCity
    expect(document.querySelector(`[name="billing.state"]`)).toBeChecked(); // BillingState
    let billingZipCheckbox = document.querySelector(`[name="billing.zip.zip"]`);
    expect(billingZipCheckbox).toBeNull(); //Zip Checkbox is not available to check

    expect(document.querySelector(`[name="billing.zip.fiveDigit"]`)).toBeChecked(); //Billing > Zip > fiveDigit
    expect(document.querySelector(`[name="billing.zip.plusFour"]`)).toBeChecked(); //Billing > Zip > plusFour
  });

  it("can validate if row selection checkbox and matchon tag gets checked automatically when corresponding match type for the row is updated", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    let getByLabelText;
    await act(async () => {
      const renderResults = render(
        <CurationContext.Provider value={customerMatchingStep}>
          <RulesetMultipleModal
            isVisible={true}
            toggleModal={toggleModalMock}
            editRuleset={{}}
          />
        </CurationContext.Provider>
      );
      getByLabelText = renderResults.getByLabelText;
    });

    let customerId = document.querySelector(`[name="customerId"]`);
    expect(customerId).not.toBeChecked();

    fireEvent.keyDown(screen.getByLabelText("customerId-match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(getByLabelText("synonym-option"));

    expect(customerId).toBeChecked();
    await wait(() => expect(getByLabelText("customerId-matchOn-tag")).toBeInTheDocument());
  });

  it("can reset match type for a row and match on tag by de-selection using row selection checkbox ", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    let getByLabelText, queryByTitle, queryByLabelText;
    await act(async () => {
      const renderResults = render(
        <CurationContext.Provider value={customerMatchingStep}>
          <RulesetMultipleModal
            isVisible={true}
            toggleModal={toggleModalMock}
            editRuleset={{}}
          />
        </CurationContext.Provider>
      );
      getByLabelText = renderResults.getByLabelText;
      queryByTitle = renderResults.queryByTitle;
      queryByLabelText = renderResults.queryByLabelText;
    });

    let customerId:any = document.querySelector(`[name="customerId"]`);

    fireEvent.keyDown(screen.getByLabelText("customerId-match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(getByLabelText("synonym-option"));
    expect(customerId).toBeChecked();
    await wait(() => expect(getByLabelText("customerId-matchOn-tag")).toBeInTheDocument());

    //Provide values for thesaurus and filter input fields
    userEvent.type(getByLabelText("customerId-thesaurus-uri-input"), "/thesaurus/uri/sample.json");
    userEvent.type(getByLabelText("customerId-filter-input"), "filterInputText");

    userEvent.click(customerId); //de-selecting customerId resets all provided field values
    expect(queryByTitle("Synonym")).not.toBeInTheDocument();
    expect(queryByLabelText("customerId-matchOn-tag")).not.toBeInTheDocument();

    userEvent.click(customerId); //selecting customerId again and check that field values should not be available
    fireEvent.keyDown(screen.getByLabelText("customerId-match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(screen.getAllByLabelText("synonym-option")[1]); // ToDo: fix deselect dropdown value
    expect(customerId).toBeChecked();
    expect(getByLabelText("customerId-matchOn-tag")).toBeInTheDocument();
    expect(getByLabelText("customerId-thesaurus-uri-input")).toHaveValue("");
    expect(getByLabelText("customerId-filter-input")).toHaveValue("");

  });

  it.skip("can manipulate match on tags using row selection checkboxes and vice-versa ", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    let getByLabelText, queryByTitle, queryByLabelText;
    await act(async () => {
      const renderResults = render(
        <CurationContext.Provider value={customerMatchingStep}>
          <RulesetMultipleModal
            isVisible={true}
            toggleModal={toggleModalMock}
            editRuleset={{}}
          />
        </CurationContext.Provider>
      );
      getByLabelText = renderResults.getByLabelText;
      queryByTitle = renderResults.queryByTitle;
      queryByLabelText = renderResults.queryByLabelText;
    });

    let customerId:any = document.querySelector(`[name="customerId"]`);
    const validateMatchOnTag = async (matchOnTag) => {
      expect(getByLabelText(matchOnTag)).toBeInTheDocument();
    };

    expect(queryByLabelText("customerId-matchOn-tag")).not.toBeInTheDocument();
    expect(queryByLabelText("shipping.street-matchOn-tag")).not.toBeInTheDocument();
    expect(queryByLabelText("shipping.zip.fiveDigit-matchOn-tag")).not.toBeInTheDocument();

    fireEvent.keyDown(screen.getByLabelText("customerId-match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(getByLabelText("synonym-option")); // ToDo: fix deselected dropdown
    expect(customerId).toBeChecked();

    validateMatchOnTag("customerId-matchOn-tag");

    //Provide values for thesaurus and filter input fields
    userEvent.type(getByLabelText("customerId-thesaurus-uri-input"), "/thesaurus/uri/sample.json");
    userEvent.type(getByLabelText("customerId-filter-input"), "filterInputText");

    let shippingStreet:any = document.querySelector(`[name="shipping.street"]`);
    userEvent.click(shippingStreet);
    validateMatchOnTag("shipping.street-matchOn-tag");

    let allZipExpandIcon: any = document.querySelector(`svg[data-testid^="zip"]`);
    await wait(() => userEvent.click(allZipExpandIcon)); // ToDo: fix auto-expanded inner children

    let shippingZipFiveDigit:any = document.querySelector(`[name="shipping.zip.fiveDigit"]`);
    expect(shippingZipFiveDigit).toBeInTheDocument();
    await wait(() => userEvent.click(shippingZipFiveDigit));

    await wait(() => validateMatchOnTag("shipping.zip.fiveDigit-matchOn-tag"));

    //Removing the match tag resets the row selection.
    userEvent.click(within(getByLabelText("customerId-matchOn-tag")).getByTestId("iconClose-tagComponent"));

    expect(queryByLabelText("customerId-matchOn-tag")).not.toBeInTheDocument(); //Check the tag is removed

    //Other tags are still available.
    validateMatchOnTag("shipping.street-matchOn-tag");
    validateMatchOnTag("shipping.zip.fiveDigit-matchOn-tag");

    expect(customerId).not.toBeChecked(); //CustomerId row should not be selected now.
    expect(queryByTitle("Synonym")).not.toBeInTheDocument(); //match type is reset
    expect(queryByLabelText("customerId-thesaurus-uri-input")).not.toBeInTheDocument();
    expect(queryByLabelText("customerId-filter-input")).not.toBeInTheDocument();

    userEvent.click(customerId);
    expect(getByLabelText("customerId-matchOn-tag")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByLabelText("customerId-match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(getByLabelText("synonym-option"));
    expect(customerId).toBeChecked();
    expect(getByLabelText("customerId-thesaurus-uri-input")).toHaveValue("");
    expect(getByLabelText("customerId-filter-input")).toHaveValue("");
  });

  it("cannot save without providing value for ruleset name", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    let queryByText, getByText, getByLabelText;
    await act(async () => {
      const renderResults = render(
        <CurationContext.Provider value={customerMatchingStep}>
          <RulesetMultipleModal
            isVisible={true}
            toggleModal={toggleModalMock}
            editRuleset={{}}
          />
        </CurationContext.Provider>
      );
      queryByText = renderResults.queryByText;
      getByText = renderResults.getByText;
      getByLabelText = renderResults.getByLabelText;
    });

    expect(queryByText("Add Match Ruleset for Multiple Properties")).toBeInTheDocument();

    userEvent.click(getByText("Save"));

    expect(getByText("A ruleset name is required")).toBeInTheDocument();

    expect(toggleModalMock).toHaveBeenCalledTimes(0);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);

    //Selecting a property without providing the ruleset name
    let customerIdSelectionCheckbox: any =  document.querySelector(`[name="customerId"]`);
    userEvent.click(customerIdSelectionCheckbox);
    fireEvent.keyDown(screen.getByLabelText("customerId-match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(getByLabelText("exact-option"));

    userEvent.click(getByText("Save"));

    expect(getByText("A ruleset name is required")).toBeInTheDocument();
    expect(toggleModalMock).toHaveBeenCalledTimes(0);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);

    userEvent.type(getByLabelText("rulesetName-input"), "Customer ruleset");

    userEvent.click(getByText("Save"));
    await wait(() => {
      expect(queryByText("A ruleset name is required")).not.toBeInTheDocument();
    });
  });

  it("cannot save without selecting at least one property and providing value for match type for the selected property", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    let queryByTestId, getByText, getByTestId, getByLabelText, queryByLabelText;
    await act(async () => {
      const renderResults = render(
        <CurationContext.Provider value={customerMatchingStep}>
          <RulesetMultipleModal
            isVisible={true}
            toggleModal={toggleModalMock}
            editRuleset={{}}
          />
        </CurationContext.Provider>
      );
      queryByTestId = renderResults.queryByTestId;
      getByText = renderResults.getByText;
      getByTestId = renderResults.getByTestId;
      getByLabelText = renderResults.getByLabelText;
      queryByLabelText = renderResults.queryByLabelText;
    });

    userEvent.type(getByLabelText("rulesetName-input"), "Customer ruleset");

    userEvent.click(getByText("Save")); //Clicking save without selecting a property

    expect(getByLabelText("noPropertyCheckedErrorMessage")).toBeInTheDocument(); //Indicating that at least one property must be selected.
    expect(toggleModalMock).toHaveBeenCalledTimes(0);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);

    let customerIdSelectionCheckbox: any = document.querySelector(`[name="customerId"]`);

    userEvent.click(customerIdSelectionCheckbox);

    expect(queryByLabelText("noPropertyCheckedErrorMessage")).not.toBeInTheDocument(); //Should not be visible since a property is selected now.

    userEvent.click(getByText("Save"));

    expect(getByTestId("customerId-match-type-err")).toBeInTheDocument(); //Indicating that match type must be provided for the selected row.
    expect(toggleModalMock).toHaveBeenCalledTimes(0);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);

    fireEvent.keyDown(screen.getByLabelText("customerId-match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(getByLabelText("exact-option"));
    userEvent.click(getByText("Save"));
    await wait(() => {
      expect(queryByTestId("customerId-match-type-err")).not.toBeInTheDocument();
      expect(toggleModalMock).toHaveBeenCalledTimes(1);
      expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
      expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(1);
    });
  });

  it("cannot save until required field is populated when match type is Synonym", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    const {getByTestId, getByText, getByLabelText, queryByTestId} = render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetMultipleModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    userEvent.type(getByLabelText("rulesetName-input"), "Customer ruleset");

    fireEvent.keyDown(screen.getByLabelText("customerId-match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(getByLabelText("synonym-option"));

    userEvent.click(getByText("Save"));

    expect(getByTestId("customerId-thesaurus-uri-err")).toBeInTheDocument();

    expect(toggleModalMock).toHaveBeenCalledTimes(0);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);

    userEvent.type(getByLabelText("customerId-thesaurus-uri-input"), "/thesaurus/uri/sample.json");

    userEvent.click(getByText("Save"));

    await wait(() => {
      expect(queryByTestId("customerId-thesaurus-uri-err")).not.toBeInTheDocument();
      expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
      expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(1);
      expect(toggleModalMock).toHaveBeenCalledTimes(1);
    });
  });

  it("cannot save until required fields are populated when match type is Double metaphone", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    const {getByTestId, getByText, getByLabelText, queryByTestId} = render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetMultipleModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    userEvent.type(getByLabelText("rulesetName-input"), "Customer ruleset");

    fireEvent.keyDown(screen.getByLabelText("customerId-match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(getByLabelText("doubleMetaphone-option"));

    userEvent.click(getByText("Save"));

    //Errors are visible when mandatory fields are empty.
    expect(getByTestId("customerId-dictionary-uri-err")).toBeInTheDocument();
    expect(getByTestId("customerId-distance-threshold-err")).toBeInTheDocument();

    expect(toggleModalMock).toHaveBeenCalledTimes(0);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);

    userEvent.type(getByLabelText("customerId-dictionary-uri-input"), "/dictionary/uri/sample.json");

    userEvent.click(getByText("Save"));

    expect(getByTestId("customerId-distance-threshold-err")).toBeInTheDocument();
    await wait(() => expect(queryByTestId("customerId-dictionary-uri-err")).not.toBeInTheDocument());

    userEvent.type(getByLabelText("customerId-distance-threshold-input"), "10");

    userEvent.click(getByText("Save"));

    await wait(() => {
      expect(queryByTestId("customerId-dictionary-uri-err")).not.toBeInTheDocument();
      expect(queryByTestId("customerId-distance-threshold-err")).not.toBeInTheDocument();
      expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
      expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(1);
      expect(toggleModalMock).toHaveBeenCalledTimes(1);
    });
  });

  it("cannot save until required fields are populated when match type is Custom", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    let getByTestId, getByText, getByLabelText, queryByTestId;
    await act(async () => {
      const renderResults = render(
        <CurationContext.Provider value={customerMatchingStep}>
          <RulesetMultipleModal
            isVisible={true}
            toggleModal={toggleModalMock}
            editRuleset={{}}
          />
        </CurationContext.Provider>
      );
      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;
      getByLabelText = renderResults.getByLabelText;
      queryByTestId = renderResults.queryByTestId;
    });

    userEvent.type(getByLabelText("rulesetName-input"), "Customer ruleset");

    fireEvent.keyDown(screen.getByLabelText("customerId-match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(getByLabelText("custom-option"));

    userEvent.click(getByText("Save"));

    //Errors are visible when mandatory fields are empty.
    expect(getByTestId("customerId-uri-err")).toBeInTheDocument();
    expect(getByTestId("customerId-function-err")).toBeInTheDocument();

    expect(toggleModalMock).toHaveBeenCalledTimes(0);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);

    userEvent.type(getByLabelText("customerId-uri-input"), "/uri/sample.json");

    userEvent.click(getByText("Save"));

    expect(getByTestId("customerId-function-err")).toBeInTheDocument();
    await wait(() => expect(queryByTestId("customerId-uri-err")).not.toBeInTheDocument());

    userEvent.type(getByLabelText("customerId-function-input"), "concat(string1,string2)");

    userEvent.click(getByText("Save"));

    await wait(() => {
      expect(queryByTestId("customerId-uri-err")).not.toBeInTheDocument();
      expect(queryByTestId("customerId-function-err")).not.toBeInTheDocument();
      expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
      expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(1);
      expect(toggleModalMock).toHaveBeenCalledTimes(1);
    });
  });

  it("can save when match type is Exact", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    const {getByLabelText, getByText} = render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetMultipleModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    userEvent.type(getByLabelText("rulesetName-input"), "Customer ruleset");

    fireEvent.keyDown(screen.getByLabelText("customerId-match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(getByLabelText("exact-option"));

    expect(toggleModalMock).toHaveBeenCalledTimes(0);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);

    userEvent.click(getByText("Save"));

    await wait(() => {
      expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
      expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(1);
      expect(toggleModalMock).toHaveBeenCalledTimes(1);
    });
  });

  it("can save when match type is Zip", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    const {getByLabelText, getByText} = render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetMultipleModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editRuleset={{}}
        />
      </CurationContext.Provider>
    );

    userEvent.type(getByLabelText("rulesetName-input"), "Customer ruleset");

    fireEvent.keyDown(screen.getByLabelText("customerId-match-type-dropdown"), {key: "ArrowDown"});
    userEvent.click(getByLabelText("zip-option"));

    expect(toggleModalMock).toHaveBeenCalledTimes(0);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);

    userEvent.click(getByText("Save"));

    await wait(() => {
      expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
      expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(1);
      expect(toggleModalMock).toHaveBeenCalledTimes(1);
    });
  });
  // ToDo: Fix rowKey=key or another approach, propertyPath currently doesn't work
  it.skip("can expand all/collapse all entity structured properties using the expand all/collapse all buttons", async () => {
    mockMatchingUpdate.mockResolvedValue({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    let getByTestId;
    await act(async () => {
      const renderResults = render(
        <CurationContext.Provider value={customerMatchingStep}>
          <RulesetMultipleModal
            isVisible={true}
            toggleModal={toggleModalMock}
            editRuleset={{}}
          />
        </CurationContext.Provider>
      );
      getByTestId = renderResults.getByTestId;
    });

    let collapseAllButton = getByTestId("collapseBtn");
    let expandAllButton = getByTestId("expandBtn");

    let shippingStreet = document.querySelector(`[data-row-key="shipping.street"]`);
    let shippingCity = document.querySelector(`[data-row-key="shipping.city"]`);
    let shippingState = document.querySelector(`[data-row-key="shipping.state"]`);
    let shippingZipFiveDigit = document.querySelector(`[data-row-key="shipping.zip.fiveDigit"]`);
    let shippingZipPlusFour = document.querySelector(`[data-row-key="shipping.zip.plusFour"]`);
    let billingStreet = document.querySelector(`[data-row-key="billing.street"]`);
    let billingCity = document.querySelector(`[data-row-key="billing.city"]`);
    let billingState = document.querySelector(`[data-row-key="billing.state"]`);
    let billingZipFiveDigit = document.querySelector(`[data-row-key="billing.zip.fiveDigit"]`);
    let billingZipPlusFour = document.querySelector(`[data-row-key="billing.zip.plusFour"]`);


    //The structured properties should be visible by default
    expect(shippingStreet).toBeVisible();
    expect(shippingCity).toBeVisible();
    expect(shippingState).toBeVisible();
    expect(shippingZipFiveDigit).toBeVisible();
    expect(shippingZipPlusFour).toBeVisible();
    expect(billingStreet).toBeVisible();
    expect(billingCity).toBeVisible();
    expect(billingState).toBeVisible();
    expect(billingZipFiveDigit).toBeVisible();
    expect(billingZipPlusFour).toBeVisible();

    //Collapse all structured properties and see if the nested rows are not visible
    userEvent.click(collapseAllButton);
    expect(shippingStreet).not.toBeVisible();
    expect(shippingCity).not.toBeVisible();
    expect(shippingState).not.toBeVisible();
    expect(shippingZipFiveDigit).not.toBeVisible();
    expect(shippingZipPlusFour).not.toBeVisible();
    expect(billingStreet).not.toBeVisible();
    expect(billingCity).not.toBeVisible();
    expect(billingState).not.toBeVisible();
    expect(billingZipFiveDigit).not.toBeVisible();
    expect(billingZipPlusFour).not.toBeVisible();


    //Expand All structured properties and see if the nested rows are visible
    userEvent.click(expandAllButton);
    expect(shippingStreet).toBeVisible();
    expect(shippingCity).toBeVisible();
    expect(shippingState).toBeVisible();
    expect(shippingZipFiveDigit).toBeVisible();
    expect(shippingZipPlusFour).toBeVisible();
    expect(billingStreet).toBeVisible();
    expect(billingCity).toBeVisible();
    expect(billingState).toBeVisible();
    expect(billingZipFiveDigit).toBeVisible();
    expect(billingZipPlusFour).toBeVisible();
  });

  it("can verify that pagination works properly", async () => {
    mockMatchingUpdate.mockResolvedValue({status: 200, data: {}});
    const toggleModalMock = jest.fn();
    let getByTitle;
    await act(async () => {
      const renderResults = render(
        <CurationContext.Provider value={customerMatchStepWithLargePropCount}>
          <RulesetMultipleModal
            isVisible={true}
            toggleModal={toggleModalMock}
            editRuleset={{}}
          />
        </CurationContext.Provider>
      );
      getByTitle = renderResults.getByTitle;
    });
    let previousPageLink = getByTitle("Previous Page");
    let page1_Option = getByTitle("1");
    let page2_Option = getByTitle("2");
    let rowsPerPageOptionsDropdown: any = document.querySelector(".react-bootstrap-table-pagination #size-per-page");
    let customerId = document.querySelector(`[data-testid="customerId-checkbox"]`);
    let name = document.querySelector(`[data-testid="name-checkbox"]`);
    let nicknames = document.querySelector(`[data-testid="nicknames-checkbox"]`);
    let testProp28 = document.querySelector(`[data-testid="testProp28-checkbox"]`);
    let testProp29 = document.querySelector(`[data-testid="testProp29-checkbox"]`);
    let testProp30 = document.querySelector(`[data-testid="testProp30-checkbox"]`);
    //default rows
    expect(customerId).toBeInTheDocument();
    expect(name).toBeInTheDocument();
    expect(nicknames).toBeInTheDocument();
    expect(testProp28).not.toBeInTheDocument();
    expect(testProp29).not.toBeInTheDocument();
    expect(testProp30).not.toBeInTheDocument();
    expect(previousPageLink).toHaveClass("disabled");
    //Navigating to page 2
    wait(() => {
      userEvent.click(page2_Option);
      expect(customerId).not.toBeInTheDocument();
      expect(name).not.toBeInTheDocument();
      expect(nicknames).not.toBeInTheDocument();
      expect(document.querySelector(`[data-testid="testProp28-checkbox"]`)).toBeInTheDocument();
      expect(document.querySelector(`[data-testid="testProp29-checkbox"]`)).toBeInTheDocument();
      expect(document.querySelector(`[data-testid="testProp30-checkbox"]`)).toBeInTheDocument();
      expect(previousPageLink).not.toHaveAttribute("disabled");
    });
    //Navigating back to page 1
    userEvent.click(previousPageLink);
    expect(document.querySelector(`[data-testid="customerId-checkbox"]`)).toBeInTheDocument();
    expect(document.querySelector(`[data-testid="name-checkbox"]`)).toBeInTheDocument();
    expect(document.querySelector(`[data-testid="nicknames-checkbox"]`)).toBeInTheDocument();
    expect(testProp28).not.toBeInTheDocument();
    expect(testProp29).not.toBeInTheDocument();
    expect(testProp30).not.toBeInTheDocument();
    //Change the page size and verify that all rows should be abailable now in one page.
    userEvent.click(rowsPerPageOptionsDropdown);
    let rowsPerPageOptions:any = document.querySelector(".dropdown-menu");
    userEvent.click(within(rowsPerPageOptions).getByText("40 / page"));
    expect(page1_Option).toBeInTheDocument();
    expect(page2_Option).not.toBeInTheDocument();
    expect(document.querySelector(`[data-testid="customerId-checkbox"]`)).toBeInTheDocument();
    expect(document.querySelector(`[data-testid="name-checkbox"]`)).toBeInTheDocument();
    expect(document.querySelector(`[data-testid="nicknames-checkbox"]`)).toBeInTheDocument();
    expect(document.querySelector(`[data-testid="testProp28-checkbox"]`)).toBeInTheDocument();
    expect(document.querySelector(`[data-testid="testProp29-checkbox"]`)).toBeInTheDocument();
    expect(document.querySelector(`[data-testid="testProp30-checkbox"]`)).toBeInTheDocument();
  });
});
