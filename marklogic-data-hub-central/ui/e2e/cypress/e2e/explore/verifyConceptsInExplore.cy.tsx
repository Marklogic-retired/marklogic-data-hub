import {toolbar} from "../../support/components/common";
import browsePage from "../../support/pages/browse";
import graphExplore from "../../support/pages/graphExplore";
import LoginPage from "../../support/pages/login";
import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import graphExploreSidePanel from "../../support/components/explore/graph-explore-side-panel";
import graphView from "../../support/components/explore/graph-view";

describe("Concepts", () => {
  before(() => {
    cy.visit("/");
    cy.log("**Logging into the app as a developer**");
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    cy.log("**Navigate to Explore**");
    toolbar.getExploreToolbarIcon().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Validate record counts changes when toggling concepts", () => {
    //Graph view
    cy.log("**Go to graph view**");
    browsePage.clickGraphView();
    graphExplore.getGraphVisCanvas().should("be.visible");
    cy.log("**Verify results number change**");
    cy.log("**Turn off concepts on graph**");
    graphView.getConceptToggle().scrollIntoView().trigger("mouseover").click();
    graphExplore.getViewingResultsCount().should("be.lessThan", 68);
    cy.log("**Turn on concepts on graph**");
    graphView.getConceptToggle().scrollIntoView().trigger("mouseover").click();
  });
  it("Validate that the concepts toggle works correctly", {defaultCommandTimeout: 200000}, () => {
    //Graph view
    cy.log("**Go to graph view**");
    browsePage.clickGraphView();
    graphExplore.getGraphVisCanvas().should("be.visible");

    graphView.getPhysicsAnimationToggle().scrollIntoView().should("have.value", "true");
    graphView.getPhysicsAnimationToggle().scrollIntoView().trigger("mouseover").click();
    graphView.getPhysicsAnimationToggle().scrollIntoView().should("have.value", "false");
    graphExplore.stopStabilization();

    cy.log("**Select 'Product' entity**");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Product");
    graphView.physicsAnimationToggle();

    cy.log("**Picking up a concept node**");
    graphExplore.focusNode(ExploreGraphNodes.CONCEPT_KETTLE);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_KETTLE).then((nodePositions: any) => {
      let kettleCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_KETTLE];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.trigger("mouseover", kettleCoordinates.x, kettleCoordinates.y, {force: true});
      canvas.click(kettleCoordinates.x, kettleCoordinates.y, {force: true});
    });

    cy.log("**Verify the side panel opened up for kettle concept node**");
    graphExploreSidePanel.getSidePanel().should("exist");
    graphExploreSidePanel.getSidePanelConceptHeading("Kettle").scrollIntoView().should("be.visible");
    graphExploreSidePanel.getSidePanelConceptHeadingInfo("Kettle").scrollIntoView().should("be.visible");
    graphExploreSidePanel.getTableCellValueByName("1").should("contain", "Product");

    cy.log("**Turn OFF concepts toggle**");
    graphView.getConceptToggle().scrollIntoView().trigger("mouseover").click();

    cy.wait(4000);

    cy.log("**Verify Kettle concept node is not visible in the canvas anymore**");
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_KETTLE).then((nodePositions: any) => {
      let kettleCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_KETTLE];
      //it should not exist because the leaf node was collapsed
      cy.log("**Kettle coordinates should not exist because it was collapsed**");
      expect(kettleCoordinates).to.be.undefined;
    });

    cy.log("**Validate show related doesn't show concepts when toggle is off");
    graphView.getPhysicsAnimationToggle().scrollIntoView().trigger("mouseover").click();

    cy.wait(4000);

    graphExplore.fit();
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.OFFICE_101).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.OFFICE_101];
      const canvas = graphExplore.getGraphVisCanvas();
      // Right click and expand the remaining records of the node
      canvas.rightclick(orderCoordinates.x, orderCoordinates.y, {force: true});
      graphExplore.clickShowRelated();
    });

    cy.wait(4000);

    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_JEANS).then((nodePositions: any) => {
      let jeansCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_JEANS];
      //it should not exist because the leaf node was collapsed
      cy.log("**Jeans coordinates should not exist because toggle is off**");
      expect(jeansCoordinates).to.be.undefined;
    });


    cy.log("**Verify that Related Concepts Filter in sidebar is disabled since concepts are toggled OFF**");
    entitiesSidebar.getRelatedConceptsPanel().trigger("mouseover");
    entitiesSidebar.getDisabledRelatedConceptsTooltip().should("be.visible");
    entitiesSidebar.getAllRelatedConceptsCheckbox().should("be.disabled");

    cy.log("**Turn ON concepts toggle**");
    graphView.getConceptToggle().scrollIntoView().trigger("mouseover").click();
    entitiesSidebar.getAllRelatedConceptsCheckbox().should("be.checked");

    cy.wait(4000);

    cy.log("**Verify Kettle concept node is visible again**");
    graphExplore.focusNode(ExploreGraphNodes.CONCEPT_KETTLE);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_KETTLE).then((nodePositions: any) => {
      let kettleCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_KETTLE];
      const canvas = graphExplore.getGraphVisCanvas();

      //Click on node to open side panel
      canvas.trigger("mouseover", kettleCoordinates.x, kettleCoordinates.y, {force: true});
      canvas.click(kettleCoordinates.x, kettleCoordinates.y, {force: true});
      graphExploreSidePanel.getSidePanel().should("exist");
    });

    cy.log("**Validate related concepts appear when toggle back on");
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.OFFICE_101).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.OFFICE_101];
      const canvas = graphExplore.getGraphVisCanvas();

      // Right click and expand the remaining records of the node
      canvas.rightclick(orderCoordinates.x, orderCoordinates.y, {force: true});
      graphExplore.clickShowRelated();
    });

    cy.wait(4000);

    graphExplore.focusNode(ExploreGraphNodes.CONCEPT_JEANS);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_JEANS).then((nodePositions: any) => {
      let jeansCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_JEANS];
      const canvas = graphExplore.getGraphVisCanvas();

      //Click on node to open side panel
      canvas.trigger("mouseover", jeansCoordinates.x, jeansCoordinates.y, {force: true});
      canvas.click(jeansCoordinates.x, jeansCoordinates.y, {force: true});
      graphExploreSidePanel.getSidePanel().should("exist");
    });

  });

  it("Validate default related concepts filter in sidebar", {defaultCommandTimeout: 200000}, () => {
    //Graph view
    cy.log("**Go to graph view**");
    browsePage.clickGraphView();
    graphExplore.getGraphVisCanvas().should("be.visible");
    graphExplore.stopStabilization();
    graphExplore.getGraphVisCanvas().should("be.visible");

    cy.log("**All checkboxes should be checked by default since concepts are all being displayed**");
    entitiesSidebar.removeSelectedBaseEntity();
    entitiesSidebar.getRelatedConceptsPanel().click({force: true});
    entitiesSidebar.getAllRelatedConceptsCheckbox().should("be.checked");
    entitiesSidebar.getSingleConceptCheckbox("BasketballShoes").should("be.checked");
    entitiesSidebar.getSingleConceptCheckbox("Kettle").should("be.checked");
    entitiesSidebar.getSingleConceptCheckbox("SlowCooker").should("be.checked");
    entitiesSidebar.getSingleConceptCheckbox("Sneakers").should("be.checked");
    entitiesSidebar.getSingleConceptCheckbox("Jeans").should("be.checked");

    cy.log("**Confirm all concepts are being displayed**");
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_KETTLE).then((nodePositions: any) => {
      let kettleCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_KETTLE];
      //it should not exist because the facet is applied only for Sneakers
      expect(kettleCoordinates).not.to.be.undefined;
    });
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_BASKETBALLSHOES).then((nodePositions: any) => {
      let basketballShoesCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_BASKETBALLSHOES];
      //it should not exist because the facet is applied only for Sneakers
      expect(basketballShoesCoordinates).not.to.be.undefined;
    });
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_SLOWCOOKER).then((nodePositions: any) => {
      let slowCookerCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_SLOWCOOKER];
      //it should not exist because the facet is applied only for Sneakers
      expect(slowCookerCoordinates).not.to.be.undefined;
    });
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_JEANS).then((nodePositions: any) => {
      let jeansCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_JEANS];
      //it should not exist because the facet is applied only for Sneakers
      expect(jeansCoordinates).not.to.be.undefined;
    });
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_SNEAKERS).then((nodePositions: any) => {
      let sneakersCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_SNEAKERS];
      //it should not exist because the facet is applied only for Sneakers
      expect(sneakersCoordinates).not.to.be.undefined;
    });

    cy.log("**Verify uncheck all checkbox works**");
    entitiesSidebar.getAllRelatedConceptsCheckbox().click();
    entitiesSidebar.getAllRelatedConceptsCheckbox().should("not.be.checked");
    entitiesSidebar.getSingleConceptCheckbox("BasketballShoes").should("not.be.checked");
    entitiesSidebar.getSingleConceptCheckbox("Kettle").should("not.be.checked");
    entitiesSidebar.getSingleConceptCheckbox("SlowCooker").should("not.be.checked");
    entitiesSidebar.getSingleConceptCheckbox("Sneakers").should("not.be.checked");
    entitiesSidebar.getSingleConceptCheckbox("Jeans").should("not.be.checked");

    cy.log("**Confirm no concepts are being displayed**");
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_KETTLE).then((nodePositions: any) => {
      let kettleCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_KETTLE];
      //it should not exist because the facet is applied only for Sneakers
      expect(kettleCoordinates).to.be.undefined;
    });
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_BASKETBALLSHOES).then((nodePositions: any) => {
      let basketballShoesCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_BASKETBALLSHOES];
      //it should not exist because the facet is applied only for Sneakers
      expect(basketballShoesCoordinates).to.be.undefined;
    });
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_SLOWCOOKER).then((nodePositions: any) => {
      let slowCookerCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_SLOWCOOKER];
      //it should not exist because the facet is applied only for Sneakers
      expect(slowCookerCoordinates).to.be.undefined;
    });
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_JEANS).then((nodePositions: any) => {
      let jeansCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_JEANS];
      //it should not exist because the facet is applied only for Sneakers
      expect(jeansCoordinates).to.be.undefined;
    });
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_SNEAKERS).then((nodePositions: any) => {
      let sneakersCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_SNEAKERS];
      //it should not exist because the facet is applied only for Sneakers
      expect(sneakersCoordinates).to.be.undefined;
    });
  });

  it("Verify concepts reflect base entity selection", {defaultCommandTimeout: 200000}, () => {

    cy.log("**Select 'Product' entity**");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Product");
    cy.wait(5000); // The canvas takes some more time animating

    cy.log("**Verify only Product concepts are present and checked by default since they are shown**");

    entitiesSidebar.getAllRelatedConceptsCheckbox().should("be.checked");
    //concepts related to Product present
    entitiesSidebar.getSingleConceptCheckbox("BasketballShoes").should("be.checked");
    entitiesSidebar.getSingleConceptCheckbox("Kettle").should("be.checked");
    entitiesSidebar.getSingleConceptCheckbox("SlowCooker").should("be.checked");
    entitiesSidebar.getSingleConceptCheckbox("Sneakers").should("be.checked");
    //Jeans concept is not present
    entitiesSidebar.getSingleConceptCheckbox("Jeans").should("not.exist");
  });

  it("Uncheck Kettle concept node and verify it is not visible in the canvas anymore", {defaultCommandTimeout: 200000}, () => {
    entitiesSidebar.getSingleConceptCheckbox("Kettle").click();
    cy.wait(2000);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_KETTLE).then((nodePositions: any) => {
      let kettleCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_KETTLE];
      //it should not exist because the facet is applied only for Sneakers
      cy.log("**Kettle coordinates should not exist because it was collapsed**");
      expect(kettleCoordinates).to.be.undefined;
    });

    cy.log("**Verify Sneakers concept node should be visible**");
    graphExplore.focusNode(ExploreGraphNodes.CONCEPT_SNEAKERS);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_SNEAKERS).then((nodePositions: any) => {
      let sneakersCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_SNEAKERS];
      const canvas = graphExplore.getGraphVisCanvas();

      //Click on node to open side panel
      canvas.trigger("mouseover", sneakersCoordinates.x, sneakersCoordinates.y, {force: true});
      canvas.click(sneakersCoordinates.x, sneakersCoordinates.y, {force: true});
      graphExploreSidePanel.getSidePanel().should("exist");
    });
  });
  it("Verify Kettle concept node should be visible again when selected in the filter", {defaultCommandTimeout: 200000}, () => {
    entitiesSidebar.getSingleConceptCheckbox("Kettle").click();

    browsePage.waitForSpinnerToDisappear();
    graphView.physicsAnimationToggle();

    cy.log("**Verify Kettle concept node is visible again**");
    graphExplore.focusNode(ExploreGraphNodes.CONCEPT_KETTLE);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_KETTLE).then((nodePositions: any) => {
      let kettleCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_KETTLE];
      const canvas = graphExplore.getGraphVisCanvas();

      //Click on node to open side panel
      canvas.trigger("mouseover", kettleCoordinates.x, kettleCoordinates.y, {force: true});
      canvas.click(kettleCoordinates.x, kettleCoordinates.y, {force: true});
      graphExploreSidePanel.getSidePanel().should("exist");
    });
  });

  it("Validate that the physics animation toggle is visible and the tooltip works on it", {defaultCommandTimeout: 200000}, () => {
    //Graph view
    cy.log("**Go to graph view**");
    browsePage.clickGraphView();
    graphExplore.getGraphVisCanvas().should("be.visible");
    graphExplore.stopStabilization();

    //Verify if the tooltip is visible
    graphView.getPhysicsAnimationHelpIcon().trigger("mouseover", {force: true});
    graphView.getPhysicsAnimationTooltip().should("be.visible");
  });

});
