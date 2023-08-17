import {compareValuesModal} from "../../support/components/matching/index";
import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import graphExplore from "../../support/pages/graphExplore";
import {toolbar} from "../../support/components/common";
import explorePage from "../../support/pages/explore";
import browsePage from "../../support/pages/browse";
import homePage from "../../support/pages/home";
import runPage from "../../support/pages/run";

describe("Test '/Explore' graph right panel", () => {
  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteRecordsInFinal("master-person", "sm-Person-auditing", "match-person", "merge-person", "sm-Person-merged", "sm-Person-mastered", "sm-Person-notification", "mdm-content", "no-match", "datahubMasteringMatchSummary-Person");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Validate Unmerge from nodes and table on graph view", () => {
    cy.loginAsDeveloperV2().withRequest();
    explorePage.navigate();

    cy.log("** Merge Person **");
    graphExplore.getRunTile().click();
    cy.intercept("GET", "/api/jobs/**").as("runResponse");

    graphExplore.getPersonJSONacordeon().click();
    graphExplore.getMappingPerson().click();
    cy.wait("@runResponse");
    cy.wait(8000);
    graphExplore.getCloseModalMatchPerson().click();
    graphExplore.getRunButtonMatchPerson().click();
    cy.wait("@runResponse");
    cy.wait(8000);
    graphExplore.getCloseModalMatchPerson().click();
    graphExplore.getRunButtonMergePerson().click();
    cy.wait("@runResponse");
    cy.wait(8000);
    graphExplore.getCloseModalMergePerson().click({force: true});
    graphExplore.getTitleApp().click();

    cy.log("**Go to Explore section**");
    explorePage.navigate();

    cy.log("**Verify Graph view is default view**");
    graphExplore.getGraphVisCanvas().should("be.visible");
    cy.wait(8000);
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
    cy.loginAsOperator().withRequest();
    homePage.navigate();
    cy.log("** Click notification bell icon to open modal **");
    toolbar.getHomePageNotificationIcon().click({force: true});
    toolbar.getNotificationTitle().should("be.visible");

    browsePage.getMergeIconDisabled().trigger("mouseover");
    cy.findByText("Merge: Contact your security administrator for access.");
  });

  it("Merge icon disabled in all Data, missing permission", () => {
    cy.loginAsOperator().withRequest();
    cy.visit("tiles-explore");
    cy.waitForAsyncRequest();

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
    explorePage.navigate();
    browsePage.getMergeIcon().first().scrollIntoView().should("be.visible");
    browsePage.getMergeIcon().first().trigger("mouseover");
    cy.findByText("Merge: Contact your security administrator for access.");
  });

  it("unMerge icon disabled on SnippetView/TableView and  when user doesn't have writeMatching and writeMerging rights ", () => {
    cy.loginAsOperator().withRequest();
    cy.visit("tiles-explore");
    cy.waitForAsyncRequest();

    graphExplore.getGraphVisCanvas().should("be.visible");
    cy.wait(8000);
    browsePage.waitForSpinnerToDisappear();
    graphExplore.getSearchBar().type("Jones");
    graphExplore.getSearchButton().click();
    cy.wait(6000);

    browsePage.switchToSnippetView();
    cy.log("** unmerge icon should be visible**");
    browsePage.getUnmergeIcon().should("have.length", 1);
    cy.log("** when hover unmerge icon should show a security tooltip**");
    browsePage.getUnmergeIcon().trigger("mouseover");
    cy.findByText("Unmerge: Contact your security administrator for access.");

    browsePage.switchToTableView();
    browsePage.getUnmergeIcon().should("have.length", 1);
    cy.log("** when hover unmerge icon should show a security tooltip**");
    browsePage.getUnmergeIcon().trigger("mouseover");
    cy.findByText("Unmerge: Contact your security administrator for access.");

    browsePage.switchToGraphView();

    cy.log("**Verify Graph view is default view**");
    graphExplore.getGraphVisCanvas().should("be.visible");
    cy.wait(8000);
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

    cy.log("** when hover unmerge icon should show a security tooltip**");
    browsePage.getUnmergeIcon().trigger("mouseover");
    cy.findAllByText("Unmerge: Contact your security administrator for access.");

    cy.log("** when hover unmerge icon should show a security tooltip**");
    graphExplore.getUnmergeOption().should("be.visible");
    graphExplore.getUnmergeOption().trigger("mouseover");
    cy.findAllByText("Unmerge: Contact your security administrator for access.");
  });

  it("Navigate to Table View and Filter Person entity", () => {
    cy.loginAsDeveloperV2().withRequest();
    cy.visit("tiles-explore");
    cy.waitForAsyncRequest();

    browsePage.switchToTableView();
    cy.wait(3000);
    graphExplore.getSearchBar().type("Jones");
    graphExplore.getSearchButton().click();
    cy.wait(3000);
    entitiesSidebar.baseEntityDropdown.click();
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

  it("Navigate to Snippet View and verify unmerge option is available", () => {
    browsePage.switchToSnippetView();
    cy.log("** unmerge icon should be visible on merged records in snippet view**");
    browsePage.getUnmergeIcon().should("have.length", 1);
    browsePage.getUnmergeIcon().first().scrollIntoView().should("be.visible");
    browsePage.getUnmergeIcon().first().click();
    compareValuesModal.getModal().should("be.visible");
    compareValuesModal.getUnmergeButton().should("be.visible");

    cy.log("** cancel button closes modal **");
    compareValuesModal.getCancelButton().click();
    compareValuesModal.getModal().should("not.exist");
  });

  it("Unmerge record and validate include unmerged documents checkbox", () => {
    cy.log("** Reopen modal and submit unmerge **");
    browsePage.getUnmergeIcon().first().scrollIntoView().click();
    compareValuesModal.getModal().should("be.visible");
    compareValuesModal.getInclusionCheckbox().click();
    compareValuesModal.getUnmergeButton().click().then(() => {
      cy.findByText("Are you sure you want to unmerge this document? By doing so, the original documents will be moved out of the archive collection and also considered for future matches.").should("be.visible");
    });
    compareValuesModal.confirmationYes().click();
    compareValuesModal.getModal().should("not.exist");

    browsePage.getUnmergeIcon().should("not.exist");

    graphExplore.getRunTile().click();
    cy.intercept("GET", "/api/jobs/**").as("runResponse");

    graphExplore.getPersonJSONacordeon().click();
    graphExplore.getRunButtonMatchPerson().click();
    cy.wait("@runResponse");
    runPage.verifyStepRunResult("match-person", "success");
    cy.waitForAsyncRequest();
    graphExplore.getCloseModalMatchPerson().click();
    graphExplore.getRunButtonMergePerson().click();
    cy.wait("@runResponse");
    runPage.verifyStepRunResult("merge-person", "success");
    cy.waitForAsyncRequest();
    graphExplore.getCloseModalMergePerson().click({force: true});

    toolbar.getExploreToolbarIcon().click();
    browsePage.switchToTableView();
    cy.log("** Unmerge icon should be visible because of inclusion checkbox**");
    browsePage.getUnmergeIcon().should("be.visible");
  });

  it("Unmerge record and validate document is not merged again", () => {
    cy.log("** Reopen modal and submit unmerge **");
    browsePage.getUnmergeIcon().first().scrollIntoView().click();
    compareValuesModal.getModal().should("be.visible");
    compareValuesModal.getUnmergeButton().click().then(() => {
      cy.findByText("Are you sure you want to unmerge this document? By doing so, the original documents will be moved out of the archive collection and be prevented from future match consideration.").should("be.visible");
    });
    compareValuesModal.confirmationYes().click();
    compareValuesModal.getModal().should("not.exist");

    browsePage.getUnmergeIcon().should("not.exist");

    graphExplore.getRunTile().click();
    cy.intercept("GET", "/api/jobs/**").as("runResponse");

    graphExplore.getPersonJSONacordeon().click();
    graphExplore.getRunButtonMatchPerson().click();
    cy.wait("@runResponse");
    runPage.verifyStepRunResult("match-person", "success");
    cy.waitForAsyncRequest();
    graphExplore.getCloseModalMatchPerson().click();
    graphExplore.getRunButtonMergePerson().click();
    cy.wait("@runResponse");
    runPage.verifyStepRunResult("merge-person", "success");
    cy.waitForAsyncRequest();
    graphExplore.getCloseModalMergePerson().click({force: true});
    toolbar.getExploreToolbarIcon().click();
    browsePage.switchToTableView();
    cy.log("** Unmerge icon should not be visible because of inclusion checkbox**");
    browsePage.getUnmergeIcon().should("not.exist");
  });
});
