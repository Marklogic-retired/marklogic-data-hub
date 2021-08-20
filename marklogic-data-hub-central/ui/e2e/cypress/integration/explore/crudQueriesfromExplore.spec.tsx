/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import queryComponent from "../../support/components/query/manage-queries-modal";
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
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForTableToLoad();
    browsePage.selectEntity("Customer");
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getGreySelectedFacets("Adams Cole").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.clickColumnTitle(2);
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveModalIcon().click();
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
    browsePage.getEditQueryModalIcon().click();
    browsePage.getEditQueryDetailDesc().clear();
    browsePage.getEditQueryDetailDesc().type("new-query description edited");
    browsePage.getEditQueryDetailButton().click();
    browsePage.getSelectedQueryDescription().should("contain", "new-query description edited");
  });
  it("Saving a copy of previous query", () => {
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().type("new-query-2");
    browsePage.getSaveQueryDescription().type("new-query-2 description");
    browsePage.getSaveQueryButton().click();
    browsePage.getSelectedQuery().should("contain", "new-query-2");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersJSON").click();
    browsePage.getGreySelectedFacets("mapCustomersJSON").should("exist");
    browsePage.getSaveModalIcon().click();
    browsePage.getRadioOptionSelected();
    browsePage.getEditSaveChangesButton().click();
    browsePage.getSelectedQueryDescription().should("contain", "new-query-2 description");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTableCell(1, 2).should("contain", "102");
    browsePage.getTableCell(2, 2).should("contain", "103");
    //Refresh the browser page.
    cy.reload();
    browsePage.waitForSpinnerToDisappear();
    //Verify if the facets and other query related properties are intact after refreshing the browser page.
    browsePage.getSelectedQuery().should("contain", "new-query-2");
    browsePage.getSelectedQueryDescription().should("contain", "new-query-2 description");
    browsePage.getTableCell(1, 2).should("contain", "102");
    browsePage.getTableCell(2, 2).should("contain", "103");
  });

  it("save more queries with duplicate query name from browse and manage queries view", () => {
    browsePage.selectQuery("new-query-2");
    browsePage.getSelectedQuery().should("contain", "new-query-2");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    // clicking on save changes icon
    browsePage.getSaveModalIcon().click();
    browsePage.getEditSaveChangesFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditSaveChangesFormName().clear();
    browsePage.getEditSaveChangesFormName().type("new-query");
    browsePage.getEditSaveChangesButton().click();
    browsePage.getErrorMessage().should("contain", "You already have a saved query with a name of new-query");
    browsePage.getEditSaveChangesCancelButton().click();
    // checking previous query name is set clicking save modal icon
    browsePage.getSaveModalIcon().click();
    browsePage.getEditSaveChangesFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditSaveChangesCancelButton().click();
    // checking previous query name is set clicking edit modal icon
    browsePage.getEditQueryModalIcon().click();
    browsePage.getEditQueryDetailFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditQueryDetailCancelButton().click();
    // checking previous query name is set clicking save a copy modal icon
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().invoke("val").should("be.empty");
    browsePage.getSaveQueryCancelButton().click();
  });
  it("Edit queries with duplicate query name", () => {
    browsePage.getEditQueryModalIcon().click();
    browsePage.getEditQueryDetailFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditQueryDetailFormName().clear();
    browsePage.getEditQueryDetailFormName().type("new-query");
    browsePage.getEditQueryDetailButton().click();
    browsePage.getErrorMessage().should("contain", "You already have a saved query with a name of new-query");
    browsePage.getEditQueryDetailCancelButton().click();
    // checking previous query name is set clicking save modal icon
    browsePage.getSaveModalIcon().click();
    browsePage.getEditSaveChangesFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditSaveChangesCancelButton().click();
    // checking previous query name is set clicking edit modal icon
    browsePage.getEditQueryModalIcon().click();
    browsePage.getEditQueryDetailFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditQueryDetailCancelButton().click();
    // checking previous query name is set clicking save a copy modal icon
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().invoke("val").should("be.empty");
    browsePage.getSaveQueryCancelButton().click();
  });
  it("Clicking on save a copy icon", () => {
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().clear();
    browsePage.getSaveQueryName().type("new-query");
    browsePage.getSaveQueryButton().click();
    browsePage.getErrorMessage().should("contain", "You already have a saved query with a name of new-query");
    browsePage.getSaveQueryCancelButton().click();
    // checking previous query name is set clicking save modal icon
    browsePage.getSaveModalIcon().click();
    browsePage.getEditSaveChangesFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditSaveChangesCancelButton().click();
    // checking previous query name is set clicking edit modal icon
    browsePage.getEditQueryModalIcon().click();
    browsePage.getEditQueryDetailFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditQueryDetailCancelButton().click();
    // checking previous query name is set clicking save a copy modal icon
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().invoke("val").should("be.empty");
    browsePage.getSaveQueryCancelButton().click();
  });
  it("Checking manage query", () => {
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
    queryComponent.getManageQueryModal().type("{esc}");
    // checking previous query name is set clicking save modal icon
    browsePage.getSaveModalIcon().click();
    cy.get("@qName").then((qName) => {
      browsePage.getEditSaveChangesFormName().invoke("val").should("contain", qName);
    });
    browsePage.getEditSaveChangesCancelButton().click();
    // checking previous query name is set clicking edit modal icon
    browsePage.getEditQueryModalIcon().first().click();
    cy.get("@qName").then((qName) => {
      browsePage.getEditQueryDetailFormName().invoke("val").should("contain", qName);
    });
    browsePage.getEditQueryDetailCancelButton().click();
    // checking previous query name is set clicking save a copy modal icon
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().invoke("val").should("be.empty");
    browsePage.getSaveQueryCancelButton().click();
  });
  it("Edit saved query and verify discard changes functionality", () => {
    browsePage.selectEntity("Person");
    browsePage.getEntityConfirmationNoClick().click();
    cy.waitForModalToDisappear();
    browsePage.getSelectedEntity().should("contain", "Person");
    browsePage.getFacetItemCheckbox("lname", "Bates").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getGreySelectedFacets("Bates").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getSaveModalIcon().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveQueryName().type("person-query");
    browsePage.getSaveQueryDescription().type("person-query description");
    browsePage.getSaveQueryButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSelectedQuery().should("contain", "person-query");
    browsePage.search("Bates");
    browsePage.clickColumnTitle(4);
    browsePage.getDiscardChangesIcon().click();
    browsePage.getDiscardYesButton().click();
    browsePage.getAppliedFacets("Bates").should("exist");
    browsePage.search("Bates");
    browsePage.clickColumnTitle(4);
    browsePage.getDiscardChangesIcon().click();
    browsePage.getDiscardNoButton().click();
    browsePage.getSearchText().should("have.value", "Bates");
    browsePage.getSortIndicatorAsc().should("have.css", "background-color", "rgba(0, 0, 0, 0)");
  });
  it("Switching between queries when making changes to saved query", () => {
    // creating query 1 with customer entity
    browsePage.selectEntity("Customer");
    browsePage.getEntityConfirmationNoClick().click();
    cy.waitForModalToDisappear();
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getHubPropertiesExpanded();
    cy.waitUntil(() => browsePage.getFacetItemCheckbox("collection", "mapCustomersJSON")).click();
    browsePage.getFacetApplyButton().click();
    browsePage.search("Adams Cole");
    browsePage.getSaveModalIcon().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveQueryName().type("query-1");
    browsePage.getSaveQueryDescription().type("query-1 description");
    browsePage.getSaveQueryButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSelectedQuery().should("contain", "query-1");
    browsePage.getSelectedQueryDescription().should("contain", "query-1 description");
    // creating query 2 using save a copy
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().type("query-2");
    browsePage.getSaveQueryButton().click();
    // Making changes to query-2 and switching to query-1
    browsePage.clickColumnTitle(2);
    browsePage.selectQuery("query-1");
    browsePage.getQueryConfirmationCancelClick().click();
    browsePage.getSortIndicatorAsc().should("have.css", "background-color", "rgba(0, 0, 0, 0)");
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
  it("Switching between entities when making changes to saved query", () => {
    browsePage.selectQuery("new-query");
    browsePage.getClearFacetSearchSelection("Adams Cole").click();
    browsePage.selectEntity("Person");
    browsePage.getEntityConfirmationCancelClick().click();
    browsePage.getSelectedQuery().should("contain", "new-query");
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.getSortIndicatorAsc().should("have.css", "background-color", "rgba(0, 0, 0, 0)");
    browsePage.selectEntity("Person");
    browsePage.getEntityConfirmationNoClick().click();
    browsePage.getSelectedEntity().should("contain", "Person");
    browsePage.selectEntity("Customer");
    browsePage.getSelectedQuery().should("contain", "select a query");
    browsePage.selectQuery("new-query");
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    browsePage.clickColumnTitle(3);
    browsePage.selectEntity("Person");
    browsePage.getEntityConfirmationYesClick().click();
    browsePage.getEditSaveChangesButton().click();
    browsePage.getSelectedEntity().should("contain", "Person");
    browsePage.selectEntity("Customer");
    browsePage.selectQuery("new-query");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getAppliedFacets("Adams Cole").should("exist");
    browsePage.getSortIndicatorAsc().should("have.css", "background-color", "rgba(0, 0, 0, 0)");
    browsePage.getTableCell(1, 3).should("contain", "Adams Cole");
    browsePage.getTableCell(2, 3).should("contain", "Adams Cole");
  });
  it("Switching between entities when there are saved queries", () => {
    browsePage.selectEntity("Customer");
    browsePage.selectEntity("Person");
    browsePage.getSaveQueriesDropdown().should("be.visible");
    browsePage.getSelectedQuery().should("contain", "select a query");
    //Checking if you are in person entity,select a saved query related to customer and shifting back to person
    browsePage.selectQuery("new-query");
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.selectEntity("Person");
    browsePage.getSelectedEntity().should("contain", "Person");
  });
  it("Save query button should not show up in all entities view", () => {
    browsePage.selectEntity("All Entities");
    browsePage.getSaveQueriesDropdown().should("be.visible");
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
    browsePage.selectEntity("Customer");
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.getSaveQueriesDropdown().should("be.visible");
    browsePage.getSelectedQuery().should("contain", "select a query");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getResetQueryButton().click();
    //selecting cancel will be in the same state as before
    browsePage.getResetConfirmationCancelClick();
    browsePage.getSelectedQuery().should("contain", "select a query");
    browsePage.getResetQueryButton().click();
    // clicking on no doesn't create a new query and navigates to zero state
    browsePage.getResetConfirmationNoClick();
    browsePage.getExploreButton().should("be.visible");
    browsePage.getExploreButton().click();
    browsePage.selectEntity("Customer");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.clickColumnTitle(2);
    browsePage.waitForSpinnerToDisappear();
    browsePage.getResetQueryButton().click();
    //selecting yes will save the new query and navigates to zero state
    browsePage.getResetConfirmationYesClick();
    browsePage.getSaveQueryName().should("be.visible");
    browsePage.getSaveQueryName().type("reset-query");
    browsePage.getSaveQueryButton().click();
    //verify created query on zero state page
    browsePage.getQuerySelector().click();
    browsePage.getQueryByName("reset-query").should("be.visible");
    browsePage.getQuerySelector().click();
    browsePage.getExploreButton().should("be.visible");
    browsePage.getExploreButton().click();
    browsePage.selectEntity("Customer");
    browsePage.selectQuery("reset-query");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getAppliedFacets("Adams Cole").should("exist");
    browsePage.getSortIndicatorAsc().should("have.css", "background-color", "rgba(0, 0, 0, 0)");
    browsePage.getTableCell(1, 2).should("contain", "102");
    browsePage.getTableCell(2, 2).should("contain", "103");
  });
  it("Show Reset query button, clicking reset confirmation when making changes to saved query", () => {
    // Select saved query, make changes, click on reset opens a confirmation
    browsePage.selectEntity("Customer");
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.getSaveQueriesDropdown().should("be.visible");
    browsePage.getSelectedQuery().should("contain", "select a query");
    browsePage.getSaveQueriesDropdown().should("be.visible");
    browsePage.selectQuery("reset-query");
    browsePage.getSelectedQuery().should("contain", "reset-query");
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    browsePage.getResetQueryButton().click();
    //selecting cancel will be in the same state as before
    browsePage.getResetConfirmationCancelClick();
    browsePage.getSelectedQuery().should("contain", "reset-query");
    // clicking on no doesn't update query and navigates to zero state
    browsePage.getResetQueryButton().click();
    browsePage.getResetConfirmationNoClick();
    browsePage.getExploreButton().should("be.visible");
    browsePage.getExploreButton().click();
    //selecting yes will update the query and navigates to zero state
    browsePage.selectEntity("Customer");
    browsePage.selectQuery("reset-query");
    browsePage.clickColumnTitle(2);
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => browsePage.getResetQueryButton()).click();
    cy.waitUntil(() => browsePage.getResetConfirmationYes()).click();
    cy.waitUntil(() => browsePage.getEditSaveChangesButton()).click();
    cy.waitUntil(() => browsePage.getExploreButton());
    browsePage.getExploreButton().should("be.visible");
    browsePage.getExploreButton().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => browsePage.getTotalDocuments());
    browsePage.selectEntity("Customer");
    browsePage.selectQuery("reset-query");
    cy.waitForAsyncRequest();
    browsePage.getAppliedFacets("Adams Cole").should("exist");
    cy.wait(500);
    browsePage.getSortIndicatorDesc().should("have.css", "background-color", "rgba(0, 0, 0, 0)");
    browsePage.getTableCell(1, 2).should("contain", "103");
    browsePage.getTableCell(2, 2).should("contain", "102");
  });
  it("Show Reset query button, verify confirmation modal displays if only selected columns changed, clicking reset icon navigates to zero state", () => {
    //verifying the confirmation modal displays if no query selected and selected columns changed
    browsePage.selectEntity("Customer");
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.getColumnSelectorIcon().should("be.visible");
    browsePage.getColumnSelectorIcon().click();
    browsePage.getColumnSelector().should("be.visible");
    browsePage.selectColumnSelectorProperty("status");
    browsePage.getColumnSelectorApply().click({force: true});
    browsePage.selectEntity("Person");
    //verifying the confirmation modal appearing and selection cancel
    browsePage.getEntityConfirmationNoClick().click();
    // Select saved query, make changes, click on reset opens a confirmation
    browsePage.selectEntity("Customer");
    browsePage.getSelectedEntity().should("contain", "Customer");
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
    // browsePage.getResetQueryButton().click();
    browsePage.getExploreButton().should("be.visible");
    browsePage.getExploreButton().click();
    //verify no confirmation modal after reset.
    browsePage.selectEntity("Customer");
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.getSaveQueriesDropdown().should("be.visible");
    browsePage.selectQuery("reset-query");
    browsePage.getResetQueryButton().click();
    browsePage.getExploreButton().should("be.visible");
  });
  it("verify export array/structured data warning", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForTableToLoad();
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
  it("Apply facet,save query using save as is option", () => {
    browsePage.selectEntity("Person");
    browsePage.getFacetItemCheckbox("lname", "Bates").click();
    browsePage.getFacetItemCheckbox("lname", "Bates").should("be.checked");
    browsePage.getGreySelectedFacets("Bates").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getFacetItemCheckbox("fname", "Bob").click();
    browsePage.getFacetItemCheckbox("fname", "Bob").should("be.checked");
    browsePage.getSaveModalIcon().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveQueryName().should("be.visible");
    browsePage.getSaveQueryName().type("check-query");
    browsePage.getSaveQueryDescription().should("be.visible");
    browsePage.getSaveQueryDescription().type("check-query description");
    browsePage.getSaveQueryButton().click();
    browsePage.getFacetItemCheckbox("fname", "Bob").should("be.checked");
    browsePage.getFacetApplyButton().should("be.visible");
    //Check grey facets does not persist when clear query icon is clicked", () => {
    browsePage.selectEntity("All Entities");
    cy.wait(1000);
    browsePage.getEntityConfirmationNoClick().click();
    cy.waitForModalToDisappear();
    cy.wait(1000);
  });
  it("Verify facets checked on sidebar", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForTableToLoad();
    browsePage.getFacetItemCheckbox("collection", "Person").click();
    browsePage.getFacetItemCheckbox("collection", "Person").should("be.checked");
    browsePage.getGreySelectedFacets("Person").should("exist");
    browsePage.getResetQueryButton().click();
    browsePage.getExploreButton().should("be.visible");
    browsePage.getExploreButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("collection", "Person").should("not.be.checked");
    browsePage.getGreySelectedFacets("Person").should("not.exist");
  });
  it("Verify selected query when switching database", () => {
    //apply saved query
    browsePage.selectQuery("person-query");
    browsePage.getSelectedQuery().should("contain", "person-query");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSelectedEntity().should("contain", "Person");
    browsePage.getFacetItemCheckbox("lname", "Bates").should("be.checked");
    //switch the database
    browsePage.getStagingDatabaseButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSelectedEntity().should("contain", "Person");
    browsePage.getSaveQueriesDropdown().should("be.visible");
    browsePage.getSelectedQuery().should("contain", "select a query");
    //Person entity is not available in stage database
    browsePage.getFacetItemCheckbox("lname", "Bates").should("not.exist");
    browsePage.getEditQueryModalIcon().should("not.exist");
    browsePage.getResetQueryButton().should("be.visible");
    browsePage.getSaveACopyModalIcon().should("not.exist");
  });
});