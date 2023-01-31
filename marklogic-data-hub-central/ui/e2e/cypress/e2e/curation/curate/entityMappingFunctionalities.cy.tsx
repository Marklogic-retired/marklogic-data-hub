/// <reference types="cypress"/>

import {Application} from "../../../support/application.config";
import {toolbar} from "../../../support/components/common";
import {mappingStepDetail} from "../../../support/components/mapping/index";
import curatePage from "../../../support/pages/curate";
import browsePage from "../../../support/pages/browse";
import LoginPage from "../../../support/pages/login";
import "cypress-wait-until";

describe("Mapping validations for session storage and table filtering", () => {
  let expandedRowsCount = 0;
  let expandedRows: string[][] = [];

  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.log("**Logging into the app as a developer**");
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Verify 'more'/'less' functionality on filtering by name for structured properties", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
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
    //Saving amount of expanded rows
    mappingStepDetail.getSourceDataExpandedChildRows().then((elems) => expandedRowsCount = elems.length);
    mappingStepDetail.getSourceDataExpandedChildRows().then(($els) => {
      return (
        Cypress.$.makeArray($els)
          .map((el) => expandedRows.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")))
      );
    });

    cy.log("**Go to another page and back**");
    toolbar.getLoadToolbarIcon().click();
    toolbar.getCurateToolbarIcon().click();

    mappingStepDetail.verifyExpandedRows();
    mappingStepDetail.verifyContent("5 / page");
    mappingStepDetail.verifyPageSourceTable("2");
    mappingStepDetail.addFilter("ship");

    cy.log("**Go to another page and back**");
    toolbar.getLoadToolbarIcon().click();
    toolbar.getCurateToolbarIcon().click();
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
    // verify expanded rows exist
    mappingStepDetail.verifyExpandedRows();
    // Go back and validate length
    mappingStepDetail.selectPageSourceTable("1");
    mappingStepDetail.verifyExpandedRows();
    mappingStepDetail.getSourceDataExpandedChildRows().should("have.length", expandedRowsCount);

    cy.log("**Collapse All**");
    mappingStepDetail.collapseAllSourceTable();
    mappingStepDetail.verifyExpandedRows();
    mappingStepDetail.getSourceDataExpandedChildRows().should("have.length", 0);

    cy.log("**Move to the next page, come back and confirm the rows are still collapsed**");
    mappingStepDetail.selectPageSourceTable("2");
    // verify expanded rows exist
    mappingStepDetail.verifyExpandedRows();
    // Go back and validate length
    mappingStepDetail.selectPageSourceTable("1");
    mappingStepDetail.verifyExpandedRows();
    mappingStepDetail.getSourceDataExpandedChildRows().should("have.length", 0);
  });
  it("Validate Data Source Filter persists when navigating between pages", () => {
    toolbar.getCurateToolbarIcon().click();
    browsePage.waitForSpinnerToDisappear();
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

});