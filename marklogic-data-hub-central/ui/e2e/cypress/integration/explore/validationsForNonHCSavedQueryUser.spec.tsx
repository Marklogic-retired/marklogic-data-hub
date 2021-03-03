/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common/index";
import "cypress-wait-until";
import LoginPage from "../../support/pages/login";

describe("User without hub-central-saved-query-user role should not see saved queries drop down on zero sate page", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-user").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-user").withRequest();
    cy.waitForAsyncRequest();
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("verifies saved queries drop down does not exist", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    browsePage.getSaveQueriesDropdown().should("not.be.visible");
  });
  it("verifies user without hub-central-saved-query-user role can explore data", () => {
    browsePage.getSaveQueriesDropdown().should("not.be.visible");
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.selectEntity("Customer");
    browsePage.getSelectedEntity().should("contain", "Customer");
  });
  it("verifies user without hub-central-saved-query-user can not save query", () => {
    browsePage.getSaveQueriesDropdown().should("not.be.visible");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getGreySelectedFacets("Adams Cole").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    //Verify user without hub-central-saved-query-user role can see save icon and is disabled
    browsePage.getSaveModalIcon().should("be.visible");
    browsePage.getSaveModalIcon().should("have.css", "background-color", "rgba(0, 0, 0, 0)");
  });
  it("verifies user without hub-central-saved-query-user can not manage queries", () => {
    browsePage.getManageQueriesButton().should("not.be.visible");
  });
});