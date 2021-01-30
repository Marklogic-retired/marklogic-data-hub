import "cypress-wait-until";
import {Application} from "../../../support/application.config";
import {
  toolbar,
  createEditStepDialog,
  tiles
} from "../../../support/components/common/index";
import curatePage from "../../../support/pages/curate";
import loadPage from "../../../support/pages/load";
import runPage from "../../../support/pages/run";
import LoginPage from "../../../support/pages/login";

const matchStep = "matchCustomerTest";
const flowName1 = "matchE2ETest";
const flowName2 = "matchE2ETestRun";

describe("Add Matching step to a flow", () => {
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
    cy.deleteSteps("matching", "matchCustomerTest");
    cy.deleteFlows("matchE2ETest", "matchE2ETestRun");
    cy.resetTestUser();
  });
  it("Navigating to curate tab", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
  });
  it("Open Customer entity", () => {
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMatchTab("Customer");
  });
  it("Create a new match step", () => {
    curatePage.addNewStep().should("be.visible").click();
    createEditStepDialog.stepNameInput().type(matchStep, {timeout: 2000});
    createEditStepDialog.stepDescriptionInput().type("match customer step example", {timeout: 2000});
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['${matchStep}'])`);
    createEditStepDialog.saveButton("matching").click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(matchStep);
  });
  it("Create match step with duplicate name", () => {
    cy.waitUntil(() => curatePage.addNewStep()).click();
    createEditStepDialog.stepNameInput().type(matchStep);
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput("test");
    createEditStepDialog.saveButton("matching").click();
    cy.waitForAsyncRequest();
  });
  it("Verify duplicate name modal is displayed", () => {
    loadPage.duplicateStepErrorMessage();
    loadPage.confirmationOptions("OK").click();
    loadPage.duplicateStepErrorMessageClosed();
  });
  it("Add the Match step to new flow and validate the step was added", () => {
    curatePage.addToNewFlow("Customer", matchStep);
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName1);
    runPage.setFlowDescription(`${flowName1} description`);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Match", matchStep);
  });
  it("Run the match step and verify success message(new)", () => {
    runPage.runStep(matchStep).click();
    cy.waitForAsyncRequest();
    cy.verifyStepRunResult("success", "Matching", matchStep);
    tiles.closeRunMessage();
  });
  it("Delete the step", () => {
    runPage.deleteStep(matchStep).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
  });
  it("Navigate back to match tab", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMatchTab("Customer");
  });
  it("Add the Match step to an existing flow and validate the step was added", () => {
    curatePage.openExistingFlowDropdown("Customer", matchStep);
    curatePage.getExistingFlowFromDropdown(flowName1).click();
    curatePage.addStepToFlowConfirmationMessage();
    curatePage.confirmAddStepToFlow(matchStep, flowName1);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Match", matchStep);
  });
  it("Run the match step and verify success message(existing)", () => {
    runPage.runStep(matchStep).click();
    cy.waitForAsyncRequest();
    cy.verifyStepRunResult("success", "Matching", matchStep);
    tiles.closeRunMessage();
  });
  it("Navigating to match tab", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMatchTab("Customer");
  });
  it("Add the Match step to new flow from run tile and should automatically run", () => {
    curatePage.runStepInCardView(matchStep).click();
    curatePage.runInNewFlow(matchStep).click();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName2);
    runPage.setFlowDescription(`${flowName2} description`);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Match", matchStep);
    cy.waitUntil(() => runPage.getFlowName(flowName2).should("be.visible"));
    cy.verifyStepRunResult("success", "Matching", matchStep);
    tiles.closeRunMessage();
  });
  it("Delete the match step", () => {
    runPage.deleteStep(matchStep).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
  });
  it("Navigating to match tab", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMatchTab("Customer");
  });
  it("Add the Match step to an existing flow from run tile and should automatically run", () => {
    curatePage.runStepInCardView(matchStep).click();
    curatePage.runStepInExistingFlow(matchStep, flowName2);
    curatePage.addStepToFlowRunConfirmationMessage();
    curatePage.confirmAddStepToFlow(matchStep, flowName2);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Match", matchStep);
    cy.waitUntil(() => runPage.getFlowName(flowName2).should("be.visible"));
    cy.verifyStepRunResult("success", "Matching", matchStep);
    tiles.closeRunMessage();
  });
});