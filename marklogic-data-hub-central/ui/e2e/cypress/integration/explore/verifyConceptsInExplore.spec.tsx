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
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
    cy.log("**Navigate to Explore**");
    toolbar.getExploreToolbarIcon().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage();
  });
  afterEach(() => {
    // update local storage
    cy.saveLocalStorage();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Validate that the concepts toggle works correctly", {defaultCommandTimeout: 120000}, () => {
    //Graph view
    cy.log("**Go to graph view**");
    browsePage.clickGraphView();
    cy.waitForAsyncRequest();
    graphExplore.getGraphVisCanvas().should("be.visible");
    graphExplore.stopStabilization();

    cy.log("**Select 'Product' entity**");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Product");
    entitiesSidebar.getBaseEntityOption("Product").scrollIntoView().should("be.visible");
    cy.wait(5000); // The canvas takes some more time animating

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
    graphExplore.focusNode(ExploreGraphNodes.CONCEPT_KETTLE);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_KETTLE).then((nodePositions: any) => {
      let kettleCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_KETTLE];
      //it should not exist because the leaf node was collapsed
      cy.log("**Kettle coordinates should not exist because it was collapsed**");
      expect(kettleCoordinates).to.be.undefined;
    });

    cy.log("**Turn ON concepts toggle**");
    graphView.getConceptToggle().scrollIntoView().trigger("mouseover").click();

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
  });

  it("Validate that the concepts facets are applied properly", {defaultCommandTimeout: 120000}, () => {
    //Graph view
    cy.log("**Go to graph view**");
    browsePage.clickGraphView();
    cy.waitForAsyncRequest();
    graphExplore.getGraphVisCanvas().should("be.visible");
    graphExplore.stopStabilization();

    cy.log("**Select 'Product' entity**");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Product");
    entitiesSidebar.getBaseEntityOption("Product").scrollIntoView().should("be.visible");
    cy.wait(5000); // The canvas takes some more time animating

    entitiesSidebar.toggleRelatedConceptsPanel();
    entitiesSidebar.showMoreRelatedConcept().click();
    browsePage.getFacetItemCheckbox("relatedconcepts", "Sneakers").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getGreySelectedFacets("Sneakers").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    cy.wait(3000);
  });

  it("Verify Kettle concept node is not visible in the canvas anymore", {defaultCommandTimeout: 120000}, () => {
    graphExplore.focusNode(ExploreGraphNodes.CONCEPT_KETTLE);
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
  it("Verify Kettle concept node should be visible when selected as facet", {defaultCommandTimeout: 120000}, () => {
    browsePage.clickMoreLink("relatedconcepts");
    browsePage.getFacetItemCheckbox("relatedconcepts", "Kettle").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getGreySelectedFacets("Kettle").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    cy.wait(3000);

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
  it("Validate that the physics animation toggle is visible and the tooltip works on it", {defaultCommandTimeout: 120000}, () => {
    //Graph view
    cy.log("**Go to graph view**");
    browsePage.clickGraphView();
    cy.waitForAsyncRequest();
    graphExplore.getGraphVisCanvas().should("be.visible");
    graphExplore.stopStabilization();

    //Verify if the tooltip is visible
    graphView.getPhysicsAnimationHelpIcon().trigger("mouseover", {force: true});
    graphView.getPhysicsAnimationTooltip().should("be.visible");

    graphView.getPhysicsAnimationToggle().should("have.value", "true");

    graphView.getPhysicsAnimationToggle().scrollIntoView().trigger("mouseover").click();
    graphView.getPhysicsAnimationToggle().should("have.value", "false");
  });

});