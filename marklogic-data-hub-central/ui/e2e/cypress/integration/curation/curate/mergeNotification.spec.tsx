import {Application} from "../../../support/application.config";
import {toolbar} from "../../../support/components/common";
import "cypress-wait-until";
import LoginPage from "../../../support/pages/login";
// import browsePage from "../../../support/pages/browse";
import explorePage from "../../../support/pages/explore";
import runPage from "../../../support/pages/run";

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
    // browsePage.getShowMoreLink("collection").click();
    // browsePage.getFacetItemCheckbox("collection", "sm-Person-notification").scrollIntoView().click({force: true});
    // browsePage.getSelectedFacets().should("exist");
    // browsePage.getFacetApplyButton().click();
    // browsePage.waitForSpinnerToDisappear();
    // browsePage.getMergeIcon().should("be.visible");
  });
});
