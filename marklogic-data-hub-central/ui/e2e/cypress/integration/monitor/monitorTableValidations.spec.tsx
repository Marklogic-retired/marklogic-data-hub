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
    cy.wait(2000);
    cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
    cy.findByTestId("step-loadPatient-checkbox").trigger("mousemove", {force: true});
    cy.wait(2000);
    browsePage.getFacetItemCheckbox("step", "loadPatient").click();
    browsePage.getGreySelectedFacets("loadPatient").should("exist");
    browsePage.getFacetItemCheckbox("step", "loadPatient").should("be.checked");
    browsePage.getFacetApplyButton().click();
    cy.wait(1000);
    cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
    browsePage.getFacetItemCheckbox("flow", "patientFlow").click();
    browsePage.getGreySelectedFacets("patientFlow").should("exist");
    browsePage.getFacetItemCheckbox("step-type", "ingestion").click();
    browsePage.getGreySelectedFacets("ingestion").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.clickClearFacetSearchSelection("patientFlow");
    cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
    browsePage.getFacetItemCheckbox("step-type", "ingestion").should("be.checked");
    browsePage.getFacetItemCheckbox("step", "loadPatient").click();
    browsePage.getFacetItemCheckbox("step-type", "ingestion").click();
    cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
    browsePage.getFacetItemCheckbox("step", "loadPatient").should("not.be.checked");
    browsePage.getFacetItemCheckbox("step-type", "ingestion").should("not.be.checked");
    browsePage.getGreySelectedFacets("loadPatient").should("not.exist");
    browsePage.getGreySelectedFacets("ingestion").should("not.exist");
    cy.waitForAsyncRequest();
    browsePage.getFacetItemCheckbox("step", "loadPatient").click();
    browsePage.getFacetItemCheckbox("step-type", "ingestion").click();
    cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
    browsePage.getFacetApplyButton().click();
    browsePage.clickClearFacetSearchSelection("loadPatient");
    browsePage.clickClearFacetSearchSelection("ingestion");
    browsePage.getFacetItemCheckbox("step", "loadPatient").should("not.be.checked");
    browsePage.getFacetItemCheckbox("step-type", "ingestion").should("not.be.checked");
    browsePage.getGreySelectedFacets("loadPatient").should("not.exist");
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
    browsePage.getFacetItemCheckbox("step", "loadPatient").click();
    browsePage.getGreySelectedFacets("mapPersonJSON").should("exist");
    browsePage.getGreySelectedFacets("loadPatient").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getFacetItemCheckbox("step", "mapPersonJSON").should("be.checked");
    cy.get("#monitorContent").scrollTo("top", {ensureScrollable: false});
    browsePage.getFacetItemCheckbox("step", "loadPatient").should("be.checked");
    browsePage.getFacetItemCheckbox("status", "finished").click();
    browsePage.getFacetItemCheckbox("step", "mapPersonJSON").click();
    browsePage.waitForSpinnerToDisappear();
    cy.findByTestId("step-loadPatient-checkbox").trigger("mousemove", {force: true});
    browsePage.getFacetItemCheckbox("step", "loadPatient").click({force: true});
    browsePage.getFacetItemCheckbox("status", "finished").click();
    browsePage.getFacetItemCheckbox("step", "mapPersonJSON").should("not.be.checked");
    cy.get("#monitorContent").scrollTo("top", {ensureScrollable: false});
    browsePage.getFacetItemCheckbox("step", "loadPatient").should("not.be.checked");
    browsePage.getFacetItemCheckbox("status", "finished").should("not.be.checked");
  });

  it("Verify select, apply, remove grey and applied startTime facet", () => {
    // Select multiple facets and remove startTime grey facet
    monitorPage.validateGreyFacet("step-type", 0);
    monitorPage.validateGreyFacet("step-type", 1);
    monitorPage.selectStartTimeFromDropDown("Today");
    monitorPage.getSelectedTime().should("contain", "Today");
    browsePage.getGreySelectedFacets("Today").should("exist");
    monitorPage.validateClearStartTimeGreyFacet("Today");
    monitorPage.getSelectedTime().should("contain", "select time");

    // Select multiple facets and apply all facets
    monitorPage.selectStartTimeFromDropDown("Today");
    monitorPage.getSelectedTime().should("contain", "Today");
    browsePage.getApplyFacetsButton().click();
    browsePage.getAppliedFacets("Today").should("exist");
    monitorPage.getSelectedTime().should("contain", "Today");

    // Remove applied startTime facet
    browsePage.clickClearFacetSearchSelection("Today");
    browsePage.getSelectedFacet("Today").should("not.exist");
    browsePage.getClearAllFacetsButton().click();
  });

});

