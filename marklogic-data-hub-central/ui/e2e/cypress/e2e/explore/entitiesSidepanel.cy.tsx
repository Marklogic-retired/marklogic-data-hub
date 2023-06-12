import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";
import {BaseEntityTypes} from "../../support/types/base-entity-types";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import graphExplore from "../../support/pages/graphExplore";
import table from "../../support/components/common/tables";
import explorePage from "../../support/pages/explore";
import browsePage from "../../support/pages/browse";


describe("Explore Page - Entities Sidepanel", () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
  });

  beforeEach(() => {
    explorePage.navigate();
    entitiesSidebar.clearAllFacetsApplied();
    entitiesSidebar.baseEntityDropdown.click("right");
    entitiesSidebar.selectBaseEntityOption("All Entities");
  });

  it("Validate that the left sidebar opens up and closes correctly when un/selecting a base entity", {browser: "!firefox"}, () => {
    entitiesSidebar.showMoreEntities();
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);
    entitiesSidebar.searchInput.should("not.exist");
    entitiesSidebar.getEntityTitle(BaseEntityTypes.CUSTOMER).should("be.visible");
    entitiesSidebar.getEntityIconFromList(BaseEntityTypes.CUSTOMER).should("be.visible");
    entitiesSidebar.backToMainSidebar();

    entitiesSidebar.searchInput.should("be.visible");
    entitiesSidebar.getEntityTitle(BaseEntityTypes.CUSTOMER).should("not.exist");
  });

  it("Validate search text and applying them over a base entities", () => {
    browsePage.switchToGraphView();
    entitiesSidebar.showMoreEntities();
    entitiesSidebar.searchInput.type("adams");
    entitiesSidebar.searchInput.should("have.value", "adams");
    entitiesSidebar.applyFacets();

    cy.log("**Checking node amount shown**");
    graphExplore.allNodes.then((nodes: any) => {
      expect(Object.keys(nodes).length).to.be.equals(2);
    });
  });

  it("Validate facets on graph view and applying them over a base entities", () => {
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);
    entitiesSidebar.getFacetCheckbox("Adams Cole").should("be.visible").click();
    entitiesSidebar.getFacetCheckbox("Adams Cole").should("be.checked");
    entitiesSidebar.applyFacets();

    cy.log("**Checking node amount shown**");
    graphExplore.allNodes.then((nodes: any) => {
      expect(Object.keys(nodes).length).to.be.equals(2);
    });
  });

  it("Validate facets on table view and applying them over a base entities", {browser: "!firefox"}, () => {
    entitiesSidebar.showMoreEntities();
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);
    entitiesSidebar.getFacetCheckbox("Adams Cole").should("be.visible").click();
    entitiesSidebar.getFacetCheckbox("Adams Cole").should("be.checked");
    entitiesSidebar.applyFacets();
    browsePage.getAppliedFacets("Adams Cole").should("be.visible");

    browsePage.switchToTableView();
    browsePage.hcTableRows.should("have.length", 2);
    entitiesSidebar.getFacetCheckboxEmail("adamscole@nutralab.com").should("be.visible").click();
    entitiesSidebar.getFacetCheckboxEmail("adamscole@nutralab.com").should("be.checked");
    entitiesSidebar.applyFacets();
    browsePage.getAppliedFacets("adamscole@nutralab.com").should("be.visible");
    browsePage.hcTableRows.should("have.length.below", 2);

    browsePage.clearFacet("adamscole@nutralab.com");
    browsePage.hcTableRows.should("have.length", 2);
    browsePage.getAppliedFacets("Adams Cole").should("be.visible");
    entitiesSidebar.getFacetCheckbox("Adams Cole").should("be.checked");

    entitiesSidebar.dateFacetLabel.should("have.text", "birthDate");
    entitiesSidebar.selectDateRange({time: "facet-datetime-picker-date"});
    entitiesSidebar.dateFacetLabel.should("not.be.empty");
    entitiesSidebar.backToMainSidebar();
  });

  it("Base Entity Filtering from side panel", {browser: "!firefox"}, () => {
    const orderID = "10248";
    const customerID = "101";

    entitiesSidebar.clearAllFacetsApplied();
    browsePage.switchToGraphView();

    cy.log("**Checking node CUSTOMER exist**");
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      expect(nodePositions[ExploreGraphNodes.CUSTOMER_102]).to.not.equal(undefined);
    });

    cy.log("**Checking node ORDER exist**");
    graphExplore.nodeInCanvas(ExploreGraphNodes.ORDER_10258).then((nodePositions: any) => {
      expect(nodePositions[ExploreGraphNodes.ORDER_10258]).to.not.equal(undefined);
    });

    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Order");
    entitiesSidebar.switchToFinalDatabase();

    cy.log("**Checking node CUSTOMER not exist**");
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      expect(nodePositions[ExploreGraphNodes.CUSTOMER_102]).to.equal(undefined);
    });

    cy.log("**Checking node ORDER exist**");
    graphExplore.nodeInCanvas(ExploreGraphNodes.ORDER_10258).then((nodePositions: any) => {
      expect(nodePositions[ExploreGraphNodes.ORDER_10258]).to.not.equal(undefined);
    });

    cy.log("**Verify Order filtered with entity-specific columns**");
    browsePage.switchToTableView();
    table.getColumnTitle(2).should("contain", "orderId");
    table.getColumnTitle(3).should("contain", "address");
    table.getColumnTitle(4).should("contain", "orderDetails");

    browsePage.getTableViewCell(orderID).should("have.length.gt", 0);
    browsePage.getTableViewCell(customerID).should("not.have.length.gt", 0);

    entitiesSidebar.baseEntityDropdown.click();
    entitiesSidebar.selectBaseEntityOption("Customer");
    table.getColumnTitle(2).should("contain", "Identifier");
    table.getColumnTitle(3).should("contain", "Entity Type");
    table.getColumnTitle(4).should("contain", "Record Type");
    table.getColumnTitle(5).should("contain", "Created");

    browsePage.getTableViewCell(orderID).should("have.length.gt", 0);
    browsePage.getTableViewCell(customerID).should("have.length.gt", 0);

    entitiesSidebar.openBaseEntityFacets("Customer");
    entitiesSidebar.getEntityIconFromList("Customer").should("be.visible");
    entitiesSidebar.getRelatedEntityIcon("Office").should("be.visible").trigger("mouseover");
    entitiesSidebar.disabledRelatedEntityTooltip.should("be.visible");

    entitiesSidebar.backToMainSidebar();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Product");
    entitiesSidebar.relatedConceptsPanel.trigger("mouseover");
    entitiesSidebar.disabledRelatedConceptsTooltip.should("be.visible");
    entitiesSidebar.allRelatedConceptsCheckbox.should("be.disabled");

    entitiesSidebar.baseEntityDropdown.click("right");
    entitiesSidebar.selectBaseEntityOption("BabyRegistry");
    entitiesSidebar.relatedEntityPanel.should("be.visible").and("have.class", "collapsed");
    entitiesSidebar.relatedEntityPanel.click();

    cy.log("**related entity panel should remain collapsed**");
    entitiesSidebar.relatedEntityPanel.should("have.class", "collapsed");

    browsePage.switchToGraphView();

    cy.log("**Checking node CUSTOMER exist**");
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      expect(nodePositions[ExploreGraphNodes.CUSTOMER_102]).to.not.equal(undefined);
    });

    cy.log("**Checking node ORDER exist**");
    graphExplore.nodeInCanvas(ExploreGraphNodes.ORDER_10258).then((nodePositions: any) => {
      expect(nodePositions[ExploreGraphNodes.ORDER_10258]).to.not.equal(undefined);
    });

    cy.log("**verify that related entity panel is collapsed due to related entity (Customer) being selected as a base**");
    entitiesSidebar.getRelatedEntity("Customer").should("not.be.visible");

    cy.log("**related entity panel is expandable and disabled tooltip applies to each item**");
    entitiesSidebar.toggleRelatedEntityPanel();
    entitiesSidebar.getRelatedEntity("Customer").should("be.visible");
    entitiesSidebar.getRelatedEntity("Customer").trigger("mouseover");
    entitiesSidebar.disabledEntityTooltip.should("exist");
    entitiesSidebar.clearAllFacetsApplied();

    cy.log("**verify related entity panel is enabled when Customer is deselected as a base entity**");
    explorePage.scrollSideBarTop();
    entitiesSidebar.baseEntityDropdown.click("right");
    entitiesSidebar.selectBaseEntityOption("All Entities");
    entitiesSidebar.baseEntityDropdown.click("right");
    entitiesSidebar.selectBaseEntityOption("BabyRegistry");
    entitiesSidebar.toggleRelatedEntityPanel();
    entitiesSidebar.getRelatedEntity("Customer").should("be.visible");
    entitiesSidebar.getRelatedEntity("Customer").trigger("mouseover");
    entitiesSidebar.disabledEntityTooltip.should("not.exist");
  });

  it("Searching main search side panel", () => {
    browsePage.switchToTableView();
    entitiesSidebar.searchInput.type("adams");
    entitiesSidebar.applyFacets();

    browsePage.getTableViewResults("Customer-102").should("have.length.gt", 0);
    browsePage.getTableViewResults("Customer-103").should("have.length.gt", 0);

    browsePage.switchToSnippetView();
    explorePage.getSnippetViewResults("Customer-102").should("be.visible");
    explorePage.getSnippetViewResults("Customer-103").should("be.visible");

    browsePage.switchToGraphView();
    browsePage.graphSearchSummary.should("have.length.gt", 0);

    cy.log("**Checking node ORDER not exist**");
    graphExplore.nodeInCanvas(ExploreGraphNodes.ORDER_10258).then((nodePositions: any) => {
      expect(nodePositions[ExploreGraphNodes.ORDER_10258]).to.equal(undefined);
    });

    cy.log("Find and click on Customer-102 node");
    graphExplore.focusNode(ExploreGraphNodes.CUSTOMER_102);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let customerCoordinates: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.click(customerCoordinates.x, customerCoordinates.y, {force: true});
      explorePage.getDetailViewURI("/json/customers/Cust2.json").should("be.visible");
    });
  });

  it("Searching on related entities", () => {
    entitiesSidebar.baseEntityDropdown.click("right");
    entitiesSidebar.selectBaseEntityOption("Office");
    entitiesSidebar.selectRelatedEntity("Customer");
    browsePage.switchToTableView();
    browsePage.hcTableRows.should("have.length.greaterThan", 0);

    entitiesSidebar.dateFacetLabel.should("have.text", "birthDate");
    entitiesSidebar.selectDateRange({time: "facet-datetime-picker-date"});
    entitiesSidebar.dateFacetLabel.should("not.be.empty");
    entitiesSidebar.applyFacets();

    browsePage.hcTableRows.should("have.length", "");
    entitiesSidebar.clearAllFacetsApplied();
  });

  it("When any base entity is selected, all related entities check are selected", () => {
    browsePage.switchToGraphView();
    entitiesSidebar.baseEntityDropdown.click("right");
    entitiesSidebar.selectBaseEntityOption("All Entities");
    entitiesSidebar.baseEntityDropdown.click("right");
    entitiesSidebar.selectBaseEntityOption("BabyRegistry");
    entitiesSidebar.toggleRelatedEntityPanel();

    entitiesSidebar.getRelatedEntity("Customer").should("be.visible");
    entitiesSidebar.getRelatedEntityCheckbox("Customer").should("be.checked").click();
    entitiesSidebar.getRelatedEntityCheckbox("Customer").should("not.be.checked");

    entitiesSidebar.baseEntityDropdown.click("right");
    entitiesSidebar.selectBaseEntityOption("All Entities");
    entitiesSidebar.baseEntityDropdown.click("right");
    entitiesSidebar.selectBaseEntityOption("Office");
    entitiesSidebar.toggleRelatedEntityPanel();
    entitiesSidebar.getRelatedEntity("Customer").should("be.visible");
    entitiesSidebar.getRelatedEntityCheckbox("Customer").should("be.checked");
  });
});
