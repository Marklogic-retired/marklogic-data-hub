import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import graphExplore from "../../support/pages/graphExplore";
import LoginPage from "../../support/pages/login";
import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";
import {compareValuesModal} from "../../support/components/matching/index";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import browsePage from "../../support/pages/browse";
import explorePage from "../../support/pages/explore";

describe("Test '/Explore' graph right panel", () => {
  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });



  it("Validate Unmerge from nodes and table on graph view", () => {
    cy.clearAllSessionStorage();
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloperV2().withRequest();
    LoginPage.postLogin();

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



    cy.log("**Verify icon dont display when node is not merged**");
    graphExplore.focusNode(ExploreGraphNodes.PRODUCT_70);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.PRODUCT_70).then((nodePositions: any) => {
      let prodCoordinates: any = nodePositions[ExploreGraphNodes.PRODUCT_70];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.trigger("mouseover", prodCoordinates.x, prodCoordinates.y, {force: true});
      canvas.click(prodCoordinates.x, prodCoordinates.y, {force: true});
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


  it("Merge Icon disabled, missing permission", () => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsOperator().withRequest();
    LoginPage.postLogin();
    cy.log("** Click notification bell icon to open modal **");
    toolbar.getHomePageNotificationIcon().click({force: true});
    toolbar.getNotificationTitle().should("be.visible");

    browsePage.getMergeIconDisabled().trigger("mouseover");
    cy.findByText("Merge: Contact your security administrator for access.");
  });

  it("Merge icon disabled in all Data, missing permission", () => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsOperator().withRequest();
    LoginPage.postLogin();
    toolbar.getExploreToolbarIcon().click();
    cy.wait(8000);
    browsePage.waitForSpinnerToDisappear();
    browsePage.getClearAllFacetsButton().then(($ele) => {
      if ($ele.is(":enabled")) {
        cy.log("**clear all facets**");
        browsePage.getClearAllFacetsButton().click();
        browsePage.waitForSpinnerToDisappear();
      }
    });
    explorePage.getAllDataButton().click();
    browsePage.waitForSpinnerToDisappear();
    cy.log("**filter data**");
    graphExplore.getSearchBar().type("match-person");
    graphExplore.getSearchButton().click();
    cy.wait(4000);
    browsePage.waitForSpinnerToDisappear();
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    browsePage.getMergeIcon().first().scrollIntoView().should("be.visible");
    browsePage.getMergeIcon().first().trigger("mouseover");
    cy.findByText("Merge: Contact your security administrator for access.");
  });


  it("unMerge icon disabled on SnippetView/TableView and  when user doesn't have writeMatching and writeMerging rights ", () => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsOperator().withRequest();
    LoginPage.postLogin();

    cy.log("**Go to Explore section**");
    toolbar.getExploreToolbarIcon().click();
    graphExplore.getGraphVisCanvas().should("be.visible");
    cy.wait(8000); //nodes need to stabilize first, "graphExplore.stopStabilization()" does not seem to work
    browsePage.waitForSpinnerToDisappear();
    graphExplore.getSearchBar().type("Jones");
    graphExplore.getSearchButton().click();
    cy.wait(6000);

    // SnippetView
    browsePage.clickSnippetView();
    cy.log("** unmerge icon should be visible**");
    browsePage.getUnmergeIcon().should("have.length", 1);
    cy.log("** when hover unmerge icon should show a security tooltip**");
    browsePage.getUnmergeIcon().trigger("mouseover");
    cy.findByText("Unmerge: Contact your security administrator for access.");

    //TableView
    browsePage.clickTableView();
    browsePage.getUnmergeIcon().should("have.length", 1);
    cy.log("** when hover unmerge icon should show a security tooltip**");
    browsePage.getUnmergeIcon().trigger("mouseover");
    cy.findByText("Unmerge: Contact your security administrator for access.");

    //Graph explore
    browsePage.clickGraphView();

    cy.log("**Verify Graph view is default view**");
    graphExplore.getGraphVisCanvas().should("be.visible");
    cy.wait(8000); //nodes need to stabilize first, "graphExplore.stopStabilization()" does not seem to work
    browsePage.waitForSpinnerToDisappear();


    cy.log("**Picking up a node available to merge**");
    graphExplore.focusNode(ExploreGraphNodes.MERGED_RECORD);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.MERGED_RECORD).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.MERGED_RECORD];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.trigger("mouseover", orderCoordinates.x, orderCoordinates.y, {force: true});
      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true});
      canvas.rightclick(orderCoordinates.x, orderCoordinates.y, {force: true});
    });
    cy.wait(3000);

    cy.log("**Verify unmerge icon is visible");
    graphExplore.getUnmergeIcon().should("be.visible");
    browsePage.getUnmergeIcon().should("have.length", 1);

    // Check unmerge icon in side panel
    cy.log("** when hover unmerge icon should show a security tooltip**");
    browsePage.getUnmergeIcon().trigger("mouseover");
    cy.findAllByText("Unmerge: Contact your security administrator for access.");

    // Check unmerge option in right click node
    cy.log("** when hover unmerge icon should show a security tooltip**");
    graphExplore.getUnmergeOption().should("be.visible");
    graphExplore.getUnmergeOption().trigger("mouseover");
    cy.findAllByText("Unmerge: Contact your security administrator for access.");
  });

  it("Navigate to Table View and Filter Person entity", () => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloperV2().withRequest();
    LoginPage.postLogin();
    //Saving Local Storage to preserve session

    cy.log("**Go to Explore section**");
    toolbar.getExploreToolbarIcon().click();

    cy.log("**Verify Graph view is default view**");
    graphExplore.getGraphVisCanvas().should("be.visible");
    cy.wait(8000); //nodes need to stabilize first, "graphExplore.stopStabilization()" does not seem to work
    browsePage.waitForSpinnerToDisappear();

    graphExplore.getSearchBar().type("Jones");
    graphExplore.getSearchButton().click();
    cy.wait(6000);
    browsePage.clickTableView();
    entitiesSidebar.getBaseEntityDropdown().click();
    entitiesSidebar.selectBaseEntityOption("Person");
    cy.log("** unmerge icon should be visible on merged records in table view**");
    browsePage.getUnmergeIcon().should("be.visible");
    cy.log("** verify compare values modal when clicking unmerge icon **");
    browsePage.getUnmergeIcon().should("have.length", 1);
    browsePage.getUnmergeIcon().first().click();
    compareValuesModal.getModal().should("be.visible");
    cy.log("** unmerged previews and original doc uri should exist **");
    compareValuesModal.getUnmergedPreview().should("be.visible");
    compareValuesModal.getUnmergeButton().should("be.visible");

    cy.log("** cancel button closes modal **");
    compareValuesModal.getCancelButton().click();
    compareValuesModal.getModal().should("not.exist");
  });

  it("Switch to Snippet View", () => {
    browsePage.clickSnippetView();
    cy.log("** unmerge icon should be visible on merged records in snippet view**");
    browsePage.getUnmergeIcon().should("have.length", 1);
    browsePage.getUnmergeIcon().first().scrollIntoView().should("be.visible");
    cy.log("** verify compare values modal when clicking unmerge icon **");
    browsePage.getUnmergeIcon().first().click();
    compareValuesModal.getModal().should("be.visible");
    compareValuesModal.getUnmergeButton().should("be.visible");

    cy.log("** cancel button closes modal **");
    compareValuesModal.getCancelButton().click();
    compareValuesModal.getModal().should("not.exist");

    cy.log("** reopen modal and submit unmerge **");
    browsePage.getUnmergeIcon().first().scrollIntoView().click();
    compareValuesModal.getModal().should("be.visible");
    compareValuesModal.getUnmergeButton().click();
    compareValuesModal.confirmationYes().click();
    compareValuesModal.getModal().should("not.exist");

    cy.log("** confirm merged record is unmerged **");
    browsePage.getUnmergeIcon().should("not.exist");
  });
});