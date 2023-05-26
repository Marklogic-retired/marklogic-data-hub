import {BaseEntityTypes} from "../../support/types/base-entity-types";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import table from "../../support/components/common/tables";
import browsePage from "../../support/pages/browse";
import "cypress-wait-until";

const query = {
  name: "newQueryWithTwoEntities",
  description: "newQueryWithTwoEntities description"
};

describe("manage queries with more than one entity", () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();

    cy.log("**Go to Explore page and select the table view option**");
    browsePage.navigate();
    browsePage.getTableView().click();
    table.mainTable.should("be.visible");
    table.getTableRows().should("not.be.empty");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSavedQueries();
    cy.waitForAsyncRequest();
  });

  it("Create query with two entities", () => {
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

    cy.log("**Go to specific view in one entity and apply facets**");
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getGreySelectedFacets("Adams Cole").should("exist");
    browsePage.getFacetApplyButton().click();
    table.clickColumnTitle(2);
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
