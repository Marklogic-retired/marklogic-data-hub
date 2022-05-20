/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import {Application} from "../../support/application.config";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import {BaseEntityTypes} from "../../support/types/base-entity-types";
import {toolbar} from "../../support/components/common/index";
import "cypress-wait-until";
import LoginPage from "../../support/pages/login";

describe("User without hub-central-saved-query-user role should not see saved queries drop down on zero sate page", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-user").withRequest();
    LoginPage.postLogin();
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage();
  });
  it("verifies user without hub-central-saved-query-user role can explore data", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    browsePage.getSaveQueriesDropdown().should("exist");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
  });
  it("verifies user without hub-central-saved-query-user can not save query", () => {
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
  it("verifies user without hub-central-saved-query-user can not manage queries", () => {
    browsePage.clickExploreSettingsMenuIcon();
    browsePage.getManageQueriesButton().should("be.visible");
    browsePage.getManageQueriesButton().should("not.be.enabled");
  });
});
