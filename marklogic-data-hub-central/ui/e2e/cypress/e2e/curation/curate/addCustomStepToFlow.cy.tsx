import curatePage from "../../../support/pages/curate";
import browsePage from "../../../support/pages/browse";
import loadPage from "../../../support/pages/load";
import runPage from "../../../support/pages/run";

import {generateUniqueName} from "../../../support/helper";
import "cypress-wait-until";


const flowName = generateUniqueName("testAddCustomStepToFlow1");
const stepName = "mapping-step";
const stepType = "Custom";

describe("Add Custom step to a flow", () => {

  before(() => {
    cy.loginAsDeveloper().withRequest();
    runPage.navigate();
  });

  after(() => {
    cy.deleteRecordsInFinal(stepName);
    cy.deleteFlows(flowName);
  });

  it("Create new flow", () => {
    runPage.createFlowButton().click();

    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`test flow for adding custom step`);
    loadPage.confirmationOptions("Save").click();
  });

  it("Add custom step from Run tile and Run the step", {defaultCommandTimeout: 120000}, () => {
    cy.log("**Expand flow and add step**");
    runPage.navigate();
    runPage.expandFlow(flowName);

    runPage.addStep(flowName);
    runPage.addStepToFlow(stepName);

    runPage.verifyStepInFlow(stepType, stepName, flowName);
    runPage.navigate();

    runPage.expandFlow(flowName);
    runPage.runStep(stepName, flowName);

    runPage.verifyStepRunResult(stepName, "success");
    runPage.closeFlowStatusModal(flowName);
  });

  it("Remove custom steps from flow", () => {
    runPage.deleteStep(stepName, flowName).click();
    loadPage.confirmationOptions("Yes").click();
  });

  it("Add custom steps from Curate tile and Run steps", {defaultCommandTimeout: 120000}, () => {
    curatePage.navigate();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectCustomTab("Customer");

    curatePage.openExistingFlowDropdown("Customer", stepName);
    curatePage.getExistingFlowFromDropdown(stepName, flowName).scrollIntoView().click({force: true});
    curatePage.confirmAddStepToFlow(stepName, flowName);

    runPage.navigate();
    runPage.expandFlow(flowName);
    runPage.verifyStepInFlow(stepType, stepName, flowName);

    runPage.navigate();
    runPage.expandFlow(flowName);
    runPage.runStep(stepName, flowName);
    runPage.verifyStepRunResult(stepName, "success");
    runPage.closeFlowStatusModal(flowName);
  });
});

describe("Check spinner", () => {
  it("Check Spinner when page is loading", () => {
    cy.visit("/tiles/curate");
    cy.findByTestId("spinner");
    browsePage.waitForSpinnerToDisappear();
  });
});