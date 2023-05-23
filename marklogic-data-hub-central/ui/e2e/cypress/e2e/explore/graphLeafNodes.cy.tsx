import graphExploreSidePanel from "../../support/components/explore/graph-explore-side-panel";
import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";
import graphView from "../../support/components/explore/graph-view";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import graphExplore from "../../support/pages/graphExplore";
import browsePage from "../../support/pages/browse";

describe("Leaf Nodes", () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
    browsePage.navigate();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  it("Verify if concepts leaf can be expanded properly. Select 'BabyRegistry' entity", () => {
    browsePage.getClearAllFacetsButton().then(($ele) => {
      if ($ele.is(":enabled")) {
        cy.log("**clear all facets**");
        browsePage.getClearAllFacetsButton().click();
        browsePage.waitForSpinnerToDisappear();
      }
    });
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("BabyRegistry");
    cy.wait(2000);
    cy.waitForAsyncRequest();

    graphExplore.fit();
    graphExplore.stopStabilization();
    graphView.physicsAnimationToggle();
    cy.log("**Verify expanded node leaf node is expanded and expanded node is visible in the canvas**");
    graphExplore.focusNode(ExploreGraphNodes.CUSTOMER_301);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_301).then((nodePositions: any) => {
      let officeCoordinates: any = nodePositions[ExploreGraphNodes.CUSTOMER_301];
      const canvas = graphExplore.getGraphVisCanvas();

      canvas.trigger("mouseover", officeCoordinates.x, officeCoordinates.y, {force: true});

      cy.log("** Right click and expand the remaining records of the node**");
      canvas.rightclick(officeCoordinates.x, officeCoordinates.y, {force: true});
      graphView.physicsAnimationToggle();

      graphExplore.clickShowRelated();
      graphExplore.stopStabilization();
      graphView.physicsAnimationToggle();
    });
  });

  it("Validate leaf nodes are working correctly", () => {
    cy.log("**Go to graph view**");
    browsePage.clickGraphView();
    graphExplore.getGraphVisCanvas().should("be.visible");
    graphExplore.stopStabilization();

    cy.log("**Select 'Customer' entity**");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    cy.waitForAsyncRequest();
    cy.wait(2000);
  });

  it("Clicking Show related on '101' leaf node to expand", () => {
    graphExplore.fit();
    graphExplore.stopStabilization();
    graphExplore.getGraphVisCanvas().scrollIntoView().should("be.visible");
    graphExplore.getSearchBar().type("Cynthia");
    cy.intercept("POST", "/api/entitySearch/graph?database=final").as("Search");
    graphExplore.getSearchButton().click();
    browsePage.waitForSpinnerToDisappear();
    cy.wait("@Search");
    cy.wait("@Search");
    graphView.getPhysicsAnimationToggle().should("be.visible");
    graphExplore.focusNode(ExploreGraphNodes.OFFICE_101);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.OFFICE_101).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.OFFICE_101];
      const canvas = graphExplore.getGraphVisCanvas();

      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true});
      canvas.trigger("mouseover", orderCoordinates.x, orderCoordinates.y, {force: true});
      cy.waitForAsyncRequest();
      graphExplore.stopStabilization();
      graphView.physicsAnimationToggle();
    });
  });

  it("Right click and expand the remaining records of the node", () => {
    graphExplore.focusNode(ExploreGraphNodes.OFFICE_101);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.OFFICE_101).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.OFFICE_101];
      const canvas = graphExplore.getGraphVisCanvas();

      canvas.rightclick(orderCoordinates.x, orderCoordinates.y, {force: true});
      graphExplore.clickShowRelated();
      cy.waitForAsyncRequest();
      graphExplore.stopStabilization();
      graphView.physicsAnimationToggle();
    });

    cy.log("**Click the product node and check tooltip text to ensure it's the right node**");
    graphExplore.focusNode(ExploreGraphNodes.PRODUCT_GROUP);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.PRODUCT_GROUP).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.PRODUCT_GROUP];
      const canvas = graphExplore.getGraphVisCanvas();

      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true})
        .trigger("mouseover", orderCoordinates.x, orderCoordinates.y, {force: true});
      graphExplore.getTooltip().should("contain", "Group of Product records");
    });
  });

  it("Clicking collapse all records", () => {
    cy.wait(3000);
    graphExplore.focusNode(ExploreGraphNodes.OFFICE_101);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.OFFICE_101).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.OFFICE_101];
      const canvas = graphExplore.getGraphVisCanvas();

      canvas.rightclick(orderCoordinates.x, orderCoordinates.y, {force: true});
      graphExplore.stopStabilization();

      graphExplore.clickCollapseLeafNode();
      graphExplore.stopStabilization();
    });

    browsePage.getClearAllFacetsButton().then(($ele) => {
      if ($ele.is(":enabled")) {
        cy.log("**clear all facets**");
        browsePage.getClearAllFacetsButton().click();
        browsePage.waitForSpinnerToDisappear();
      }
    });
    cy.wait(2000);
    graphView.physicsAnimationToggle();
  });

  it("Try opening the Product Node to make sure it's was collapsed", () => {
    graphExplore.focusNode(ExploreGraphNodes.PRODUCT_GROUP);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.PRODUCT_GROUP).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.PRODUCT_GROUP];
      cy.log("**Coordinates should not exist because it was collapsed**");
      expect(orderCoordinates).to.be.undefined;
    });
    browsePage.removeBaseEntity("Customer");
    cy.waitForAsyncRequest();
    cy.wait(5000);
  });

  it("Verify if concepts leaf can be expanded properly. Select 'Product' entity", () => {
    entitiesSidebar.selectBaseEntityOption("Product");
    cy.waitForAsyncRequest();
    cy.wait(5000);

    graphExplore.fit();
    graphExplore.stopStabilization();
    graphView.physicsAnimationToggle();
    cy.log("**Verify expanded node leaf node is expanded and expanded node is visible in the canvas**");
    graphExplore.focusNode(ExploreGraphNodes.OFFICE_101);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.OFFICE_101).then((nodePositions: any) => {
      let officeCoordinates: any = nodePositions[ExploreGraphNodes.OFFICE_101];
      const canvas = graphExplore.getGraphVisCanvas();

      canvas.trigger("mouseover", officeCoordinates.x, officeCoordinates.y, {force: true});
      cy.wait(1000);

      canvas.rightclick(officeCoordinates.x, officeCoordinates.y, {force: true});
      graphView.physicsAnimationToggle();

      graphExplore.clickShowRelated();
      cy.waitForAsyncRequest();
      graphExplore.stopStabilization();
      graphView.physicsAnimationToggle();
    });
  });

  it("Verify expanded node leaf node is expanded and expanded node is visible in the canvas", () => {
    graphExplore.focusNode(ExploreGraphNodes.OFFICE_101);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.OFFICE_101).then((nodePositions: any) => {
      let officeCoordinates: any = nodePositions[ExploreGraphNodes.OFFICE_101];
      const canvas = graphExplore.getGraphVisCanvas();

      canvas.click(officeCoordinates.x, officeCoordinates.y, {force: true});
      cy.waitForAsyncRequest();
      cy.wait(2000);
      graphView.physicsAnimationToggle();
      graphExploreSidePanel.getSidePanel().should("exist");
    });

    graphExplore.focusNode(ExploreGraphNodes.CONCEPT_JEANS);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_JEANS).then((nodePositions: any) => {
      let jeansCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_JEANS];
      const canvas = graphExplore.getGraphVisCanvas();

      canvas.click(jeansCoordinates.x, jeansCoordinates.y, {force: true});
      canvas.trigger("mouseover", jeansCoordinates.x, jeansCoordinates.y, {force: true});

      canvas.rightclick(jeansCoordinates.x, jeansCoordinates.y, {force: true});
      cy.waitForAsyncRequest();
      graphExplore.stopStabilization();
    });
  });
});
