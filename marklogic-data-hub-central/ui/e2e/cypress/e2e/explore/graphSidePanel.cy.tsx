import graphExploreSidePanel from "../../support/components/explore/graph-explore-side-panel";
import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";
import graphExplore from "../../support/pages/graphExplore";
import {toolbar} from "../../support/components/common";
import browsePage from "../../support/pages/browse";
import LoginPage from "../../support/pages/login";

const TABLE_HEADERS = ["Property", "Value"];

describe("Test '/Explore' graph right panel", () => {
  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.loginAsDeveloper().withRequest();
    LoginPage.navigateToMainPage();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  it("Validate that the right panel opens and display node's information", () => {
    cy.log("**Go to Explore section**");
    toolbar.getExploreToolbarIcon().click();

    cy.log("**Verify Graph view is default view**");
    graphExplore.getGraphVisCanvas().should("be.visible");
    cy.wait(8000);
    browsePage.waitForSpinnerToDisappear();
    browsePage.search("10258");

    cy.log("**Picking up a node**");
    graphExplore.focusNode(ExploreGraphNodes.ORDER_10258);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.ORDER_10258).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.ORDER_10258];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.trigger("mouseover", orderCoordinates.x, orderCoordinates.y, {force: true});
      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true});
    });
    cy.wait(3000);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.ORDER_10258).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.ORDER_10258];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true});
    });

    cy.log("**View json record type information**");
    graphExplore.getRecordTab().click();
    graphExplore.getJsonRecordData().should("be.visible");

    cy.log("**Inspect detail view icons and labels**");
    graphExplore.getGraphViewRightArrow().should("have.length.gt", 0);
    graphExplore.getJsonTypeDetailView().should("have.length.gt", 0);

    cy.log("**Inspect instance tab content**");
    graphExplore.getInstanceTab().click();
    const headers = graphExplore.getTableHeaders();
    headers.should("have.length", 2);
    headers.each((item, i) => {
      expect(item).to.have.text(TABLE_HEADERS[i]);
    });
    let children = graphExplore.getTableChildren();
    children.should("have.length", 1);

    cy.log("**Expand one element**");
    graphExplore.getExpandRows().last().click();
    children = graphExplore.getTableChildren();
    children.should("have.length.greaterThan", 1);

    cy.log("**Collapse one element**");
    graphExplore.getExpandRows().last().click();
    children = graphExplore.getTableChildren();
    children.should("have.length", 1);

    cy.log("**Expand all element's properties**");
    graphExplore.clickOnExpandAll();
    children = graphExplore.getTableChildren();
    children.should("have.length.greaterThan", 1);

    cy.log("**Collapse all element's properties**");
    graphExplore.clickOnCollapseAll();
    children = graphExplore.getTableChildren();
    children.should("have.length", 1);

    cy.log("**Close side panel**");
    graphExploreSidePanel.closeGraphExploreSidePanel();
    browsePage.search("Kettle");

    cy.log("**Picking up a concept node**");
    graphExplore.focusNode(ExploreGraphNodes.CONCEPT_KETTLE);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_KETTLE).then((nodePositions: any) => {
      let kettleCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_KETTLE];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.trigger("mouseover", kettleCoordinates.x, kettleCoordinates.y);
      canvas.click(kettleCoordinates.x, kettleCoordinates.y, {force: true});
    });
    cy.wait(1000);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CONCEPT_KETTLE).then((nodePositions: any) => {
      let kettleCoordinates: any = nodePositions[ExploreGraphNodes.CONCEPT_KETTLE];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.click(kettleCoordinates.x, kettleCoordinates.y, {force: true});
    });

    cy.log("**Verify the count of related instances for the concept node**");
    graphExploreSidePanel.getSidePanelConceptHeading("Kettle").scrollIntoView().should("be.visible");
    graphExploreSidePanel.getSidePanelConceptHeadingInfo("Kettle").scrollIntoView().should("be.visible");
    graphExploreSidePanel.getTableCellValueByName("1").should("contain", "Product");
  });

  it("Retain state when select facets", () => {
    cy.log("**Go to Explore section**");
    toolbar.getExploreToolbarIcon().click();

    cy.log("**Verify Graph view is default view**");
    cy.wait(6000);
    browsePage.waitForSpinnerToDisappear();
    graphExplore.getGraphVisCanvas().should("be.visible");
    cy.clearLocalStorage();
    browsePage.getAllDataButton().click();
    cy.wait(2000);
    browsePage.getStagingButton().click();
    cy.findByTestId("collection-loadPersonJSON-checkbox").click();
    cy.findByTestId("facet-apply-button").click();
    cy.wait(1500);
    cy.findByTestId("/json/persons/last-name-dob-custom1.json-detailViewIcon").click();
    cy.wait(1500);
    cy.findByLabelText("Back").click();
    cy.wait(6000);
    cy.get("[data-cy=\"clear-loadPersonJSON\"]");
  });
});


