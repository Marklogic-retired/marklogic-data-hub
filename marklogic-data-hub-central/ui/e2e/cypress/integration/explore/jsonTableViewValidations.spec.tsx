/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import detailPage from "../../support/pages/detail";
import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import "cypress-wait-until";
// import detailPageNonEntity from "../../support/pages/detail-nonEntity";
import LoginPage from "../../support/pages/login";

describe("json scenario for table on browse documents page", () => {

  let facets: string[] = ["collection", "flow"];

  //login with valid account and go to /browse page
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });
  beforeEach(() => {
    cy.loginAsDeveloper().withRequest();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForTableToLoad();
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("select \"all entities\" and verify table default columns", () => {
    browsePage.getSelectedEntity().should("contain", "All Entities");
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
    // detailPage.getDocumentTable().should("exist");
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
    // detailPage.getDocumentTable().should("exist");
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

    //TODO: re-test facet search without using ml-tooltip-container
    //verify the popover doesn't display for the short facet name.
    // browsePage.getFacetName("Adams Cole").trigger("mouseover");
    // cy.wait(1000);
    // browsePage.getTooltip("Adams Cole").should("not.exist");
    // browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    // //verify the popover displays for the long facet name.
    // browsePage.getFacetName("adamscole@nutralab.com").trigger("mouseover");
    // cy.wait(1000);
    // browsePage.getTooltip("adamscole\\@nutralab\\.com").should("be.exist");

    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    browsePage.getSelectedFacets().should("exist");
    // TODO DHFPROD-7711 skip since fails for Ant Design components
    // browsePage.getGreySelectedFacets("Adams Cole").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.clickFacetView();
    // TODO DHFPROD-7711 skip since fails for Ant Design components
    // browsePage.getClearFacetSearchSelection("Adams Cole").should("contain", "name: Adams Cole");
    // browsePage.getClearFacetSearchSelection("adamscole@nutralab.com").should("exist");
    browsePage.getTotalDocuments().should("be.equal", 1);
    // TODO DHFPROD-7711 skip since fails for Ant Design components
    // browsePage.clickClearFacetSearchSelection("adamscole@nutralab.com");
    browsePage.clickTableView();
    // TODO DHFPROD-7711 skip since fails for Ant Design components
    // browsePage.getClearFacetSearchSelection("Adams Cole").should("exist");
    // browsePage.getTotalDocuments().should("be.equal", 2);
  });

  it("verify hub properties grey facets are not being removed when entity properties are selected", () => {
    browsePage.selectEntity("Customer");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getGreySelectedFacets("Adams Cole").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersJSON").click();
    browsePage.getFacetItemCheckbox("flow", "CurateCustomerJSON").click();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersJSON").should("exist");
    browsePage.getFacetItemCheckbox("collection", "mapCustomersJSON").should("be.checked");
    browsePage.getFacetItemCheckbox("flow", "CurateCustomerJSON").should("exist");
    browsePage.getFacetItemCheckbox("flow", "CurateCustomerJSON").should("be.checked");

    browsePage.getFacetItemCheckbox("source-name", "CustomerSourceName").click();
    browsePage.getFacetItemCheckbox("source-name", "CustomerSourceName").should("exist");
    browsePage.getFacetItemCheckbox("source-name", "CustomerSourceName").should("be.checked");

    browsePage.getFacetItemCheckbox("source-type", "CustomerSourceType").click();
    browsePage.getFacetItemCheckbox("source-type", "CustomerSourceType").should("exist");
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