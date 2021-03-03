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
    cy.deleteSteps("matching", "matchCustomerTest");
    cy.deleteFlows("matchE2ETest", "matchE2ETestRun");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Navigating to Customer Match tab", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
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
  it("Create match step with duplicate name and verify duplicate name modal is displayed", () => {
    cy.waitUntil(() => curatePage.addNewStep()).click();
    createEditStepDialog.stepNameInput().type(matchStep);
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput("test");
    createEditStepDialog.saveButton("matching").click();
    cy.waitForAsyncRequest();
    loadPage.duplicateStepErrorMessage();
    loadPage.confirmationOptions("OK").click();
    loadPage.duplicateStepErrorMessageClosed();
  });
  it("Add the Match step to new flow and Run the step(new)", () => {
    curatePage.addToNewFlow("Customer", matchStep);
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName1);
    runPage.setFlowDescription(`${flowName1} description`);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Match", matchStep);
    cy.waitForAsyncRequest();
    runPage.runStep(matchStep);
    cy.verifyStepRunResult("success", "Matching", matchStep);
    tiles.closeRunMessage();
    cy.waitForAsyncRequest();
  });
  it("Delete the step and Navigate back to match tab", () => {
    runPage.deleteStep(matchStep).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMatchTab("Customer");
  });
  it("Add the Match step to an existing flow and Run the step(existing)", () => {
    curatePage.openExistingFlowDropdown("Customer", matchStep);
    curatePage.getExistingFlowFromDropdown(flowName1).click();
    curatePage.addStepToFlowConfirmationMessage();
    curatePage.confirmAddStepToFlow(matchStep, flowName1);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Match", matchStep);
    cy.waitForAsyncRequest();
    runPage.runStep(matchStep);
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
  it("Add the Match step to new flow from card run button and should automatically run", () => {
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
  it("Delete the match step and Navigate back to match tab", () => {
    runPage.deleteStep(matchStep).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMatchTab("Customer");
  });
  it("Add the Match step to an existing flow from card run button and should automatically run", () => {
    curatePage.runStepInCardView(matchStep).click();
    curatePage.runStepSelectFlowConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName2);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Match", matchStep);
    cy.waitUntil(() => runPage.getFlowName(flowName2).should("be.visible"));
    cy.verifyStepRunResult("success", "Matching", matchStep);
    tiles.closeRunMessage();
  });
  it("Navigating to match tab", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMatchTab("Customer");
  });
  it("Run the Match step from card run button and should automatically run in the flow where step exists", () => {
    curatePage.runStepInCardView(matchStep).click();
    curatePage.runStepExistsOneFlowConfirmation().should("be.visible");
    curatePage.confirmContinueRun();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Match", matchStep);
    cy.waitUntil(() => runPage.getFlowName(flowName2).should("be.visible"));
    cy.verifyStepRunResult("success", "Matching", matchStep);
    tiles.closeRunMessage();
  });
  it("Navigating to match tab", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMatchTab("Customer");
  });
  it("Add the match step to a second flow and verify it was added", () => {
    curatePage.openExistingFlowDropdown("Customer", matchStep);
    curatePage.getExistingFlowFromDropdown(flowName1).click();
    curatePage.addStepToFlowConfirmationMessage();
    curatePage.confirmAddStepToFlow(matchStep, flowName1);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Match", matchStep);
  });
  it("Navigating to match tab", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMatchTab("Customer");
  });
  it("Run the Match step from card run button and should display all flows where step exists, choose one to automatically run in", () => {
    curatePage.runStepInCardView(matchStep).click();
    curatePage.runStepExistsMultFlowsConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName1);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Match", matchStep);
    cy.waitUntil(() => runPage.getFlowName(flowName1).should("be.visible"));
    cy.verifyStepRunResult("success", "Matching", matchStep);
    tiles.closeRunMessage();
  });
});