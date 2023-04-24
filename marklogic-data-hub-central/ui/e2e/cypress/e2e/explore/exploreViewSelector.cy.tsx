import table from "../../support/components/common/tables";
import {toolbar} from "../../support/components/common";
import monitorPage from "../../support/pages/monitor";
import explorePage from "../../support/pages/explore";
import browsePage from "../../support/pages/browse";
import LoginPage from "../../support/pages/login";


describe("Test '/Explore' view selector", () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
    LoginPage.navigateToMainPage();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  it(`Validate that the 'graph' view is shown and stored in the user preference`, () => {
    cy.log(`**Go to Explore section?**`);
    toolbar.getExploreToolbarIcon().click();

    cy.log(`**Selecting 'Graph' view**`);
    browsePage.switchView("graph");
    explorePage.getGraphVisExploreContainer().should("be.visible");

    cy.log(`**Go to Monitor section**`);
    toolbar.getMonitorToolbarIcon().click();
    monitorPage.getMonitorContainer().should("be.visible");

    cy.log(`**Return to Explore section**`);
    toolbar.getExploreToolbarIcon().click();
    explorePage.getGraphVisExploreContainer().should("be.visible");

    cy.log(`**Select 'All Data' button**`);
    explorePage.getAllDataButton().click();

    cy.log(`**Select 'Entities' button**`);
    explorePage.getEntities().click();
    explorePage.getGraphVisExploreContainer().should("be.visible");
  });

  it(`Validate that the 'table' view is shown and stored in the user preference`, () => {
    cy.log(`**Go to Explore section**`);
    toolbar.getExploreToolbarIcon().click();

    cy.log(`**Selecting 'Table' view**`);
    browsePage.switchView("table");
    table.getMainTableContainer().should("be.visible");

    cy.log(`**Go to Monitor section**`);
    toolbar.getMonitorToolbarIcon().click();
    monitorPage.getMonitorContainer().should("be.visible");

    cy.log(`**Return to Explore section**`);
    toolbar.getExploreToolbarIcon().click();
    table.getMainTableContainer().should("be.visible");

    cy.log(`**Select 'All Data' button**`);
    explorePage.getAllDataButton().click();

    cy.log(`**Select 'Entities' button**`);
    explorePage.getEntities().click();
    table.getMainTableContainer().should("be.visible");
  });

  it(`Persist table items`, () => {
    cy.log(`**expands item**`);
    browsePage.expandItemTableView("/json/persons/last-name-dob-custom1.json");

    cy.log(`**Go to Monitor section**`);
    toolbar.getMonitorToolbarIcon().click();
    monitorPage.getMonitorContainer().should("be.visible");

    cy.log(`**Return to Explore section**`);
    toolbar.getExploreToolbarIcon().click();
    browsePage.switchView("table");
    table.getMainTableContainer().should("be.visible");

    cy.log(`**table view item is still spanded**`);
    cy.findByText("Alice").should("be.visible");
  });

  it(`Validate that the 'Snippet' view is shown and stored in the user preference`, () => {
    cy.log(`**Go to Explore section?**`);
    toolbar.getExploreToolbarIcon().click();

    cy.log(`**Selecting 'Snippet' view**`);
    browsePage.switchView("snippet");
    browsePage.getSnippetContainer().should("be.visible");

    cy.log(`**Go to Monitor section**`);
    toolbar.getMonitorToolbarIcon().click();
    monitorPage.getMonitorContainer().should("be.visible");

    cy.log(`**Return to Explore section**`);
    toolbar.getExploreToolbarIcon().click();
    browsePage.getSnippetContainer().should("be.visible");

    cy.log(`**Select 'All Data' button**`);
    explorePage.getAllDataButton().click();

    cy.log(`**Select 'Entities' button**`);
    explorePage.getEntities().click();
    browsePage.getSnippetContainer().should("be.visible");
  });

  it(`persist snippet items`, () => {
    cy.log(`**expands item**`);
    browsePage.expandItemSnippetView("Person", "/json/persons/last-name-dob-custom1.json");

    cy.log(`**Go to Monitor section**`);
    toolbar.getMonitorToolbarIcon().click();
    monitorPage.getMonitorContainer().should("be.visible");

    cy.log(`**Return to Explore section**`);
    toolbar.getExploreToolbarIcon().click();
    browsePage.switchView("snippet");
    browsePage.getSnippetContainer().should("be.visible");

    cy.log(`**snippet item is still spanded**`);
    browsePage.getSnippetItem("/json/persons/last-name-dob-custom1.json").should("be.visible");
  });

});
