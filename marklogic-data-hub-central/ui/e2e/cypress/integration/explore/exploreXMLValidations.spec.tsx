/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import detailPage from "../../support/pages/detail";
import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import "cypress-wait-until";
import detailPageNonEntity from "../../support/pages/detail-nonEntity";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import LoginPage from "../../support/pages/login";
import explorePage from "../../support/pages/explore";
import table from "../../support/components/common/tables";

describe("xml scenario for snippet view on browse documents page", () => {

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
  });
  it("select Customer XML entity instances and verify entity, docs, hub/entity properties", () => {
    toolbar.getExploreToolbarIcon().should("be.visible").click();
    browsePage.getTableView().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.clickFacetView();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getHubPropertiesExpanded();
    explorePage.scrollSideBarTop();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersXML").scrollIntoView().click({force: true});
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
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
    entitiesSidebar.getBaseEntityOption("All Entities").should("be.visible");
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    explorePage.scrollSideBarTop();
    browsePage.getShowMoreLink("collection").scrollIntoView().click({force: true});
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
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
    entitiesSidebar.getBaseEntityOption("All Entities").should("be.visible");
    browsePage.getShowMoreLink("collection").scrollIntoView().click({force: true});
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    browsePage.showMoreCollection();
    explorePage.scrollSideBarTop();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersXML").click();
    browsePage.getGreySelectedFacets("mapCustomersXML").click();
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
  });
  it("apply facet search and clear all grey facets", () => {
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
    entitiesSidebar.getBaseEntityOption("All Entities").should("be.visible");
    browsePage.getShowMoreLink("collection").scrollIntoView().click({force: true});
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    browsePage.showMoreCollection();
    browsePage.getFacetItemCheckbox("collection", "Customer").click();
    explorePage.scrollSideBarTop();
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
  it.skip("verify instance view of the document", () => {
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
    explorePage.backToResults();

    browsePage.getSearchText().should("be.visible");
  });
  it.skip("verify source view of the document", () => {
    browsePage.getSearchText().clear();
    browsePage.waitForSpinnerToDisappear();
    browsePage.search("Randolph");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getSourceViewIcon().click();
    detailPage.getSourceView().click();
    detailPage.getDocumentXML().should("exist");
    explorePage.backToResults();
    browsePage.getSearchText().should("be.visible");
  });
  it.skip("select Customer xml entity instances and verify table", () => {
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.getHubPropertiesExpanded();
    explorePage.scrollSideBarTop();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersXML").should("be.visible").click();
    browsePage.getGreySelectedFacets("mapCustomersXML").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.clickTableView();
    browsePage.getTotalDocuments().should("be.gte", 5);
    //check table rows
    browsePage.getHCTableRows().should("have.length", 5);
    //check table columns
    table.getTableColumns().should("have.length", 6);
    browsePage.clickClearFacetSearchSelection("mapCustomersXML");
  });
  it.skip("verify instance view of the document", () => {
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
    explorePage.backToResults();
    browsePage.getSearchText().should("be.visible");
  });
  it.skip("verify source view of the document", () => {
    browsePage.getSearchText().clear();
    browsePage.waitForSpinnerToDisappear();
    browsePage.search("Bowman");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getTableViewSourceIcon().click();
    detailPage.getSourceView().click();
    detailPage.getDocumentXML().should("exist");
    explorePage.backToResults();
    browsePage.getSearchText().should("be.visible");
    browsePage.getSearchText().clear();
  });
  it.skip("verify metadata view of the document", () => {
    browsePage.getSearchText().clear();
    browsePage.waitForSpinnerToDisappear();
    browsePage.search("Bowman");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getTableViewSourceIcon().click();
    detailPage.getMetadataView().click();
    detailPage.getDocumentUri().should("exist");
    detailPage.getDocumentQuality().should("exist");
    detailPage.getDocumentCollections().should("exist");
    detailPage.getDocumentPermissions().should("exist");
    detailPage.getDocumentMetadataValues().should("exist");
    detailPage.getDocumentProperties().should("not.exist");
    detailPage.getDocumentNoPropertiesMessage().should("exist");
    explorePage.backToResults();
    browsePage.getSearchText().should("be.visible");
    browsePage.getSearchText().clear();
  });
  it("verify record view of the XML document in non-entity detail page", () => {
    entitiesSidebar.toggleAllDataView();
    browsePage.getSearchText().clear();
    browsePage.getApplyFacetsButton().click();
    browsePage.getNavigationIconForDocument("/dictionary/first-names.xml").click({force: true});
    browsePage.waitForSpinnerToDisappear();
    detailPageNonEntity.getRecordView().should("exist");
    detailPage.getDocumentXML().should("exist");
    detailPageNonEntity.getDocumentUri().should("contain", "/dictionary/first-names.xml");
    detailPageNonEntity.getDocumentQuality().should("exist");
    detailPageNonEntity.getSourceTable().should("exist");
    detailPageNonEntity.getHistoryTable().should("exist");
    detailPageNonEntity.getDocumentCollections().should("exist");
    detailPageNonEntity.getDocumentPermissions().should("exist");
    detailPageNonEntity.getDocumentMetadataValues().should("not.exist");
    detailPageNonEntity.getDocumentProperties().should("not.exist");
    detailPageNonEntity.getDocumentNoPropertiesMessage().should("exist");
    detailPageNonEntity.clickBackButton();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
  });
  it.skip("verify metadata view of the document properties", () => {
    entitiesSidebar.toggleAllDataView();
    browsePage.search("robert");
    browsePage.getNavigationIconForDocument("/thesaurus/nicknames.xml").click({force: true});
    browsePage.waitForSpinnerToDisappear();
    detailPageNonEntity.getDocumentProperties().should("exist");
    detailPageNonEntity.getDocumentNoPropertiesMessage().should("not.exist");
    explorePage.backToResults();
    browsePage.getSearchText().should("be.visible");
    browsePage.getSearchText().clear();
    browsePage.search("201");
    browsePage.getNavigationIconForDocument("/xml/customers/CustXMLDoc1.xml").click({force: true});
    browsePage.waitForSpinnerToDisappear();
    detailPage.getMetadataView().click();
    detailPage.getDocumentProperties().should("exist");
    detailPage.getDocumentNoPropertiesMessage().should("not.exist");
  });
});
