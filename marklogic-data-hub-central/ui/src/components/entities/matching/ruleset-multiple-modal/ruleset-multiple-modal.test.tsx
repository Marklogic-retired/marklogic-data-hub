import React from "react";
import {act, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RulesetMultipleModal from "./ruleset-multiple-modal";

import {CurationContext} from "../../../../util/curation-context";
import {updateMatchingArtifact} from "../../../../api/matching";
import {customerMatchingStep} from "../../../../assets/mock-data/curation/curation-context-mock";
import {waitFor, within} from "@testing-library/dom";

jest.mock("../../../../api/matching");

const mockMatchingUpdate = updateMatchingArtifact as jest.Mock;

describe("Matching Multiple Rulesets Modal component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("can view multiple rulesets modal properties, select match type and click cancel", () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    const {queryByText, getByText, getByLabelText, rerender} =  render(
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

    expect(getByText("Match on:")).toBeInTheDocument();
    expect(getByLabelText("modalTitleLegend")).toBeInTheDocument();

    userEvent.click(screen.getByLabelText("customerId-match-type-dropdown"));
    userEvent.click(screen.getByText("Exact"));

    userEvent.click(getByText("Cancel"));
    expect(screen.getByLabelText("confirm-body")).toBeInTheDocument();
    userEvent.click(screen.getByText("Yes"));

    expect(toggleModalMock).toHaveBeenCalledTimes(1);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);
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

    userEvent.click(screen.getByLabelText("customerId-match-type-dropdown"));
    userEvent.click(screen.getByLabelText("synonym-option"));
    expect(screen.getByLabelText("customerId-thesaurus-uri-input")).toBeInTheDocument();
    expect(screen.getByLabelText("customerId-filter-input")).toBeInTheDocument();

    userEvent.click(screen.getByLabelText("doubleMetaphone-option"));
    expect(screen.getByLabelText("customerId-dictionary-uri-input")).toBeInTheDocument();
    expect(screen.getByLabelText("customerId-distance-threshold-input")).toBeInTheDocument();

    userEvent.click(screen.getByLabelText("synonym-option"));
    expect(screen.getByLabelText("customerId-thesaurus-uri-input")).toBeInTheDocument();
    expect(screen.getByLabelText("customerId-filter-input")).toBeInTheDocument();

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

    //Check if the select all checkbox works

    let customerId = document.querySelector(`[name="customerId"]`);
    let name = document.querySelector(`[name="name"]`);
    let nicknames = document.querySelector(`[name="nicknames"]`);
    let shipping = document.querySelector(`[data-row-key="shipping"] .ant-checkbox`);
    let billing = document.querySelector(`[data-row-key="billing"] .ant-checkbox`);

    //All properties are not checked by default
    expect(customerId).not.toBeChecked();
    expect(name).not.toBeChecked();
    expect(nicknames).not.toBeChecked();
    expect(document.querySelector(`[name="shipping.street"]`)).not.toBeInTheDocument();
    expect(document.querySelector(`[name="billing.street"]`)).not.toBeInTheDocument();

    //Checkboxes for ParentProperties are not available to check
    expect(shipping).not.toBeVisible();
    expect(billing).not.toBeVisible();

    let selectAllCheckbox:any = document.querySelector(".ant-table-thead .ant-checkbox-input");
    expect(selectAllCheckbox).not.toBeChecked();
    userEvent.click(selectAllCheckbox);

    // Check if all the properties are selected now.
    expect(customerId).toBeChecked();
    expect(name).toBeChecked();
    expect(nicknames).toBeChecked();

    //Expand shipping hierarchy and see that they are checked
    userEvent.click(within(getByTestId("mltable-expand-shipping")).getByRole("img"));
    expect(document.querySelector(`[name="shipping.street"]`)).toBeChecked(); //ShippingStreet
    expect(document.querySelector(`[name="shipping.city"]`)).toBeChecked(); //ShippingCity
    expect(document.querySelector(`[name="shipping.state"]`)).toBeChecked(); // ShippingState

    let zip:any = document.querySelector(`[data-row-key="shipping.zip.zip"]`);
    let shippingZipCheckbox = document.querySelector(`[data-row-key="shipping.zip.zip"] .ant-checkbox`);
    expect(shippingZipCheckbox).not.toBeVisible(); //Zip Checkbox is not available to check
    let zipDropdown = within(zip).getByTestId("mltable-expand-zip");
    userEvent.click(within(zipDropdown).getByRole("img"));

    expect(document.querySelector(`[name="shipping.zip.fiveDigit"]`)).toBeChecked(); //Shipping > Zip > fiveDigit
    expect(document.querySelector(`[name="shipping.zip.plusFour"]`)).toBeChecked(); //Shipping > Zip > plusFour

    //Expand Billing hierarchy and see that they are checked
    userEvent.click(within(getByTestId("mltable-expand-billing")).getByRole("img"));
    expect(document.querySelector(`[name="billing.street"]`)).toBeChecked(); //BillingStreet
    expect(document.querySelector(`[name="billing.city"]`)).toBeChecked(); //BillingCity
    expect(document.querySelector(`[name="billing.state"]`)).toBeChecked(); // BillingState

    let billingZip:any = document.querySelector(`[data-row-key="billing.zip.zip"]`);
    let billingZipCheckbox = document.querySelector(`[data-row-key="billing.zip.zip"] .ant-checkbox`);
    expect(billingZipCheckbox).not.toBeVisible(); //Zip Checkbox is not available to check

    let billingZipDropdown = within(billingZip).getByTestId("mltable-expand-zip");
    userEvent.click(within(billingZipDropdown).getByRole("img"));

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

    userEvent.click(getByLabelText("customerId-match-type-dropdown"));
    userEvent.click(getByLabelText("synonym-option"));

    expect(customerId).toBeChecked();
    expect(getByLabelText("customerId-matchOn-tag")).toBeInTheDocument();
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

    userEvent.click(getByLabelText("customerId-match-type-dropdown"));
    userEvent.click(getByLabelText("synonym-option"));
    expect(customerId).toBeChecked();
    expect(getByLabelText("customerId-matchOn-tag")).toBeInTheDocument();

    //Provide values for thesaurus and filter input fields
    userEvent.type(getByLabelText("customerId-thesaurus-uri-input"), "/thesaurus/uri/sample.json");
    userEvent.type(getByLabelText("customerId-filter-input"), "filterInputText");

    userEvent.click(customerId); //de-selecting customerId resets all provided field values
    expect(queryByTitle("Synonym")).not.toBeInTheDocument();
    expect(queryByLabelText("customerId-matchOn-tag")).not.toBeInTheDocument();

    userEvent.click(customerId); //selecting customerId again and check that field values should not be available
    userEvent.click(getByLabelText("customerId-match-type-dropdown"));
    userEvent.click(getByLabelText("synonym-option"));
    expect(customerId).toBeChecked();
    expect(getByLabelText("customerId-matchOn-tag")).toBeInTheDocument();
    expect(getByLabelText("customerId-thesaurus-uri-input")).toHaveValue("");
    expect(getByLabelText("customerId-filter-input")).toHaveValue("");
  });

  it("can manipulate match on tags using row selection checkboxes and vice-versa ", async () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();

    let getByLabelText, queryByTitle, queryByLabelText, getByTestId;
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
      getByTestId = renderResults.getByTestId;
    });

    let customerId:any = document.querySelector(`[name="customerId"]`);
    const validateMatchOnTag = (matchOnTag) => {
      expect(getByLabelText(matchOnTag)).toBeInTheDocument();
    };

    expect(queryByLabelText("customerId-matchOn-tag")).not.toBeInTheDocument();
    expect(queryByLabelText("shipping.street-matchOn-tag")).not.toBeInTheDocument();
    expect(queryByLabelText("shipping.zip.fiveDigit-matchOn-tag")).not.toBeInTheDocument();

    userEvent.click(getByLabelText("customerId-match-type-dropdown"));
    userEvent.click(getByLabelText("synonym-option"));
    expect(customerId).toBeChecked();

    validateMatchOnTag("customerId-matchOn-tag");

    //Provide values for thesaurus and filter input fields
    userEvent.type(getByLabelText("customerId-thesaurus-uri-input"), "/thesaurus/uri/sample.json");
    userEvent.type(getByLabelText("customerId-filter-input"), "filterInputText");

    //Expand shipping hierarchy and select street
    userEvent.click(within(getByTestId("mltable-expand-shipping")).getByRole("img"));
    let shippingStreet:any = document.querySelector(`[name="shipping.street"]`);
    userEvent.click(shippingStreet);
    validateMatchOnTag("shipping.street-matchOn-tag");

    //Expand Zip hierarchy and select fiveDigit
    let zip:any = document.querySelector(`[data-row-key="shipping.zip.zip"]`);
    let zipDropdown = within(zip).getByTestId("mltable-expand-zip");
    userEvent.click(within(zipDropdown).getByRole("img"));
    let shippingZipFiveDigit:any = document.querySelector(`[name="shipping.zip.fiveDigit"]`);
    userEvent.click(shippingZipFiveDigit);

    validateMatchOnTag("shipping.zip.fiveDigit-matchOn-tag");

    //Removing the match tag resets the row selection.
    userEvent.click(within(getByLabelText("customerId-matchOn-tag")).getByLabelText("icon: close"));

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

    userEvent.click(getByLabelText("customerId-match-type-dropdown"));
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

    userEvent.type(getByLabelText("rulesetName-input"), "Customer ruleset");

    userEvent.click(getByText("Save"));
    await waitFor(() => {
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

    let customerIdSelectionCheckbox: any =  document.querySelector(`[name="customerId"]`);

    userEvent.click(customerIdSelectionCheckbox);

    expect(queryByLabelText("noPropertyCheckedErrorMessage")).not.toBeInTheDocument(); //Should not be visible since a property is selected now.

    userEvent.click(getByText("Save"));

    expect(getByTestId("customerId-match-type-err")).toBeInTheDocument(); //Indicating that match type must be provided for the selected row.
    expect(toggleModalMock).toHaveBeenCalledTimes(0);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);

    userEvent.click(getByLabelText("customerId-match-type-dropdown"));
    userEvent.click(getByLabelText("exact-option"));

    userEvent.click(getByText("Save"));
    await waitFor(() => {
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

    userEvent.click(getByLabelText("customerId-match-type-dropdown"));
    userEvent.click(getByLabelText("synonym-option"));

    userEvent.click(getByText("Save"));

    expect(getByTestId("customerId-thesaurus-uri-err")).toBeInTheDocument();

    expect(toggleModalMock).toHaveBeenCalledTimes(0);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);

    userEvent.type(getByLabelText("customerId-thesaurus-uri-input"), "/thesaurus/uri/sample.json");

    userEvent.click(getByText("Save"));

    await waitFor(() => {
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

    userEvent.click(getByLabelText("customerId-match-type-dropdown"));
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
    await waitFor(() => expect(queryByTestId("customerId-dictionary-uri-err")).not.toBeInTheDocument());

    userEvent.type(getByLabelText("customerId-distance-threshold-input"), "10");

    userEvent.click(getByText("Save"));

    await waitFor(() => {
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

    userEvent.click(getByLabelText("customerId-match-type-dropdown"));
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
    await waitFor(() => expect(queryByTestId("customerId-uri-err")).not.toBeInTheDocument());

    userEvent.type(getByLabelText("customerId-function-input"), "concat(string1,string2)");

    userEvent.click(getByText("Save"));

    await waitFor(() => {
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

    userEvent.click(getByLabelText("customerId-match-type-dropdown"));
    userEvent.click(getByLabelText("exact-option"));

    expect(toggleModalMock).toHaveBeenCalledTimes(0);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);

    userEvent.click(getByText("Save"));

    await waitFor(() => {
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

    userEvent.click(getByLabelText("customerId-match-type-dropdown"));
    userEvent.click(getByLabelText("zip-option"));

    expect(toggleModalMock).toHaveBeenCalledTimes(0);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);

    userEvent.click(getByText("Save"));

    await waitFor(() => {
      expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
      expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(1);
      expect(toggleModalMock).toHaveBeenCalledTimes(1);
    });
  });

  it("can view modal for existing ruleset with multiple properties", () => {
    mockMatchingUpdate.mockResolvedValueOnce({status: 200, data: {}});
    const toggleModalMock = jest.fn();
    const synonymRulesetMultiple = {
      ...customerMatchingStep.curationOptions.activeStep.stepArtifact.matchRulesets[4],
      index: 0
    };

    const {queryByText, getByText, getByLabelText} =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetMultipleModal
          isVisible={true}
          toggleModal={toggleModalMock}
          editRuleset={synonymRulesetMultiple}
        />
      </CurationContext.Provider>
    );

    expect(queryByText("Edit Match Ruleset for Multiple Properties")).toBeInTheDocument();
    expect(getByLabelText("titleDescription")).toBeInTheDocument();
    expect(getByLabelText("rulesetName-input")).toHaveValue("MultipleRuleset-Customer");
    expect(getByLabelText("reduceToggle")).toBeChecked();

    expect(getByText("Match on:")).toBeInTheDocument();
    expect(getByLabelText("modalTitleLegend")).toBeInTheDocument();

    let customerIdRow: any = document.querySelector(`[data-row-key="customerId"]`);
    let customerIdSelectionCheckbox: any =  document.querySelector(`[name="customerId"]`);

    expect(customerIdSelectionCheckbox).toBeChecked();
    expect(within(customerIdRow).getByTitle("Synonym")).toBeInTheDocument();
    expect(getByLabelText("customerId-thesaurus-uri-input")).toHaveValue("/thesaurus/uri/input.json");
    expect(getByLabelText("customerId-filter-input")).toHaveValue("");
  });
});
