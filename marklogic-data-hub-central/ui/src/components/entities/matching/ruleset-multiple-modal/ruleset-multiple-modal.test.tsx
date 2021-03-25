import React from "react";
import {act, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RulesetMultipleModal from "./ruleset-multiple-modal";

import {CurationContext} from "../../../../util/curation-context";
import {updateMatchingArtifact} from "../../../../api/matching";
import {customerMatchingStep} from "../../../../assets/mock-data/curation/curation-context-mock";
import {within} from "@testing-library/dom";

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

    userEvent.click(screen.getByLabelText("customerId,0-match-type-dropdown"));
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

    userEvent.click(screen.getByLabelText("customerId,0-match-type-dropdown"));
    userEvent.click(screen.getByLabelText("synonym-option"));
    expect(screen.getByLabelText("customerId,0-thesaurus-uri-input")).toBeInTheDocument();
    expect(screen.getByLabelText("customerId,0-filter-input")).toBeInTheDocument();

    userEvent.click(screen.getByLabelText("doubleMetaphone-option"));
    expect(screen.getByLabelText("customerId,0-dictionary-uri-input")).toBeInTheDocument();
    expect(screen.getByLabelText("customerId,0-distance-threshold-input")).toBeInTheDocument();

    userEvent.click(screen.getByLabelText("synonym-option"));
    expect(screen.getByLabelText("customerId,0-thesaurus-uri-input")).toBeInTheDocument();
    expect(screen.getByLabelText("customerId,0-filter-input")).toBeInTheDocument();

    userEvent.click(screen.getByLabelText("custom-option"));
    expect(screen.getByLabelText("customerId,0-uri-input")).toBeInTheDocument();
    expect(screen.getByLabelText("customerId,0-function-input")).toBeInTheDocument();
    expect(screen.getByLabelText("customerId,0-namespace-input")).toBeInTheDocument();

    userEvent.click(getByText("Cancel"));
    expect(screen.getByLabelText("confirm-body")).toBeInTheDocument();
    userEvent.click(screen.getByText("Yes"));

    expect(toggleModalMock).toHaveBeenCalledTimes(1);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);
  });

  it("can select properties using row selection checkboxes", async () => {
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

    let customerId = document.querySelector(`[name="customerId,0"]`);
    let name = document.querySelector(`[name="name,1"]`);
    let nicknames = document.querySelector(`[name="nicknames,2"]`);

    //All properties are not checked by default
    expect(customerId).not.toBeChecked();
    expect(name).not.toBeChecked();
    expect(nicknames).not.toBeChecked();
    expect(document.querySelector(`[name="shipping,300"]`)).not.toBeInTheDocument();
    expect(document.querySelector(`[name="billing,300"]`)).not.toBeInTheDocument();

    let selectAllCheckbox:any = document.querySelector(".ant-table-thead .ant-checkbox-input");
    expect(selectAllCheckbox).not.toBeChecked();
    userEvent.click(selectAllCheckbox);

    // Check if all the properties are selected now.
    expect(customerId).toBeChecked();
    expect(name).toBeChecked();
    expect(nicknames).toBeChecked();

    //Expand shipping hierarchy and see that they are checked
    userEvent.click(within(getByTestId("mltable-expand-shipping")).getByRole("img"));
    expect(document.querySelector(`[name="shipping,300"]`)).toBeChecked(); //ShippingStreet
    expect(document.querySelector(`[name="shipping,310"]`)).toBeChecked(); //ShippingCity
    expect(document.querySelector(`[name="shipping,320"]`)).toBeChecked(); // ShippingState

    let zip:any = document.querySelector(`[data-row-key="zip,31"]`);
    let zipDropdown = within(zip).getByTestId("mltable-expand-zip");
    userEvent.click(within(zipDropdown).getByRole("img"));

    expect(document.querySelector(`[name="zip,301"]`)).toBeChecked(); //Shipping > Zip > fiveDigit
    expect(document.querySelector(`[name="zip,311"]`)).toBeChecked(); //Shipping > Zip > plusFour

    //Expand Billing hierarchy and see that they are checked
    userEvent.click(within(getByTestId("mltable-expand-billing")).getByRole("img"));
    expect(document.querySelector(`[name="billing,400"]`)).toBeChecked(); //BillingStreet
    expect(document.querySelector(`[name="billing,410"]`)).toBeChecked(); //BillingCity
    expect(document.querySelector(`[name="billing,420"]`)).toBeChecked(); // BillingState

    let billingZip:any = document.querySelector(`[data-row-key="zip,41"]`);
    let billingZipDropdown = within(billingZip).getByTestId("mltable-expand-zip");
    userEvent.click(within(billingZipDropdown).getByRole("img"));

    expect(document.querySelector(`[name="zip,401"]`)).toBeChecked(); //Billing > Zip > fiveDigit
    expect(document.querySelector(`[name="zip,411"]`)).toBeChecked(); //Billing > Zip > plusFour

  });
});
