import "cypress-wait-until";
import {Application} from "../../../support/application.config";
import {toolbar} from "../../../support/components/common/index";
import curatePage from "../../../support/pages/curate";
import loadPage from "../../../support/pages/load";
import runPage from "../../../support/pages/run";
import LoginPage from "../../../support/pages/login";

//Utils
import {generateUniqueName} from "../../../support/helper";

const stepName = "mapping-step";
const flowName = generateUniqueName("testAddCustomStepToFlow1");
const stepType = "Custom";

describe("Add Custom step to a flow", () => {
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
    cy.deleteRecordsInFinal(stepName);
    cy.deleteFlows(flowName);
  });

  it("Create new flow", () => {
    toolbar.getRunToolbarIcon().should("be.visible").click();
    runPage.createFlowButton().click();

    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`test flow for adding custom step`);
    loadPage.confirmationOptions("Save").click();

  });

  it("Add custom step from Run tile and Run the step", {defaultCommandTimeout: 120000}, () => {
    cy.log("**Expand flow and add step**");
    toolbar.getRunToolbarIcon().should("be.visible").click({force: true});
    runPage.expandFlow(flowName);

    runPage.addStep(flowName);
    runPage.addStepToFlow(stepName);

    runPage.verifyStepInFlow(stepType, stepName, flowName);
    toolbar.getRunToolbarIcon().should("be.visible").click();
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
    cy.intercept("/api/jobs/**").as("getJobs");
    toolbar.getCurateToolbarIcon().should("be.visible").click();
    curatePage.getEntityTypePanel("Customerzzzz").should("be.visible");
    curatePage.toggleEntityTypeId("Customerzzz");
    curatePage.selectCustomTab("Customerzzz");

    curatePage.openExistingFlowDropdown("Customer", stepName);
    curatePage.getExistingFlowFromDropdown(stepName, flowName).scrollIntoView().click({force: true});
    curatePage.confirmAddStepToFlow(stepName, flowName);

    toolbar.getRunToolbarIcon().should("not.be.visible").click();
    runPage.expandFlow(flowName);

    runPage.verifyStepInFlow(stepType, stepName, flowName);
    toolbar.getRunToolbarIcon().should("not.be.visible").click();
    runPage.expandFlow(flowName);

    runPage.runStep(stepName, flowName);

    runPage.verifyStepRunResult(stepName, "success");
    runPage.closeFlowStatusModal(flowName);
  });
});