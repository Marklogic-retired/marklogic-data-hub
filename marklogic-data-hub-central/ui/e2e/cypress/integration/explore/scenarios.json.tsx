/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import detailPage from "../../support/pages/detail";
import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import "cypress-wait-until";
// import detailPageNonEntity from "../../support/pages/detail-nonEntity";
import LoginPage from "../../support/pages/login";
import runPage from "../../support/pages/run";

describe("scenarios for All Data zero state and explore pages.", () => {

  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
  });

  it("verify All Data for final/staging databases and non-entity detail page", () => {
    //switch on zero state page and select query parameters for final database
    cy.waitUntil(() => browsePage.getFinalDatabaseButton()).click();
    browsePage.getFinalDatabaseButton().click();
    browsePage.getTableViewButton().click();
    browsePage.selectEntity("All Data");
    browsePage.getSearchText().type("Adams");
    browsePage.getExploreButton().click();
    //verify the query data for final database on explore page
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    cy.contains("Showing 1-2 of 2 results", {timeout: 10000});
    browsePage.getAllDataSnippetByUri("/json/customers/Cust2.json").should("contain", "ColeAdams");
    browsePage.search("Barbi");
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getTotalDocuments().should("be.equal", 0);

    //switch to staging database and verify data for query parameters
    browsePage.getStagingDatabaseButton().click();
    cy.waitForAsyncRequest();
    browsePage.search("Adams");
    cy.get(".ant-input-search-button").click();
    cy.waitForAsyncRequest();
    cy.contains("Showing 1-2 of 2 results", {timeout: 10000});
    browsePage.getAllDataSnippetByUri("/json/customers/Cust2.json").should("contain", "Adams");
    browsePage.search("Barbi");
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getAllDataSnippetByUri("/json/clients/client1.json").should("contain", "Barbi");

    //Verify if switching between All Data and specific entities works properly
    browsePage.getFinalDatabaseButton().click();
    cy.waitForAsyncRequest();
    browsePage.selectEntity("Customer");
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.getTotalDocuments().should("be.equal", 10);
    browsePage.selectEntity("All Data");
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getSelectedEntity().should("contain", "All Data");

    browsePage.getIncludeHubArtifactsSwitch().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();

    browsePage.search("Adams");
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    cy.contains("Showing 1-2 of 2 results", {timeout: 10000});

    // Commenting out this test as the search endpoint will not return datahub artifacts.
    // The test will be handle as part of DHFPROD-6670

    // Verifying non-entity detail page for JSON document
    browsePage.clearSearchText();

    // cy.waitUntil(() => browsePage.getNavigationIconForDocument("/steps/custom/mapping-step.step.json")).click();
    // browsePage.waitForSpinnerToDisappear();
    //
    // detailPageNonEntity.getDocumentUri().should("contain", "/steps/custom/mapping-step.step.json");
    // detailPageNonEntity.getSourceTable().should("exist");
    // detailPageNonEntity.getHistoryTable().should("exist");
    // detailPage.getDocumentJSON().should("exist");
    // detailPageNonEntity.clickBackButton();
    //
    // browsePage.waitForSpinnerToDisappear();
    // cy.waitForAsyncRequest();
    // browsePage.getSelectedEntity().should("contain", "All Data");
    // browsePage.getDatabaseButton("final").should("have.attr", "checked");

    //verify Explorer Search option entity dropdown doesn't default to 'All Data' for subsequent navigations
    toolbar.getLoadToolbarIcon().click();
    toolbar.getModelToolbarIcon().click();
    toolbar.getCurateToolbarIcon().click();
    toolbar.getRunToolbarIcon().click();
    toolbar.getExploreToolbarIcon().click();
    browsePage.getSelectedEntity().should("contain", "All Entities");
    browsePage.getExploreButton().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getSelectedEntity().should("contain", "All Entities");
  });

  it("verify Include Hub Data artifacts switch for All Data option on browse page", () => {
    //switch on zero state page and select query parameters for final database
    cy.waitUntil(() => browsePage.getFinalDatabaseButton()).click();
    browsePage.getFinalDatabaseButton().click();
    browsePage.getTableViewButton().click();
    browsePage.selectEntity("All Data");
    browsePage.getExploreButton().click();
    //verify the query data for final database on explore page
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();

    //Include Data Hub Artifacts switch should not be checked by default
    browsePage.getIncludeHubArtifactsSwitch().should("not.be.checked");
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getAllDataSnippetByUri("/steps/custom/mapping-step.step.json").should("not.exist");

    //Toggle the switch to see if the hub artifact is visible now
    browsePage.getIncludeHubArtifactsSwitch().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => browsePage.getAllDataSnippetByUri("/steps/custom/mapping-step.step.json")).should("exist");
  });
});

describe("json scenario for snippet on browse documents page", () => {

  let facets: string[] = ["collection", "flow"];

  //login with valid account and go to /browse page
  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.clickFacetView();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForTableToLoad();
  });

  afterEach(() => {
    cy.resetTestUser();
  });

  it("select \"all entities\" verify docs, hub/entity properties", () => {
    browsePage.getSelectedEntity().should("contain", "All Entities");
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    browsePage.getDocuments().each(function (item, i) {
      browsePage.getDocumentEntityName(i).should("exist");
      browsePage.getDocumentPKey(i).should("exist");
      browsePage.getDocumentPKeyValue(i).should("exist");
      browsePage.getDocumentSnippet(i).should("exist");
      browsePage.getDocumentCreatedOn(i).should("exist");
      browsePage.getDocumentRecordType(i).should("exist");
    });
    facets.forEach(function (item) {
      browsePage.getFacet(item).should("exist");
      browsePage.getFacetItems(item).should("exist");
    });

    //Verify shadow effect upon scrolling within the snippet view
    browsePage.getSnippetViewResult().should("have.css", "box-shadow", "none"); //No shadow effect in place when no scroll.
    browsePage.getSnippetViewResult().scrollTo("center"); //Scrolling within the div
    //Checking if the shadow style is applied when scroll in effect
    browsePage.getSnippetViewResult().should("have.css", "box-shadow", "rgb(153, 153, 153) 0px 4px 4px -4px, rgb(153, 153, 153) 0px -4px 4px -4px");
    browsePage.getSnippetViewResult().scrollTo("bottom"); //Scrolling within the div, to the bottom of the list
    browsePage.getSnippetViewResult().should("have.css", "box-shadow", "none"); //No shadow effect because end of scroll.

    //Verify page number persists when navigating back from detail view
    browsePage.clickPaginationItem(2);
    browsePage.search("10256");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getInstanceViewIcon().click();
    detailPage.getInstanceView().should("exist");
    detailPage.getDocumentTable().should("exist");
    detailPage.clickBackButton();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getSelectedEntity().should("contain", "All Entities");
    browsePage.getDatabaseButton("final").should("have.attr", "checked");
    browsePage.getSearchText().should("have.value", "10256");
    browsePage.getFacetView().should("have.css", "color", "rgb(91, 105, 175)");
  });

  it("select Person entity and verify entity, docs, hub/entity properties", () => {
    browsePage.selectEntity("Person");
    browsePage.getSelectedEntity().should("contain", "Person");
    browsePage.getHubPropertiesExpanded();
    browsePage.getTotalDocuments().should("be.greaterThan", 5);
    browsePage.getDocuments().each(function (item, i) {
      browsePage.getDocumentEntityName(i).should("exist");
      browsePage.getDocumentPKey(i).should("exist");
      browsePage.getDocumentPKeyValue(i).should("exist");
      browsePage.getDocumentSnippet(i).should("exist");
      browsePage.getDocumentCreatedOn(i).should("exist");
      browsePage.getDocumentRecordType(i).should("exist");
    });
    facets.forEach(function (item) {
      browsePage.getFacet(item).should("exist");
      browsePage.getFacetItems(item).should("exist");
    });
  });

  it("select Person/Customer entity, verify no entityName in Collection facets and hub property persistence", () => {
    browsePage.selectEntity("Person");
    browsePage.getSelectedEntity().should("contain", "Person");
    browsePage.getFacetItemCheckbox("collection", "mapPersonJSON").should("not.be.visible");
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacetItemCheckbox("collection", "Person").should("not.exist");
    browsePage.getFacetItemCheckbox("collection", "mapPersonJSON").click();
    browsePage.getFacetApplyButton().click();
    browsePage.getFacetItemCheckbox("collection", "mapPersonJSON").should("be.visible");
    browsePage.getFacetItemCheckbox("collection", "mapPersonJSON").should("be.checked");
    browsePage.selectEntity("Customer");
    browsePage.getEntityConfirmationNoClick().click();
    cy.waitForModalToDisappear();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.getFacetItemCheckbox("collection", "mapCustomerXML").should("not.be.visible");
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacetItemCheckbox("collection", "Customer").should("not.exist");
    browsePage.getFacetItemCheckbox("collection", "mapCustomersXML").click();
    browsePage.getFacetApplyButton().click();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersXML").should("be.visible");
    browsePage.getFacetItemCheckbox("collection", "mapCustomersXML").should("be.checked");
  });

  it("apply facet search and verify docs, hub/entity properties", () => {
    browsePage.selectEntity("All Entities");
    browsePage.getSelectedEntity().should("contain", "All Entities");
    browsePage.getExpandableSnippetView();
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    browsePage.getShowMoreLink("collection").click();
    browsePage.getFacetItemCheckbox("collection", "Person").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getGreySelectedFacets("Person").should("exist");
    browsePage.getFacetApplyButton().should("exist");
    browsePage.getClearGreyFacets().should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getTotalDocuments().should("be.equal", 14);
    browsePage.getClearAllFacetsButton().should("exist");
    browsePage.getFacetSearchSelectionCount("collection").should("contain", "1");
    browsePage.clickClearFacetSearchSelection("Person");
  });

  it("apply facet search and clear individual grey facet", () => {
    browsePage.selectEntity("All Entities");
    browsePage.getSelectedEntity().should("contain", "All Entities");
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    browsePage.getShowMoreLink("collection").click();
    browsePage.getFacetItemCheckbox("collection", "Person").click();
    browsePage.getGreySelectedFacets("Person").click();
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
  });

  it("apply facet search and clear all grey facets", () => {
    browsePage.selectEntity("All Entities");
    browsePage.getSelectedEntity().should("contain", "All Entities");
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    browsePage.getShowMoreLink("collection").click();
    browsePage.getFacetItemCheckbox("collection", "Person").click();
    browsePage.getFacetItemCheckbox("collection", "Customer").click();
    browsePage.getGreySelectedFacets("Person").should("exist");
    browsePage.getGreySelectedFacets("Customer").should("exist");
    browsePage.getClearGreyFacets().click();
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
  });

  it("search for a simple text/query and verify content", () => {
    browsePage.search("Powers");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getDocumentEntityName(0).should("exist");
    //browsePage.getDocumentId(0).should('exist');
    browsePage.getDocumentSnippet(0).should("exist");
    browsePage.getDocumentCreatedOn(0).should("exist");
    browsePage.getDocumentSources(0).should("exist");
    browsePage.getDocumentRecordType(0).should("exist");
  });

  it("verify instance view of the document with pk", () => {
    browsePage.search("Powers");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getInstanceViewIcon().click();
    detailPage.getInstanceView().should("exist");
    detailPage.getDocumentTimestamp().should("exist");
    detailPage.getDocumentID().should("contain", "104");
    detailPage.getDocumentSource().should("contain", "CustomerSourceName");
    detailPage.getDocumentRecordType().should("contain", "json");
    detailPage.getDocumentTable().should("exist");
    detailPage.getDocumentEntity().should("contain", "Customer");
  });

  it("verify detail view of the document with encoded uri", () => {
    browsePage.selectEntity("All Data");
    browsePage.search("Holland Wells");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getInstanceViewIcon().click();
    detailPage.getInstanceView().should("exist");
    detailPage.getDocumentEntity().should("contain", "Customer");
    detailPage.getDocumentTimestamp().should("exist");
    detailPage.getDocumentSource().should("contain", "CustomerSourceName");
    detailPage.getDocumentRecordType().should("contain", "json");
    detailPage.getDocumentTable().should("exist");
    detailPage.getDocumentUri().should("contain", "/json/customers/Cust%205.json");
  });

  it("verify instance view of the document without pk", () => {
    browsePage.search("1990 Taylor St");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getInstanceViewIcon().click();
    detailPage.getInstanceView().should("exist");
    detailPage.getDocumentEntity().should("contain", "Person");
    detailPage.getDocumentTimestamp().should("exist");
    detailPage.getDocumentSource().should("contain", "PersonSourceName");
    detailPage.getDocumentRecordType().should("contain", "json");
    detailPage.getDocumentTable().should("exist");
    detailPage.getDocumentUri().should("contain", "/json/persons/last-name-dob-custom1.json");
  });

  it("verify source view of the document", () => {
    browsePage.search("Powers");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getSourceViewIcon().click();
    detailPage.getSourceView().click();
    detailPage.getDocumentJSON().should("exist");
  });

  it("verify detail page source and instance tooltips", () => {
    browsePage.search("Powers");
    browsePage.getSourceViewIcon().trigger("mouseover");
    cy.contains("Show the complete JSON").should("be.visible");
    browsePage.getInstanceViewIcon().trigger("mouseover");
    cy.contains("Show the processed data").should("be.visible");
    browsePage.getSourceViewIcon().click();
    detailPage.getSourceView().trigger("mouseover");
    cy.contains("Show the complete JSON").should("be.visible");
    detailPage.getInstanceView().trigger("mouseover");
    cy.contains("Show the processed data").should("be.visible");
  });

});


describe("json scenario for table on browse documents page", () => {

  let facets: string[] = ["collection", "flow"];

  //login with valid account and go to /browse page
  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForTableToLoad();
  });

  it("select \"all entities\" and verify table default columns", () => {
    browsePage.getSelectedEntity().should("contain", "All Entities");
    browsePage.getExpandableTableView();
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    browsePage.getColumnTitle(2).should("contain", "Identifier");
    browsePage.getColumnTitle(3).should("contain", "Entity Type");
    browsePage.getColumnTitle(4).should("contain", "Record Type");
    browsePage.getColumnTitle(5).should("contain", "Created");

    facets.forEach(function (item) {
      browsePage.getFacet(item).should("exist");
      browsePage.getFacetItems(item).should("exist");
    });
  });

  it("select \"all entities\" and verify table", () => {
    browsePage.getSelectedEntity().should("contain", "All Entities");
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    //check table rows
    browsePage.getTableRows().should("have.length", 20);
    //check table columns
    browsePage.getTableColumns().should("have.length", 5);
  });

  it("select Person entity and verify table", () => {
    browsePage.selectEntity("Person");
    browsePage.getSelectedEntity().should("contain", "Person");
    browsePage.getHubPropertiesExpanded();
    browsePage.getTotalDocuments().should("be.greaterThan", 5);
    //check table rows
    browsePage.getTableRows().should("have.length", 14);
    //check table columns
    browsePage.getTableColumns().should("to.have.length.of.at.most", 6);
  });


  it("search for a simple text/query and verify content", () => {
    browsePage.search("Alice");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getTableRows().should("have.length", 1);
  });

  it("verify instance view of the document without pk", () => {
    browsePage.selectEntity("Person");
    browsePage.search("Alice");
    browsePage.getFacetItemCheckbox("fname", "Alice").click();
    browsePage.getGreySelectedFacets("Alice").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getTableViewInstanceIcon().click();
    detailPage.getInstanceView().should("exist");
    detailPage.getDocumentEntity().should("contain", "Person");
    detailPage.getDocumentUri().should("contain", "/json/persons/last-name-dob-custom1.json");
    detailPage.getDocumentTimestamp().should("exist");
    detailPage.getDocumentSource().should("contain", "PersonSourceName");
    detailPage.getDocumentRecordType().should("contain", "json");
    detailPage.getDocumentTable().should("exist");
    //Verify navigating back from detail view should persist search options
    detailPage.clickBackButton();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getDatabaseButton("final").should("have.attr", "checked");
    browsePage.getSelectedEntity().should("contain", "Person");
    browsePage.getClearFacetSearchSelection("Alice").should("exist");
    browsePage.getSearchText().should("have.value", "Alice");
    browsePage.getTableView().should("have.css", "color", "rgb(91, 105, 175)");

  });

  it("verify instance view of the document with pk", () => {
    browsePage.search("10248");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getTableViewInstanceIcon().click();
    detailPage.getInstanceView().should("exist");
    detailPage.getDocumentEntity().should("contain", "Order");
    detailPage.getDocumentID().should("contain", "10248");
    detailPage.getDocumentTimestamp().should("exist");
    detailPage.getDocumentSource().should("contain", "OrdersSourceName");
    detailPage.getDocumentRecordType().should("contain", "json");
    detailPage.getDocumentTable().should("exist");
  });

  it("verify source view of the document", () => {
    browsePage.selectEntity("Customer");
    browsePage.getFinalDatabaseButton().click();
    browsePage.search("Adams Cole");
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    browsePage.getFacetItemCheckbox("email", "coleadams39@nutralab.com").click();
    browsePage.getGreySelectedFacets("adamscole@nutralab.com").should("exist");
    browsePage.getGreySelectedFacets("coleadams39@nutralab.com").should("exist");
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersJSON").click();
    browsePage.getGreySelectedFacets("mapCustomersJSON").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getTotalDocuments().should("be.equal", 2);

    //Refresh the browser page at Browse table view.
    cy.reload();
    cy.waitForAsyncRequest();

    //Verify if the facet, search text and view persists.
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.getFinalDatabaseButton().parent().find("input").invoke("attr", "checked").should("exist");
    browsePage.getClearFacetSearchSelection("mapCustomersJSON").should("exist");
    browsePage.getAppliedFacets("adamscole@nutralab.com").should("exist");
    browsePage.getAppliedFacets("coleadams39@nutralab.com").should("exist");
    browsePage.getAppliedFacetName("adamscole@nutralab.com").should("be.equal", "email: adamscole@nutralab.com");
    browsePage.getAppliedFacetName("coleadams39@nutralab.com").should("be.equal", "email: coleadams39@nutralab.com");
    browsePage.getSearchText().should("have.value", "Adams Cole");
    browsePage.getTableView().should("have.css", "color", "rgb(91, 105, 175)");

    //Navigating to detail view
    cy.waitForAsyncRequest();
    cy.waitUntil(() => browsePage.getTableViewSourceIcon()).click();
    cy.waitForAsyncRequest();
    browsePage.waitForSpinnerToDisappear();
    detailPage.getDocumentJSON().should("exist");
    detailPage.getDocumentEntity().should("contain", "Customer");
    detailPage.getDocumentTimestamp().should("exist");
    detailPage.getDocumentSource().should("contain", "CustomerSourceName");
    detailPage.getDocumentRecordType().should("contain", "json");

    //Refresh the browser page at Detail view.
    cy.reload();
    cy.waitForAsyncRequest();
    browsePage.waitForSpinnerToDisappear();
    //Verify if the detail view is intact after page refresh
    detailPage.getDocumentEntity().should("contain", "Customer");
    detailPage.getDocumentTimestamp().should("exist");
    detailPage.getDocumentSource().should("contain", "CustomerSourceName");
    detailPage.getDocumentRecordType().should("contain", "json");

    detailPage.clickBackButton(); //Click on Back button to navigate back to the browse table view.

    cy.waitForAsyncRequest();
    browsePage.waitForSpinnerToDisappear();
    //Verify navigating back from detail view should persist search options
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.getDatabaseButton("final").should("have.attr", "checked");
    browsePage.getFinalDatabaseButton().parent().find("input").invoke("attr", "checked").should("exist");
    browsePage.getClearFacetSearchSelection("mapCustomersJSON").should("exist");
    browsePage.getSearchText().should("have.value", "Adams Cole");
    browsePage.getTableView().should("have.css", "color", "rgb(91, 105, 175)");
  });

  it("search for multiple facets, switch to snippet view, delete a facet, switch to table view, verify search query", () => {
    browsePage.selectEntity("Customer");
    browsePage.getSelectedEntity().should("contain", "Customer");
    //verify the popover doesn't display for the short facet name.
    browsePage.getFacetName("Adams Cole").trigger("mouseover");
    cy.wait(1000);
    browsePage.getTooltip("Adams Cole").should("not.be.visible");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    //verify the popover displays for the long facet name.
    browsePage.getFacetName("adamscole@nutralab.com").trigger("mouseover");
    cy.wait(1000);
    browsePage.getTooltip("adamscole\\@nutralab\\.com").should("be.visible");
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getGreySelectedFacets("Adams Cole").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.clickFacetView();
    browsePage.getClearFacetSearchSelection("Adams Cole").should("contain", "name: Adams Cole");
    browsePage.getClearFacetSearchSelection("adamscole@nutralab.com").should("exist");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.clickClearFacetSearchSelection("adamscole@nutralab.com");
    browsePage.clickTableView();
    browsePage.getClearFacetSearchSelection("Adams Cole").should("exist");
    browsePage.getTotalDocuments().should("be.equal", 2);
  });

  it("verify hub properties grey facets are not being removed when entity properties are selected", () => {
    browsePage.selectEntity("Customer");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getGreySelectedFacets("Adams Cole").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersJSON").click();
    browsePage.getFacetItemCheckbox("flow", "CurateCustomerJSON").click();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersJSON").should("be.visible");
    browsePage.getFacetItemCheckbox("collection", "mapCustomersJSON").should("be.checked");
    browsePage.getFacetItemCheckbox("flow", "CurateCustomerJSON").should("be.visible");
    browsePage.getFacetItemCheckbox("flow", "CurateCustomerJSON").should("be.checked");

    browsePage.getFacetItemCheckbox("source-name", "CustomerSourceName").click();
    browsePage.getFacetItemCheckbox("source-name", "CustomerSourceName").should("be.visible");
    browsePage.getFacetItemCheckbox("source-name", "CustomerSourceName").should("be.checked");

    browsePage.getFacetItemCheckbox("source-type", "CustomerSourceType").click();
    browsePage.getFacetItemCheckbox("source-type", "CustomerSourceType").should("be.visible");
    browsePage.getFacetItemCheckbox("source-type", "CustomerSourceType").should("be.checked");

    browsePage.getGreySelectedFacets("mapCustomersJSON").should("exist");
    browsePage.getGreySelectedFacets("CurateCustomerJSON").should("exist");
    browsePage.getGreySelectedFacets("CustomerSourceName").should("exist");
    browsePage.getGreySelectedFacets("CustomerSourceType").should("exist");

    browsePage.clickClearFacetSearchSelection("Adams Cole");
    browsePage.getGreySelectedFacets("Adams Cole").should("not.exist");
    browsePage.getFacetItemCheckbox("name", "Bowman Hale").click();
    browsePage.getGreySelectedFacets("mapCustomersJSON").should("exist");
    browsePage.getGreySelectedFacets("CurateCustomerJSON").should("exist");
    browsePage.getGreySelectedFacets("CustomerSourceName").should("exist");
    browsePage.getGreySelectedFacets("CustomerSourceType").should("exist");
    browsePage.getGreySelectedFacets("Bowman Hale").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getSelectedFacet("mapCustomersJSON").should("exist");
    browsePage.getSelectedFacet("CurateCustomerJSON").should("exist");
    browsePage.getSelectedFacet("Bowman Hale").should("exist");
  });

  it("apply multiple facets, select and discard new facet, verify original facets checked", () => {
    browsePage.selectEntity("Customer");
    browsePage.getShowMoreLink("name").click();
    browsePage.getFacetItemCheckbox("name", "Jacqueline Knowles").click();
    browsePage.getFacetItemCheckbox("name", "Lola Dunn").click();
    browsePage.getGreySelectedFacets("Jacqueline Knowles").should("exist");
    browsePage.getGreySelectedFacets("Lola Dunn").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getFacetItemCheckbox("name", "Jacqueline Knowles").should("be.checked");
    browsePage.getFacetItemCheckbox("name", "Lola Dunn").should("be.checked");
    browsePage.getFacetItemCheckbox("email", "jacquelineknowles@nutralab.com").click();
    browsePage.getGreySelectedFacets("jacquelineknowles@nutralab.com").should("exist");
    browsePage.getClearGreyFacets().click();
    browsePage.getFacetItemCheckbox("name", "Jacqueline Knowles").should("be.checked");
    browsePage.getFacetItemCheckbox("name", "Lola Dunn").should("be.checked");
    browsePage.getFacetItemCheckbox("email", "jacquelineknowles@nutralab.com").should("not.be.checked");
  });

  it("apply multiple facets, deselect them, apply changes, apply multiple, clear them, verify no facets checked", () => {
    browsePage.selectEntity("Customer");
    browsePage.getShowMoreLink("name").click();
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getGreySelectedFacets("Adams Cole").should("exist");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").should("be.checked");
    browsePage.getFacetApplyButton().click();
    browsePage.selectDateRange();
    browsePage.getSelectedFacet("birthDate:").should("exist");
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    browsePage.getGreySelectedFacets("adamscole@nutralab.com").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.clickClearFacetSearchSelection("birthDate");
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").should("be.checked");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    browsePage.getFacetItemCheckbox("name", "Adams Cole").should("not.be.checked");
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").should("not.be.checked");
    browsePage.getGreySelectedFacets("Adams Cole").should("not.exist");
    browsePage.getGreySelectedFacets("adamscole@nutralab.com").should("not.exist");
    cy.waitForAsyncRequest();
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    browsePage.getFacetApplyButton().click();
    browsePage.clickClearFacetSearchSelection("Adams Cole");
    browsePage.clickClearFacetSearchSelection("adamscole@nutralab.com");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").should("not.be.checked");
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").should("not.be.checked");
    browsePage.getGreySelectedFacets("Adams Cole").should("not.exist");
    browsePage.getGreySelectedFacets("adamscole@nutralab.com").should("not.exist");
  });


  it("Verify facets can be selected, applied and cleared using clear text", () => {
    browsePage.selectEntity("Person");
    browsePage.getShowMoreLink("fname").click();
    browsePage.getFacetItemCheckbox("fname", "Gary").click();
    browsePage.getGreySelectedFacets("Gary").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getFacetItemCheckbox("fname", "Gary").should("be.checked");
    browsePage.getFacetSearchSelectionCount("fname").should("contain", "1");
    browsePage.getClearFacetSelection("fname").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("fname", "Gary").should("not.be.checked");
    browsePage.getGreySelectedFacets("Gary").should("not.exist");
  });

  it("Apply facets, unchecking them should not recheck original facets", () => {
    browsePage.selectEntity("Customer");
    browsePage.getShowMoreLink("name").click();
    browsePage.getFacetItemCheckbox("name", "Mcgee Burch").click();
    browsePage.getFacetItemCheckbox("name", "Powers Bauer").click();
    browsePage.getGreySelectedFacets("Mcgee Burch").should("exist");
    browsePage.getGreySelectedFacets("Powers Bauer").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getFacetItemCheckbox("name", "Mcgee Burch").should("be.checked");
    browsePage.getFacetItemCheckbox("name", "Powers Bauer").should("be.checked");
    browsePage.getFacetItemCheckbox("email", "mcgeeburch@nutralab.com").click();
    browsePage.getFacetItemCheckbox("name", "Mcgee Burch").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("name", "Powers Bauer").click();
    browsePage.getShowMoreLink("email").click();
    browsePage.getFacetItemCheckbox("email", "mcgeeburch@nutralab.com").click();
    browsePage.getFacetItemCheckbox("name", "Mcgee Burch").should("not.be.checked");
    browsePage.getFacetItemCheckbox("name", "Powers Bauer").should("not.be.checked");
    browsePage.getFacetItemCheckbox("email", "mcgeeburch@nutralab.com").should("not.be.checked");
  });
});


describe("Verify numeric/date facet can be applied", () => {
  //login with valid account and go to /browse page
  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("pii-reader", "hub-central-developer").withRequest();
    LoginPage.postLogin();
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForTableToLoad();
  });

  it("Apply numeric facet values multiple times, clears the previous values and applies the new one, clearing date range facet clears selected facet", () => {
    browsePage.selectEntity("Customer");
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.waitForSpinnerToDisappear();
    browsePage.changeNumericSlider("2273");
    browsePage.getGreyRangeFacet(2273).should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getRangeFacet(2273).should("exist");
    browsePage.getClearAllFacetsButton().should("exist");
    browsePage.changeNumericSlider("3024");
    browsePage.getGreyRangeFacet(3024).should("exist");
    browsePage.getFacetApplyButton().should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getRangeFacet(3024).should("exist");
    browsePage.getClearAllFacetsButton().should("exist");
    browsePage.getClearAllFacetsButton().click();
    //Verify clearing date range facet clears corresponding selected facet
    browsePage.selectDateRange();
    browsePage.getFacetApplyButton().click();
    browsePage.getSelectedFacet("birthDate:").should("exist");
    browsePage.getDateFacetPicker().trigger("mouseover");
    cy.waitUntil(() => browsePage.getDateFacetClearIcon()).click({force: true});
    browsePage.getFacetApplyButton().should("not.exist");
  });
});

describe("scenarios for final/staging databases for zero state and explore pages", () => {

  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
  });

  it("verify selection of final/staging database on zero state and explore pages", () => {
    //switch on zero state page and select query parameters for final database
    cy.waitUntil(() => browsePage.getFinalDatabaseButton()).click();
    browsePage.getFinalDatabaseButton().click();
    browsePage.getTableViewButton().click();
    browsePage.selectEntity("Customer");
    browsePage.getSearchText().type("Adams");
    browsePage.getExploreButton().click();
    browsePage.waitForSpinnerToDisappear();

    //verify query parameters for final database on browse page
    browsePage.waitForTableToLoad();
    browsePage.getFinalDatabaseButton().parent().find("input").invoke("attr", "checked").should("exist");
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.getSearchText().should("have.value", "Adams");
    browsePage.getTotalDocuments().should("be.equal", 2);

    //Verify if the pagination gets reset upon cliking on database buttons
    browsePage.clearSearchText();
    browsePage.selectEntity("All Entities");
    browsePage.getPaginationPageSizeOptions().then(attr => {
      attr[0].click();
    });

    browsePage.getPageSizeOption("10 / page").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.clickPaginationItem(4);
    browsePage.waitForSpinnerToDisappear();
    browsePage.getStagingDatabaseButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFinalDatabaseButton().click();
    browsePage.waitForSpinnerToDisappear();

    cy.contains("Showing 1-20 of 36 results", {timeout: 5000});
    browsePage.getTotalDocuments().should("be.equal", 36);

    //switch to staging database and verify the number of documents for the search string is 0
    browsePage.getStagingDatabaseButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.search("Adams");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("be.equal", 0);

    //switch on zero state page and select query parameters for staging database
    toolbar.getExploreToolbarIcon().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitUntil(() => browsePage.getStagingDatabaseButton()).click();
    browsePage.selectEntity("Customer");
    browsePage.getSearchText().type("Powers");
    browsePage.getSnippetViewButton().click();
    browsePage.getExploreButton().click();
    browsePage.waitForSpinnerToDisappear();

    //verify query parameters for staging database on browse page
    cy.waitUntil(() => browsePage.getSnippetViewResult());
    browsePage.getStagingDatabaseButton().parent().find("input").invoke("attr", "checked").should("exist");
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.getSearchText().should("have.value", "Powers");
    browsePage.getDocuments().should("not.exist");

    //verify the number of documents is 0
    browsePage.getTotalDocuments().should("be.equal", 0);

    //switch to final database and verify the number of documents for the search string is 1
    browsePage.getFinalDatabaseButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.search("Powers");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("be.equal", 1);

    //switch to staging database and verify documents deployed to staging
    browsePage.getStagingDatabaseButton().click();
    browsePage.selectEntity("Client");
    browsePage.getSelectedEntity().should("contain", "Client");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("be.equal", 5);

    //apply facet search for the documents deployed to staging
    browsePage.getFacetItemCheckbox("firstname", "Barbi").click();
    browsePage.getGreySelectedFacets("Barbi").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getFacetItemCheckbox("firstname", "Barbi").should("be.checked");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getClearAllFacetsButton().click();

    //apply numeric search for the documents deployed to staging
    browsePage.waitForSpinnerToDisappear();
    browsePage.changeNumericSlider("7000");
    browsePage.getGreyRangeFacet(7000).should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getRangeFacet(7000).should("exist");
    browsePage.getClearAllFacetsButton().should("exist");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("be.equal", 3);
    browsePage.getClearAllFacetsButton().click();

    //apply string search for the documents deployed to staging
    browsePage.waitForSpinnerToDisappear();
    browsePage.search("Barbi");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("be.equal", 1);
  });
});


describe("verify sidebar footer functionality ", () => {

  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForTableToLoad();
  });

  it("Verify functionality of clear and apply facet buttons", () => {
    //verify no facets selected case.
    browsePage.selectEntity("Customer");
    browsePage.getClearAllFacetsButton().should("be.disabled");
    browsePage.getApplyFacetsButton().should("be.disabled");

    //verify selecting facets case.
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getGreySelectedFacets("Adams Cole").should("exist");
    browsePage.getClearAllFacetsButton().should("not.be.disabled");
    browsePage.getApplyFacetsButton().should("not.be.disabled");

    //verify facets applied case.
    browsePage.getApplyFacetsButton().click();
    browsePage.getFacetItemCheckbox("name", "Adams Cole").should("be.checked");
    browsePage.getAppliedFacets("Adams Cole").should("exist");
    browsePage.getClearAllFacetsButton().should("not.be.disabled");
    browsePage.getApplyFacetsButton().should("be.disabled");

    // verify selecting additional facets case.
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    browsePage.getGreySelectedFacets("adamscole@nutralab.com").should("exist");
    browsePage.getClearAllFacetsButton().should("not.be.disabled");
    browsePage.getApplyFacetsButton().should("not.be.disabled");

    browsePage.getClearAllFacetsButton().click();
    browsePage.getAppliedFacets("Adams Cole").should("not.exist");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").should("not.be.checked");
    browsePage.getClearAllFacetsButton().should("be.disabled");
    browsePage.getApplyFacetsButton().should("be.disabled");
  });
});

describe("Verify gray facets don't persist upon switching between views", () => {

  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForTableToLoad();
  });

  it("Verify gray facets don't persist when switching between browse, zero state explorer and run views", () => {
    //verify gray facets don't persist when switching between browse and zero state explorer views.
    browsePage.selectEntity("Person");
    browsePage.getFacetItemCheckbox("fname", "Alice").click();
    browsePage.getGreySelectedFacets("Alice").should("exist");
    toolbar.getExploreToolbarIcon().click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.clickFacetView();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForTableToLoad();
    browsePage.getGreySelectedFacets("Alice").should("not.exist");

    //verify gray facets don't persist when switching between browse and run views.
    browsePage.selectEntity("Person");
    browsePage.getFacetItemCheckbox("fname", "Alice").click();
    browsePage.getGreySelectedFacets("Alice").should("exist");
    toolbar.getRunToolbarIcon().click();
    cy.waitUntil(() => runPage.getFlowName("personJSON").should("be.visible"));
    runPage.expandFlow("personJSON");
    runPage.runStep("mapPersonJSON").click();
    cy.verifyStepRunResult("success", "Mapping", "mapPersonJSON");
    runPage.explorerLink().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForTableToLoad();
    browsePage.getGreySelectedFacets("Alice").should("not.exist");
  });
});