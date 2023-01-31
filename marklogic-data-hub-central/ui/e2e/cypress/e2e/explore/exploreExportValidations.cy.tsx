import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import browsePage from "../../support/pages/browse";
import graphExplore from "../../support/pages/graphExplore";
import LoginPage from "../../support/pages/login";

describe("Test graph export to png", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);

    cy.log("**Logging into the app as a developer**");
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
  });
  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  const entity: string = "Order";

  it("Validate export as CSV in the table view", () => {
    cy.log("**Go to Explore section**");
    toolbar.getExploreToolbarIcon().click();
    browsePage.getTableView().click();
    cy.log("**Graph Export button should not exist in table view**");
    graphExplore.getExportPNGIcon().should("not.exist");
    cy.log("**Export as CSV should exist under All Entities **");
    browsePage.getDataExportIcon()
      .scrollIntoView()
      .should("exist")
      .trigger("mouseover");
    browsePage.getExportIconTooltip().should("exist");


    cy.log("**Export button should still exist after selecting a single entity**");
    browsePage.selectBaseEntity(entity);
    browsePage.waitForSpinnerToDisappear();
    browsePage.getDataExportIcon()
      .scrollIntoView()
      .should("exist")
      .trigger("mouseover");
    browsePage.getExportIconTooltip().should("exist");
  });

  it("Validate that the export png icon appear only in graph view and can export", () => {

    cy.log("**Select Graph view and check that the export button exist and show the tooltip**");
    browsePage.clickGraphView();
    graphExplore.getExportPNGIcon()
      .scrollIntoView()
      .should("exist")
      .trigger("mouseover");
    graphExplore.getExportPNGIconTooltip().should("exist");

    cy.log("**Export cSV button should not exist in snippet, graph and table view**");
    browsePage.getDataExportIcon().should("not.exist");

    cy.log("**Click on export button and check that file it's exported**");

    //To test graph view model png is downloaded successfully
    if (Cypress.isBrowser("!firefox")) {
      graphExplore.getExportPNGIcon().click({force: true}).then(
        () => {
          cy.readFile("./cypress/downloads/graph-view-explore.png", "base64").then(
            (downloadPng) => {
              expect(downloadPng).exist;
            });
        });
    }
  });
});