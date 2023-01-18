import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import graphExplore from "../../support/pages/graphExplore";
import LoginPage from "../../support/pages/login";
import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";
import browsePage from "../../support/pages/browse";



describe("Test '/Explore' graph right panel", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloperV2().withRequest();
    LoginPage.postLogin();
  });
  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });
  after(() => {
    cy.loginAsDeveloperV2().withRequest();
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Validate Unmerge from nodes and table on graph view", () => {


    cy.log("** Merge Person **");
    graphExplore.getRunTile().click();

    graphExplore.getPersonJSONacordeon().click();
    graphExplore.getMappingPerson().click();
    cy.wait(8000);
    graphExplore.getCloseModalMatchPerson().click();
    graphExplore.getRunButtonMatchPerson().click();
    cy.wait(8000);
    graphExplore.getCloseModalMatchPerson().click();
    graphExplore.getRunButtonMergePerson().click();
    cy.wait(8000);
    graphExplore.getCloseModalMergePerson().click();
    graphExplore.getTitleApp().click();

    cy.log("**Go to Explore section**");
    toolbar.getExploreToolbarIcon().click();


    cy.log("**Verify Graph view is default view**");
    graphExplore.getGraphVisCanvas().should("be.visible");
    cy.wait(8000); //nodes need to stabilize first, "graphExplore.stopStabilization()" does not seem to work
    browsePage.waitForSpinnerToDisappear();



    cy.log("**Verify icon dont display when  node is not merged**");
    graphExplore.focusNode(ExploreGraphNodes.BABY_REGISTRY_3039);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.BABY_REGISTRY_3039).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.BABY_REGISTRY_3039];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.trigger("mouseover", orderCoordinates.x, orderCoordinates.y, {force: true});
      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true});
    });
    graphExplore.getUnmergeIcon().should("not.exist");



    cy.log("**Verify unmerged option not visible in unmerged node**");
    graphExplore.focusNode(ExploreGraphNodes.BABY_REGISTRY_3039);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.BABY_REGISTRY_3039).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.BABY_REGISTRY_3039];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.trigger("mouseover", orderCoordinates.x, orderCoordinates.y, {force: true});
      canvas.rightclick(orderCoordinates.x, orderCoordinates.y, {force: true});
    });

    graphExplore.getUnmergeOption().should("not.exist");

    graphExplore.getSearchBar().type("Jones");
    graphExplore.getSearchButton().click();
    cy.wait(6000);

    cy.log("**Picking up a node available to merge**");
    graphExplore.focusNode(ExploreGraphNodes.MERGED_RECORD);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.MERGED_RECORD).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.MERGED_RECORD];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.trigger("mouseover", orderCoordinates.x, orderCoordinates.y, {force: true});
      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true});
    });
    cy.wait(3000);

    cy.log("**Verify unmerge icon is visible");
    graphExplore.getUnmergeIcon().should("be.visible");

    cy.log("**Open unmerge modal **");
    graphExplore.getUnmergeIcon().last().click();

    cy.log("**Verify Spinner**");
    graphExplore.getUnmergeSpinner().should("be.visible");

    cy.log("**Verify modal open**");
    graphExplore.getMergeModal().should("be.visible");
    graphExplore.getCloseCompareModal().last().click();

    cy.log("**Verify unmerged option in merged node**");
    graphExplore.focusNode(ExploreGraphNodes.MERGED_RECORD);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.MERGED_RECORD).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.MERGED_RECORD];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.trigger("mouseover", orderCoordinates.x, orderCoordinates.y, {force: true});
      canvas.rightclick(orderCoordinates.x, orderCoordinates.y, {force: true});
    });

    graphExplore.getUnmergeOption().should("be.visible");

  });
});