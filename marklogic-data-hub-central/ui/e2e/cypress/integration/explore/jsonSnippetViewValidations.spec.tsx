/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import detailPage from "../../support/pages/detail";
import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import "cypress-wait-until";
// import detailPageNonEntity from "../../support/pages/detail-nonEntity";
import LoginPage from "../../support/pages/login";
import entitiesSidebar from "../../support/pages/entitiesSidebar";

describe.skip("json scenario for snippet on browse documents page", () => {
  let facets: string[] = ["collection", "flow"];
  //login with valid account and go to /browse page
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage();
  });
  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("select \"all entities\" verify docs, hub/entity properties", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    browsePage.clickFacetView();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForHCTableToLoad();
    entitiesSidebar.getSelectedEntityText().should("contain", "All Entities");
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
    entitiesSidebar.getSelectedEntityText().should("contain", "All Entities");
    browsePage.getDatabaseButton("final").should("have.attr", "checked");
    browsePage.getSearchText().should("have.value", "10256");
    browsePage.getFacetView().should("have.css", "color", "rgb(57, 68, 148)");
  });
  it("select Person entity and verify entity, docs, hub/entity properties", () => {
    entitiesSidebar.selectEntity("Person");
    entitiesSidebar.getSelectedEntityText().should("contain", "Person");
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
    browsePage.getFacetItemCheckbox("collection", "mapPersonJSON").scrollIntoView().click({force: true});
    browsePage.getFacetApplyButton().scrollIntoView().click({force: true});
    browsePage.getFacetItemCheckbox("collection", "mapPersonJSON").should("exist");
    browsePage.getFacetItemCheckbox("collection", "mapPersonJSON").should("be.checked");
  });
  it("select Customer entity and verify entity, docs, hub/entity properties", () => {
    entitiesSidebar.selectEntity("Customer");
    browsePage.getEntityConfirmationNoClick().click({force: true});
    cy.waitForModalToDisappear();
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.getSelectedEntityText().should("contain", "Customer");
    browsePage.getFacetItemCheckbox("collection", "mapCustomerXML").should("not.exist");
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacetItemCheckbox("collection", "Customer").should("not.exist");
    cy.get("#hc-sider-content").scrollTo("bottom");
    browsePage.getFacetItemCheckbox("collection", "mapCustomersXML").scrollIntoView().click({force: true});
    browsePage.getFacetApplyButton().scrollIntoView().click({force: true});
    browsePage.getFacetItemCheckbox("collection", "mapCustomersXML").should("exist");
    browsePage.getFacetItemCheckbox("collection", "mapCustomersXML").should("be.checked");
    browsePage.clickClearFacetSearchSelection("mapCustomersXML");
    browsePage.getFacetItemCheckbox("collection", "mapCustomersXML").should("not.be.checked");
  });

  it("apply facet search and verify docs, hub/entity properties", () => {
    entitiesSidebar.selectEntity("All Entities");
    entitiesSidebar.getSelectedEntityText().should("contain", "All Entities");
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
    entitiesSidebar.selectEntity("All Entities");
    entitiesSidebar.getSelectedEntityText().should("contain", "All Entities");
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    browsePage.getShowMoreLink("collection").click();
    browsePage.getFacetItemCheckbox("collection", "Person").click();
    browsePage.getGreySelectedFacets("Person").click();
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
  });
  it("apply facet search and clear all grey facets", () => {
    entitiesSidebar.selectEntity("All Entities");
    entitiesSidebar.getSelectedEntityText().should("contain", "All Entities");
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
    entitiesSidebar.selectEntity("All Data");
    browsePage.search("Holland Wells");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getInstanceViewIcon().click();
    detailPage.getInstanceView().should("exist");
    detailPage.getDocumentEntity().should("contain", "Customer");
    detailPage.getDocumentTimestamp().should("exist");
    detailPage.getDocumentSource().should("contain", "CustomerSourceName");
    detailPage.getDocumentRecordType().should("contain", "json");
    detailPage.getDocumentTable().should("exist");
    detailPage.getMetadataView().should("exist");
    detailPage.getMetadataView().click();
    detailPage.getDocumentUri().should("contain", "/json/customers/Cust5.json");
    browsePage.backToResults();
    cy.waitUntil(() => browsePage.getSearchText());
    browsePage.getSearchText().clear();
    // });
    // it("verify instance view of the document without pk", () => {
    entitiesSidebar.selectEntity("All Entities");
    browsePage.search("1990 Taylor St");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getInstanceViewIcon().click();
    detailPage.getInstanceView().should("exist");
    detailPage.getDocumentEntity().should("contain", "Person");
    detailPage.getDocumentTimestamp().should("exist");
    detailPage.getDocumentSource().should("contain", "PersonSourceName");
    detailPage.getDocumentRecordType().should("contain", "json");
    detailPage.getDocumentTable().should("exist");
    detailPage.getMetadataView().should("exist");
    detailPage.getMetadataView().click();
    detailPage.getDocumentUri().should("contain", "/json/persons/last-name-dob-custom1.json");
    browsePage.backToResults();
    cy.waitUntil(() => browsePage.getSearchText());
    browsePage.clickFacetView();
  });
  it("verify source view of the document", () => {
    browsePage.getSearchText().clear();
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.selectEntity("All Entities");
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
    entitiesSidebar.selectEntity("All Entities");
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
