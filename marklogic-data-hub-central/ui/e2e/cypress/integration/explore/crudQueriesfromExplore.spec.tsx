/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import queryComponent from "../../support/components/query/manage-queries-modal";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common/index";
import "cypress-wait-until";
import LoginPage from "../../support/pages/login";

describe("save/manage queries scenarios, developer role", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    cy.runStep("personJSON", "2");
    cy.waitForAsyncRequest();
    cy.deleteSavedQueries();
  });
  beforeEach(() => {
    cy.loginAsDeveloper().withRequest();
    cy.waitForAsyncRequest();
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  after(() => {
    //clearing all the saved queries
    cy.loginAsDeveloper().withRequest();
    cy.deleteSavedQueries();
    cy.waitForAsyncRequest();
  });
  it("Apply facet search,open save modal, save new query", () => {
    toolbar.getExploreToolbarIcon().should("be.visible").click();
    browsePage.clickTableView();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForHCTableToLoad();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    entitiesSidebar.openBaseEntityFacets("Customer");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getGreySelectedFacets("Adams Cole").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.clickColumnTitle(2);
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.backToMainSidebar();
    browsePage.getSaveModalIcon().scrollIntoView().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveQueryName().should("be.visible");
    browsePage.getSaveQueryName().type("new-query");
    browsePage.getSaveQueryDescription().should("be.visible");
    browsePage.getSaveQueryDescription().type("new-query description");
    browsePage.getSaveQueryButton().click();
    browsePage.waitForSpinnerToDisappear();
    // Creating a new query
    browsePage.getSelectedQuery().should("contain", "new-query");
    browsePage.getSelectedQueryDescription().should("contain", "new-query description");
    browsePage.getSaveQueryButton().should("not.exist");
    browsePage.getSaveQueriesDropdown().should("be.visible");
  });
  it("Editing a previous query", () => {
    browsePage.getEllipsisButton().click();
    browsePage.getEditQueryModalIcon().click();
    browsePage.getEditQueryDetailDesc().clear();
    browsePage.getEditQueryDetailDesc().type("new-query description edited");
    browsePage.getEditQueryDetailButton().click();
    browsePage.getSelectedQueryDescription().should("contain", "new-query description edited");
  });
  it("Saving a copy of previous query", () => {
    browsePage.getEllipsisButton().click();
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().type("new-query-2");
    browsePage.getSaveQueryDescription().type("new-query-2 description");
    browsePage.getSaveQueryButton().click();
    browsePage.getSelectedQuery().should("contain", "new-query-2");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersJSON").scrollIntoView().click({force: true});
    browsePage.getGreySelectedFacets("mapCustomersJSON").should("exist");
    browsePage.getSaveModalIcon().scrollIntoView().click();
    browsePage.getRadioOptionSelected();
    browsePage.getEditSaveChangesButton().click();
    browsePage.getSelectedQueryDescription().should("contain", "new-query-2 description");
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.getTableCell(1, 2).should("contain", "102");
    browsePage.getTableCell(2, 2).should("contain", "103");
    //Refresh the browser page.
    cy.reload();
    cy.wait(3000);
    browsePage.waitForSpinnerToDisappear();
    //Verify if the facets and other query related properties are intact after refreshing the browser page.
    browsePage.getSelectedQuery().should("contain", "new-query-2");
    browsePage.getSelectedQueryDescription().should("contain", "new-query-2 description");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.getTableCell(1, 2).should("contain", "102");
    browsePage.getTableCell(2, 2).should("contain", "103");

    // it("save more queries with duplicate query name from browse and manage queries view", () => {
    cy.wait(3000);
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.openBaseEntityFacets("Customer");
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    entitiesSidebar.backToMainSidebar();
    // clicking on save changes icon
    browsePage.getSaveModalIcon().scrollIntoView().click();
    browsePage.getEditSaveChangesFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditSaveChangesFormName().clear();
    browsePage.getEditSaveChangesFormName().type("new-query");
    browsePage.getEditSaveChangesButton().click();
    browsePage.getErrorMessage().should("contain", "You already have a saved query with a name of new-query");
    browsePage.getEditSaveChangesCancelButton().click();
    // checking previous query name is set clicking save modal icon
    browsePage.getEllipsisButton().click();
    browsePage.getSaveModalIcon().scrollIntoView().click();
    browsePage.getEditSaveChangesFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditSaveChangesCancelButton().click();
    // checking previous query name is set clicking edit modal icon
    browsePage.getEllipsisButton().click();
    browsePage.getEditQueryModalIcon().click();
    browsePage.getEditQueryDetailFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditQueryDetailCancelButton().click();
    // checking previous query name is set clicking save a copy modal icon
    browsePage.getEllipsisButton().click();
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().invoke("val").should("be.empty");
    browsePage.getSaveQueryCancelButton().click();
  });
  it("Edit queries with duplicate query name", () => {
    browsePage.getEllipsisButton().click();
    browsePage.getEditQueryModalIcon().click();
    browsePage.getEditQueryDetailFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditQueryDetailFormName().clear();
    browsePage.getEditQueryDetailFormName().type("new-query");
    browsePage.getEditQueryDetailButton().click();
    browsePage.getErrorMessage().should("contain", "You already have a saved query with a name of new-query");
    browsePage.getEditQueryDetailCancelButton().click();
    // checking previous query name is set clicking save modal icon
    browsePage.getSaveModalIcon().scrollIntoView().click();
    browsePage.getEditSaveChangesFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditSaveChangesCancelButton().click();
    // checking previous query name is set clicking edit modal icon
    browsePage.getEllipsisButton().click();
    browsePage.getEditQueryModalIcon().click();
    browsePage.getEditQueryDetailFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditQueryDetailCancelButton().click();
    // checking previous query name is set clicking save a copy modal icon
    browsePage.getEllipsisButton().click();
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().invoke("val").should("be.empty");
    browsePage.getSaveQueryCancelButton().click();
  });
  it("Clicking on save a copy icon", () => {
    browsePage.getEllipsisButton().click();
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().clear();
    browsePage.getSaveQueryName().type("new-query");
    browsePage.getSaveQueryButton().click();
    browsePage.getErrorMessage().should("contain", "You already have a saved query with a name of new-query");
    browsePage.getSaveQueryCancelButton().click();
    // checking previous query name is set clicking save modal icon
    browsePage.getSaveModalIcon().scrollIntoView().click();
    browsePage.getEditSaveChangesFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditSaveChangesCancelButton().click();
    // checking previous query name is set clicking edit modal icon
    browsePage.getEllipsisButton().click();
    browsePage.getEditQueryModalIcon().click();
    browsePage.getEditQueryDetailFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditQueryDetailCancelButton().click();
    // checking previous query name is set clicking save a copy modal icon
    browsePage.getEllipsisButton().click();
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().invoke("val").should("be.empty");
    browsePage.getSaveQueryCancelButton().click();
  });
  it("Checking manage query", () => {
    browsePage.getExploreSettingsMenuIcon().click();
    browsePage.getManageQueriesModalOpened();
    queryComponent.getManageQueryModal().should("be.visible");
    queryComponent.getEditQuery().click();
    queryComponent.getEditQueryName().invoke("text").as("qName");
    queryComponent.getEditQueryName().invoke("val").then(
      ($someVal) => {
        if ($someVal === "new-query-2") {
          queryComponent.getEditQueryName().clear();
          queryComponent.getEditQueryName().type("new-query");
          queryComponent.getSubmitButton().click();
          queryComponent.getErrorMessage().should("contain", "You already have a saved query with a name of new-query");
        } else {
          queryComponent.getEditQueryName().clear();
          queryComponent.getEditQueryName().type("new-query-2");
          queryComponent.getSubmitButton().click();
          queryComponent.getErrorMessage().should("contain", "You already have a saved query with a name of new-query-2");
        }
      }
    );
    queryComponent.getEditCancelButton().click();
    queryComponent.getManageQueryModal().find(".btn-close").click();
    // checking previous query name is set clicking save modal icon
    browsePage.getSaveModalIcon().scrollIntoView().click();
    cy.get("@qName").then((qName) => {
      browsePage.getEditSaveChangesFormName().invoke("val").should("contain", qName);
    });
    browsePage.getEditSaveChangesCancelButton().click();
    // checking previous query name is set clicking edit modal icon
    browsePage.getEllipsisButton().click();
    browsePage.getEditQueryModalIcon().first().click();
    cy.get("@qName").then((qName) => {
      browsePage.getEditQueryDetailFormName().invoke("val").should("contain", qName);
    });
    browsePage.getEditQueryDetailCancelButton().click();
    // checking previous query name is set clicking save a copy modal icon
    browsePage.getEllipsisButton().scrollIntoView().click();
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().invoke("val").should("be.empty");
    browsePage.getSaveQueryCancelButton().click();
  });
  it("Edit saved query and verify discard changes functionality", () => {
    entitiesSidebar.removeSelectedBaseEntity();
    browsePage.getClearAllFacetsButton().click();
    entitiesSidebar.clearQuery();
    browsePage.getResetConfirmationNoClick();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
    entitiesSidebar.getBaseEntityOption("Person").should("be.visible");
    entitiesSidebar.openBaseEntityFacets("Person");
    browsePage.getFacetItemCheckbox("lname", "Bates").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getGreySelectedFacets("Bates").should("exist");
    browsePage.getFacetApplyButton().click();
    entitiesSidebar.backToMainSidebar();
    browsePage.getSaveModalIcon().scrollIntoView().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveQueryName().type("person-query");
    browsePage.getSaveQueryDescription().type("person-query description");
    browsePage.getSaveQueryButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSelectedQuery().should("contain", "person-query");
    browsePage.search("Bates");
    browsePage.clickColumnTitle(4);
    browsePage.getEllipsisButton().scrollIntoView().click();
    browsePage.getDiscardChangesIcon().click();
    browsePage.getDiscardYesButton().click();
    browsePage.getAppliedFacets("Bates").should("exist");
    browsePage.search("Bates");
    browsePage.clickColumnTitle(4);
    browsePage.getEllipsisButton().scrollIntoView().click();
    browsePage.getDiscardChangesIcon().click();
    browsePage.getDiscardNoButton().click();
    browsePage.getSearchBar().should("have.value", "Bates");
    browsePage.getSortIndicatorAsc().should("have.css", "background-color", "rgba(0, 0, 0, 0)");
  });
  it("Switching between queries when making changes to saved query", () => {
    entitiesSidebar.removeSelectedBaseEntity();
    browsePage.getClearAllFacetsButton().click();
    entitiesSidebar.clearQuery();
    browsePage.getResetConfirmationNoClick();
    // creating query 1 with customer entity
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    cy.waitForModalToDisappear();
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersJSON").click({force: true});
    browsePage.getFacetApplyButton().click();
    browsePage.search("Adams Cole");
    browsePage.getSaveModalIcon().scrollIntoView().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveQueryName().type("query-1");
    browsePage.getSaveQueryDescription().type("query-1 description");
    browsePage.getSaveQueryButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSelectedQuery().should("contain", "query-1");
    browsePage.getSelectedQueryDescription().should("contain", "query-1 description");
    // creating query 2 using save a copy
    browsePage.getEllipsisButton().scrollIntoView().click();
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().type("query-2");
    browsePage.getSaveQueryButton().click();
    // Making changes to query-2 and switching to query-1
    browsePage.clickColumnTitle(2);
    browsePage.selectQuery("query-1");
    browsePage.getQueryConfirmationNoClick().click();
    browsePage.getSelectedQuery().should("contain", "query-1");
    browsePage.getClearFacetSearchSelection("mapCustomersJSON").click();
    browsePage.clickColumnTitle(2);
    browsePage.selectQuery("query-2");
    browsePage.getQueryConfirmationYesClick().click();
    browsePage.getEditSaveChangesButton().click();
    browsePage.getSelectedQuery().should("contain", "query-2");
    browsePage.getAppliedFacets("mapCustomersJSON").should("exist");
    browsePage.selectQuery("query-1");
    browsePage.getSortIndicatorAsc().should("have.css", "background-color", "rgba(0, 0, 0, 0)");
  });
  it.skip("Switching between entities when making changes to saved query", () => {
    browsePage.selectQuery("new-query");
    browsePage.getClearFacetSearchSelection("Adams Cole").click();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
    entitiesSidebar.getBaseEntityOption("Person").should("be.visible");
    entitiesSidebar.getBaseEntityOption("Person").should("be.visible");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.getSelectedQuery().should("contain", "select a query");
    browsePage.selectQuery("new-query");
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    browsePage.clickColumnTitle(3);
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
    browsePage.getEntityConfirmationYesClick().click();
    browsePage.getEditSaveChangesButton().click();
    entitiesSidebar.getBaseEntityOption("Person").should("be.visible");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.selectQuery("new-query");
    cy.wait(5000);
    browsePage.waitForSpinnerToDisappear();
    browsePage.getAppliedFacets("Adams Cole").should("exist");
    browsePage.getSortIndicatorAsc().should("have.css", "background-color", "rgba(0, 0, 0, 0)");
    browsePage.getTableCell(1, 3).should("contain", "Adams Cole");
    browsePage.getTableCell(2, 3).should("contain", "Adams Cole");
  });
  it.skip("Switching between entities when there are saved queries", () => {
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    entitiesSidebar.removeSelectedBaseEntity();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
    entitiesSidebar.getBaseEntityOption("Person").should("be.visible");
    browsePage.getSaveQueriesDropdown().should("exist");
    browsePage.getSelectedQuery().should("contain", "select a query");
    //Checking if you are in person entity,select a saved query related to customer and shifting back to person
    browsePage.selectQuery("new-query");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
    entitiesSidebar.getBaseEntityOption("Person").should("be.visible");
  });
  it("Save query button should not show up in all entities view", () => {
    browsePage.getClearAllFacetsButton().click();
    entitiesSidebar.clearQuery();
    browsePage.getResetConfirmationNoClick();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
    entitiesSidebar.getBaseEntityOption("All Entities").should("be.visible");
    browsePage.getSaveQueriesDropdown().should("exist");
    browsePage.getSelectedQuery().should("contain", "select a query");
    // Should comment below line after DHFPROD-5392 is done
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacetItemCheckbox("collection", "Person").click({force: true});
    browsePage.getFacetApplyButton().click();
    browsePage.getSaveModalIcon().should("not.exist");
  });
  // Reset query confirmation
  it("Show Reset query button, open reset confirmation", () => {
    // Clicking on reset after selected facets are applied, saves new query and navigates to zero state
    browsePage.getClearAllFacetsButton().click();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    entitiesSidebar.openBaseEntityFacets("Customer");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.backToMainSidebar();
    entitiesSidebar.clearQuery();
    // clicking on no doesn't create a new query and navigates to zero state
    browsePage.getResetConfirmationNoClick();
    entitiesSidebar.getBaseEntityOption("All Entities").should("be.visible");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    entitiesSidebar.openBaseEntityFacets("Customer");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.clickColumnTitle(2);
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.backToMainSidebar();
    entitiesSidebar.clearQuery();
    //selecting yes will save the new query and navigates to zero state
    browsePage.getResetConfirmationYesClick();
    browsePage.getSaveQueryName().should("be.visible");
    browsePage.getSaveQueryName().type("reset-query");
    browsePage.getSaveQueryButton().click();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.selectQuery("reset-query");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getAppliedFacets("Adams Cole").should("exist");
    browsePage.getSortIndicatorAsc().should("have.css", "background-color", "rgba(0, 0, 0, 0)");
    cy.wait(1000);
    browsePage.getTableCell(1, 2).should("contain", "102");
    browsePage.getTableCell(2, 2).should("contain", "103");
  });
  it("Show Reset query button, clicking reset confirmation when making changes to saved query", () => {
    // Select saved query, make changes, click on reset opens a confirmation
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.getSaveQueriesDropdown().should("exist");
    browsePage.selectQuery("reset-query");
    browsePage.getSelectedQuery().should("contain", "reset-query");
    entitiesSidebar.openBaseEntityFacets("Customer");
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    // clicking on no doesn't update query and navigates to zero state
    entitiesSidebar.backToMainSidebar();
    entitiesSidebar.clearQuery();
    browsePage.getResetConfirmationNoClick();
    entitiesSidebar.getBaseEntityOption("All Entities").should("be.visible");
    //selecting yes will update the query and navigates to zero state
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.selectQuery("reset-query");
    browsePage.clickColumnTitle(2);
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    entitiesSidebar.clearQuery();
    browsePage.getResetConfirmationYes().should("be.visible").click();
    browsePage.getEditSaveChangesButton().should("be.visible").click();
    cy.waitForAsyncRequest();
    browsePage.getTotalDocuments();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.selectQuery("reset-query");
    cy.waitForAsyncRequest();
    browsePage.getAppliedFacets("Adams Cole").should("exist");
    cy.wait(500);
    browsePage.getSortIndicatorDesc().should("have.css", "background-color", "rgba(0, 0, 0, 0)");
    browsePage.getTableCell(1, 2).should("contain", "103");
    browsePage.getTableCell(2, 2).should("contain", "102");
  });
  it.skip("Show Reset query button, verify confirmation modal displays if only selected columns changed, clicking reset icon resets to all entities", () => {
    //verifying the confirmation modal displays if no query selected and selected columns changed
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.getColumnSelectorIcon().should("be.visible");
    browsePage.getColumnSelectorIcon().click();
    browsePage.getColumnSelector().should("be.visible");
    browsePage.selectColumnSelectorProperty("status");
    browsePage.getColumnSelectorApply().click({force: true});
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
    entitiesSidebar.getBaseEntityOption("Person").should("be.visible");
    //verifying the confirmation modal appearing and selection cancel
    browsePage.getEntityConfirmationNoClick().click();
    // Select saved query, make changes, click on reset opens a confirmation
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.getSaveQueriesDropdown().should("be.visible");
    browsePage.selectQuery("reset-query");
    //changing the selecte column list should trigger modal confirmation
    browsePage.getColumnSelectorIcon().should("be.visible");
    browsePage.getColumnSelectorIcon().click();
    browsePage.getColumnSelector().should("be.visible");
    browsePage.selectColumnSelectorProperty("status");
    browsePage.getColumnSelectorApply().click({force: true});
    browsePage.getResetQueryButton().click({force: true});
    //verifying the confirmation modal appearing and selection cancel
    browsePage.getResetConfirmationNoClick();
    entitiesSidebar.getBaseEntityOption("All Entities").should("be.visible");
    //verify no confirmation modal after reset.
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.getSaveQueriesDropdown().should("be.visible");
    browsePage.selectQuery("reset-query");
    browsePage.getResetQueryButton().click();
    entitiesSidebar.getBaseEntityOption("All Entities").should("be.visible");
    // });

    // it("Apply facet,save query using save as is option", () => {
    browsePage.getClearAllFacetsButton().click();
    entitiesSidebar.clearQuery();
    browsePage.getResetConfirmationNoClick();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
    entitiesSidebar.getBaseEntityOption("Person").should("be.visible");
    entitiesSidebar.openBaseEntityFacets("Person");
    browsePage.getFacetItemCheckbox("lname", "Bates").click();
    browsePage.getFacetItemCheckbox("lname", "Bates").should("be.checked");
    browsePage.getGreySelectedFacets("Bates").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("fname", "Bob").click();
    browsePage.getFacetItemCheckbox("fname", "Bob").should("be.checked");
    entitiesSidebar.backToMainSidebar();
    browsePage.getSaveModalIcon().scrollIntoView().click({force: true});
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveQueryName().should("be.visible");
    browsePage.getSaveQueryName().type("check-query");
    browsePage.getSaveQueryDescription().should("be.visible");
    browsePage.getSaveQueryDescription().type("check-query description");
    browsePage.getSaveQueryButton().click();
    /*browsePage.getFacetItemCheckbox("fname", "Bob").should("be.checked");
    browsePage.getFacetApplyButton().should("be.visible");
    //Check grey facets does not persist when clear query icon is clicked", () => {
    browsePage.selectEntity("All Entities");
    cy.wait(1000);
    browsePage.getEntityConfirmationNoClick().click();
    cy.waitForModalToDisappear();
    cy.wait(1000);*/
  });

  xit("verify export array/structured data warning", () => {
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForHCTableToLoad();
    // TODO DHFPROD-7711 skip since fails for Ant Design Table component
    // TODO selecting "Order" leads to blank screen and error in browser
    // browsePage.selectEntity("Order");
    // browsePage.getSelectedEntity().should("contain", "Order");
    // browsePage.getDataExportIcon().click({force: true});
    // browsePage.getStructuredDataWarning().should("be.visible");
    // browsePage.getStructuredDataCancel().should("be.visible");
    // browsePage.getStructuredDataCancel().click();
    // browsePage.getStructuredDataWarning().should("not.exist");
  });

  it.skip("Verify facets checked on sidebar", () => {
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
    entitiesSidebar.getBaseEntityOption("All Entities").should("be.visible");
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForHCTableToLoad();
    browsePage.getFacetItemCheckbox("collection", "Person").click();
    browsePage.getFacetItemCheckbox("collection", "Person").should("be.checked");
    browsePage.getGreySelectedFacets("Person").should("exist");
    browsePage.getResetQueryButton().click();
    browsePage.getResetConfirmationNoClick();
    entitiesSidebar.getBaseEntityOption("All Entities").should("be.visible");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("collection", "Person").should("not.be.checked");
    browsePage.getGreySelectedFacets("Person").should("not.exist");
  });
  it("Verify selected query when switching database", () => {
    browsePage.getClearAllFacetsButton().click();
    //apply saved query
    browsePage.selectQuery("person-query");
    browsePage.getQueryConfirmationNoClick().click();
    browsePage.getSelectedQuery().should("contain", "person-query");
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.getBaseEntityOption("Person").should("be.visible");
    entitiesSidebar.openBaseEntityFacets("Person");
    browsePage.getFacetItemCheckbox("lname", "Bates").should("be.checked");
    //switch the database
    entitiesSidebar.backToMainSidebar();
    browsePage.getStagingDatabaseButton();
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.getBaseEntityOption("Person").should("be.visible");
    browsePage.getSaveQueriesDropdown().should("be.visible");
    browsePage.getSelectedQuery().should("contain", "select a query");
    //Person entity is not available in stage database
    browsePage.getFacetItemCheckbox("lname", "Bates").should("not.exist");
    browsePage.getEditQueryModalIcon().should("not.exist");
    browsePage.getResetQueryButton().should("be.visible");
    browsePage.getSaveACopyModalIcon().should("not.exist");
  });
});
