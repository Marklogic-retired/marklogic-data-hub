import "cypress-wait-until";
import {Application} from "../../../support/application.config";
import {toolbar, tiles} from "../../../support/components/common/index";
import curatePage from "../../../support/pages/curate";
import loadPage from "../../../support/pages/load";
import runPage from "../../../support/pages/run";
import LoginPage from "../../../support/pages/login";

const stepName = "mapping-step";
const flowName = "testAddCustomStepToFlow";
const stepType = "Custom";

describe("Add Custom step to a flow", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
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
    cy.loginAsDeveloper().withRequest();
    cy.deleteRecordsInFinal(stepName);
    cy.deleteFlows(flowName);
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Create new flow", () => {
    cy.waitUntil(() => toolbar.getRunToolbarIcon().should("be.visible")).click();
    runPage.createFlowButton().click();
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`test flow for adding custom step`);
    loadPage.confirmationOptions("Save").click();
    cy.wait(2000);
    cy.waitForAsyncRequest();
  });

  it("Add custom step from Run tile and Run the step", {defaultCommandTimeout: 120000}, () => {
    cy.waitUntil(() => toolbar.getRunToolbarIcon().should("be.visible")).click({force: true});
    runPage.expandFlow(flowName);
    cy.waitForAsyncRequest();

    runPage.addStep(flowName);
    runPage.addStepToFlow(stepName);
    cy.waitForAsyncRequest();

    runPage.verifyStepInFlow(stepType, stepName, flowName);
    cy.waitUntil(() => toolbar.getRunToolbarIcon().should("be.visible")).click();
    runPage.expandFlow(flowName);
    cy.waitForAsyncRequest();

    runPage.runStep(stepName, flowName);
    cy.verifyStepRunResult("success", stepType, stepName);
    tiles.closeRunMessage();
  });

  it("Remove custom steps from flow", () => {
    runPage.deleteStep(stepName, flowName).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
  });

  it("Add custom steps from Curate tile and Run steps", {defaultCommandTimeout: 120000}, () => {
    cy.intercept("/api/jobs/**").as("getJobs");
    cy.waitUntil(() => toolbar.getCurateToolbarIcon().should("be.visible")).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectCustomTab("Customer");
    cy.waitForAsyncRequest();
    curatePage.openExistingFlowDropdown("Customer", stepName);
    curatePage.getExistingFlowFromDropdown(flowName).click();
    curatePage.confirmAddStepToFlow(stepName, flowName);
    cy.waitForAsyncRequest();

    cy.waitUntil(() => toolbar.getRunToolbarIcon().should("be.visible")).click();
    runPage.expandFlow(flowName);

    runPage.verifyStepInFlow(stepType, stepName, flowName);
    cy.waitUntil(() => toolbar.getRunToolbarIcon().should("be.visible")).click();
    runPage.expandFlow(flowName);
    cy.waitForAsyncRequest();

    runPage.runStep(stepName, flowName);
    cy.verifyStepRunResult("success", stepType, stepName);
    tiles.closeRunMessage();
  });
});