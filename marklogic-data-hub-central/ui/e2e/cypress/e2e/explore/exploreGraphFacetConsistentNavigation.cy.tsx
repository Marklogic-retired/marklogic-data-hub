import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import browsePage from "../../support/pages/browse";
import detailPage from "../../support/pages/detail";
import graphExploreSidePanel from "../../support/components/explore/graph-explore-side-panel";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import graphExplore from "../../support/pages/graphExplore";
import LoginPage from "../../support/pages/login";

describe("Test navigation with facets from graph side panel to details twice", () => {
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

  it("Validate that with aplied facet can navigate from snipet view to graph and details from right side go back, repeat last one without fail", () => {
    cy.log("**Go to Explore section?**");
    toolbar.getExploreToolbarIcon().click();

    cy.log("**Verify loading indicator in the graph**");
    graphExplore.getGraphLoader().should("be.visible");
    cy.log("**Select Graph view**");
    browsePage.clickGraphView();
    graphExplore.getGraphVisCanvas().should("be.visible");
    graphExplore.getStabilizationAlert().should("be.visible");
    graphExplore.stopStabilization();

    cy.log("**Enter text in search field and apply facets**");
    entitiesSidebar.getMainPanelSearchInput("3039");
    entitiesSidebar.getApplyFacetsButton().click();
    browsePage.waitForSpinnerToDisappear();

    cy.log("**Go to snippet view and click in graph icon in one registry**");
    browsePage.getFacetView().click();
    browsePage.waitForSpinnerToDisappear();
    cy.get(`[data-testid="graph-icon"]`).first().click();
    graphExploreSidePanel.getSidePanel().should("be.visible");

    cy.log("**Go to details page and back twice to check navigation**");
    cy.wait(1500);
    Cypress._.times(2, () => {
      cy.wait(1000);
      graphExploreSidePanel.getInstanceViewIcon().scrollIntoView().should("be.visible").click({force: true});
      detailPage.getDocumentID().should("be.visible");
      detailPage.clickBackButton();
      cy.intercept("/api/entitySearch/**").as("entitySearch");
      cy.intercept("/api/models/hubCentralConfig").as("hubCentralConfig");
      graphExploreSidePanel.getSidePanel().should("be.visible");
    });
  });
});


