/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import {Application} from "../../support/application.config";
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
  });
  beforeEach(() => {
    cy.loginAsDeveloper().withRequest();
  });
  afterEach(() => {
    cy.resetTestUser();
  });
  it("Switch on zero state page and select query parameters for final database", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
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
  });
  it("Select query parameters for final database", () => {
    browsePage.clearSearchText();
    browsePage.waitForSpinnerToDisappear();
    browsePage.search("Barbi");
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getTotalDocuments().should("be.equal", 0);
  });
  it("Switch to staging database and verify data for query parameters", () => {
    browsePage.getStagingDatabaseButton().click();
    cy.waitForAsyncRequest();
    browsePage.search("Adams");
    cy.get(".ant-input-search-button").click();
    cy.waitForAsyncRequest();
    cy.contains("Showing 1-2 of 2 results", {timeout: 10000});
    browsePage.getAllDataSnippetByUri("/json/customers/Cust2.json").should("contain", "Adams");
  });
  it("Select query parameters for stage database", () => {
    browsePage.search("Barbi");
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getTotalDocuments().should("be.equal", 1);
    browsePage.getAllDataSnippetByUri("/json/clients/client1.json").should("contain", "Barbi");
  });
  it("Verify if switching between All Data and specific entities works properly", () => {
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
  });
  it("Verify Explorer Search option entity dropdown doesn't default to 'All Data' for subsequent navigations", () => {
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
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
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
  it("Switch on zero state page and select query parameters for final database", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getFinalDatabaseButton()).click();
    browsePage.getFinalDatabaseButton().click();
    browsePage.getTableViewButton().click();
    browsePage.selectEntity("Customer");
    browsePage.getSearchText().type("Adams");
    browsePage.getExploreButton().click();
    browsePage.waitForSpinnerToDisappear();
  });
  it("Verify query parameters for final database on browse page", () => {
    browsePage.waitForTableToLoad();
    browsePage.getFinalDatabaseButton().parent().find("input").invoke("attr", "checked").should("exist");
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.getSearchText().should("have.value", "Adams");
    browsePage.getTotalDocuments().should("be.equal", 2);
    //Verify if the pagination gets reset upon cliking on database buttons
    browsePage.clearSearchText();
    browsePage.selectEntity("All Entities");
    browsePage.getTotalDocuments().then(val => {
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
      cy.contains("Showing 1-20 of "+val+" results", {timeout: 5000});
      browsePage.getTotalDocuments().should("be.equal", val);
    });
  });
  it("Switch to staging database and verify the number of documents for the search string is 0", () => {
    browsePage.getStagingDatabaseButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.search("Adams");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("be.equal", 0);
  });
  it("switch on zero state page and select query parameters for staging database", () => {
    toolbar.getExploreToolbarIcon().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitUntil(() => browsePage.getStagingDatabaseButton()).click();
    browsePage.selectEntity("Customer");
    browsePage.getSearchText().type("Powers");
    browsePage.getSnippetViewButton().click();
    browsePage.getExploreButton().click();
    browsePage.waitForSpinnerToDisappear();
  });
  it("verify query parameters for staging database on browse page", () => {
    cy.waitUntil(() => browsePage.getSnippetViewResult());
    browsePage.getStagingDatabaseButton().parent().find("input").invoke("attr", "checked").should("exist");
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.getSearchText().should("have.value", "Powers");
    browsePage.getDocuments().should("not.exist");
    //verify the number of documents is 0
    browsePage.getTotalDocuments().should("be.equal", 0);
  });
  it("Switch to final database and verify the number of documents for the search string is 1", () => {
    browsePage.getFinalDatabaseButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.search("Powers");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("be.equal", 1);
  });
  it("Switch to staging database and verify documents deployed to staging", () => {
    browsePage.getStagingDatabaseButton().click();
    browsePage.selectEntity("Client");
    browsePage.getSelectedEntity().should("contain", "Client");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("be.equal", 5);
  });
  it("Apply facet search for the documents deployed to staging", () => {
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
    browsePage.search("Barbi");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("be.equal", 1);
  });
});