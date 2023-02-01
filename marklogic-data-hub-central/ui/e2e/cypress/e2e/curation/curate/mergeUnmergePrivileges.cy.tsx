import {Application} from "../../../support/application.config";
import {toolbar} from "../../../support/components/common";
import entitiesSidebar from "../../../support/pages/entitiesSidebar";
import "cypress-wait-until";
import LoginPage from "../../../support/pages/login";
import browsePage from "../../../support/pages/browse";
import explorePage from "../../../support/pages/explore";
import {compareValuesModal} from "../../../support/components/matching/index";

describe("Disabled Merge/Unmerge Permissions on All Screens", () => {

  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer").withRequest();
    LoginPage.postLogin();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Filter Person Entity in Explore", () => {
    toolbar.getExploreToolbarIcon().click();
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
    explorePage.getEntities().click();
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
    browsePage.waitForSpinnerToDisappear();
    browsePage.clickTableView();
    cy.wait(1000);
    cy.waitForAsyncRequest();
    entitiesSidebar.getBaseEntityDropdown().click();
    entitiesSidebar.selectBaseEntityOption("Person");
    cy.wait(1000); //adding explicit waits for now to get this stably in for beta
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.wait(1000);
    cy.log("** unmerge icon should be visible and disabled on merged records in table view **");
    browsePage.getUnmergeIcon().first().click({force: true});
    cy.log("** clicking disabled icon should not open modal **");
    compareValuesModal.getModal().should("not.exist");
    cy.log("** verify security permissions tooltip text **");
    browsePage.getPermissionsDeniedTooltip().should("be.visible");
    browsePage.getPermissionsDeniedTooltip().should("have.text", "Contact your security administrator for access.");
  });

  it("Switch to Snippet View", () => {
    browsePage.clickSnippetView();
    cy.log("** unmerge icon should be visible and disabled on merged records in snippet view **");
    browsePage.getUnmergeIcon().first().click({force: true});
    cy.log("** clicking disabled icon should not open modal **");
    compareValuesModal.getModal().should("not.exist");
    cy.log("** verify security permissions tooltip text **");
    browsePage.getPermissionsDeniedTooltip().should("be.visible");
    browsePage.getPermissionsDeniedTooltip().should("have.text", "Contact your security administrator for access.");

  });

  it("Switch to All Data for the merge notification", () => {
    entitiesSidebar.toggleAllDataView();
    cy.log("** filter for notification collection **");
    explorePage.scrollSideBarBottom();
    // browsePage.getFacetItemCheckbox("collection", "Person").scrollIntoView().click({force: true});
    // browsePage.getGreySelectedFacets("Person").should("exist");
    // browsePage.getFacetApplyButton().click();
    browsePage.getCollectionPopover().scrollIntoView().click();
    browsePage.collectionPopoverInput().type("notification");
    browsePage.getPopoverFacetCheckbox("sm-Person-notification").click();
    browsePage.submitPopoverSearch();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();

    cy.log("** verify merge icon disabled");
    browsePage.getMergeIcon().first().click({force: true});
    compareValuesModal.getModal().should("not.exist");

    cy.log("** verify security permissions tooltip text **");
    browsePage.getPermissionsDeniedTooltip().should("be.visible");
    browsePage.getPermissionsDeniedTooltip().should("have.text", "Contact your security administrator for access.");
  });
});
