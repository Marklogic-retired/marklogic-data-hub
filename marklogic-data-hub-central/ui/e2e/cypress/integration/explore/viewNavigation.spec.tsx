import {toolbar} from "../../support/components/common";
import browsePage from "../../support/pages/browse";
import graphExplore from "../../support/pages/graphExplore";
import LoginPage from "../../support/pages/login";

describe("Navigation through all the Explore views (Table, Snippet, Graph)", () => {
  before(() => {
    cy.visit("/");

    cy.log("**Logging into the app as a developer**");
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });
  before(() => {
    cy.log("**Navigate to Explore**");
    toolbar.getExploreToolbarIcon().click();
    browsePage.waitForSpinnerToDisappear();
  });

  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    Cypress.Cookies.preserveOnce("HubCentralSession");
    cy.restoreLocalStorage();
  });

  it("Switch views and validate they get updated correctly", () => {
    cy.wait(2000);
    cy.log("**Select Table view and validate it switches correctly**");
    browsePage.clickSwitchToTableView();
    //Graph and table should not appear anymore
    graphExplore.getGraphVisCanvas().should("not.exist");
    browsePage.getSnippetViewResult().should("not.exist");
    browsePage.getTotalDocuments().should("exist").should("be.greaterThan", 25);

    cy.log("**Go to Snippet View**");
    browsePage.clickSnippetView();
    //Graph and table should not appear anymore
    graphExplore.getGraphVisCanvas().should("not.exist");
    browsePage.getHCTableRows().should("not.exist");
    browsePage.getSnippetViewResult().should("be.visible");

    cy.log("**Go to graph view**");
    browsePage.clickGraphView();
    graphExplore.getGraphVisCanvas().should("be.visible");
    graphExplore.stopStabilization();
    //Table and snippet view should not appear anymore
    browsePage.getSnippetViewResult().should("not.exist");
    browsePage.getHCTableRows().should("not.exist");

  });
});