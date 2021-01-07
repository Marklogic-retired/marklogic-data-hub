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

describe("Add Matching step to a flow", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMatchTab("Customer");
  });
  afterEach(() => {
    cy.resetTestUser();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("matching", "matchCustomerTest");
    cy.deleteFlows("matchE2ETest", "matchE2ETestRun");
  });
  const matchStep = "matchCustomerTest";
  const flowName1 = "matchE2ETest";
  const flowName2 = "matchE2ETestRun";
  it("Adding a Match step to a new flow step", () => {
    //Creating a new match step
    cy.waitUntil(() => curatePage.addNewStep()).click();
    createEditStepDialog.stepNameInput().type(matchStep);
    createEditStepDialog.stepDescriptionInput().type("match customer step example");
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['${matchStep}'])`);
    createEditStepDialog.saveButton("matching").click();
    curatePage.verifyStepNameIsVisible(matchStep);

    //Verify match step with duplicate name cannot be created
    cy.waitUntil(() => curatePage.addNewStep()).click();
    createEditStepDialog.stepNameInput().type(matchStep);
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput("test");
    createEditStepDialog.saveButton("matching").click();
    loadPage.duplicateStepErrorMessage();
    loadPage.confirmationOptions("OK").click();
    loadPage.duplicateStepErrorMessageClosed();

    //Add the step to new flow
    curatePage.addToNewFlow("Customer", matchStep);
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName1);
    runPage.setFlowDescription(`${flowName1} description`);
    loadPage.confirmationOptions("Save").click();
    cy.verifyStepAddedToFlow("Match", matchStep);
    //Run the match step
    runPage.runStep(matchStep).click();
    cy.verifyStepRunResult("success", "Matching", matchStep);
    tiles.closeRunMessage();
    //Delete the step
    runPage.deleteStep(matchStep).click();
    loadPage.confirmationOptions("Yes").click();
  });
  it("Adding a Match step to an existing flow step", () => {
    //Add the step to an existing flow
    curatePage.openExistingFlowDropdown("Customer", matchStep);
    curatePage.getExistingFlowFromDropdown(flowName1).click();
    curatePage.addStepToFlowConfirmationMessage();
    curatePage.confirmAddStepToFlow(matchStep, flowName1);
    cy.verifyStepAddedToFlow("Match", matchStep);
    //Step should automatically run
    runPage.runStep(matchStep).click();
    cy.verifyStepRunResult("success", "Matching", matchStep);
    tiles.closeRunMessage();
  });
  it("Adding a Match step to a new flow step from Run Tile", () => {
    //Add the step to new flow from run tile
    curatePage.runStepInCardView(matchStep).click();
    curatePage.runInNewFlow(matchStep).click();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName2);
    runPage.setFlowDescription(`${flowName2} description`);
    loadPage.confirmationOptions("Save").click();
    cy.verifyStepAddedToFlow("Match", matchStep);
    //Step should automatically run
    cy.verifyStepRunResult("success", "Matching", matchStep);
    tiles.closeRunMessage();
    //Delete the match step
    runPage.deleteStep(matchStep).click();
    loadPage.confirmationOptions("Yes").click();
  });
  it("Adding a Match step to an existing flow step from Run Tile", () => {
    //Add the step to an existing flow
    curatePage.runStepInCardView(matchStep).click();
    curatePage.runStepInExistingFlow(matchStep, flowName2);
    curatePage.addStepToFlowRunConfirmationMessage();
    curatePage.confirmAddStepToFlow(matchStep, flowName2);
    cy.verifyStepAddedToFlow("Match", matchStep);
    //Step should automatically run
    cy.verifyStepRunResult("success", "Matching", matchStep);
    tiles.closeRunMessage();
  });
});
