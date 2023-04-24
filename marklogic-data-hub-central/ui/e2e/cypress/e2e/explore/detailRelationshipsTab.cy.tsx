import entitiesSidebar from "../../support/pages/entitiesSidebar";
import {toolbar} from "../../support/components/common";
import detailPage from "../../support/pages/detail";
import browsePage from "../../support/pages/browse";
import LoginPage from "../../support/pages/login";

describe("Test graph export to png", () => {
  before(() => {
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.loginAsDeveloper().withRequest();
    LoginPage.navigateToMainPage();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  it("Validate existing relationships for a record", () => {
    cy.log("**Go to Explore section**");
    toolbar.getExploreToolbarIcon().click();
    browsePage.getTableView().click();
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Office");
    browsePage.waitForSpinnerToDisappear();

    cy.log("**Go to Detail page**");
    browsePage.getDetailInstanceViewIcon("101").scrollIntoView().should("be.visible").click();

    cy.log("**Switch to Relationships tab**");
    detailPage.getRelationshipsView().should("exist").click();
    detailPage.getRelatedEntitiesTitle().should("exist");
    detailPage.getRelatedConceptsTitle().should("exist");

    cy.log("**Expand entities groups**");
    detailPage.getExpandBtn().should("exist").click();
    detailPage.getRelationItems().should("have.length.greaterThan", 0);
  });

  it("Validate there are no relationships for a record", () => {
    cy.log("**Go to Explore section**");
    toolbar.getExploreToolbarIcon().click();
    browsePage.getTableView().click();
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Product");
    browsePage.waitForSpinnerToDisappear();

    cy.log("**Go to Detail page**");
    browsePage.getDetailInstanceViewIcon("90").scrollIntoView().should("be.visible").click();

    cy.log("**Check Relationships tab**");
    detailPage.getRelationshipsView().should("not.exist");
  });
});