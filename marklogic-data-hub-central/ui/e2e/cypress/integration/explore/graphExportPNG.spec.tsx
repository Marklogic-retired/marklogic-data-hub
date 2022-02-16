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
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    Cypress.Cookies.preserveOnce("HubCentralSession");
    cy.restoreLocalStorage();
  });

  it("Validate that the export png icon appear only in graph view and can export", () => {
    cy.log("**Go to Explore section**");
    toolbar.getExploreToolbarIcon().click();

    cy.log("**Export button should not exist in snippet and table view**");
    browsePage.clickFacetView();
    graphExplore.getExportPNGIcon().should("not.exist");
    browsePage.clickTableView();
    graphExplore.getExportPNGIcon().should("not.exist");

    cy.log("**Select Graph view and check that the export button exist and show the tooltip**");
    browsePage.clickGraphView();
    graphExplore.getExportPNGIcon()
      .scrollIntoView()
      .should("exist")
      .trigger("mouseover");
    graphExplore.getExportPNGIconTooltip().should("exist");

    cy.log("**Click on export button and check that file it's exported**");
    graphExplore.getExportPNGIcon().click({force: true}).then(
      () => {
        cy.readFile("./cypress/downloads/graph-view-explore.png", "base64").then(
          (downloadPng) => {
            expect(downloadPng).exist;
          });
      });
  });
});