import {Application} from "../../support/application.config";
import browsePage from "../../support/pages/browse";
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
    cy.loginAsDeveloper().withRequest().then(() => {
      LoginPage.postLogin();
      //Saving Local Storage to preserve session
      cy.saveLocalStorage();
    });


  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    Cypress.Cookies.preserveOnce("HubCentralSession");
    cy.restoreLocalStorage();

  });

  it("Validate that the left sidebar opens up and closes correctly when un/selecting a base entity", () => {
    cy.visit("/tiles/explore");
    cy.wait(8000);
    entitiesSidebar.showMoreEntities().click({force: true});
    cy.log("**Base entity tooltip is visible**");
    entitiesSidebar.getBaseEntity("Client").trigger("mouseover");
    entitiesSidebar.getBaseEntityToolTip().should("be.visible");

    cy.log(`**Selecting 'Customer' base entity**`);
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);
    browsePage.getSearchField().should("not.exist");
    entitiesSidebar.getEntityTitle(BaseEntityTypes.CUSTOMER).should("be.visible");

    cy.log("**Base entity icon is displayed on the entity icons list**");
    entitiesSidebar.getEntityIconFromList(BaseEntityTypes.CUSTOMER).should("be.visible");

    cy.log("**Returning to main sidebar and confirming it's visible**");
    entitiesSidebar.backToMainSidebar();
    browsePage.getSearchField().should("be.visible");
    entitiesSidebar.getEntityTitle(BaseEntityTypes.CUSTOMER).should("not.exist");
  });
  /*
     TODO: this test is commented because the entity specific search input was commented
     */

  // it("Validate search text and applying them over a base entities", () => {
  //   cy.log("**Selecting Customer entity**");
  //   // browsePage.getGraphView().click();
  //   entitiesSidebar.showMoreEntities().should(`be.visible`).click({force: true});
  //   entitiesSidebar.clickOnBaseEntity(BaseEntityTypes.CUSTOMER);

  //   cy.log("**Testing search input**");
  //   entitiesSidebar.getInputSearch().type("adams");
  //   entitiesSidebar.getInputSearch().should("have.value", "adams");

  //   cy.log("****Applying text search**");
  //   entitiesSidebar.clickOnApplyFacetsButton();
  //   browsePage.waitForSpinnerToDisappear();
  //   cy.wait(3000);

  //   cy.log("**Checking node amount shown**");
  //   graphExplore.getAllNodes().then((nodes: any) => {
  //     expect(Object.keys(nodes).length).to.be.equals(2);
  //   });
  // });


  //For now it's skip until BE is integrated and can apply facets over graph
  it.skip("Validate facets on graph view and applying them over a base entities", () => {
    cy.log("**Testing checkbox facet**");
    entitiesSidebar.clickFacetCheckbox("Adams Cole");
    entitiesSidebar.getFacetCheckbox("Adams Cole").should("be.checked");
    entitiesSidebar.clickOnApplyFacetsButton();

    browsePage.waitForSpinnerToDisappear();
    cy.wait(3000);

    cy.log("**Checking node amount shown**");
    graphExplore.getAllNodes().then((nodes: any) => {
      expect(Object.keys(nodes).length).to.be.equals(2);
    });
  });

  it("Validate facets on table view and applying them over a base entities", () => {
    // cy.log("**Opening table view**");
    // browsePage.getTableView().click();
    browsePage.waitForSpinnerToDisappear();

    cy.log(`**Selecting 'Customer' base entity**`);
    cy.wait(2000);
    //TODO: Need to click on Show more because a 6th entity it's being created in another test and not being deleted after
    entitiesSidebar.showMoreEntities().click();
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);

    cy.log("**Checking facet is selected**");
    entitiesSidebar.clickFacetCheckbox("Adams Cole");
    entitiesSidebar.getFacetCheckbox("Adams Cole").should("be.checked");
    browsePage.getGreySelectedFacets("Adams Cole").should("exist");

    cy.log("**Applying facet**");
    entitiesSidebar.clickOnApplyFacetsButton();
    browsePage.getAppliedFacets("Adams Cole").should("exist");

    cy.log("**Checking table rows amount shown**");
    browsePage.getTableView().click();
    browsePage.getHCTableRows().should("have.length", 2);

    cy.log("**Testing date facet**");
    entitiesSidebar.getDateFacetTitle().should("have.text", "birthDate");
    entitiesSidebar.selectDateRange({time: "facet-datetime-picker-date"});
    entitiesSidebar.getDateFacet().should("not.be.empty");
    entitiesSidebar.backToMainSidebar();
  });

  it("Base Entity Filtering from side panel", () => {
    cy.log("Navigate to Graph View and verify all entities displayed");
    cy.wait(5000);
    browsePage.getClearAllFacetsButton().click();
    browsePage.clickGraphView();
    cy.wait(5000);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let custCoordinates: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      expect(custCoordinates).to.not.equal(undefined);
    });
    graphExplore.nodeInCanvas(ExploreGraphNodes.ORDER_10258).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.ORDER_10258];
      expect(orderCoordinates).to.not.equal(undefined);
    });

    cy.log("Select Order Entity from dropdown and verify Customer node is gone");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Order");
    entitiesSidebar.getBaseEntityOption("Order").should("be.visible");
    cy.wait(1000);
    browsePage.getFinalDatabaseButton();
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let custCoordinates: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      expect(custCoordinates).to.equal(undefined);
    });
    graphExplore.nodeInCanvas(ExploreGraphNodes.ORDER_10258).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.ORDER_10258];
      expect(orderCoordinates).to.not.equal(undefined);
    });

    cy.log("Navigate to Table View and verify Order filtered with entity-specific columns");
    browsePage.getTableView().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForHCTableToLoad();
    browsePage.getColumnTitle(2).should("contain", "orderId");
    browsePage.getColumnTitle(3).should("contain", "address");
    browsePage.getColumnTitle(4).should("contain", "orderDetails");

    //orderId value should be present while customerID should not
    browsePage.getTableViewCell("10248").should("have.length.gt", 0);
    browsePage.getTableViewCell("101").should("not.have.length.gt", 0);

    cy.log("Select Customer Entity and verify default table columns since > 1 entity filtered");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForHCTableToLoad();
    browsePage.getColumnTitle(2).should("contain", "Identifier");
    browsePage.getColumnTitle(3).should("contain", "Entity Type");
    browsePage.getColumnTitle(4).should("contain", "Record Type");
    browsePage.getColumnTitle(5).should("contain", "Created");

    //both Order and Customer ID's should be present in table
    browsePage.getTableViewCell("10248").should("have.length.gt", 0);
    browsePage.getTableViewCell("101").should("have.length.gt", 0);

    cy.log("Select BabyRegistry and verify related entities panel appears but is disabled in table view");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("BabyRegistry");
    entitiesSidebar.getBaseEntityOption("BabyRegistry").should("exist");
    entitiesSidebar.getRelatedEntityPanel().should("be.visible");
    entitiesSidebar.verifyCollapsedRelatedEntityPanel().should("exist");
    entitiesSidebar.getRelatedEntityPanel().click();
    //related entity panel should remain collapsed
    entitiesSidebar.verifyCollapsedRelatedEntityPanel().should("exist");

    cy.log("verify both Customer and Order nodes are still present in graph");
    browsePage.clickGraphView();
    cy.wait(1000);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let custCoordinates: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      expect(custCoordinates).to.not.equal(undefined);
    });
    graphExplore.nodeInCanvas(ExploreGraphNodes.ORDER_10258).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.ORDER_10258];
      expect(orderCoordinates).to.not.equal(undefined);
    });

    cy.log("verify that related entity panel is collapsed due to related entity (Customer) being selected as a base");
    entitiesSidebar.getRelatedEntity("Customer").should("not.be.visible");

    cy.log("related entity panel is expandable and disabled tooltip applies to each item");
    entitiesSidebar.toggleRelatedEntityPanel();
    entitiesSidebar.getRelatedEntity("Customer").should("be.visible");
    entitiesSidebar.getRelatedEntity("Customer").trigger("mouseover");
    entitiesSidebar.getDisabledEntityTooltip().should("be.visible");
    browsePage.getClearAllFacetsButton().trigger("mouseover", {force: true});

    cy.log("verify related entity panel is enabled when Customer is deselected as a base entity");
    entitiesSidebar.removeLastSelectedBaseEntity();
    cy.wait(500);
    entitiesSidebar.removeLastSelectedBaseEntity();
    entitiesSidebar.getRelatedEntity("Customer").should("be.visible");
    entitiesSidebar.getRelatedEntity("Customer").trigger("mouseover");
    entitiesSidebar.getDisabledEntityTooltip().should("not.exist");
  });

  //TODO: this test is commented because a refresh graph error
  it.skip("Searching main search side panel", () => {
    cy.wait(8000);
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
    browsePage.clickGraphView();
    browsePage.getGraphSearchSummary().should("have.length.gt", 0);

    cy.log("verify search filtered on top of base entity selections and Order is now gone in graph");
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
    entitiesSidebar.clickOnApplyFacetsButton();
    browsePage.getHCTableRows().should("have.length", 0);
    entitiesSidebar.clickOnClearFacetsButton();
    entitiesSidebar.backToMainSidebar();
    browsePage.waitForHCTableToLoad();
  });
  /*
     TODO: this test is commented because the entity specific search input was commented
     */
  // it("Searching text on related entities", () => {
  //   //TODO: Bug: The page renders twice, so waiting for the spinner does not work.
  //   cy.wait(8000);
  //   cy.log("**Selecting Order entity**");
  //   browsePage.selectBaseEntity("Order");
  //   browsePage.waitForSpinnerToDisappear();
  //   entitiesSidebar.clickOnRelatedEntity("Person");

  //   cy.log("**Testing search input**");
  //   entitiesSidebar.getInputSearch().type("Alice");
  //   entitiesSidebar.getInputSearch().should("have.value", "Alice");
  //   entitiesSidebar.clickOnApplyFacetsButton();

  //   cy.log("**Checking table rows amount shown**");
  //   browsePage.getHCTableRows().should("have.length", 1);
  //   entitiesSidebar.clickOnClearFacetsButton();
  //   entitiesSidebar.getInputSearch().should("have.value", "");
  //   browsePage.getHCTableRows().should("have.length.greaterThan", 1);
  // });
});
