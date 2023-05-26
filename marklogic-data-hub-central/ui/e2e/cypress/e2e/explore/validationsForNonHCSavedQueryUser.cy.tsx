import {BaseEntityTypes} from "../../support/types/base-entity-types";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import explorePage from "../../support/pages/explore";
import browsePage from "../../support/pages/browse";
import "cypress-wait-until";

describe("User without hub-central-saved-query-user role should not see saved queries drop down on zero sate page", () => {
  before(() => {
    cy.loginAsTestUserWithRoles("hub-central-user").withRequest();
    browsePage.navigate();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  it("Verify user without hub-central-saved-query-user role can explore data", () => {
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
