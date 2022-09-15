import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import graphExploreSidePanel from "../../support/components/explore/graph-explore-side-panel";
import graphExplore from "../../support/pages/graphExplore";
import LoginPage from "../../support/pages/login";
import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";

const TABLE_HEADERS = ["Property", "Value"];

describe("Test '/Explore' graph right panel", () => {
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
    cy.restoreLocalStorage();
  });

  it("Validate that the right panel opens and display node's information", () => {
    cy.log("**Go to Explore section**");
    toolbar.getExploreToolbarIcon().click();

    cy.log("**Verify Graph view is default view**");
    graphExplore.getGraphVisCanvas().should("be.visible");
    cy.wait(8000); //nodes need to stabilize first, "graphExplore.stopStabilization()" does not seem to work

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
});


