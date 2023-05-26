import detailPageNonEntity from "../../support/pages/detail-nonEntity";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import table from "../../support/components/common/tables";
import explorePage from "../../support/pages/explore";
import browsePage from "../../support/pages/browse";
import detailPage from "../../support/pages/detail";
import loadPage from "../../support/pages/load";
import "cypress-wait-until";

let facets: string[] = ["collection", "flow"];

describe("xml scenario for snippet view on browse documents page", () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
    explorePage.navigate();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  after(() => {
    cy.resetTestUser();
  });

  it("Select Customer XML entity instances and verify entity, docs, hub/entity properties", () => {
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

  it("Apply facet search and verify docs, hub/entity properties", () => {
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

  it("Apply facet search and clear individual grey facet", () => {
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

  it("Apply facet search and clear all grey facets", () => {
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

  it("Select grey facets, change page, back and verify retained state", () => {
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
    entitiesSidebar.getBaseEntityOption("All Entities").should("be.visible");
    browsePage.getShowMoreLink("collection").scrollIntoView().click({force: true});
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    browsePage.showMoreCollection();

    cy.log("**Select grey facets**");
    browsePage.getFacetItemCheckbox("collection", "Customer").click();
    browsePage.getFacetItemCheckbox("collection", "Order").click();
    browsePage.getFacetItemCheckbox("collection", "Product").click();
    browsePage.getFacetItemCheckbox("source-type", "OrdersSourceType").click();

    cy.log("**Verify grey facets tags**");
    browsePage.getGreySelectedFacets("Customer").should("exist");
    browsePage.getGreySelectedFacets("Order").should("exist");
    browsePage.getGreySelectedFacets("Product").should("exist");
    browsePage.getGreySelectedFacets("OrdersSourceType").should("exist");

    cy.log("**Select date grey facet **");
    cy.get("#date-select").click({force: true});
    cy.contains("This Week").click();

    cy.log("**Go to another page and back**");
    loadPage.navigate();
    explorePage.navigate();
    browsePage.clickTableView();

    cy.log("**Verify grey facets tags exists**");
    browsePage.getGreySelectedFacets("Customer").should("exist");
    browsePage.getGreySelectedFacets("Order").should("exist");
    browsePage.getGreySelectedFacets("Product").should("exist");
    browsePage.getGreySelectedFacets("OrdersSourceType").should("exist");

    cy.log("**Verify preselected facets are checked and uncheck it**");
    browsePage.getShowMoreLink("collection").click({force: true});
    browsePage.getFacetItemCheckbox("collection", "Customer").should("be.checked").click();
    browsePage.getFacetItemCheckbox("collection", "Order").should("be.checked").click();
    browsePage.getFacetItemCheckbox("collection", "Product").should("be.checked").click();
    browsePage.getFacetItemCheckbox("source-type", "OrdersSourceType").scrollIntoView().should("be.checked").click();

    cy.log("**Verify grey tags not exists**");
    browsePage.getGreySelectedFacets("Customer").should("not.exist");
    browsePage.getGreySelectedFacets("Order").should("not.exist");
    browsePage.getGreySelectedFacets("Product").should("not.exist");
    browsePage.getGreySelectedFacets("OrdersSourceType").should("not.exist");
    browsePage.getClearGreyFacets();
    browsePage.getGreySelectedFacets("This Week").should("not.exist");

    browsePage.getClearGreyFacets().click();
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
  });

  it("Search for a simple text/query and verify content", () => {
    browsePage.getSnippetView().click({force: true});
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

  // TODO: DHFPROD-10180
  it.skip("Verify instance view of the document", () => {
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

  // TODO: DHFPROD-10180
  it.skip("Verify source view of the document", () => {
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

  // TODO: DHFPROD-10180
  it.skip("Select Customer xml entity instances and verify table", () => {
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

    browsePage.getHCTableRows().should("have.length", 5);

    table.getTableColumns().should("have.length", 6);
    browsePage.clickClearFacetSearchSelection("mapCustomersXML");
  });

  // TODO: DHFPROD-10180
  it.skip("Verify instance view of the document", () => {
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

  // TODO: DHFPROD-10180
  it.skip("Verify source view of the document", () => {
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

  // TODO: DHFPROD-10180
  it.skip("Verify metadata view of the document", () => {
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

  it("Verify record view of the XML document in non-entity detail page", () => {
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

  // TODO: DHFPROD-10180
  it.skip("Verify metadata view of the document properties", () => {
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
