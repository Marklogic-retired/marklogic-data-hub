import {createEditStepDialog} from "../../../support/components/common";
import {advancedSettingsDialog, mappingStepDetail} from "../../../support/components/mapping/index";
import curatePage from "../../../support/pages/curate";
import browsePage from "../../../support/pages/browse";
import loadPage from "../../../support/pages/load";

import "cypress-wait-until";

describe("Mapping validations for session storage and table filtering", () => {
  let expandedRowsCount = 0;
  let expandedRows: string[][] = [];

  before(() => {
    cy.loginAsDeveloper().withRequest();
    curatePage.navigate();
  });

  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Verify 'more'/'less' functionality on filtering by name for structured properties", () => {
    mappingStepDetail.customerEntity().click();
    mappingStepDetail.getEditStepSettingsButton("mapCustomersJSON").click();
    mappingStepDetail.getCollectionInputValue().should("have.value", "loadCustomersJSON");
    curatePage.openMappingStepDetail("Customer", "mapCustomersJSON");
    browsePage.waitForSpinnerToDisappear();
    curatePage.scrollEntityContainer();
    mappingStepDetail.searchIcon("Customer").click({force: true});
    mappingStepDetail.searchName().type("street");
    mappingStepDetail.searchButton().click();
    cy.findAllByText("more").should("have.length.gt", 1);
    cy.findAllByText("more").first().click();
    cy.findByText("less").should("be.visible");
  });

  it("Validate session storage is working for source table", () => {
    mappingStepDetail.expandDropdownPagination();
    mappingStepDetail.selectPagination("5 / page");
    mappingStepDetail.expandAllSourceTable();
    mappingStepDetail.verifyExpandedRows();
    mappingStepDetail.getSourceDataExpandedChildRows().then((elems) => expandedRowsCount = elems.length);
    mappingStepDetail.getSourceDataExpandedChildRows().then(($els) => {
      return (
        Cypress.$.makeArray($els)
          .map((el) => expandedRows.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")))
      );
    });

    cy.log("**Go to another page and back**");
    loadPage.navigate();
    curatePage.navigate();

    mappingStepDetail.verifyExpandedRows();
    mappingStepDetail.verifyContent("5 / page");
    mappingStepDetail.verifyPageSourceTable("2");
    mappingStepDetail.addFilter("ship");

    cy.log("**Go to another page and back**");
    loadPage.navigate();
    curatePage.navigate();
    mappingStepDetail.verifyFilter();
    mappingStepDetail.resetSourceSearch().should("be.visible").click();
  });

  it("Validate ''Expand All' and 'Collapse All' when moving through the pages", () => {
    cy.log("**Expand all and validate number of shown rows**");
    mappingStepDetail.expandAllSourceTable();
    mappingStepDetail.verifyExpandedRows();
    mappingStepDetail.getSourceDataExpandedChildRows().should("have.length", expandedRowsCount);

    cy.log("**Move to another page, come back and confirm the rows are still expanded**");
    mappingStepDetail.selectPageSourceTable("2");
    mappingStepDetail.verifyExpandedRows();
    mappingStepDetail.selectPageSourceTable("1");
    mappingStepDetail.verifyExpandedRows();
    mappingStepDetail.getSourceDataExpandedChildRows().should("have.length", expandedRowsCount);

    cy.log("**Collapse All**");
    mappingStepDetail.collapseAllSourceTable();
    mappingStepDetail.verifyExpandedRows();
    mappingStepDetail.getSourceDataExpandedChildRows().should("have.length", 0);

    cy.log("**Move to the next page, come back and confirm the rows are still collapsed**");
    mappingStepDetail.selectPageSourceTable("2");
    mappingStepDetail.verifyExpandedRows();
    mappingStepDetail.selectPageSourceTable("1");
    mappingStepDetail.verifyExpandedRows();
    mappingStepDetail.getSourceDataExpandedChildRows().should("have.length", 0);
  });

  it("Validate Data Source Filter persists when navigating between pages", () => {
    curatePage.navigate();
    mappingStepDetail.expandAllSourceTable();
    mappingStepDetail.getSourceDataExpandedRows().should("be.visible");

    cy.log("**Set pagination to '1'**");
    mappingStepDetail.expandDropdownPagination();
    mappingStepDetail.selectPagination("1 / page");

    cy.log("**Set filter on Source Data for 'Name'**");
    mappingStepDetail.addFilter("Name");

    cy.log("**Verify expanded rows contain the filter**");
    mappingStepDetail.getHighlightedWordInSourceData().each(($el) => {
      let text = $el.text().toLowerCase();
      expect(text).to.contain("name");
    });

    cy.log("**Move to the next page and come back**");
    mappingStepDetail.selectPageSourceTable("2");
    mappingStepDetail.getHighlightedWordInSourceData().each(($el) => {
      let text = $el.text().toLowerCase();
      expect(text).to.contain("name");
    });
  });

  it("Check collection Typeahead request when source database is changed", () => {
    cy.visit("/tiles-curate");
    cy.waitForAsyncRequest();
    curatePage.toggleEntityTypeId("Order");
    curatePage.addNewStep("Order").click();
    createEditStepDialog.stepNameInput().type("testName", {timeout: 2000});

    cy.log("**verify typehead is requesting to staging db**");
    cy.intercept("POST", "api/entitySearch/facet-values?database=staging").as("stagingRequest1");
    createEditStepDialog.setCollectionInput("ABC");
    cy.wait("@stagingRequest1");


    cy.log("**verify typehead is requesting to staging db when source DB is changed**");
    createEditStepDialog.getAdvancedTab().click();
    advancedSettingsDialog.setSourceDatabase("data-hub-FINAL");
    createEditStepDialog.getBasicTab().click();
    cy.intercept("POST", "api/entitySearch/facet-values?database=final").as("finalRequest1");
    createEditStepDialog.setCollectionInput("D");
    cy.wait("@finalRequest1");
    createEditStepDialog.saveButton("mapping").click();
    cy.findByLabelText("Back").click();

    cy.log("**verify typehead request when the step is already created**");
    curatePage.editStep("testName").click();
    cy.intercept("POST", "api/entitySearch/facet-values?database=final").as("finalRequest2");
    createEditStepDialog.setCollectionInput("E");
    cy.wait("@finalRequest2");
    createEditStepDialog.getAdvancedTab().click();
    advancedSettingsDialog.setSourceDatabase("data-hub-STAGING");
    createEditStepDialog.getBasicTab().click();
    cy.intercept("POST", "api/entitySearch/facet-values?database=staging").as("stagingRequest2");
    createEditStepDialog.setCollectionInput("F");
    cy.wait("@stagingRequest2");
    createEditStepDialog.saveButton("mapping").click();
    curatePage.deleteMappingStepButton("testName").click();
    curatePage.deleteConfirmation("Yes").click();
  });
});