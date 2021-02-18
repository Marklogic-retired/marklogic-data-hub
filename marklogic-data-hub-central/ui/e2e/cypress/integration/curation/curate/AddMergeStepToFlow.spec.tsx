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

const mergeStep = "mergeCustomerTest";
const flowName1 = "mergeE2ETest";
const flowName2 = "mergeE2ETestRun";

describe("Add Merge step to a flow", () => {
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
    cy.deleteSteps("merging", "mergeCustomerTest");
    cy.deleteFlows("mergeE2ETest", "mergeE2ETestRun");
    cy.resetTestUser();
  });
  it("Navigating to curate tab", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
  });
  it("Open Customer entity", () => {
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMergeTab("Customer");
  });
  it("Create a new merge step", () => {
    curatePage.addNewStep().should("be.visible").click();
    createEditStepDialog.stepNameInput().type(mergeStep, {timeout: 2000});
    createEditStepDialog.stepDescriptionInput().type("merge order step example", {timeout: 2000});
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['${mergeStep}'])`);
    createEditStepDialog.setTimestampInput().type("/envelop/headers/createdOn", {timeout: 2000});
    createEditStepDialog.saveButton("merging").click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(mergeStep);
  });
  it("Create merge step with duplicate name", () => {
    cy.waitUntil(() => curatePage.addNewStep()).click();
    createEditStepDialog.stepNameInput().type(mergeStep);
    createEditStepDialog.stepDescriptionInput().type("merge order step example");
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput("test");
    createEditStepDialog.saveButton("merging").click();
    cy.waitForAsyncRequest();
  });
  it("Verify duplicate name modal is displayed", () => {
    loadPage.duplicateStepErrorMessage();
    loadPage.confirmationOptions("OK").click();
    loadPage.duplicateStepErrorMessageClosed();
  });
  it("Add the Merge step to new flow and validate the step was added", () => {
    curatePage.addToNewFlow("Customer", mergeStep);
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName1);
    runPage.setFlowDescription(`${flowName1} description`);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Merge", mergeStep);
  });
  it("Run the merge step and verify success message(new)", () => {
    runPage.runStep(mergeStep).click();
    cy.waitForAsyncRequest();
    cy.verifyStepRunResult("success", "Merging", mergeStep);
    tiles.closeRunMessage();
  });
  it("Delete the step", () => {
    runPage.deleteStep(mergeStep).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
  });
  it("Navigate back to merge tab", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMergeTab("Customer");
  });
  it("Add the Merge step to an existing flow and validate the step was added", () => {
    curatePage.openExistingFlowDropdown("Customer", mergeStep);
    curatePage.getExistingFlowFromDropdown(flowName1).click();
    curatePage.addStepToFlowConfirmationMessage();
    curatePage.confirmAddStepToFlow(mergeStep, flowName1);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Merge", mergeStep);
  });
  it("Run the merge step and verify success message(existing)", () => {
    runPage.runStep(mergeStep).click();
    cy.waitForAsyncRequest();
    cy.verifyStepRunResult("success", "Merging", mergeStep);
    tiles.closeRunMessage();
  });
  it("Delete the merge step", () => {
    runPage.deleteStep(mergeStep).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
  });
  it("Navigating to merge tab", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMergeTab("Customer");
  });
  it("Add the Merge step to new flow from card run button and should automatically run", () => {
    curatePage.runStepInCardView(mergeStep).click();
    curatePage.runInNewFlow(mergeStep).click();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName2);
    runPage.setFlowDescription(`${flowName2} description`);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Merge", mergeStep);
    cy.waitUntil(() => runPage.getFlowName(flowName2).should("be.visible"));
    cy.verifyStepRunResult("success", "Merging", mergeStep);
    tiles.closeRunMessage();
  });
  it("Delete the merge step", () => {
    runPage.deleteStep(mergeStep).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
  });
  it("Navigating to merge tab", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMergeTab("Customer");
  });
  it("Add the Merge step to an existing flow from card run button and should automatically run", () => {
    curatePage.runStepInCardView(mergeStep).click();
    curatePage.runStepSelectFlowConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName2);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Merge", mergeStep);
    cy.waitUntil(() => runPage.getFlowName(flowName2).should("be.visible"));
    cy.verifyStepRunResult("success", "Merging", mergeStep);
    tiles.closeRunMessage();
  });
  it("Navigating to merge tab", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMergeTab("Customer");
  });
  it("Run the Merge step from card run button and should automatically run in the flow where step exists", () => {
    curatePage.runStepInCardView(mergeStep).click();
    curatePage.runStepExistsOneFlowConfirmation().should("be.visible");
    curatePage.confirmContinueRun();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Merge", mergeStep);
    cy.waitUntil(() => runPage.getFlowName(flowName2).should("be.visible"));
    cy.verifyStepRunResult("success", "Merging", mergeStep);
    tiles.closeRunMessage();
  });
  it("Navigating to merge tab", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMergeTab("Customer");
  });
  it("Add the merge step to a second flow and verify it was added", () => {
    curatePage.openExistingFlowDropdown("Customer", mergeStep);
    curatePage.getExistingFlowFromDropdown(flowName1).click();
    curatePage.addStepToFlowConfirmationMessage();
    curatePage.confirmAddStepToFlow(mergeStep, flowName1);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Merge", mergeStep);
  });
  it("Navigating to merge tab", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMergeTab("Customer");
  });
  it("Run the Merge step from card run button and should display all flows where step exists, choose one to automatically run in", () => {
    curatePage.runStepInCardView(mergeStep).click();
    curatePage.runStepExistsMultFlowsConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName1);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Merge", mergeStep);
    cy.waitUntil(() => runPage.getFlowName(flowName1).should("be.visible"));
    cy.verifyStepRunResult("success", "Merging", mergeStep);
    tiles.closeRunMessage();
  });
});