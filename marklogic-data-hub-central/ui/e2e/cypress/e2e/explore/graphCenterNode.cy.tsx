import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";
import graphExplore from "../../support/pages/graphExplore";
import browsePage from "../../support/pages/browse";

describe("Center node on graph", () => {
  before(() => {
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.loginAsDeveloper().withRequest();
    browsePage.navigate();

  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  it("Can center on node type in graph view", {defaultCommandTimeout: 120000}, () => {
    cy.log("**Go to graph view**");
    browsePage.switchToGraphView();
    graphExplore.getGraphVisCanvas().should("be.visible");
    cy.wait(2000);

    graphExplore.focusNode(ExploreGraphNodes.CUSTOMER_102);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let customer_102_nodePosition: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      graphExplore.getGraphVisCanvas().trigger("mouseover", customer_102_nodePosition.x, customer_102_nodePosition.y);
    });
    cy.wait(500);

    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let customer_102_nodePosition: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      cy.wait(150);
      graphExplore.getGraphVisCanvas().rightclick(customer_102_nodePosition.x, customer_102_nodePosition.y);
      graphExplore.getGraphVisCanvas().rightclick(customer_102_nodePosition.x, customer_102_nodePosition.y);
    });

    cy.wait(500);
    graphExplore.getCenterNodeOption().trigger("mouseover").click();

    let centeredNodeX: any;
    let centeredNodeY: any;

    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      centeredNodeX = nodePositions[ExploreGraphNodes.CUSTOMER_102].x;
      centeredNodeY = nodePositions[ExploreGraphNodes.CUSTOMER_102].y;

      cy.log("**Person entity coordinates should be within the center of canvas**");
      expect(centeredNodeX).to.be.greaterThan(700);
      expect(centeredNodeX).to.be.lessThan(800);
      expect(centeredNodeY).to.be.greaterThan(300);
      expect(centeredNodeY).to.be.lessThan(500);
    });
  });
});
