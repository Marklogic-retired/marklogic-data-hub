import "cypress-wait-until";
import {Application} from "../../../support/application.config";
import {
  toolbar,
  createEditStepDialog
} from "../../../support/components/common/index";
import curatePage from "../../../support/pages/curate";
import loadPage from "../../../support/pages/load";
import runPage from "../../../support/pages/run";
import LoginPage from "../../../support/pages/login";
//Utils
import {generateUniqueName} from "../../../support/helper";
const matchStep = generateUniqueName("matchStep");
const flowName1 = generateUniqueName("flow1");
const flowName2 = generateUniqueName("flow2");

describe("Add Matching step to a flow", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("matching", matchStep);
    cy.deleteFlows(flowName1, flowName2);
    cy.resetTestUser();
  });
  it("Navigating to Customer Match tab", () => {
    toolbar.getCurateToolbarIcon().should("be.visible").click();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMatchTab("Customer");
  });
  it("Create a new match step", () => {
    curatePage.addNewStep("Customer").should("be.visible").click();
    createEditStepDialog.stepNameInput().type(matchStep, {timeout: 2000});
    createEditStepDialog.stepDescriptionInput().type("match customer step example", {timeout: 2000});
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['${matchStep}'])`);
    createEditStepDialog.saveButton("matching").click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(matchStep);
  });
  it("Create match step with duplicate name and verify duplicate name modal is displayed", () => {
    curatePage.addNewStep("Customer").should("be.visible").click();
    createEditStepDialog.stepNameInput().type(matchStep);
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput("test");
    createEditStepDialog.saveButton("matching").click();
    cy.waitForAsyncRequest();

    loadPage.duplicateStepErrorMessage().then(() => {
      loadPage.confirmationOptions("Ok").click({force: true}).then(() => {
        loadPage.duplicateStepErrorMessageClosed();
      });
    });
  });
  it("Add the Match step to new flow and Run the step(new)", {defaultCommandTimeout: 120000}, () => {
    curatePage.addToNewFlow("Customer", matchStep);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName1);
    runPage.setFlowDescription(`${flowName1} description`);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();

    cy.log("**Verify the step added to Flow**");
    cy.verifyStepAddedToFlow("Matching", matchStep, flowName1);

    runPage.runStep(matchStep, flowName1);
    cy.log("**Verify Step Run Result is successful**");
    runPage.verifyStepRunResult(matchStep, "success");
    runPage.closeFlowStatusModal(flowName1);
    cy.waitForAsyncRequest();

  });
  it("Delete the step and Navigate back to match tab", () => {
    runPage.deleteStep(matchStep, flowName1).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
    toolbar.getCurateToolbarIcon().should("be.visible").click();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.selectMatchTab("Customer");
  });
  it("Add the Match step to an existing flow and Run the step(existing)", {defaultCommandTimeout: 120000}, () => {
    cy.log("**Open the match step dropdown**");
    curatePage.openExistingFlowDropdown("Customer", matchStep);

    cy.log("**Select existing flow from the match step dropdown**");
    curatePage.getExistingFlowFromDropdown(matchStep, flowName1).click();
    curatePage.addStepToFlowConfirmationMessage();
    curatePage.confirmAddStepToFlow(matchStep, flowName1);
    cy.waitForAsyncRequest();

    cy.verifyStepAddedToFlow("Matching", matchStep, flowName1);

    cy.waitForAsyncRequest();
    runPage.runStep(matchStep, flowName1);

    runPage.verifyStepRunResult(matchStep, "success");
    runPage.closeFlowStatusModal(flowName1);
  });
  it("Delete the match step", () => {
    runPage.deleteStep(matchStep, flowName1).click();
    loadPage.confirmationOptions("Yes").click();

    cy.log("**Navigating to match tab**");
    toolbar.getCurateToolbarIcon().should("be.visible").click();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.selectMatchTab("Customer");
  });
  // NOTE Moved testing of a adding step to a new flow and running the step to RTL unit tests
  // SEE https://project.marklogic.com/jira/browse/DHFPROD-7109
  it("Add the Match step to new flow", {defaultCommandTimeout: 120000}, () => {
    // create new flow
    cy.log("Create new flow");
    toolbar.getRunToolbarIcon().should("be.visible").click();
    runPage.createFlowButton().should("be.visible").click();
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName(flowName2);
    runPage.setFlowDescription(`${flowName2} description`);
    cy.wait(500);
    loadPage.confirmationOptions("Save").should("be.visible").click();
    // add step to that new flow
    cy.log("add step to that new flow");
    runPage.addStep(flowName2);
    runPage.addStepToFlow(matchStep);
    runPage.verifyStepInFlow("Matching", matchStep, flowName2);
    cy.wait(1000);
  });
  it("Delete the match step and Navigate back to match tab", () => {
    runPage.deleteStep(matchStep, flowName2).click();
    //loadPage.confirmationOptions("Yes").click(); // multiple "Yes" options appearing
    loadPage.confirmationOptionsAll("Yes").last().click();
    cy.waitForAsyncRequest();
    toolbar.getCurateToolbarIcon().should("be.visible").click();
    curatePage.getEntityTypePanel("Customer").should("be.visible");

    curatePage.selectMatchTab("Customer");
  });
  it("Add the Match step to an existing flow from card run button and should automatically run", {defaultCommandTimeout: 120000}, () => {
    curatePage.runStepInCardView(matchStep).click();
    curatePage.runStepSelectFlowConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName2);
    cy.waitForAsyncRequest();
    runPage.getFlowStatusSuccess(flowName2).should("be.visible");
    runPage.verifyStepRunResult(matchStep, "success");
    runPage.closeFlowStatusModal(flowName2);
    cy.verifyStepAddedToFlow("Matching", matchStep, flowName2);
  });
  it("Navigating to match tab", () => {
    toolbar.getCurateToolbarIcon().should("be.visible").click();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.selectMatchTab("Customer");
  });
  it("Run the Match step from card run button and should automatically run in the flow where step exists", {defaultCommandTimeout: 120000}, () => {
    curatePage.runStepInCardView(matchStep).click();
    curatePage.runStepExistsOneFlowConfirmation().scrollIntoView().should("be.visible");
    curatePage.confirmContinueRun();

    cy.log("**Verify the step run result**");
    runPage.verifyStepRunResult(matchStep, "success");
    runPage.closeFlowStatusModal(flowName2);
    cy.verifyStepAddedToFlow("Matching", matchStep, flowName2);
  });
  it("Navigating to match tab", () => {
    toolbar.getCurateToolbarIcon().should("be.visible").click();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.selectMatchTab("Customer");
  });
  it("Add the match step to a second flow and verify it was added", () => {
    curatePage.openExistingFlowDropdown("Customer", matchStep);
    curatePage.getExistingFlowFromDropdown(matchStep, flowName1).click();
    curatePage.addStepToFlowConfirmationMessage();
    curatePage.confirmAddStepToFlow(matchStep, flowName1);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Matching", matchStep, flowName1);
  });
  it("Navigating to match tab", () => {
    toolbar.getCurateToolbarIcon().should("be.visible").click();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.selectMatchTab("Customer");
  });
  it("Run the Match step from card run button and should display all flows where step exists, choose one to automatically run in", {defaultCommandTimeout: 120000}, () => {
    curatePage.runStepInCardView(matchStep).click();
    curatePage.runStepExistsMultFlowsConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName1);
    cy.waitForAsyncRequest();

    runPage.getFlowStatusSuccess(flowName1).should("be.visible");

    runPage.verifyStepRunResult(matchStep, "success");
    runPage.closeFlowStatusModal(flowName1);
    cy.verifyStepAddedToFlow("Matching", matchStep, flowName1);
  });
});