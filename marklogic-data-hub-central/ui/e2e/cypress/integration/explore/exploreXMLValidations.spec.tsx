/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import detailPage from "../../support/pages/detail";
import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import "cypress-wait-until";
import detailPageNonEntity from "../../support/pages/detail-nonEntity";
import LoginPage from "../../support/pages/login";

describe("xml scenario for snippet view on browse documents page", () => {

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
  it("select Customer XML entity instances and verify entity, docs, hub/entity properties", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.clickFacetView();
    browsePage.selectEntity("Customer");
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersXML").scrollIntoView().click();
    browsePage.getGreySelectedFacets("mapCustomersXML").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getTotalDocuments().should("be.gte", 5);
    browsePage.getDocuments().each((item, i) => {
      browsePage.getDocumentEntityName(i).should("exist");
      browsePage.getDocumentPKey(i).should("exist");
      browsePage.getDocumentPKeyValue(i).should("exist");
      browsePage.getDocumentSnippet(i).should("exist");
      browsePage.getDocumentCreatedOn(i).should("exist");
      browsePage.getDocumentSources(i).should("exist");
      browsePage.getDocumentRecordType(i).should("exist");
    });
    facets.forEach(function (item) {
      browsePage.getFacet(item).should("exist");
      browsePage.getFacetItems(item).should("exist");
    });
    browsePage.clickClearFacetSearchSelection("mapCustomersXML");
  });
  it("apply facet search and verify docs, hub/entity properties", () => {
    browsePage.selectEntity("All Entities");
    browsePage.getSelectedEntity().should("contain", "All Entities");
    browsePage.getShowMoreLink("collection").click();
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    browsePage.getFacetItemCheckbox("collection", "mapCustomersXML").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getGreySelectedFacets("mapCustomersXML").should("exist");
    browsePage.getFacetApplyButton().should("exist");
    browsePage.getClearGreyFacets().should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getTotalDocuments().should("be.equal", 5);
    browsePage.getClearAllFacetsButton().should("exist");
    browsePage.getFacetSearchSelectionCount("collection").should("contain", "1");
    browsePage.clickClearFacetSearchSelection("mapCustomersXML");
  });
  it("apply facet search and clear individual grey facet", () => {
    browsePage.selectEntity("All Entities");
    browsePage.getSelectedEntity().should("contain", "All Entities");
    browsePage.getShowMoreLink("collection").click();
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    browsePage.showMoreCollection();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersXML").click();
    browsePage.getGreySelectedFacets("mapCustomersXML").click();
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
  });
  it("apply facet search and clear all grey facets", () => {
    browsePage.selectEntity("All Entities");
    browsePage.getSelectedEntity().should("contain", "All Entities");
    browsePage.getShowMoreLink("collection").click();
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    browsePage.showMoreCollection();
    browsePage.getFacetItemCheckbox("collection", "Customer").click();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersXML").click();
    browsePage.getGreySelectedFacets("Customer").should("exist");
    browsePage.getGreySelectedFacets("mapCustomersXML").should("exist");
    browsePage.getClearGreyFacets().click();
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
  });
  it("search for a simple text/query and verify content", () => {
    browsePage.search("Randolph");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getDocumentEntityName(0).should("exist");
    browsePage.getDocumentPKey(0).should("exist");
    browsePage.getDocumentPKeyValue(0).should("exist");
    browsePage.getDocumentSnippet(0).should("exist");
    browsePage.getDocumentCreatedOn(0).should("exist");
    browsePage.getDocumentSources(0).should("exist");
    browsePage.getDocumentRecordType(0).should("exist");
    browsePage.getDocumentRecordType(0).should("be.equal", "xml");
  });
  it("verify instance view of the document", () => {
    browsePage.getSearchText().clear();
    browsePage.waitForSpinnerToDisappear();
    browsePage.search("Randolph");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getInstanceViewIcon().click();
    detailPage.getInstanceView().should("exist");
    detailPage.getDocumentEntity().should("contain", "Customer");
    detailPage.getDocumentID().should("contain", "0");
    detailPage.getDocumentTimestamp().should("exist");
    detailPage.getDocumentSource().should("contain", "CustomerSourceName");
    detailPage.getDocumentRecordType().should("contain", "xml");
    detailPage.getDocumentTable().should("exist");
    browsePage.backToResults();
    cy.waitUntil(() => browsePage.getSearchText());
  });
  it("verify source view of the document", () => {
    browsePage.getSearchText().clear();
    browsePage.waitForSpinnerToDisappear();
    browsePage.search("Randolph");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getSourceViewIcon().click();
    detailPage.getSourceView().click();
    detailPage.getDocumentXML().should("exist");
    browsePage.backToResults();
    cy.waitUntil(() => browsePage.getSearchText());
  });
  it("select Customer xml entity instances and verify table", () => {
    browsePage.selectEntity("Customer");
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.getHubPropertiesExpanded();
    cy.waitUntil(() => browsePage.getFacetItemCheckbox("collection", "mapCustomersXML")).click();
    browsePage.getGreySelectedFacets("mapCustomersXML").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.clickTableView();
    browsePage.getTotalDocuments().should("be.gte", 5);
    //check table rows
    browsePage.getTableRows().should("have.length", 5);
    //check table columns
    browsePage.getTableColumns().should("have.length", 6);
    browsePage.clickClearFacetSearchSelection("mapCustomersXML");
  });
  it("verify instance view of the document", () => {
    browsePage.search("Bowman");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getTableViewInstanceIcon().click();
    detailPage.getInstanceView().should("exist");
    detailPage.getDocumentEntity().should("contain", "Customer");
    detailPage.getDocumentID().should("contain", "203");
    detailPage.getDocumentTimestamp().should("exist");
    detailPage.getDocumentSource().should("contain", "CustomerSourceName");
    detailPage.getDocumentRecordType().should("contain", "xml");
    detailPage.getDocumentTable().should("exist");
    browsePage.backToResults();
    cy.waitUntil(() => browsePage.getSearchText());
  });
  it("verify source view of the document", () => {
    browsePage.getSearchText().clear();
    browsePage.waitForSpinnerToDisappear();
    browsePage.search("Bowman");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getTableViewSourceIcon().click();
    detailPage.getSourceView().click();
    detailPage.getDocumentXML().should("exist");
    browsePage.backToResults();
    cy.waitUntil(() => browsePage.getSearchText());
    browsePage.getSearchText().clear();
  });
  it("verify record view of the XML document in non-entity detail page", () => {
    browsePage.selectEntity("All Data");
    cy.waitUntil(() => browsePage.getNavigationIconForDocument("/dictionary/first-names.xml")).click({force: true});
    browsePage.waitForSpinnerToDisappear();
    detailPageNonEntity.getRecordView().should("exist");
    detailPage.getDocumentXML().should("exist");
    detailPageNonEntity.getDocumentUri().should("contain", "/dictionary/first-names.xml");
    detailPageNonEntity.getSourceTable().should("exist");
    detailPageNonEntity.getHistoryTable().should("exist");
    detailPageNonEntity.clickBackButton();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getSelectedEntity().should("contain", "All Data");
  });
});