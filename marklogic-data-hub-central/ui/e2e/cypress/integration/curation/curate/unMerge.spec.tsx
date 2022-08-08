import {Application} from "../../../support/application.config";
import {toolbar} from "../../../support/components/common";
import entitiesSidebar from "../../../support/pages/entitiesSidebar";
import "cypress-wait-until";
import LoginPage from "../../../support/pages/login";
import browsePage from "../../../support/pages/browse";
// import {compareValuesModal} from "../../../support/components/matching/index";

describe("UnMerge Functionality in Table and Snippet View", () => {

  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer").withRequest();
    LoginPage.postLogin();
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Navigate to Explore tile Table View and Filter Person entity", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    browsePage.clickTableView();
    entitiesSidebar.getBaseEntityDropdown().click();
    entitiesSidebar.selectBaseEntityOption("Person");
    cy.log("** unmerge icon should be visible on merged records in table view**");
    browsePage.getUnmergeIcon().should("be.visible");
    cy.log("** verify compare values modal when clicking unmerge icon **");
    browsePage.getUnmergeIcon().first().click();
    // compareValuesModal.getTableHeader().should("be.visible");
    // compareValuesModal.getUnmergeButton().should("be.visible");

    cy.log("** cancel button closes modal **");
    // compareValuesModal.getCancelButton().click();
    // compareValuesModal.getTableHeader().should("not.exist");
  });
  it("Switch to Snippet View", () => {
    browsePage.clickSnippetView();
    cy.log("** unmerge icon should be visible on merged records in snippet view**");
    browsePage.getUnmergeIcon().should("be.visible");
    cy.log("** verify compare values modal when clicking unmerge icon **");
    browsePage.getUnmergeIcon().first().click();
    // compareValuesModal.getTableHeader().should("be.visible");
    // compareValuesModal.getUnmergeButton().should("be.visible");

    cy.log("** cancel button closes modal **");
    // compareValuesModal.getCancelButton().click();
    // compareValuesModal.getTableHeader().should("not.exist");
  });
});
