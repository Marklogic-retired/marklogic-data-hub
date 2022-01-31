import {Application} from "../../support/application.config";
import browsePage from "../../support/pages/browse";
import {toolbar} from "../../support/components/common";
import LoginPage from "../../support/pages/login";
import {BaseEntityTypes} from "../../support/types/base-entity-types";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import graphExplore from "../../support/pages/graphExplore";
import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";

/**
 * NOTE: This test will involve all operations related to the specific sidebar, for now it's quiet simple
 * (more functionality will be developed in the future)
 */

describe("Test '/Explore' left sidebar", () => {
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
  it("Validate that the left sidebar opens up and closes correctly when un/selecting a base entity", () => {
    cy.log(`**Go to Explore section?**`);
    toolbar.getExploreToolbarIcon().click();

    cy.log(`**Selecting 'Customer' base entity**`);
    entitiesSidebar.showMoreEntities().click();
    entitiesSidebar.clickOnBaseEntity(BaseEntityTypes.CUSTOMER);
    browsePage.getSearchField().should("not.exist");
    entitiesSidebar.getEntityTitle(BaseEntityTypes.CUSTOMER).should("be.visible");

    cy.log("**Base entity icon is displayed on the entity icons list**");
    entitiesSidebar.getEntityIconFromList(BaseEntityTypes.CUSTOMER).should("be.visible");

    cy.log("**Returning to main sidebar and confirming it's visible**");
    entitiesSidebar.backToMainSidebarButton.should("be.visible").click();
    browsePage.getSearchField().should("be.visible");
    entitiesSidebar.getEntityTitle(BaseEntityTypes.CUSTOMER).should("not.exist");
  });

  it("Validate facets", () => {
    cy.log("Selecting Customer entity");
    entitiesSidebar.showMoreEntities().click();
    entitiesSidebar.clickOnBaseEntity(BaseEntityTypes.CUSTOMER);

    cy.log("Testing search input");
    entitiesSidebar.getInputSearch().type("Test search");
    entitiesSidebar.getInputSearch().should("have.value", "Test search");

    cy.log("Testing checkbox facet");
    entitiesSidebar.clickFacetCheckbox("Adams Cole");
    entitiesSidebar.getFacetCheckbox("Adams Cole").should("be.checked");

    cy.log("Testing date facet");
    entitiesSidebar.getDateFacet().should("have.text", "birthDate");
    entitiesSidebar.selectDateRange({time: "facet-datetime-picker-date"});
    entitiesSidebar.getDateFacet().should("not.be.empty");
    entitiesSidebar.backToMainSidebarButton.should("be.visible").click();
  });

  it("Base Entity Filtering in side panel", () => {
    cy.log("Navigate to Graph View and verify all entities displayed");
    browsePage.clickGraphView().click();
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let custCoordinates: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      expect(custCoordinates).to.not.equal(undefined);
    });
    graphExplore.nodeInCanvas(ExploreGraphNodes.ORDER_10258).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.ORDER_10258];
      expect(orderCoordinates).to.not.equal(undefined);
    });

    cy.log("Select Order Entity from dropdown and verify Customer node is gone");
    entitiesSidebar.getBaseEntityDropdown().click();
    entitiesSidebar.selectBaseEntityOption("Order");
    cy.wait(1000);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let custCoordinates: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      expect(custCoordinates).to.equal(undefined);
    });
    graphExplore.nodeInCanvas(ExploreGraphNodes.ORDER_10258).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.ORDER_10258];
      expect(orderCoordinates).to.not.equal(undefined);
    });

    cy.log("Select Customer Entity and verify both Customer and Order nodes are present");
    entitiesSidebar.getBaseEntityDropdown().click();
    entitiesSidebar.selectBaseEntityOption("Customer");
    cy.wait(1000);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let custCoordinates: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      expect(custCoordinates).to.not.equal(undefined);
    });
    graphExplore.nodeInCanvas(ExploreGraphNodes.ORDER_10258).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.ORDER_10258];
      expect(orderCoordinates).to.not.equal(undefined);
    });
  });

  it("Searching main search side panel", () => {
    browsePage.getTableView().click();
    cy.log("Typing Adams in search bar and click on apply facets");
    entitiesSidebar.getMainPanelSearchInput().type("Adams");
    entitiesSidebar.getApplyFacetsButton().click();
    browsePage.waitForSpinnerToDisappear();

    cy.log("Verifying the results in table view");
    browsePage.getTableViewResults("Customer-102");
    browsePage.getTableViewResults("Customer-103");

    cy.log("Verifying the results in snippet view");
    browsePage.getSnippetView().click();
    browsePage.getSnippetViewResults("Customer-102").should("be.visible");
    browsePage.getSnippetViewResults("Customer-103").should("be.visible");

    cy.log("Switch to graph view and verify search summary is visible");
    browsePage.clickGraphView().click();
    browsePage.getGraphSearchSummary().should("have.length.gt", 0);

    cy.log("verify search filtered on top of base entity selections and Order is now gone");
    graphExplore.nodeInCanvas(ExploreGraphNodes.ORDER_10258).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.ORDER_10258];
      expect(orderCoordinates).to.equal(undefined);
    });

    cy.log("Find and click on Customer-102 node");
    graphExplore.focusNode(ExploreGraphNodes.CUSTOMER_102);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let custCoordinates: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.click(custCoordinates.x, custCoordinates.y, {force: true});
    });

    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let custCoordinates: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.click(custCoordinates.x, custCoordinates.y, {force: true});
    });

    browsePage.getDetailViewURI("/json/customers/Cust2.json").should("be.visible");
  });
});
