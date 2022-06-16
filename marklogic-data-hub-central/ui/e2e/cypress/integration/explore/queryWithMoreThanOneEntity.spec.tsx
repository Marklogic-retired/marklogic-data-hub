/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common/index";
import "cypress-wait-until";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import LoginPage from "../../support/pages/login";
import {BaseEntityTypes} from "../../support/types/base-entity-types";

const query = {
  name: "newQueryWithTwoEntities",
  description: "newQueryWithTwoEntities description"
};

describe("manage queries with more than one entity", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);

    cy.log("**Logging into the app as a developer**");
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
    cy.waitForAsyncRequest();
    cy.deleteSavedQueries();
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage();
  });
  after(() => {
    //clearing all the saved queries
    cy.loginAsDeveloper().withRequest();
    cy.deleteSavedQueries();
    cy.waitForAsyncRequest();
  });

  it("Create query with two entities", () => {
    cy.log("**Go to explore tile and select table view**");
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    browsePage.clickTableView();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForHCTableToLoad();

    cy.log("**Select two entities in the entities select**");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption(BaseEntityTypes.CUSTOMER);
    entitiesSidebar.getBaseEntityOption(BaseEntityTypes.CUSTOMER).should("be.visible");
    browsePage.getColumnSelectorIcon().should("exist");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption(BaseEntityTypes.PERSON);
    entitiesSidebar.getBaseEntityOption(BaseEntityTypes.PERSON).should("be.visible");

    cy.log("**Check that the column selector should not exist**");
    browsePage.getColumnSelectorIcon().should("not.exist");

    cy.log("**Go to especific view in one entitie and apply facets**");
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getGreySelectedFacets("Adams Cole").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.clickColumnTitle(2);
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.backToMainSidebar();

    cy.log("**Save the query**");
    browsePage.getSaveModalIcon().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveQueryName().should("be.visible");
    browsePage.getSaveQueryName().type(query.name);
    browsePage.getSaveQueryDescription().should("be.visible");
    browsePage.getSaveQueryDescription().type(query.description);
    browsePage.getSaveQueryButton().click();
    browsePage.waitForSpinnerToDisappear();

    cy.log("**Clear selected query and check that the entities are not selected**");
    browsePage.getResetQueryButton().click();
    entitiesSidebar.getBaseEntityOption(BaseEntityTypes.CUSTOMER).should("not.exist");
    entitiesSidebar.getBaseEntityOption(BaseEntityTypes.PERSON).should("not.exist");

    browsePage.getSaveQueriesDropdown().should("exist");
    browsePage.selectQuery(query.name);

    cy.log("**Select created query and check that the entities are present in the dropdown**");
    entitiesSidebar.getBaseEntityOption(BaseEntityTypes.CUSTOMER).should("be.visible");
    entitiesSidebar.getBaseEntityOption(BaseEntityTypes.PERSON).should("be.visible");
    browsePage.getColumnSelectorIcon().should("not.exist");
  });
});
