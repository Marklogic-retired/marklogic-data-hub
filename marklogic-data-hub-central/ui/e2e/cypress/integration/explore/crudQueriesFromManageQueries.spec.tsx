/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import queryComponent from "../../support/components/query/manage-queries-modal";
import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common/index";
import "cypress-wait-until";
import detailPage from "../../support/pages/detail";
import LoginPage from "../../support/pages/login";

describe("manage queries modal scenarios, developer role", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
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
  it("Create Queries", () => {
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
    browsePage.getSaveQueryName().type("newQuery");
    browsePage.getSaveQueryDescription().should("be.visible");
    browsePage.getSaveQueryDescription().type("newQuery description");
    browsePage.getSaveQueryButton().click();
    browsePage.waitForSpinnerToDisappear();
    // Creating another query
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().clear();
    browsePage.getSaveQueryName().type("newQuery-1");
    browsePage.getSaveQueryButton().click();
  });
  it("manage queries, edit, apply, delete query", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForTableToLoad();
    //edit query
    browsePage.getManageQueriesModalOpened();
    queryComponent.getManageQueryModal().should("be.visible");
    queryComponent.getEditQuery().click();
    queryComponent.getEditQueryName().clear();
    queryComponent.getEditQueryName().type("editedQuery");
    queryComponent.getSubmitButton().click();
    //apply query
    queryComponent.getQueryByName("editedQuery").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSelectedQuery().should("contain", "editedQuery");
    //remove query
    browsePage.getManageQueriesModalOpened();
    queryComponent.getManageQueryModal().should("be.visible");
    queryComponent.getDeleteQuery();
    browsePage.getManageQueryCloseIcon().click();
    queryComponent.getManageQueryModal().should("not.exist");
    browsePage.getSelectedQuery().should("contain", "select a query");
    browsePage.getSelectedQueryDescription().should("contain", "");
    browsePage.getResetQueryButton().should("be.visible");

    browsePage.getSaveQueriesDropdown().click();
    browsePage.getQueryOption("editedQuery").should("not.exist");
    browsePage.getSaveQueriesDropdown().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.selectEntity("Person");
    cy.waitUntil(() => browsePage.getDetailInstanceViewIcon("/json/persons/last-name-dob-custom1.json"), {timeout: 10000}).click({force: true});
    browsePage.waitForSpinnerToDisappear();
  });
  it("Navigate to detail page and verify if manage query modal opens up.", () => {
    detailPage.getInstanceView().should("exist");
    detailPage.getDocumentUri().should("contain", "/json/persons/last-name-dob-custom1.json");
    detailPage.getDocumentTimestamp().should("exist");
    detailPage.getDocumentSource().should("contain", "PersonSourceName");
    detailPage.getDocumentRecordType().should("contain", "json");
    detailPage.getDocumentTable().should("exist");
    browsePage.getManageQueriesModalOpened();
    queryComponent.getManageQueryModal().should("be.visible");
    queryComponent.getEditQueryIconForFirstRow().should("be.visible");
    queryComponent.getExportQueryIconForFirstRow().should("be.visible");
    queryComponent.getDeleteQueryIconForFirstRow().should("be.visible");
    browsePage.getManageQueryCloseIcon().click();
    queryComponent.getManageQueryModal().should("not.exist");
    detailPage.getInstanceView().should("exist");
  });
  it("manage queries, edit, apply, delete query on zero state page", () => {
    //edit query
    browsePage.getManageQueriesModalOpened();
    queryComponent.getManageQueryModal().should("be.visible");
    queryComponent.getEditQuery().click();
    queryComponent.getEditQueryName().clear();
    queryComponent.getEditQueryName().type("editedQuery");
    queryComponent.getEditQueryDescription().clear();
    queryComponent.getEditQueryDescription().type("editedQuery-description");
    queryComponent.getSubmitButton().click();
    // apply query and verify discard/apply icons are not shown after applying
    queryComponent.getQueryByName("editedQuery").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getClearGreyFacets().should("not.exist");
    browsePage.getFacetApplyButton().should("not.exist");
    browsePage.getSelectedQuery().should("contain", "editedQuery");
    browsePage.getSelectedQueryDescription().should("contain", "editedQuery-description");
    //remove query
    browsePage.getResetQueryButton().click();
    browsePage.getManageQueriesModalOpened();
    queryComponent.getManageQueryModal().should("be.visible");
    queryComponent.getDeleteQuery();
    // browsePage.getManageQueryCloseIcon().click();
    queryComponent.getManageQueryModal().should("not.exist");
  });
  it("verify manage queries modal visibility and removing query scenario on the detail page", () => {
    //create a query
    browsePage.selectEntity("Person");
    browsePage.getSelectedEntity().should("contain", "Person");
    browsePage.getShowMoreLink("fname").click();
    browsePage.getFacetItemCheckbox("fname", "Alice").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveModalIcon().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveQueryName().should("be.visible");
    browsePage.getSaveQueryName().type("personQuery-detail");
    browsePage.getSaveQueryButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getManageQueryCloseIcon().click();
    //switch to explorer zero state page
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForTableToLoad();
    //open record instance view for the first document
    cy.get("#instance").first().click({force: true});
    cy.waitForAsyncRequest();
    browsePage.waitForSpinnerToDisappear();
    //verify the manage queries modal button is visible
    browsePage.getManageQueriesButton().should("be.visible");
    //reload page and verify the manage queries modal button persist
    cy.reload();
    cy.waitForAsyncRequest();
    browsePage.waitForSpinnerToDisappear();
    cy.waitUntil(() => browsePage.getManageQueriesButton().should("have.length.gt", 0));
    cy.wait(1000);
    cy.waitForAsyncRequest();
    cy.waitUntil(() => browsePage.getManageQueriesButton().should("be.visible"), {timeout: 10000});
    //open manage queries modal dialog and remove previosly saved query
    browsePage.getManageQueriesModalOpened();
    queryComponent.getManageQueryModal().should("be.visible");
    queryComponent.getDeleteQuery();
    queryComponent.getManageQueryModal().should("not.exist");
    //return back to explore page and verify data display
    detailPage.clickBackButton();
    cy.waitForAsyncRequest();
    browsePage.waitForSpinnerToDisappear();
    cy.wait(1000);
    browsePage.getTotalDocuments().should("not.be.equal", 0);
  });

  it("verify query selection from All Data view page, doesn't stay on card view", () => {
    //create a query first
    browsePage.selectEntity("Person");
    browsePage.getSelectedEntity().should("contain", "Person");
    browsePage.getShowMoreLink("fname").click();
    browsePage.getFacetItemCheckbox("fname", "Alice").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveModalIcon().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveQueryName().should("be.visible");
    browsePage.getSaveQueryName().type("personQuery-test");
    browsePage.getSaveQueryButton().click();
    browsePage.waitForSpinnerToDisappear();

    //Switch to "All Data"
    browsePage.selectEntity("All Data");
    browsePage.getSelectedEntity().should("contain", "All Data");

    //Open the manage query modal to apply the recently created query
    browsePage.getManageQueriesModalOpened();
    queryComponent.getManageQueryModal().should("be.visible");
    queryComponent.getQueryByName("personQuery-test").click();
    cy.waitForAsyncRequest();
    browsePage.waitForSpinnerToDisappear();

    //check table rows
    browsePage.getTableRows().should("have.length", 1);
    //check table columns
    browsePage.getTableColumns().should("have.length", 6);
    //Check query facet is applied
    browsePage.getSelectedFacet("Alice").should("exist");

    //open manage queries modal dialog and remove previously saved query
    browsePage.getManageQueriesModalOpened();
    queryComponent.getManageQueryModal().should("be.visible");
    queryComponent.getDeleteQuery();
    queryComponent.getManageQueryModal().should("not.exist");
  });

  it("verify applying previously saved query scenario on the detail page", () => {
    //create a query
    browsePage.selectEntity("Person");
    browsePage.getSelectedEntity().should("contain", "Person");
    browsePage.getShowMoreLink("fname").click();
    browsePage.getFacetItemCheckbox("fname", "Alice").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveModalIcon().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveQueryName().should("be.visible");
    browsePage.getSaveQueryName().type("personQuery");
    browsePage.getSaveQueryButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getManageQueryCloseIcon().click();

    //open record instance view for a document of a different entity
    browsePage.selectEntity("Customer");
    browsePage.getSelectedEntity().should("contain", "Customer");
    cy.get("#instance").first().click({force: true});
    cy.waitForAsyncRequest();
    browsePage.waitForSpinnerToDisappear();

    //verify the manage queries modal button is visible
    browsePage.getManageQueriesButton().should("be.visible");

    //open manage queries modal dialog and apply previosly saved query
    browsePage.getManageQueriesModalOpened();
    queryComponent.getManageQueryModal().should("be.visible");
    queryComponent.getQueryByName("personQuery").first().click();
    queryComponent.getManageQueryModal().should("not.exist");

    //verify the applied query details on Browse page
    cy.waitForAsyncRequest();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("not.be.equal", 0);
    browsePage.getSelectedEntity().should("contain", "Person");
    browsePage.getFacetItemCheckbox("fname", "Alice").should("be.checked");
    browsePage.getAppliedFacets("Alice").should("exist");
    browsePage.getSelectedQuery().should("contain", "personQuery");
  });

  it("verify editing previously saved query, updates the currently applied query name in browse page", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForTableToLoad();
    browsePage.getSelectedEntity().should("contain", "All Entities");
    browsePage.getSaveQueriesDropdown().should("be.visible");
    browsePage.selectQuery("personQuery");

    //verify the applied query details on Browse page
    cy.waitForAsyncRequest();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSelectedEntity().should("contain", "Person");
    browsePage.getSelectedQuery().should("contain", "personQuery");

    //verify the manage queries modal button is visible
    browsePage.getManageQueriesButton().should("be.visible");

    //open manage queries modal dialog and apply previosly saved query
    browsePage.getManageQueriesModalOpened();
    queryComponent.getManageQueryModal().should("be.visible");

    //Editing the query
    queryComponent.getEditQuery().click();
    queryComponent.getEditQueryName().clear();
    queryComponent.getEditQueryName().type("edited-personQuery");
    queryComponent.getSubmitButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => browsePage.getManageQueryCloseIcon().should("be.visible")).click();
    queryComponent.getManageQueryModal().should("not.exist");

    //Check if the current query name is updated in browse page or not
    browsePage.getSelectedQuery().should("contain", "edited-personQuery");
  });
});
