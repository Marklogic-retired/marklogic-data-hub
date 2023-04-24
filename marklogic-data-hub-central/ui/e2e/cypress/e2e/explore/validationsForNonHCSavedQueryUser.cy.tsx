import {BaseEntityTypes} from "../../support/types/base-entity-types";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import {toolbar} from "../../support/components/common/index";
import explorePage from "../../support/pages/explore";
import browsePage from "../../support/pages/browse";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";

describe("User without hub-central-saved-query-user role should not see saved queries drop down on zero sate page", () => {
  before(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.loginAsTestUserWithRoles("hub-central-user").withRequest();
    LoginPage.navigateToMainPage();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  it("Verify user without hub-central-saved-query-user role can explore data", () => {
    toolbar.getExploreToolbarIcon().should("be.visible").click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    browsePage.getSaveQueriesDropdown().should("exist");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").scrollIntoView().should("be.visible");
  });

  it("Verify user without hub-central-saved-query-user can not save query", () => {
    browsePage.getSaveQueriesDropdown().should("exist");
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getGreySelectedFacets("Adams Cole").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    //Verify user without hub-central-saved-query-user role can see save icon and is disabled
    entitiesSidebar.backToMainSidebar();
    browsePage.getSaveModalIcon().should("be.visible");
    browsePage.getSaveModalIcon().should("have.css", "background-color", "rgba(0, 0, 0, 0)");
  });

  it("Verify user without hub-central-saved-query-user can not manage queries", () => {
    explorePage.clickExploreSettingsMenuIcon();
    browsePage.getManageQueriesButton().should("be.visible");
    browsePage.getManageQueriesButton().should("not.be.enabled");
  });
});
