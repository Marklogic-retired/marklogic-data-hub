import {Application} from "../../../support/application.config";
import {tiles, toolbar} from "../../../support/components/common";
import loadPage from "../../../support/pages/load";
import runPage from "../../../support/pages/run";
import LoginPage from "../../../support/pages/login";
import "cypress-wait-until";

describe("Custom Ingestion", () => {

  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-load-reader", "hub-central-step-runner").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => loadPage.stepName("ingestion-step").should("be.visible"));
  });
  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("verify that custom ingestion step shows up and can be run", {defaultCommandTimeout: 120000}, () => {
    cy.intercept("/api/jobs/**").as("getJobs");
    const flowName = "testCustomFlow";
    const loadStep = "ingestion-step";
    // create load step
    toolbar.getLoadToolbarIcon().click();
    cy.waitUntil(() => loadPage.stepName("ingestion-step").should("be.visible"));
    // open settings
    loadPage.editStepInCardView(loadStep).click();
    loadPage.switchEditAdvanced().click(); // Advanced tab
    //custom ingestion steps have step definition name
    cy.findByText("Step Definition Name").should("exist");
    loadPage.cancelSettings(loadStep).click();
    toolbar.getRunToolbarIcon().click();
    //Run the ingest with JSON
    cy.waitUntil(() => cy.findByText(flowName).closest("div")).click();
    cy.waitUntil(() => cy.contains("Custom"));
    cy.waitForAsyncRequest();
    runPage.runStep(loadStep, flowName);
    cy.uploadFile("input/test-1.json");
    cy.waitForAsyncRequest();
    cy.verifyStepRunResult("success", "Ingestion", loadStep);
    tiles.closeRunMessage();

  });
});
