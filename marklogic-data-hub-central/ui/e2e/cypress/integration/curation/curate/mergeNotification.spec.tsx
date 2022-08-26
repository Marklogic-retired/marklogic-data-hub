import {Application} from "../../../support/application.config";
import {toolbar} from "../../../support/components/common";
import "cypress-wait-until";
import LoginPage from "../../../support/pages/login";
import browsePage from "../../../support/pages/browse";
import explorePage from "../../../support/pages/explore";
import runPage from "../../../support/pages/run";
import {compareValuesModal} from "../../../support/components/matching";

describe("Merge Notification Functionality From Explore Card View", () => {

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
  it("Run Match and Merge steps to generate Notifcation Docs", () => {
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    runPage.getFlowName("personJSON").should("be.visible");
    runPage.toggleExpandFlow("personJSON");
    cy.log("** Run Match and Merge Steps **");
    runPage.runStep("match-person", "personJSON");
    runPage.verifyStepRunResult("match-person", "success");
    runPage.getDocumentsWritten("match-person").should("be.greaterThan", 0);
    runPage.closeFlowStatusModal("personJSON");
    runPage.runStep("merge-person", "personJSON");
    runPage.verifyStepRunResult("merge-person", "success");
    runPage.getDocumentsWritten("merge-person").should("be.greaterThan", 0);
    runPage.closeFlowStatusModal("personJSON");
  });
  it("Navigate to Explore tile All Data View", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    explorePage.getAllDataButton().click();
    cy.log("**filter for notification collection and verify merge icon**");
    explorePage.scrollSideBarBottom();
    browsePage.getCollectionPopover().scrollIntoView().click();
    browsePage.collectionPopoverInput().type("notification");
    browsePage.getPopoverFacetCheckbox("sm-Person-notification").click();
    browsePage.submitPopoverSearch();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    cy.wait(2000);
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    browsePage.getMergeIcon().should("be.visible");

    browsePage.getMergeIcon().first().click();
    compareValuesModal.getModal().should("be.visible");

    cy.log("** verify match coloring **");
    cy.findByTitle("fname").should("have.css", "background-color", "rgb(133, 191, 151)");
    cy.findByTitle("lname").should("have.css", "background-color", "rgb(133, 191, 151)");
    cy.findByTitle("Address").should("have.css", "background-color", "rgb(133, 191, 151)");
    cy.findByTitle("ZipCode").should("not.have.css", "background-color", "rgb(133, 191, 151)");

    compareValuesModal.getMergeButton().should("be.visible");

    cy.log("** cancel button closes modal **");
    compareValuesModal.getCancelButton().click();
    compareValuesModal.getModal().should("not.exist");
    browsePage.getMergeIcon().first().click();

    cy.log("** verify match coloring when reopening modal **");
    cy.findByTitle("fname").should("have.css", "background-color", "rgb(133, 191, 151)");
    cy.findByTitle("lname").should("have.css", "background-color", "rgb(133, 191, 151)");
    cy.findByTitle("Address").should("have.css", "background-color", "rgb(133, 191, 151)");
    cy.findByTitle("ZipCode").should("not.have.css", "background-color", "rgb(133, 191, 151)");

    compareValuesModal.getMergeButton().click();
    compareValuesModal.confirmationYes().click();
    compareValuesModal.getModal().should("not.exist");
  });
});
