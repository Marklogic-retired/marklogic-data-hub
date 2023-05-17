import entitiesSidebar from "../../support/pages/entitiesSidebar";
import {toolbar} from "../../support/components/common";
import explorePage from "../../support/pages/explore";
import browsePage from "../../support/pages/browse";
import detailPage from "../../support/pages/detail";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";

let facets: string[] = ["collection", "flow"];

describe.skip("json scenario for snippet on browse documents page", () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
    LoginPage.navigateToMainPage();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Select \"all entities\" verify docs, hub/entity properties", () => {
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

  // TODO: DHFPROD-10182
  it.skip("Verify shadow effect upon scrolling within the snippet view", () => {
    browsePage.clickFacetView();
    browsePage.getSnippetViewResult().should("have.css", "box-shadow", "none");
    browsePage.getSnippetViewResult().scrollTo("center", {ensureScrollable: false});

    browsePage.getSnippetViewResult().should("have.css", "box-shadow", "rgb(153, 153, 153) 0px 4px 4px -4px, rgb(153, 153, 153) 0px -4px 4px -4px");
    browsePage.getSnippetViewResult().scrollTo("bottom");
    browsePage.getSnippetViewResult().should("have.css", "box-shadow", "none");
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
    explorePage.getDatabaseButton("final").should("have.attr", "checked");
    browsePage.getSearchText().should("have.value", "10256");
    browsePage.getFacetView().should("have.css", "color", "rgb(57, 68, 148)");
  });

  it("Select Person entity and verify entity, docs, hub/entity properties", () => {
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

  it("Select Customer entity and verify entity, docs, hub/entity properties", () => {
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

  it("Apply facet search and verify docs, hub/entity properties", () => {
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

  it("Apply facet search and clear individual grey facet", () => {
    entitiesSidebar.selectEntity("All Entities");
    entitiesSidebar.getSelectedEntityText().should("contain", "All Entities");
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    browsePage.getShowMoreLink("collection").click();
    browsePage.getFacetItemCheckbox("collection", "Person").click();
    browsePage.getGreySelectedFacets("Person").click();
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
  });

  it("Apply facet search and clear all grey facets", () => {
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

  it("Search for a simple text/query and verify content", () => {
    browsePage.search("Powers");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getDocumentEntityName(0).should("exist");

    browsePage.getDocumentSnippet(0).should("exist");
    browsePage.getDocumentCreatedOn(0).should("exist");
    browsePage.getDocumentSources(0).should("exist");
    browsePage.getDocumentRecordType(0).should("exist");
  });

  it("Verify instance view of the document with pk", () => {
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
    explorePage.backToResults();
    cy.waitUntil(() => browsePage.getSearchText());
  });

  it("Verify detail view of the document with encoded uri", () => {
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
    explorePage.backToResults();
    cy.waitUntil(() => browsePage.getSearchText());
    browsePage.getSearchText().clear();

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
    explorePage.backToResults();
    cy.waitUntil(() => browsePage.getSearchText());
    browsePage.clickFacetView();
  });

  it("Verify source view of the document", () => {
    browsePage.getSearchText().clear();
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.selectEntity("All Entities");
    browsePage.search("Powers");
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getSourceViewIcon().click();
    detailPage.getSourceView().click();
    detailPage.getDocumentJSON().should("exist");
    explorePage.backToResults();
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
