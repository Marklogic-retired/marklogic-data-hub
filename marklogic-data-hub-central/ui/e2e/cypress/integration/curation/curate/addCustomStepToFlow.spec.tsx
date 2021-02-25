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
  });
  beforeEach(() => {
    cy.loginAsDeveloper().withRequest();
  });
  afterEach(() => {
    cy.resetTestUser();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteFlows(flowName);
    cy.resetTestUser();
  });

  it("Create new flow", () => {
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    runPage.createFlowButton().click();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`test flow for adding custom step`);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
  });

  it("Add custom step from Run tile", () => {
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    runPage.expandFlow(flowName);
    cy.waitForAsyncRequest();

    runPage.addStep(flowName);
    runPage.addStepToFlow(stepName);
    cy.waitForAsyncRequest();

    runPage.verifyStepInFlow("Custom", stepName);
  });

  it("Run steps", () => {
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    runPage.expandFlow(flowName);
    cy.waitForAsyncRequest();

    runPage.runStep(stepName).click();
    cy.waitForAsyncRequest();
    cy.verifyStepRunResult("success", stepType, stepName);
    tiles.closeRunMessage();
  });

  it("Remove custom steps from flow", () => {
    runPage.deleteStep(stepName).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
  });

  it("Add custom steps from Curate tile", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectCustomTab("Customer");
    cy.waitForAsyncRequest();

    curatePage.openExistingFlowDropdown("Customer", stepName);
    curatePage.getExistingFlowFromDropdown(flowName).click();
    curatePage.confirmAddStepToFlow(stepName, flowName);
    cy.waitForAsyncRequest();

    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    runPage.expandFlow(flowName);

    runPage.verifyStepInFlow("Custom", stepName);
  });

  it("Run steps", () => {
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    runPage.expandFlow(flowName);
    cy.waitForAsyncRequest();

    runPage.runStep(stepName).click();
    cy.waitForAsyncRequest();
    cy.verifyStepRunResult("success", stepType, stepName);
    tiles.closeRunMessage();
  });
});