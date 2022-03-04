/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import "cypress-wait-until";
import LoginPage from "../../support/pages/login";
import runPage from "../../support/pages/run";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import {BaseEntityTypes} from "../../support/types/base-entity-types";


describe("Verify numeric/date facet can be applied", () => {
  //login with valid account and go to /browse page
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("pii-reader", "hub-central-developer").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("pii-reader", "hub-central-developer").withRequest();
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
  it("Apply numeric facet values multiple times, clears the previous values and applies the new one", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    browsePage.getTableView().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForHCTableToLoad();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);
    browsePage.changeNumericSlider("2273");
    browsePage.getGreyRangeFacet(2273).should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getRangeFacet(2273).should("exist");
    browsePage.getClearAllFacetsButton().should("exist");
    browsePage.changeNumericSlider("3024");
    browsePage.getGreyRangeFacet(3024).should("exist");
    browsePage.getFacetApplyButton().should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getRangeFacet(3024).should("exist");
  });
  it("Verify clearing date range facet clears corresponding selected facet", () => {
    browsePage.getClearAllFacetsButton().should("exist");
    browsePage.getClearAllFacetsButton().click();
    browsePage.selectDateRange();
    browsePage.getFacetApplyButton().click();
    browsePage.getSelectedFacet("birthDate:").should("exist");
    browsePage.getDateFacetPicker().trigger("mouseover");
    cy.waitUntil(() => browsePage.getDateFacetClearIcon()).click({force: true});
    browsePage.getFacetApplyButton().should("not.exist");
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForHCTableToLoad();
  });
  it("Verify functionality of clear and apply facet buttons", () => {
    //verify no facets selected case.
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    browsePage.getClearAllFacetsButton().should("be.disabled");
    browsePage.getApplyFacetsButton().should("be.disabled");
    //verify selecting facets case.
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getGreySelectedFacets("Adams Cole").should("exist");
    browsePage.getClearAllFacetsButton().should("not.be.disabled");
    browsePage.getApplyFacetsButton().should("not.be.disabled");
    //verify facets applied case.
    browsePage.getApplyFacetsButton().click();
    browsePage.getFacetItemCheckbox("name", "Adams Cole").should("be.checked");
    browsePage.getAppliedFacets("Adams Cole").should("exist");
    browsePage.getClearAllFacetsButton().should("not.be.disabled");
    browsePage.getApplyFacetsButton().should("be.disabled");
    // verify selecting additional facets case.
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    browsePage.getGreySelectedFacets("adamscole@nutralab.com").should("exist");
    browsePage.getClearAllFacetsButton().should("not.be.disabled");
    browsePage.getApplyFacetsButton().should("not.be.disabled");
    browsePage.getClearAllFacetsButton().click();
    browsePage.getAppliedFacets("Adams Cole").should("not.exist");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").should("not.be.checked");
    browsePage.getClearAllFacetsButton().should("be.disabled");
    browsePage.getApplyFacetsButton().should("be.disabled");
  });
  it("Verify gray facets don't persist when switching between browse, zero state explorer and run views", {defaultCommandTimeout: 120000}, () => {
    cy.intercept("/api/jobs/**").as("getJobs");
    cy.log("**Return to main sidebar");
    entitiesSidebar.backToMainSidebar();

    cy.log("**Remove Customer entity and select Person entity to facet");
    entitiesSidebar.removeSelectedBaseEntity();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.PERSON);
    browsePage.clickMoreLink("fname");
    browsePage.getFacetItemCheckbox("fname", "Alice").click();
    browsePage.getGreySelectedFacets("Alice").should("exist");
    toolbar.getExploreToolbarIcon().click();
    browsePage.clickFacetView();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForHCTableToLoad();
    browsePage.getGreySelectedFacets("Alice").should("not.exist");
    //verify gray facets don't persist when switching between browse and run views.
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.PERSON);
    browsePage.clickMoreLink("fname");
    browsePage.getFacetItemCheckbox("fname", "Alice").click();
    browsePage.getGreySelectedFacets("Alice").should("exist");
    toolbar.getRunToolbarIcon().click();
    cy.waitUntil(() => runPage.getFlowName("personJSON").should("be.visible"));
    runPage.expandFlow("personJSON");
    runPage.runStep("mapPersonJSON", "personJSON");
    runPage.verifyStepRunResult("mapPersonJSON", "success");
    runPage.closeFlowStatusModal("personJSON");
    /* Commented until DHFPROD-7477 is done
    runPage.explorerLink().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForHCTableToLoad();
    browsePage.getGreySelectedFacets("Alice").should("not.exist"); */
  });
  it("Verify clearing date time range facet clears corresponding selected facet", () => {
    toolbar.getExploreToolbarIcon().click();
    cy.wait(1000);
    entitiesSidebar.removeSelectedBaseEntity();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Client");
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CLIENT);
    browsePage.selectDateRange({time: "updated"});
    browsePage.getFacetApplyButton().click();
    browsePage.getSelectedFacet("updated:").should("exist");
    browsePage.getDateFacetPicker({time: "updated"}).trigger("mouseover");
    cy.waitUntil(() => browsePage.getDateFacetClearIcon({time: "updated"})).click({force: true});
    browsePage.getFacetApplyButton().should("not.exist");
  });
});
