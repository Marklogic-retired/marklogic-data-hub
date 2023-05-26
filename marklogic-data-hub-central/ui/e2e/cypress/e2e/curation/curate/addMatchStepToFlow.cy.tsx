import {createEditStepDialog} from "../../../support/components/common/index";
import curatePage from "../../../support/pages/curate";
import loadPage from "../../../support/pages/load";
import runPage from "../../../support/pages/run";

import {generateUniqueName} from "../../../support/helper";
import "cypress-wait-until";

const matchStep = generateUniqueName("matchStep");
const flowName1 = generateUniqueName("flow1");
const flowName2 = generateUniqueName("flow2");

describe("Add Matching step to a flow", () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
    curatePage.navigate();
  });

  after(() => {
    cy.deleteFlows(flowName1, flowName2);
    cy.resetTestUser();
  });

  it("Create a new match step", () => {
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMatchTab("Customer");
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

  it("Delete the step", () => {
    runPage.deleteStep(matchStep, flowName1).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
  });

  it("Add the Match step to an existing flow and Run the step (existing)", {defaultCommandTimeout: 120000}, () => {
    curatePage.navigate();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.selectMatchTab("Customer");
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
    cy.waitForAsyncRequest();
  });

  it("Add the Match step to new flow", {defaultCommandTimeout: 120000}, () => {
    cy.log("Create new flow");
    runPage.navigate();
    runPage.createFlowButton().should("be.visible").click();
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName(flowName2);
    runPage.setFlowDescription(`${flowName2} description`);
    cy.wait(500);
    loadPage.confirmationOptions("Save").should("be.visible").click();

    cy.log("add step to that new flow");
    runPage.addStep(flowName2);
    runPage.addStepToFlow(matchStep);
    runPage.verifyStepInFlow("Matching", matchStep, flowName2);
    cy.wait(1000);
  });

  it("Delete the match step", () => {
    runPage.deleteStep(matchStep, flowName2).click();
    loadPage.confirmationOptionsAll("Yes").last().click();
    cy.waitForAsyncRequest();
  });

  it("Add the Match step to an existing flow from card run button and should automatically run", {defaultCommandTimeout: 120000}, () => {
    curatePage.navigate();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.selectMatchTab("Customer");

    curatePage.runStepInCardView(matchStep).click();
    curatePage.runStepSelectFlowConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName2);
    cy.waitForAsyncRequest();
    runPage.getFlowStatusSuccess(flowName2).should("be.visible");
    runPage.verifyStepRunResult(matchStep, "success");
    runPage.closeFlowStatusModal(flowName2);
    cy.verifyStepAddedToFlow("Matching", matchStep, flowName2);
  });

  it("Run the Match step from card run button and should automatically run in the flow where step exists", {defaultCommandTimeout: 120000}, () => {
    curatePage.navigate();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.selectMatchTab("Customer");
    curatePage.runStepInCardView(matchStep).click();
    curatePage.runStepExistsOneFlowConfirmation().scrollIntoView().should("be.visible");
    curatePage.confirmContinueRun();

    cy.log("**Verify the step run result**");
    runPage.verifyStepRunResult(matchStep, "success");
    runPage.closeFlowStatusModal(flowName2);
    cy.verifyStepAddedToFlow("Matching", matchStep, flowName2);
  });

  it("Add the match step to a second flow and verify it was added", () => {
    curatePage.navigate();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.selectMatchTab("Customer");
    curatePage.openExistingFlowDropdown("Customer", matchStep);
    curatePage.getExistingFlowFromDropdown(matchStep, flowName1).click();
    curatePage.addStepToFlowConfirmationMessage();
    curatePage.confirmAddStepToFlow(matchStep, flowName1);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Matching", matchStep, flowName1);
  });

  it("Run the Match step from card run button and should display all flows where step exists, choose one to automatically run in", {defaultCommandTimeout: 120000}, () => {
    curatePage.navigate();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.selectMatchTab("Customer");
    curatePage.runStepInCardView(matchStep).click();
    curatePage.runStepExistsMultFlowsConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName1);
    cy.waitForAsyncRequest();

    runPage.getFlowStatusSuccess(flowName1).should("be.visible");

    runPage.verifyStepRunResult(matchStep, "success");
    runPage.closeFlowStatusModal(flowName1);
    cy.verifyStepAddedToFlow("Matching", matchStep, flowName1);
  });

  it("Delete the match step", () => {
    curatePage.navigate();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.selectMatchTab("Customer");
    curatePage.deleteMappingStepButton(matchStep).should("be.visible").click();
    curatePage.deleteConfirmation("Yes").click();
  });

  it("Validate match step is removed from flows", () => {
    runPage.navigate();
    runPage.expandFlow(flowName1);
    runPage.verifyNoStepsInFlow();
    runPage.navigate();
    runPage.expandFlow(flowName2);
    runPage.verifyNoStepsInFlow();
  });
});