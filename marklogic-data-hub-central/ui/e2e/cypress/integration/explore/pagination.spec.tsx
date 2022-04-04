/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import {Application} from "../../support/application.config";
import "cypress-wait-until";
import LoginPage from "../../support/pages/login";
import table from "../../support/components/common/tables";
import entitiesSidebar from "../../support/pages/entitiesSidebar";

describe("Validate scenarios for pagination in the explore page table", () => {
  let firstPageTableCells: any[] = [];

  before(() => {
    cy.log("**Go to the Home Page and log into the app**");
    cy.visit("/");
    cy.contains(Application.title);

    //Loggin into the app
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();

    //Saving Local Storage to preserve session
    cy.saveLocalStorage();

    cy.log("**Go to Explore page and select the table view option**");
    cy.visit("/tiles/explore");
    cy.wait(4000);
    browsePage.getTableView().click();
    table.mainTable.should("be.visible");
    table.getTableRows().should("not.be.empty");

    cy.log("**Saving table rows text from the first page");
    table.getTableRows().should("not.be.empty");
    // get rows from the table first page
    table.getTableRows().then(($els) => {
      // get inner text from each row
      return (
        Cypress.$.makeArray($els)
          .map((el) => firstPageTableCells.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")))
      );
    });

  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage();
  });
  after(() => {
    cy.resetTestUser();
  });

  it("Change page number and verify the updated result", () => {
    cy.log("**Go to page number 2**");
    browsePage.clickPaginationItem(2);
    table.getTableRows().should("not.be.empty");

    cy.log("**Validate that elements from page 1 do not exist on page 2**");
    //get the second page rows
    table.getTableRows().each((item, i) => {
      expect(item).to.not.equal(firstPageTableCells[i]);
    });

  });
  it("Change page size and validate it gets updated correctly", () => {
    cy.log("**Go back to page number 1**");
    browsePage.clickPaginationItem(1);
    table.getTableRows().should("not.be.empty");
    table.getTableRows().should("have.length", 20);

    cy.log("**Change page size to 10 and validate total number of elements shown at the top it's accurate**");
    browsePage.getTotalDocuments().then(val => {
      browsePage.scrollToBottom();
      browsePage.getPaginationPageSizeOptions().select("10 / page", {force: true});
      cy.contains("Showing 1-10 of ");
      browsePage.getTotalDocuments().should("be.equal", val);
    });
    table.getTableRows().should("have.length", 10);
  });
  it("Verify page number persists when navigating back from detail view", () => {
    cy.log("**Select 'Order' and 'BabyRegistry' entity**");
    //Select Order
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Order");
    entitiesSidebar.getBaseEntityOption("Order").should("be.visible");
    table.getTableRows().should("not.be.empty");
    //Select BabyRegistry so that we have more than 10 records
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("BabyRegistry");
    entitiesSidebar.getBaseEntityOption("BabyRegistry").should("be.visible");
    browsePage.waitForSpinnerToDisappear();
    table.getTableRows().should("not.be.empty");

    cy.log("**Change page size to 10**");
    browsePage.scrollToBottom();
    browsePage.getPaginationPageSizeOptions().select("10 / page", {force: true});
    table.getTableRows().should("have.length", 10);

    cy.log("**Go to page number 2**");
    browsePage.clickPaginationItem(2);
    table.getTableRows().should("not.be.empty");

    cy.log("**Go back to 'All Entities'**");
    //Select All Entities
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
    entitiesSidebar.getBaseEntityOption("All Entities").should("be.visible");
    table.getTableRows().should("not.be.empty");

    cy.log("**Validate that when going back to 'All Entities' the active page it's now the first one again**");
    table.getActiveTablePage().should("contain", "1");
  });

});
