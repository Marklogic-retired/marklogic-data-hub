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
  });
  before(() => {
    cy.log("**Navigate to Explore**");
    toolbar.getExploreToolbarIcon().click();
    browsePage.waitForSpinnerToDisappear();
  });

  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    Cypress.Cookies.preserveOnce("HubCentralSession");
    cy.restoreLocalStorage();
  });

  it("Validate that the concepts toggle works correctly", () => {
    //Graph view
    cy.log("**Go to graph view**");
    browsePage.clickGraphView();
    graphExplore.getGraphVisCanvas().should("be.visible");
    graphExplore.stopStabilization();

    cy.log("**Select 'Product' entity**");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Product");
    entitiesSidebar.getBaseEntityOption("Product").should("be.visible");
    cy.wait(2000);

    cy.log("**Picking up a concept node**");
    graphExplore.focusNode(ExploreGraphNodes.CONCEPT_KETTLE);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_KETTLE).then((nodePositions: any) => {
      let kettleCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_KETTLE];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.click(kettleCoordinates.x, kettleCoordinates.y, {force: true});
    });

    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_KETTLE).then((nodePositions: any) => {
      let kettleCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_KETTLE];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.click(kettleCoordinates.x, kettleCoordinates.y, {force: true});
    });

    cy.log("**Verify the side panel opened up for kettle concept node**");
    graphExploreSidePanel.getSidePanel().should("exist");
    graphExploreSidePanel.getSidePanelConceptHeading("Kettle").scrollIntoView().should("be.visible");
    graphExploreSidePanel.getSidePanelConceptHeadingInfo("Kettle").scrollIntoView().should("be.visible");
    graphExploreSidePanel.getTableCellValueByName("1").should("contain", "Product");

    cy.log("**Turn OFF concepts toggle**");
    graphView.getConceptToggle().scrollIntoView().trigger("mouseover").click();

    cy.wait(3000);

    cy.log("**Verify Kettle concept node is not visible in the canvas anymore**");
    graphExplore.focusNode(ExploreGraphNodes.CONCEPT_KETTLE);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_KETTLE).then((nodePositions: any) => {
      let kettleCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_KETTLE];
      const canvas = graphExplore.getGraphVisCanvas();

      //Click on node to open side panel
      canvas.click(kettleCoordinates.x, kettleCoordinates.y, {force: true});
      canvas.click(kettleCoordinates.x, kettleCoordinates.y, {force: true});
      graphExploreSidePanel.getSidePanel().should("not.exist");
    });

    cy.log("**Turn ON concepts toggle**");
    graphView.getConceptToggle().scrollIntoView().trigger("mouseover").click();

    cy.wait(3000);

    cy.log("**Verify Kettle concept node is visible again**");
    graphExplore.focusNode(ExploreGraphNodes.CONCEPT_KETTLE);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_KETTLE).then((nodePositions: any) => {
      let kettleCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_KETTLE];
      const canvas = graphExplore.getGraphVisCanvas();

      //Click on node to open side panel
      canvas.click(kettleCoordinates.x, kettleCoordinates.y, {force: true});
      canvas.click(kettleCoordinates.x, kettleCoordinates.y, {force: true});
      graphExploreSidePanel.getSidePanel().should("exist");
    });
  });
});