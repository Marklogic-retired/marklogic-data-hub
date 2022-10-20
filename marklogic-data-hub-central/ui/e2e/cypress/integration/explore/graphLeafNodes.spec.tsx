import {toolbar} from "../../support/components/common";
import browsePage from "../../support/pages/browse";
import graphExplore from "../../support/pages/graphExplore";
import LoginPage from "../../support/pages/login";
import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import graphExploreSidePanel from "../../support/components/explore/graph-explore-side-panel";
import graphView from "../../support/components/explore/graph-view";

describe("Leaf Nodes", () => {
  before(() => {
    cy.visit("/");

    cy.log("**Logging into the app as a developer**");
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });
  before(() => {
    cy.log("**Navigate to Explore**");
    toolbar.getExploreToolbarIcon().click();
    browsePage.waitForSpinnerToDisappear();
  });

  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage();
  });

  it("Validate leaf nodes are working correctly", () => {
    //Graph view
    cy.log("**Go to graph view**");
    browsePage.clickGraphView();
    cy.waitForAsyncRequest();
    graphExplore.getGraphVisCanvas().should("be.visible");
    graphExplore.stopStabilization();

    cy.log("**Select 'Customer' entity**");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    cy.waitForAsyncRequest();
    entitiesSidebar.getBaseEntityOption("Customer").scrollIntoView().should("be.visible");
    cy.wait(2000);

    graphExplore.fit();
    cy.log("**Clicking Show related on '101' leaf node to expand**");
    graphExplore.focusNode(ExploreGraphNodes.OFFICE_101);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.OFFICE_101).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.OFFICE_101];
      const canvas = graphExplore.getGraphVisCanvas();

      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true});
      //Hover to bring focus
      canvas.trigger("mouseover", orderCoordinates.x, orderCoordinates.y, {force: true});

      graphExplore.stopStabilization();
      graphView.physicsAnimationToggle();
    });

    graphExplore.focusNode(ExploreGraphNodes.OFFICE_101);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.OFFICE_101).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.OFFICE_101];
      const canvas = graphExplore.getGraphVisCanvas();

      // Right click and expand the remaining records of the node
      canvas.rightclick(orderCoordinates.x, orderCoordinates.y, {force: true});
      graphExplore.clickShowRelated();
      graphExplore.stopStabilization();
      graphView.physicsAnimationToggle();
    });

    // TODO: COMMENTED SINCE WE NEED TO PERFORM A CLICK AND HOVER TO MAKE THE TOOLTIP APPEARS
    // AND THAT COLLAPSES THE PRODUCT NODE, AND THE LEAF NODE DISAPPEARS
    // Wait needed for the graph to get stabilized
    /*cy.wait(2000);
    cy.log("**Click the product node and check tooltip text to ensure it's the right node**");
    graphExplore.focusNode(ExploreGraphNodes.PRODUCT_GROUP);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.PRODUCT_GROUP).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.PRODUCT_GROUP];
      const canvas = graphExplore.getGraphVisCanvas();

      //First click and hover to focus the  node
      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true})
      .trigger("mouseover", orderCoordinates.x, orderCoordinates.y, {force: true});
      //Validate tooltip
      graphExplore.getTooltip().should("contain", "Group of Product records");

    });*/

    cy.log("**Clicking collapse all records**");
    cy.wait(3000); //wait for graph to stabilize
    graphExplore.focusNode(ExploreGraphNodes.OFFICE_101);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.OFFICE_101).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.OFFICE_101];
      const canvas = graphExplore.getGraphVisCanvas();

      // Right click and expand 3 records of the node
      canvas.rightclick(orderCoordinates.x, orderCoordinates.y, {force: true});
      graphExplore.stopStabilization();

      graphExplore.clickCollapseLeafNode();
      graphExplore.stopStabilization();

    });

    // Wait needed for the graph to get stabilized
    cy.wait(2000);
    graphView.physicsAnimationToggle();
    cy.log("**Try opening the Product Node to make sure it's was collapsed**");
    graphExplore.focusNode(ExploreGraphNodes.PRODUCT_GROUP);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.PRODUCT_GROUP).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.PRODUCT_GROUP];
      //it should not exist because the leaf node was collapsed
      cy.log("**Coordinates should not exist because it was collapsed**");
      expect(orderCoordinates).to.be.undefined;
    });

    cy.log("**Verify if concepts leaf can be expanded properly. Select 'Product' entity**");
    browsePage.removeBaseEntity("Customer");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Product");
    entitiesSidebar.getBaseEntityOption("Product").scrollIntoView().should("be.visible");
    cy.wait(2000);
    cy.waitForAsyncRequest();

    graphExplore.fit();
    graphExplore.stopStabilization();
    graphView.physicsAnimationToggle();
    cy.log("**Verify expanded node leaf node is expanded and expanded node is visible in the canvas**");
    graphExplore.focusNode(ExploreGraphNodes.OFFICE_101);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.OFFICE_101).then((nodePositions: any) => {
      let officeCoordinates: any = nodePositions[ExploreGraphNodes.OFFICE_101];
      const canvas = graphExplore.getGraphVisCanvas();

      //Hover to bring focus
      canvas.trigger("mouseover", officeCoordinates.x, officeCoordinates.y, {force: true});

      // Right click and expand the remaining records of the node
      canvas.rightclick(officeCoordinates.x, officeCoordinates.y, {force: true});
      graphView.physicsAnimationToggle();

      graphExplore.clickShowRelated();
      graphExplore.stopStabilization();
      graphView.physicsAnimationToggle();
    });

    cy.log("**Verify expanded node leaf node is expanded and expanded node is visible in the canvas**");
    graphExplore.focusNode(ExploreGraphNodes.OFFICE_101);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.OFFICE_101).then((nodePositions: any) => {
      let officeCoordinates: any = nodePositions[ExploreGraphNodes.OFFICE_101];
      const canvas = graphExplore.getGraphVisCanvas();

      //Click on node to open side panel
      canvas.click(officeCoordinates.x, officeCoordinates.y, {force: true});
      cy.wait(2000);
      graphView.physicsAnimationToggle();
      graphExploreSidePanel.getSidePanel().should("exist");
    });

    graphExplore.focusNode(ExploreGraphNodes.CONCEPT_JEANS);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_JEANS).then((nodePositions: any) => {
      let jeansCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_JEANS];
      const canvas = graphExplore.getGraphVisCanvas();

      canvas.click(jeansCoordinates.x, jeansCoordinates.y, {force: true});
      //Hover to bring focus
      canvas.trigger("mouseover", jeansCoordinates.x, jeansCoordinates.y, {force: true});

      // Right click and expand the remaining records of the node
      canvas.rightclick(jeansCoordinates.x, jeansCoordinates.y, {force: true});
      graphExplore.stopStabilization();
    });
  });
});
