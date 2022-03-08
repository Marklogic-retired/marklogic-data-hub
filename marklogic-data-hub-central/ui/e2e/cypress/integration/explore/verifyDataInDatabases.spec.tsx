/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import {Application} from "../../support/application.config";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import {BaseEntityTypes} from "../../support/types/base-entity-types";
import {toolbar} from "../../support/components/common";
import "cypress-wait-until";
// import detailPageNonEntity from "../../support/pages/detail-nonEntity";
import LoginPage from "../../support/pages/login";

describe("Verify All Data for final/staging databases and non-entity detail page", () => {

  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
    cy.setupHubCentralConfig();
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

  it("Switch on zero state page and select query parameters for final database", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.wait(3000);
    entitiesSidebar.toggleAllDataView();
    browsePage.search("Adams");
    //verify the query data for final database on explore page
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    cy.contains("Showing 1-2 of 2 results", {timeout: 10000});
    browsePage.getAllDataSnippetByUri("/json/customers/Cust2.json").should("contain", "ColeAdams");
  });
  it("Select query parameters for final database", () => {
    browsePage.search("Barbi");
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getTotalDocuments().should("be.equal", 0);
  });
  it("Switch to staging database and verify data for query parameters", () => {
    browsePage.getStagingDatabaseButton();
    browsePage.search("Adams");
    cy.waitForAsyncRequest();
    cy.contains("Showing 1-2 of 2 results", {timeout: 10000});
    browsePage.getAllDataSnippetByUri("/json/customers/Cust2.json").should("contain", "Adams");
    browsePage.getNavigationIconForDocument("/json/customers/Cust2.json").click();
    browsePage.waitForSpinnerToDisappear();
    cy.contains("CustomerSourceName", {timeout: 50000});
    browsePage.backToResults();
  });
  it("Select query parameters for stage database", () => {
    browsePage.search("Barbi");
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getAllDataSnippetByUri("/json/clients/client1.json").should("contain", "Barbi");
  });

  it("Verify if switching between All Data and specific entities works properly", () => {
    browsePage.getFinalDatabaseButton();
    cy.waitForAsyncRequest();
    entitiesSidebar.toggleEntitiesView();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getTableView().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("be.equal", 11);
    entitiesSidebar.toggleAllDataView();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();

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
    browsePage.getSearchText().clear();

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
  });

  it("Verify query parameters for final database on browse page", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    entitiesSidebar.toggleEntitiesView();
    entitiesSidebar.getClearFacetsButton().click();
    //Verify if the pagination gets reset upon cliking on database buttons
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
    browsePage.getTableView().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().then(val => {
      browsePage.scrollToBottom();
      browsePage.getPaginationPageSizeOptions().select("10 / page", {force: true});
      browsePage.waitForSpinnerToDisappear();
      browsePage.clickPaginationItem(3);
      browsePage.waitForSpinnerToDisappear();
      browsePage.getStagingDatabaseButton();
      browsePage.waitForSpinnerToDisappear();
      browsePage.getFinalDatabaseButton();
      browsePage.waitForSpinnerToDisappear();
      cy.contains("Showing 1-20 of " + val + " results", {timeout: 5000});
      browsePage.getTotalDocuments().should("be.equal", val);
    });
  });
  it("Switch to staging database and verify the number of documents for the search string is 0", () => {
    browsePage.getStagingDatabaseButton();
    browsePage.waitForSpinnerToDisappear();
    browsePage.search("Adams");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("be.equal", 0);
  });

  it("Switch to final database and verify the number of documents for the search string is 1", () => {

    toolbar.getExploreToolbarIcon().click();
    browsePage.getTableView().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFinalDatabaseButton();
    browsePage.waitForSpinnerToDisappear();
    browsePage.search("Powers");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("be.equal", 1);
  });
  it("Switch to staging database and verify documents deployed to staging", () => {
    browsePage.getStagingDatabaseButton();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Client");
    entitiesSidebar.getBaseEntityOption("Client").should("be.visible");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("be.equal", 5);
  });
  it("Apply facet search for the documents deployed to staging", () => {
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CLIENT);
    browsePage.getFacetItemCheckbox("firstname", "Barbi").click();
    browsePage.getGreySelectedFacets("Barbi").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getFacetItemCheckbox("firstname", "Barbi").should("be.checked");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getClearAllFacetsButton().click();
  });
  it("Apply numeric search for the documents deployed to staging", () => {
    browsePage.waitForSpinnerToDisappear();
    browsePage.changeNumericSlider("7000");
    browsePage.getGreyRangeFacet(7000).should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getRangeFacet(7000).should("exist");
    browsePage.getClearAllFacetsButton().should("exist");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("be.equal", 3);
    browsePage.getClearAllFacetsButton().click();
  });
  it("Apply string search for the documents deployed to staging", () => {
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.backToMainSidebar();
    browsePage.search("Barbi");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("be.equal", 1);
  });
});
