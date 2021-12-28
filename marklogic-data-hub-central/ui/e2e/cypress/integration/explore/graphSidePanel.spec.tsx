import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import browsePage from "../../support/pages/browse";
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
    Cypress.Cookies.preserveOnce("HubCentralSession");
    cy.restoreLocalStorage();
  });

  it("Validate that the right panel opens and display node's information", () => {
    cy.log("**Go to Explore section?**");
    toolbar.getExploreToolbarIcon().click();

    cy.log("**Select Graph view**");
    browsePage.clickGraphView();
    graphExplore.getGraphVisCanvas().should("be.visible");
    //cy.wait(2000);
    graphExplore.stopStabilization();

    cy.log("**Picking up a node**");
    graphExplore.focusNode(ExploreGraphNodes.ORDER_10258);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.ORDER_10258).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.ORDER_10258];
      const canvas = graphExplore.getGraphVisCanvas();
      const trigger = canvas.trigger("mouseover", orderCoordinates.x, orderCoordinates.y);
      trigger.click({force: true});
      trigger.click({force: true});
    });

    cy.log("**Inspect instance tab content**");
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
  });
});


