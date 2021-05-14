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
    monitorPage.getTableRows().should("have.length", 20);
    monitorPage.getPaginationPageSizeOptions().then(attr => {
      attr[0].click();
      monitorPage.getPageSizeOption("10 / page").click();
    });
    monitorPage.getTableRows().should("have.length", 10);
  });

  it("apply facet search and verify docs", () => {
    browsePage.getShowMoreLink("flow").click();
    browsePage.getFacetItemCheckbox("flow", "convertedFlow").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getGreySelectedFacets("convertedFlow").should("exist");
    browsePage.getFacetApplyButton().should("exist");
    browsePage.getClearGreyFacets().should("exist");
    browsePage.getFacetApplyButton().click();
    monitorPage.getTableRows().should("have.length", 2);
    browsePage.getClearAllFacetsButton().should("exist");
    browsePage.getFacetSearchSelectionCount("flow").should("contain", "1");
    browsePage.clickClearFacetSearchSelection("convertedFlow");
  });
  it("apply facet search and clear individual grey facet", () => {
    monitorPage.getTableRows().should("have.length", 10);
    browsePage.getShowMoreLink("flow").click();
    browsePage.getFacetItemCheckbox("flow", "convertedFlow").click();
    browsePage.getGreySelectedFacets("convertedFlow").click();
    monitorPage.getTableRows().should("have.length", 10);
  });

});

