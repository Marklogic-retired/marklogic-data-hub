import loadPage from "../../../support/pages/load";
import runPage from "../../../support/pages/run";
import "cypress-wait-until";

describe("Custom Ingestion", () => {
  before(() => {
    cy.loginAsTestUserWithRoles("hub-central-load-reader", "hub-central-step-runner").withRequest();
    loadPage.navigate();
  });

  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Verify that custom ingestion step shows up and can be run", {defaultCommandTimeout: 120000}, () => {
    const flowName = "testCustomFlow";
    const loadStep = "ingestion-step";

    cy.waitUntil(() => loadPage.stepName("ingestion-step").should("be.visible"));

    loadPage.editStepInCardView(loadStep).click();
    loadPage.switchEditAdvanced().click();

    cy.findByText("Step Definition Name:").should("exist");
    loadPage.cancelSettings(loadStep).click();
    runPage.navigate();

    cy.waitUntil(() => cy.findByText(flowName).closest("div")).click();
    cy.waitUntil(() => cy.contains("Custom"));
    cy.waitForAsyncRequest();
    runPage.runStep(loadStep, flowName);
    cy.uploadFile("input/test-1.json");
    cy.waitForAsyncRequest();
    runPage.verifyStepRunResult(loadStep, "success");
    runPage.closeFlowStatusModal(flowName);
  });
});
