import {toolbar} from "../../support/components/common";
import browsePage from "../../support/pages/browse";
import graphExplore from "../../support/pages/graphExplore";
import LoginPage from "../../support/pages/login";
import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";

describe("Center node on graph", () => {
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

  it("can center on node type in graph view", {defaultCommandTimeout: 120000}, () => {
    //Graph view
    cy.log("**Go to graph view**");
    browsePage.clickGraphView();
    graphExplore.getGraphVisCanvas().should("be.visible");
    cy.wait(5000);

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

      //Person entity coordinates should be within the center of canvas
      expect(centeredNodeX).to.be.greaterThan(700);
      expect(centeredNodeX).to.be.lessThan(800);
      expect(centeredNodeY).to.be.greaterThan(300);
      expect(centeredNodeY).to.be.lessThan(500);
    });
  });
});