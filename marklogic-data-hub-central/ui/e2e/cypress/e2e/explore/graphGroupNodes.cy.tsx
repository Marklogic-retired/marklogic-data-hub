import graphExploreSidePanel from "../../support/components/explore/graph-explore-side-panel";
import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";
import graphView from "../../support/components/explore/graph-view";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import graphExplore from "../../support/pages/graphExplore";
import tables from "../../support/components/common/tables";
import browsePage from "../../support/pages/browse";

describe("Group Nodes", () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
    browsePage.navigate();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  it("Validate group nodes are working correctly in the graph", () => {
    cy.log("**Go to graph view**");
    browsePage.switchToGraphView();
    graphExplore.getGraphVisCanvas().should("be.visible");
    graphExplore.stopStabilization();

    cy.log("**Select 'Office' entity**");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Office");
    entitiesSidebar.getBaseEntityOption("Office").scrollIntoView().should("be.visible");
    cy.wait(1000);
    graphView.physicsAnimationToggle();

    cy.log("**Picking up Product group node and validate tooltip**");
    graphExplore.focusNode(ExploreGraphNodes.PRODUCT_GROUP);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.PRODUCT_GROUP).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.PRODUCT_GROUP];
      const canvas = graphExplore.getGraphVisCanvas();

      cy.log("**Validate tooltip appears when the group node it's collapsed**");
      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true});
      graphExplore.getTooltip().should("contain", "Group of Product records")
        .should("contain", "Click to expand 3 sample records in this group.")
        .should("contain", "Double click to expand all records in this group.");
    });

    cy.log("**Right click and select expand 3 records of the Product group node**");

    graphExplore.focusNode(ExploreGraphNodes.PRODUCT_GROUP);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.PRODUCT_GROUP).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.PRODUCT_GROUP];
      const canvas = graphExplore.getGraphVisCanvas();

      cy.log("** Right click and expand 3 records of the node**");
      canvas.rightclick(orderCoordinates.x, orderCoordinates.y, {force: true});
      graphExplore.stopStabilization();

      graphExplore.clickExpand3RecordsFromGroupNode();
      graphExplore.stopStabilization();
    });

    cy.wait(3000);
    graphView.physicsAnimationToggle();
    cy.log("**Validating the record's IDs that have been expanded in the side panel**");

    cy.log("**Click Product node '50' to open side panel and validate productID**");
    graphExplore.focusNode(ExploreGraphNodes.PRODUCT_50);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.PRODUCT_50).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.PRODUCT_50];
      const canvas = graphExplore.getGraphVisCanvas();

      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true});
      graphExploreSidePanel.getTableCellValueBySidepanelQuery("productId").should("contain", "50");
    });

    cy.log("**Click Product node '60' to open side panel and validate productID**");
    graphExplore.focusNode(ExploreGraphNodes.PRODUCT_60);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.PRODUCT_60).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.PRODUCT_60];
      const canvas = graphExplore.getGraphVisCanvas();

      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true});
      graphExploreSidePanel.getTableCellValueBySidepanelQuery("productId").should("contain", "60");
    });

    cy.log("**Click Product node '70' to open side panel and validate productID**");
    graphExplore.focusNode(ExploreGraphNodes.PRODUCT_70);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.PRODUCT_70).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.PRODUCT_70];
      const canvas = graphExplore.getGraphVisCanvas();

      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true});
      graphExploreSidePanel.getTableCellValueBySidepanelQuery("productId").should("contain", "70");

    });

    cy.wait(1000);
    cy.log("**Right click and expand the remaining records of the group node**");
    graphExplore.focusNode(ExploreGraphNodes.PRODUCT_GROUP);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.PRODUCT_GROUP).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.PRODUCT_GROUP];
      const canvas = graphExplore.getGraphVisCanvas();

      canvas.trigger("mouseover", orderCoordinates.x, orderCoordinates.y, {force: true});

      cy.log("** Right click and expand the remaining records of the node**");
      canvas.rightclick(orderCoordinates.x, orderCoordinates.y, {force: true});
      graphExplore.stopStabilization();
      graphExplore.clickExpandAllRecordsFromGroupNode();

    });

    cy.wait(1000);
    graphView.physicsAnimationToggle();
    cy.log("**Click Product node '80' to open side panel and validate productID**");
    graphExplore.focusNode(ExploreGraphNodes.PRODUCT_80);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.PRODUCT_80).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.PRODUCT_80];
      const canvas = graphExplore.getGraphVisCanvas();

      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true});
      graphExploreSidePanel.getTableCellValueBySidepanelQuery("productId").should("contain", "80");
    });

    cy.wait(1000);
    cy.log("**Click Product node '90' to open side panel and validate productID**");
    graphExplore.focusNode(ExploreGraphNodes.PRODUCT_90);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.PRODUCT_90).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.PRODUCT_90];
      const canvas = graphExplore.getGraphVisCanvas();

      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true});
      graphExploreSidePanel.getTableCellValueBySidepanelQuery("productId").should("contain", "90");

    });

    cy.log("**Right click a node and select collapse all expanded records**");
    graphExplore.focusNode(ExploreGraphNodes.PRODUCT_80);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.PRODUCT_80).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.PRODUCT_80];
      const canvas = graphExplore.getGraphVisCanvas();

      cy.log("** Right click and expand 3 records of the node**");
      canvas.rightclick(orderCoordinates.x, orderCoordinates.y, {force: true});
      graphExplore.stopStabilization();

      graphExplore.clickCollapseGroupNode();
      graphExplore.stopStabilization();

    });

    cy.wait(1000);
    graphView.physicsAnimationToggle();
    cy.log("**Picking up Product group node and validate tooltip to confirm it has been collapsed**");
    graphExplore.focusNode(ExploreGraphNodes.PRODUCT_GROUP);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.PRODUCT_GROUP).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.PRODUCT_GROUP];
      const canvas = graphExplore.getGraphVisCanvas();

      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true});
      graphExplore.getTooltip().should("contain", "Group of Product records")
        .should("contain", "Click to expand 3 sample records in this group.")
        .should("contain", "Double click to expand all records in this group.");
    });
  });

  it("Validate Expand records on table", () => {
    cy.wait(1000);
    cy.log("**Right click and select expand in the table**");
    graphExplore.focusNode(ExploreGraphNodes.PRODUCT_GROUP);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.PRODUCT_GROUP).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.PRODUCT_GROUP];
      const canvas = graphExplore.getGraphVisCanvas();

      canvas.rightclick(orderCoordinates.x, orderCoordinates.y, {force: true}).then(() => {
        graphExplore.getViewRecordsInTable().should("be.visible").click();
      });

      cy.log("**Validate all the records appear in the table**");
      tables.getTableRows().should("contain", "50").should("contain", "60").should("contain", "70").should("contain", "80").should("contain", "90").should("not.contain", "101");
    });
  });
});
