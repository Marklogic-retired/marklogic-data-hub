/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import detailPage from "../../support/pages/detail";
import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import "cypress-wait-until";
// import detailPageNonEntity from "../../support/pages/detail-nonEntity";
import LoginPage from "../../support/pages/login";

describe("json scenario for snippet on browse documents page", () => {
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
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("select \"all entities\" verify docs, hub/entity properties", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.clickFacetView();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForTableToLoad();
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
  });
  it.skip("Verify shadow effect upon scrolling within the snippet view", () => {
    browsePage.clickFacetView();
    browsePage.getSnippetViewResult().should("have.css", "box-shadow", "none"); //No shadow effect in place when no scroll.
    browsePage.getSnippetViewResult().scrollTo("center", {ensureScrollable: false}); //Scrolling within the div
    //Checking if the shadow style is applied when scroll in effect
    browsePage.getSnippetViewResult().should("have.css", "box-shadow", "rgb(153, 153, 153) 0px 4px 4px -4px, rgb(153, 153, 153) 0px -4px 4px -4px");
    browsePage.getSnippetViewResult().scrollTo("bottom"); //Scrolling within the div, to the bottom of the list
    browsePage.getSnippetViewResult().should("have.css", "box-shadow", "none"); //No shadow effect because end of scroll.
  });
  it("Verify page number persists when navigating back from detail view", () => {
    browsePage.clickPaginationItem(2);
    browsePage.getSearchText().clear();
    browsePage.waitForSpinnerToDisappear();
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
    browsePage.getFacetItemCheckbox("collection", "mapPersonJSON").should("not.be.visible");
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacetItemCheckbox("collection", "Person").should("not.exist");
    browsePage.getFacetItemCheckbox("collection", "mapPersonJSON").click({force: true});
    browsePage.getFacetApplyButton().click();
    browsePage.getFacetItemCheckbox("collection", "mapPersonJSON").should("exist");
    browsePage.getFacetItemCheckbox("collection", "mapPersonJSON").should("be.checked");
  });
  it("select Customer entity and verify entity, docs, hub/entity properties", () => {
    browsePage.selectEntity("Customer");
    browsePage.getEntityConfirmationNoClick().click();
    cy.waitForModalToDisappear();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.getFacetItemCheckbox("collection", "mapCustomerXML").should("not.exist");
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacetItemCheckbox("collection", "Customer").should("not.exist");
    browsePage.getFacetItemCheckbox("collection", "mapCustomersXML").click();
    browsePage.getFacetApplyButton().click();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersXML").should("exist");
    browsePage.getFacetItemCheckbox("collection", "mapCustomersXML").should("be.checked");
    browsePage.clickClearFacetSearchSelection("mapCustomersXML");
    browsePage.getFacetItemCheckbox("collection", "mapCustomersXML").should("not.be.checked");
  });
  // TODO: skip failing test brought from develop branch since it's blocking ant replacement feature branch.
  // will unskip next test when pending PR are merged in ant-lib-replacement
  it.skip("apply facet search and verify docs, hub/entity properties", () => {
    browsePage.selectEntity("All Entities");
    browsePage.getSelectedEntity().should("contain", "All Entities");
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    browsePage.getShowMoreLink("collection").click({force: true});
    browsePage.getFacetItemCheckbox("collection", "Person").click({force: true});
    browsePage.getSelectedFacets().should("exist");
    browsePage.getGreySelectedFacets("Person").should("exist");
    browsePage.getFacetApplyButton().should("exist");
    browsePage.getClearGreyFacets().should("exist");
    browsePage.getFacetApplyButton().click({force: true});
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
    browsePage.getSearchText().clear();
    browsePage.waitForSpinnerToDisappear();
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
    browsePage.backToResults();
    cy.waitUntil(() => browsePage.getSearchText());
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
    detailPage.getDocumentUri().should("contain", "/json/customers/Cust5.json");
    browsePage.backToResults();
    cy.waitUntil(() => browsePage.getSearchText());
  });
  it("verify instance view of the document without pk", () => {
    browsePage.selectEntity("All Entities");
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
    browsePage.backToResults();
    cy.waitUntil(() => browsePage.getSearchText());
    browsePage.clickFacetView();
  });
  it("verify source view of the document", () => {
    browsePage.getSearchText().clear();
    browsePage.waitForSpinnerToDisappear();
    browsePage.selectEntity("All Entities");
    browsePage.search("Powers");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getSourceViewIcon().click();
    detailPage.getSourceView().click();
    detailPage.getDocumentJSON().should("exist");
    browsePage.backToResults();
    cy.waitUntil(() => browsePage.getSearchText());
  });
  it("verify detail page source and instance tooltips", () => {
    browsePage.getSearchText().clear();
    browsePage.waitForSpinnerToDisappear();
    browsePage.selectEntity("All Entities");
    browsePage.search("Powers");
    browsePage.getSourceViewIcon().trigger("mouseover");
    cy.contains("Show the complete JSON").should("exist");
    browsePage.getInstanceViewIcon().trigger("mouseover");
    cy.contains("Show the processed data").should("exist");
    browsePage.getSourceViewIcon().click();
    detailPage.getSourceView().trigger("mouseover");
    cy.contains("Show the complete JSON").should("exist");
    detailPage.getInstanceView().trigger("mouseover");
    cy.contains("Show the processed data").should("exist");
  });
});
