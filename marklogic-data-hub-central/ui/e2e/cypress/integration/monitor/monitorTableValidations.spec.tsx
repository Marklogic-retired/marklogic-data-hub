import monitorPage from "../../support/pages/monitor";
import {Application} from "../../support/application.config";
import "cypress-wait-until";
import {toolbar} from "../../support/components/common";
import LoginPage from "../../support/pages/login";
import browsePage from "../../support/pages/browse";

describe("Monitor Tile", () => {

  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-job-monitor").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });

  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-job-monitor").withRequest();
    cy.waitUntil(() => toolbar.getMonitorToolbarIcon()).click();
    monitorPage.waitForMonitorTableToLoad();
  });

  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Navigate to Monitor Tile and verify pagination works", () => {
    monitorPage.getTableRows().its("length").should("be.gte", 10);
    monitorPage.getPaginationPageSizeOptions().then(attr => {
      attr[0].click();
      monitorPage.getPageSizeOption("10 / page").click();
    });
    monitorPage.getTableRows().should("have.length", 10);
  });

  it("apply facet search and verify docs", () => {
    monitorPage.validateAppliedFacetTableRows("step-type", 1);
  });

  it("apply facet search and clear individual grey facet", () => {
    monitorPage.validateClearGreyFacet("step-type", 0);
  });

  it("apply facet search and clear all grey facets", () => {
    monitorPage.validateGreyFacet("step-type", 0);
    monitorPage.validateGreyFacet("flow", 0);
    browsePage.getClearGreyFacets().click();
  });

  it("Verify functionality of clear and apply facet buttons", () => {
    //verify no facets selected case.
    browsePage.getClearAllFacetsButton().should("be.disabled");
    browsePage.getApplyFacetsButton().should("be.disabled");
    //verify selecting facets case.
    monitorPage.validateGreyFacet("step-type", 0);
    browsePage.getClearAllFacetsButton().should("not.be.disabled");
    browsePage.getApplyFacetsButton().should("not.be.disabled");
    //verify facets applied case.
    browsePage.getApplyFacetsButton().click();
    browsePage.getClearAllFacetsButton().should("not.be.disabled");
    browsePage.getApplyFacetsButton().should("be.disabled");
    // verify selecting additional facets case.
    monitorPage.validateGreyFacet("step", 0);
    browsePage.getClearAllFacetsButton().should("not.be.disabled");
    browsePage.getApplyFacetsButton().should("not.be.disabled");
    browsePage.getClearAllFacetsButton().click();
    browsePage.getClearAllFacetsButton().should("be.disabled");
    browsePage.getApplyFacetsButton().should("be.disabled");
  });


  it("apply multiple facets, deselect them, apply changes, apply multiple, clear them, verify no facets checked", () => {
    browsePage.getShowMoreLink("step").click();
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").click();
    cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
    browsePage.getGreySelectedFacets("loadPersonJSON").should("exist");
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").should("be.checked");
    browsePage.getFacetApplyButton().click();
    browsePage.getFacetItemCheckbox("flow", "personJSON").click();
    cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
    browsePage.getGreySelectedFacets("personJSON").should("exist");
    browsePage.getFacetItemCheckbox("step-type", "ingestion").click();
    browsePage.getGreySelectedFacets("ingestion").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.clickClearFacetSearchSelection("personJSON");
    cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
    browsePage.getFacetItemCheckbox("step-type", "ingestion").should("be.checked");
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").click();
    browsePage.getFacetItemCheckbox("step-type", "ingestion").click();
    cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").should("not.be.checked");
    browsePage.getFacetItemCheckbox("step-type", "ingestion").should("not.be.checked");
    browsePage.getGreySelectedFacets("loadPersonJSON").should("not.exist");
    browsePage.getGreySelectedFacets("ingestion").should("not.exist");
    cy.waitForAsyncRequest();
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").click();
    browsePage.getFacetItemCheckbox("step-type", "ingestion").click();
    cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
    browsePage.getFacetApplyButton().click();
    browsePage.clickClearFacetSearchSelection("loadPersonJSON");
    browsePage.clickClearFacetSearchSelection("ingestion");
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").should("not.be.checked");
    browsePage.getFacetItemCheckbox("step-type", "ingestion").should("not.be.checked");
    browsePage.getGreySelectedFacets("loadPersonJSON").should("not.exist");
    browsePage.getGreySelectedFacets("ingestion").should("not.exist");
  });


  it("Verify facets can be selected, applied and cleared using clear text", () => {
    monitorPage.validateAppliedFacet("step", 0);
    browsePage.getFacetSearchSelectionCount("step").should("contain", "1");
    browsePage.getClearFacetSelection("step").click();
    browsePage.waitForSpinnerToDisappear();
  });

  it("Apply facets, unchecking them should not recheck original facets", () => {
    browsePage.getShowMoreLink("step").click();
    browsePage.getFacetItemCheckbox("step", "mapPersonJSON").click();
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").click();
    browsePage.getGreySelectedFacets("mapPersonJSON").should("exist");
    browsePage.getGreySelectedFacets("loadPersonJSON").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getFacetItemCheckbox("step", "mapPersonJSON").should("be.checked");
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").should("be.checked");
    browsePage.getFacetItemCheckbox("status", "finished").click();
    browsePage.getFacetItemCheckbox("step", "mapPersonJSON").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").click();
    browsePage.getFacetItemCheckbox("status", "finished").click();
    browsePage.getFacetItemCheckbox("step", "mapPersonJSON").should("not.be.checked");
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").click();
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").should("not.be.checked");
    browsePage.getFacetItemCheckbox("status", "finished").should("not.be.checked");
  });

});

