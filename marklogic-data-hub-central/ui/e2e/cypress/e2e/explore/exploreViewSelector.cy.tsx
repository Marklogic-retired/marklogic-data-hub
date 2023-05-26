import entitiesSidebar from "../../support/pages/entitiesSidebar";
import table from "../../support/components/common/tables";
import monitorPage from "../../support/pages/monitor";
import explorePage from "../../support/pages/explore";
import browsePage from "../../support/pages/browse";
describe("Test '/Explore' view selector", () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
    explorePage.navigate();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  it(`Validate that the 'graph' view is shown and stored in the user preference`, () => {
    cy.log(`**Go to Explore section?**`);
    explorePage.navigate();

    cy.log(`**Selecting 'Graph' view**`);
    browsePage.switchView("graph");
    explorePage.getGraphVisExploreContainer().should("be.visible");

    cy.log(`**Go to Monitor section**`);
    monitorPage.navigate();
    monitorPage.getMonitorContainer().should("be.visible");

    cy.log(`**Return to Explore section**`);
    explorePage.navigate();
    explorePage.getGraphVisExploreContainer().should("be.visible");

    cy.log(`**Select 'All Data' button**`);
    explorePage.getAllDataButton().click();

    cy.log(`**Select 'Entities' button**`);
    explorePage.getEntities().click();
    explorePage.getGraphVisExploreContainer().should("be.visible");
  });

  it(`Validate that the 'table' view is shown and stored in the user preference`, () => {
    cy.log(`**Go to Explore section**`);
    explorePage.navigate();

    cy.log(`**Selecting 'Table' view**`);
    browsePage.switchView("table");
    table.getMainTableContainer().should("be.visible");

    cy.log(`**Go to Monitor section**`);
    monitorPage.navigate();
    monitorPage.getMonitorContainer().should("be.visible");

    cy.log(`**Return to Explore section**`);
    explorePage.navigate();
    table.getMainTableContainer().should("be.visible");

    cy.log(`**Select 'All Data' button**`);
    explorePage.getAllDataButton().click();

    cy.log(`**Select 'Entities' button**`);
    explorePage.getEntities().click();
    table.getMainTableContainer().should("be.visible");
  });

  it(`Persist table items`, () => {
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Office");
    cy.log(`**expands item**`);
    browsePage.expandItemTableView("/xml/persons/ssn-match1.xml");

    cy.log(`**Go to Monitor section**`);
    monitorPage.navigate();
    monitorPage.getMonitorContainer().should("be.visible");

    cy.log(`**Return to Explore section**`);
    explorePage.navigate();
    browsePage.switchView("table");
    table.getMainTableContainer().should("be.visible");

    cy.log(`**table view item is still expanded**`);
    cy.findByText("Jane").should("be.visible");
  });

  it(`Validate that the 'Snippet' view is shown and stored in the user preference`, () => {
    cy.log(`**Go to Explore section?**`);
    explorePage.navigate();

    cy.log(`**Selecting 'Snippet' view**`);
    browsePage.switchView("snippet");
    browsePage.getSnippetContainer().should("be.visible");

    cy.log(`**Go to Monitor section**`);
    monitorPage.navigate();
    monitorPage.getMonitorContainer().should("be.visible");

    cy.log(`**Return to Explore section**`);
    explorePage.navigate();
    browsePage.getSnippetContainer().should("be.visible");

    cy.log(`**Select 'All Data' button**`);
    explorePage.getAllDataButton().click();

    cy.log(`**Select 'Entities' button**`);
    explorePage.getEntities().click();
    browsePage.getSnippetContainer().should("be.visible");
  });

  it(`persist snippet items`, () => {
    cy.log(`**expands item**`);
    browsePage.expandItemSnippetView("Person", "/xml/persons/ssn-match1.xml");

    cy.log(`**Go to Monitor section**`);
    monitorPage.navigate();
    monitorPage.getMonitorContainer().should("be.visible");

    cy.log(`**Return to Explore section**`);
    explorePage.navigate();
    browsePage.switchView("snippet");
    browsePage.getSnippetContainer().should("be.visible");

    cy.log(`**snippet item is still expanded**`);
    browsePage.getSnippetItem("/xml/persons/ssn-match1.xml").should("be.visible");
  });
});
