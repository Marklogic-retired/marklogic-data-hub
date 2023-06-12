import {BaseEntityTypes} from "../../support/types/base-entity-types";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import table from "../../support/components/common/tables";
import explorePage from "../../support/pages/explore";
import browsePage from "../../support/pages/browse";
import detailPage from "../../support/pages/detail";
import "cypress-wait-until";

describe("json scenario for table on browse documents page", () => {
  let facets: string[] = ["collection", "flow"];

  before(() => {
    cy.loginAsDeveloper().withRequest();
    browsePage.navigate();
  });

  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Select \"all entities\" and verify table default columns", () => {
    browsePage.getClearAllFacetsButton().then(($ele) => {
      if ($ele.is(":enabled")) {
        cy.log("**clear all facets**");
        browsePage.getClearAllFacetsButton().click();
        browsePage.waitForSpinnerToDisappear();
      }
    });
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
    browsePage.getTableView().should("be.visible").click({force: true});
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForHCTableToLoad();
    entitiesSidebar.getBaseEntityOption("All Entities").scrollIntoView().should("be.visible");
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    table.getColumnTitle(2).should("contain", "Identifier");
    table.getColumnTitle(3).should("contain", "Entity Type");
    table.getColumnTitle(4).should("contain", "Record Type");
    table.getColumnTitle(5).should("contain", "Created");

    facets.forEach(function (item) {
      browsePage.getFacet(item).should("exist");
      browsePage.getFacetItems(item).should("exist");
    });
  });

  it("Select \"all entities\" and verify table", () => {
    entitiesSidebar.getBaseEntityOption("All Entities").should("be.visible");
    browsePage.getTotalDocuments().should("be.greaterThan", 25);

    browsePage.hcTableRows.should("have.length", 20);
    table.getTableColumns().should("have.length", 5);
  });

  it("Select Person entity and verify table", () => {
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
    browsePage.getHubPropertiesExpanded();
    browsePage.getTotalDocuments().should("be.greaterThan", 5);

    browsePage.hcTableRows.should("have.length.lt", 52);
    table.getTableColumns().should("to.have.length.of.at.most", 10);
  });

  it("Search for a simple text/query and verify content", () => {
    entitiesSidebar.getMainPanelSearchInput("Bob");
    entitiesSidebar.applyFacets();
    browsePage.waitForSpinnerToDisappear();
    browsePage.hcTableRows.then(($row) => {
      let length = $row.length;
      browsePage.getTotalDocuments().should("be.equal", length);
    });
    browsePage.validateHCTableRows("Bob");
  });

  it("Verify instance view of the document without pk", () => {
    cy.wait(2000);
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.PERSON);
    browsePage.getFacetItemCheckbox("fname", "Bob").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getGreySelectedFacets("Bob").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.validateHCTableRows("Bob");
    browsePage.getFirstTableViewInstanceIcon().click();
    browsePage.waitForSpinnerToDisappear();
    detailPage.getInstanceView().should("exist");
    detailPage.getDocumentEntity().should("contain", "Person");
    detailPage.getDocumentTimestamp().should("exist");
    detailPage.getDocumentSource().should("contain", "PersonSourceName");
    detailPage.getDocumentRecordType().should("contain", "json");
    detailPage.getDocumentTable().should("exist");
    detailPage.getMetadataView().should("exist");
    detailPage.getMetadataView().click();
    detailPage.getDocumentUri().should("contain", "/json/persons/first-name-synonym2.json");
    detailPage.clickBackButton();
    browsePage.waitForSpinnerToDisappear();
    explorePage.getDatabaseButton("final").should("have.attr", "checked");
    browsePage.getClearFacetSearchSelection("Bob").should("exist");
    browsePage.getSearchBar().should("have.value", "Bob");
    browsePage.getTableView().should("have.css", "color", "rgb(57, 68, 148)");
    browsePage.getClearAllFacetsButton().click();
    browsePage.waitForSpinnerToDisappear();
  });

  it("Select Product entity and long text should be trimmed and tooltip appears on hover", () => {
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.removeLastSelectedBaseEntity();
    entitiesSidebar.selectBaseEntityOption("Product");
    cy.findByText("Crock-Pot 8 Quart Manual Slow Cooker with 16 Oz Little Dipper Foo...");
    cy.findByText("Crock-Pot 8 Quart Manual Slow Cooker with 16 Oz Little Dipper Foo...").trigger("mouseover");
    cy.findByText("Crock-Pot 8 Quart Manual Slow Cooker with 16 Oz Little Dipper Food Warmer, Stainless");
    cy.findByText("product5");
  });

  it("Verify instance view of the document with pk", () => {
    entitiesSidebar.getMainPanelSearchInput("10248");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
    entitiesSidebar.getBaseEntityOption("All Entities").scrollIntoView().should("be.visible");
    entitiesSidebar.applyFacets();
    browsePage.waitForSpinnerToDisappear();
    browsePage.totalNumberDocuments("1");
    browsePage.getTableViewInstanceIcon().click();
    detailPage.getInstanceView().should("exist");
    detailPage.getDocumentEntity().should("contain", "Order");
    detailPage.getDocumentID().should("contain", "10248");
    detailPage.getDocumentTimestamp().should("exist");
    detailPage.getDocumentSource().should("contain", "OrdersSourceName");
    detailPage.getDocumentRecordType().should("contain", "json");
  });

  it("Verify source view of the document", () => {
    explorePage.backToResults();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.switchToFinalDatabase();
    browsePage.getClearAllFacetsButton().click();
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.getMainPanelSearchInput("Adams Cole");
    entitiesSidebar.applyFacets();
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("email", "coleadams39@nutralab.com").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getGreySelectedFacets("adamscole@nutralab.com").should("exist");
    browsePage.getGreySelectedFacets("coleadams39@nutralab.com").should("exist");
    entitiesSidebar.backToMainSidebar();
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersJSON").click({force: true});
    browsePage.waitForSpinnerToDisappear();
    browsePage.getGreySelectedFacets("mapCustomersJSON").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("be.equal", 2);

    cy.reload();
    browsePage.waitForSpinnerToDisappear();

    cy.log("**Verify if the facet, search text and view persists.**");
    browsePage.getClearFacetSearchSelection("mapCustomersJSON").should("exist");
    browsePage.getAppliedFacets("adamscole@nutralab.com").should("exist");
    browsePage.getAppliedFacets("coleadams39@nutralab.com").should("exist");
    browsePage.getAppliedFacetName("adamscole@nutralab.com").should("be.equal", "email: adamscole@nutralab.com");
    browsePage.getAppliedFacetName("coleadams39@nutralab.com").should("be.equal", "email: coleadams39@nutralab.com");
    browsePage.getSearchBar().should("have.value", "Adams Cole");
    browsePage.getTableView().should("have.css", "color", "rgb(57, 68, 148)");

    cy.waitForAsyncRequest();
    browsePage.getTableViewSourceIcon().scrollIntoView().should("be.visible").click();
    browsePage.waitForSpinnerToDisappear();
    detailPage.getDocumentJSON().should("exist");
    detailPage.getDocumentEntity().should("contain", "Customer");
    detailPage.getDocumentTimestamp().should("exist");
    detailPage.getDocumentSource().should("contain", "CustomerSourceName");
    detailPage.getDocumentRecordType().should("contain", "json");

    cy.reload();
    browsePage.waitForSpinnerToDisappear();
    cy.log("**Verify if the detail view is intact after page refresh**");
    detailPage.getDocumentEntity().should("contain", "Customer");
    detailPage.getDocumentTimestamp().should("exist");
    detailPage.getDocumentSource().should("contain", "CustomerSourceName");
    detailPage.getDocumentRecordType().should("contain", "json");

    detailPage.clickBackButton();

    browsePage.waitForSpinnerToDisappear();

    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    explorePage.getDatabaseButton("final").should("have.attr", "checked");
    browsePage.getClearFacetSearchSelection("mapCustomersJSON").should("exist");
    browsePage.getSearchBar().should("have.value", "Adams Cole");
    browsePage.getTableView().should("have.css", "color", "rgb(57, 68, 148)");
  });

  it("Search for multiple facets, switch to snippet view, delete a facet, switch to table view, verify search query", () => {
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);
    browsePage.getFacetItemCheckbox("name", "Adams Cole").should("be.visible").click();
    browsePage.getFacetItemCheckbox("email", "coleadams39@nutralab.com").should("be.visible").click();
    browsePage.switchToSnippetView();
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.switchToTableView();
    browsePage.getClearAllFacetsButton().click({force: true});
    entitiesSidebar.backToMainSidebar();
  });

  it("Verify hub properties grey facets are not being removed when entity properties are selected", () => {
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getGreySelectedFacets("Adams Cole").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.backToMainSidebar();
    cy.wait(1000);
    browsePage.getFacetItemCheckbox("flow", "CurateCustomerJSON").click({force: true});
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("flow", "CurateCustomerJSON").should("exist");
    browsePage.getFacetItemCheckbox("flow", "CurateCustomerJSON").should("be.checked");

    browsePage.getFacetItemCheckbox("source-name", "CustomerSourceName").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("source-name", "CustomerSourceName").should("exist");
    browsePage.getFacetItemCheckbox("source-name", "CustomerSourceName").should("be.checked");

    browsePage.getFacetItemCheckbox("source-type", "CustomerSourceType").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("source-type", "CustomerSourceType").should("exist");
    browsePage.getFacetItemCheckbox("source-type", "CustomerSourceType").should("be.checked");

    browsePage.getGreySelectedFacets("CurateCustomerJSON").should("exist");
    browsePage.getGreySelectedFacets("CustomerSourceName").should("exist");
    browsePage.getGreySelectedFacets("CustomerSourceType").should("exist");

    browsePage.clickClearFacetSearchSelection("Adams Cole");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getGreySelectedFacets("Adams Cole").should("not.exist");
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getGreySelectedFacets("CurateCustomerJSON").should("exist");
    browsePage.getGreySelectedFacets("CustomerSourceName").should("exist");
    browsePage.getGreySelectedFacets("CustomerSourceType").should("exist");
    browsePage.getGreySelectedFacets("Adams Cole").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSelectedFacet("CurateCustomerJSON").should("exist");
    browsePage.getSelectedFacet("Adams Cole").should("exist");
    entitiesSidebar.backToMainSidebar();
    cy.wait(5000);
    browsePage.waitForSpinnerToDisappear();

    cy.log("*apply multiple facets, select and discard new facet, verify original facets checked*");
    browsePage.getClearAllFacetsButton().click();
    cy.wait(3000);
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);
    browsePage.getShowMoreLink("name").click();
    browsePage.getFacetItemCheckbox("name", "Jacqueline Knowles").click();
    browsePage.getFacetItemCheckbox("name", "Lola Dunn").click();
    browsePage.getGreySelectedFacets("Jacqueline Knowles").should("exist");
    browsePage.getGreySelectedFacets("Lola Dunn").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("name", "Jacqueline Knowles").should("be.checked");
    browsePage.getFacetItemCheckbox("name", "Lola Dunn").should("be.checked");
    browsePage.getFacetItemCheckbox("email", "jacquelineknowles@nutralab.com").click();
    browsePage.getGreySelectedFacets("jacquelineknowles@nutralab.com").should("exist");
    browsePage.getClearGreyFacets().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("name", "Jacqueline Knowles").should("be.checked");
    browsePage.getFacetItemCheckbox("name", "Lola Dunn").should("be.checked");
    browsePage.getFacetItemCheckbox("email", "jacquelineknowles@nutralab.com").should("not.be.checked");
  });

  it("Apply multiple facets, deselect them, apply changes, apply multiple, clear them, verify no facets checked", () => {
    entitiesSidebar.backToMainSidebar();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.getClearAllFacetsButton().click();
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);
    browsePage.getShowMoreLink("name").click();
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getGreySelectedFacets("Adams Cole").should("exist");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").should("be.checked");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.selectDateRange();
    browsePage.getSelectedFacet("birthDate:").should("exist");
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    browsePage.getGreySelectedFacets("adamscole@nutralab.com").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.clickClearFacetSearchSelection("birthDate");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").should("be.checked");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("name", "Adams Cole").should("not.be.checked");
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").should("not.be.checked");
    browsePage.getGreySelectedFacets("Adams Cole").should("not.exist");
    browsePage.getGreySelectedFacets("adamscole@nutralab.com").should("not.exist");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.clickClearFacetSearchSelection("Adams Cole");
    browsePage.waitForSpinnerToDisappear();
    browsePage.clickClearFacetSearchSelection("adamscole@nutralab.com");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("name", "Adams Cole").should("not.be.checked");
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").should("not.be.checked");
    browsePage.getGreySelectedFacets("Adams Cole").should("not.exist");
    browsePage.getGreySelectedFacets("adamscole@nutralab.com").should("not.exist");
  });

  it("Verify facets can be selected, applied and cleared using clear text", () => {
    entitiesSidebar.backToMainSidebar();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
    entitiesSidebar.getBaseEntityOption("Person").should("be.visible");
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.PERSON);
    browsePage.getShowMoreLink("fname").click();
    browsePage.getFacetItemCheckbox("fname", "Gary").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getGreySelectedFacets("Gary").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("fname", "Gary").should("be.checked");
    browsePage.getFacetSearchSelectionCount("fname").should("contain", "1");
    browsePage.getClearFacetSelection("fname").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("fname", "Gary").should("not.be.checked");
    browsePage.getGreySelectedFacets("Gary").should("not.exist");
  });

  it("Apply facets, unchecking them should not recheck original facets", () => {
    entitiesSidebar.backToMainSidebar();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);
    browsePage.getShowMoreLink("name").click();
    browsePage.getFacetItemCheckbox("name", "Mcgee Burch").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("name", "Powers Bauer").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getGreySelectedFacets("Mcgee Burch").should("exist");
    browsePage.getGreySelectedFacets("Powers Bauer").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("name", "Mcgee Burch").should("be.checked");
    browsePage.getFacetItemCheckbox("name", "Powers Bauer").should("be.checked");
    browsePage.getFacetItemCheckbox("email", "mcgeeburch@nutralab.com").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("name", "Mcgee Burch").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("name", "Powers Bauer").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getShowMoreLink("email").click();
    browsePage.getFacetItemCheckbox("email", "mcgeeburch@nutralab.com").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("name", "Mcgee Burch").should("not.be.checked");
    browsePage.getFacetItemCheckbox("name", "Powers Bauer").should("not.be.checked");
    browsePage.getFacetItemCheckbox("email", "mcgeeburch@nutralab.com").should("not.be.checked");
  });
});
