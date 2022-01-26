import {Application} from "../../support/application.config";
import browsePage from "../../support/pages/browse";
import {toolbar} from "../../support/components/common";
import LoginPage from "../../support/pages/login";
import monitorPage from "../../support/pages/monitor";

/**
 * NOTE: This test will involve all operations related to the views selector.
 */

describe("Test '/Explore' view selector", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);

    cy.log("**Logging into the app as a developer**");
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    Cypress.Cookies.preserveOnce("HubCentralSession");
    cy.restoreLocalStorage();
  });
  it(`Validate that the 'graph' view is shown and stored in the user preference`, () => {
    cy.log(`**Go to Explore section?**`);
    toolbar.getExploreToolbarIcon().click();

    cy.log(`**Selecting 'Graph' view**`);
    browsePage.viewSelector("graph").should("be.visible").click();
    browsePage.getGraphVisExploreContainer().should("be.visible");

    cy.log(`**Go to Monitor section**`);
    toolbar.getMonitorToolbarIcon().click();
    monitorPage.getMonitorContainer().should("be.visible");

    cy.log(`**Return to Explore section**`);
    toolbar.getExploreToolbarIcon().click();
    browsePage.getGraphVisExploreContainer().should("be.visible");

    cy.log(`**Select 'All Data' button**`);
    browsePage.getAllDataButton().click();

    cy.log(`**Select 'Entities' button**`);
    browsePage.getEntities().click();
    browsePage.getGraphVisExploreContainer().should("be.visible");
  });
  it(`Validate that the 'table' view is shown and stored in the user preference`, () => {
    cy.log(`**Go to Explore section**`);
    toolbar.getExploreToolbarIcon().click();

    cy.log(`**Selecting 'Table' view**`);
    browsePage.viewSelector("table").should("be.visible").click();
    browsePage.getMainTableContainer().should("be.visible");

    cy.log(`**Go to Monitor section**`);
    toolbar.getMonitorToolbarIcon().click();
    monitorPage.getMonitorContainer().should("be.visible");

    cy.log(`**Return to Explore section**`);
    toolbar.getExploreToolbarIcon().click();
    browsePage.getMainTableContainer().should("be.visible");

    cy.log(`**Select 'All Data' button**`);
    browsePage.getAllDataButton().click();

    cy.log(`**Select 'Entities' button**`);
    browsePage.getEntities().click();
    browsePage.getMainTableContainer().should("be.visible");
  });
  it(`Validate that the 'Snippet' view is shown and stored in the user preference`, () => {
    cy.log(`**Go to Explore section?**`);
    toolbar.getExploreToolbarIcon().click();

    cy.log(`**Selecting 'Snippet' view**`);
    browsePage.viewSelector("snippet").should("be.visible").click();
    browsePage.getSnippetContainer().should("be.visible");

    cy.log(`**Go to Monitor section**`);
    toolbar.getMonitorToolbarIcon().click();
    monitorPage.getMonitorContainer().should("be.visible");

    cy.log(`**Return to Explore section**`);
    toolbar.getExploreToolbarIcon().click();
    browsePage.getSnippetContainer().should("be.visible");

    cy.log(`**Select 'All Data' button**`);
    browsePage.getAllDataButton().click();

    cy.log(`**Select 'Entities' button**`);
    browsePage.getEntities().click();
    browsePage.getSnippetContainer().should("be.visible");
  });

});