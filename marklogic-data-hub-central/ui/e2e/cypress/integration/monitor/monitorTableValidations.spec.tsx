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

  //TODO: Re-test facets without using ml-tooltip-container

  // it("apply multiple facets, deselect them, apply changes, apply multiple, clear them, verify no facets checked", () => {
  //   browsePage.getShowMoreLink("step").click();
  //   cy.get("[id=\"date-select\"]").scrollIntoView();
  //   cy.get("[id=\"date-select\"]").trigger("mousemove", {force: true});
  //   cy.get("[data-testid=\"step-facet\"] [class=\"facet_checkContainer__1pogS\"] [class=\"ml-tooltip-container\"]").eq(0).invoke("text").then(stepVal => {
  //     browsePage.getFacetItemCheckbox("step", stepVal).click();
  //     browsePage.getGreySelectedFacets(stepVal).should("exist");
  //     browsePage.getFacetItemCheckbox("step", stepVal).should("be.checked");
  //     browsePage.getFacetApplyButton().click();
  //     cy.get("[id=\"date-select\"]").scrollIntoView();
  //     cy.get("[id=\"date-select\"]").trigger("mousemove", {force: true});
  //     cy.get("[data-testid=\"flow-facet\"] [class=\"facet_checkContainer__1pogS\"] [class=\"ml-tooltip-container\"]").eq(0).invoke("text").then(flowVal => {
  //       browsePage.getFacetItemCheckbox("flow", flowVal).click();
  //       browsePage.getGreySelectedFacets(flowVal).should("exist");
  //       cy.get("[id=\"date-select\"]").scrollIntoView();
  //       cy.get("[id=\"date-select\"]").trigger("mousemove", {force: true});
  //       cy.get("[data-testid=\"step-type-facet\"] [class=\"facet_checkContainer__1pogS\"] [class=\"ml-tooltip-container\"]").eq(0).invoke("text").then(stepTypeVal => {
  //         browsePage.getFacetItemCheckbox("step-type", stepTypeVal).click();
  //         browsePage.getGreySelectedFacets(stepTypeVal).trigger("mousemove", {force: true});
  //         browsePage.getGreySelectedFacets(stepTypeVal).should("exist");
  //         browsePage.getFacetApplyButton().click();
  //         monitorPage.clearFacetSearchSelection(flowVal);
  //         cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
  //         browsePage.getFacetItemCheckbox("step-type", stepTypeVal).should("be.checked");
  //         browsePage.getFacetItemCheckbox("step", stepVal).click();
  //         browsePage.getFacetItemCheckbox("step-type", stepTypeVal).click();
  //         cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
  //         browsePage.getFacetItemCheckbox("step", stepVal).should("not.be.checked");
  //         browsePage.getFacetItemCheckbox("step-type", stepTypeVal).should("not.be.checked");
  //         browsePage.getGreySelectedFacets(stepVal).should("not.exist");
  //         browsePage.getGreySelectedFacets(stepTypeVal).should("not.exist");
  //         cy.waitForAsyncRequest();
  //         browsePage.getFacetItemCheckbox("step", stepVal).click();
  //         browsePage.getFacetItemCheckbox("step-type", stepTypeVal).click();
  //         cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
  //         browsePage.getFacetApplyButton().click();
  //         monitorPage.clearFacetSearchSelection(stepVal);
  //         monitorPage.clearFacetSearchSelection(stepTypeVal);
  //         browsePage.getFacetItemCheckbox("step", stepVal).should("not.be.checked");
  //         browsePage.getFacetItemCheckbox("step-type", stepTypeVal).should("not.be.checked");
  //         browsePage.getGreySelectedFacets(stepVal).should("not.exist");
  //         browsePage.getGreySelectedFacets(stepTypeVal).should("not.exist");
  //       });
  //     });
  //   });
  // });


  // it("Verify facets can be selected, applied and cleared using clear text", () => {
  //   monitorPage.validateAppliedFacet("step", 0);
  //   browsePage.getFacetSearchSelectionCount("step").should("contain", "1");
  //   browsePage.getClearFacetSelection("step").click();
  //   browsePage.waitForSpinnerToDisappear();
  // });

  // it("Apply facets, unchecking them should not recheck original facets", () => {
  //   browsePage.getShowMoreLink("step").click();
  //   cy.get("[id=\"date-select\"]").scrollIntoView();
  //   cy.get("[id=\"date-select\"]").trigger("mousemove", {force: true});
  //   cy.get("[data-testid=\"step-facet\"] [class=\"facet_checkContainer__1pogS\"] [class=\"ml-tooltip-container\"]").eq(0).invoke("text").then(stepVal1 => {
  //     cy.get("[data-testid=\"step-facet\"] [class=\"facet_checkContainer__1pogS\"] [class=\"ml-tooltip-container\"]").eq(1).invoke("text").then(stepVal2 => {
  //       cy.findByTestId("step-"+stepVal1+"-checkbox").trigger("mousemove", {force: true});
  //       browsePage.getFacetItemCheckbox("step", stepVal1).click();
  //       browsePage.getFacetItemCheckbox("step", stepVal2).click();
  //       browsePage.getGreySelectedFacets(stepVal1).should("exist");
  //       browsePage.getGreySelectedFacets(stepVal2).should("exist");
  //       browsePage.getFacetApplyButton().click();
  //       browsePage.getFacetItemCheckbox("step", stepVal1).should("be.checked");
  //       cy.get("#monitorContent").scrollTo("top", {ensureScrollable: false});
  //       cy.findByTestId("step-"+stepVal2+"-checkbox").trigger("mousemove", {force: true});
  //       browsePage.getFacetItemCheckbox("step", stepVal2).should("be.checked");
  //       browsePage.getFacetItemCheckbox("status", "finished").click();
  //       browsePage.getFacetItemCheckbox("step", stepVal1).click();
  //       browsePage.waitForSpinnerToDisappear();
  //       cy.findByTestId("step-"+stepVal2+"-checkbox").trigger("mousemove", {force: true});
  //       browsePage.getFacetItemCheckbox("step", stepVal2).click({force: true});
  //       browsePage.getFacetItemCheckbox("status", "finished").click();
  //       cy.findByTestId("step-"+stepVal1+"-checkbox").trigger("mousemove", {force: true});
  //       browsePage.getFacetItemCheckbox("step", stepVal1).should("not.be.checked");
  //       cy.get("#monitorContent").scrollTo("top", {ensureScrollable: false});
  //       browsePage.getFacetItemCheckbox("step", stepVal2).should("not.be.checked");
  //       browsePage.getFacetItemCheckbox("status", "finished").should("not.be.checked");
  //     });
  //   });
  // });

  // it("Verify select, apply, remove grey and applied startTime facet", () => {
  //   // Select multiple facets and remove startTime grey facet
  //   monitorPage.validateGreyFacet("step-type", 0);
  //   monitorPage.validateGreyFacet("step-type", 1);
  //   monitorPage.selectStartTimeFromDropDown("Today");
  //   monitorPage.getSelectedTime().should("contain", "Today");
  //   browsePage.getGreySelectedFacets("Today").should("exist");
  //   monitorPage.validateClearStartTimeGreyFacet("Today");
  //   monitorPage.getSelectedTime().should("contain", "select time");

  //   // Select multiple facets and apply all facets
  //   monitorPage.selectStartTimeFromDropDown("Today");
  //   monitorPage.getSelectedTime().should("contain", "Today");
  //   browsePage.getApplyFacetsButton().click();
  //   browsePage.getAppliedFacets("Today").should("exist");
  //   monitorPage.getSelectedTime().should("contain", "Today");

  //   // Remove applied startTime facet
  //   monitorPage.clearFacetSearchSelection("Today");
  //   browsePage.getSelectedFacet("Today").should("not.exist");
  //   browsePage.getClearAllFacetsButton().click();
  // });

});
