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

describe("Add Merge step to a flow", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMergeTab("Customer");
  });
  afterEach(() => {
    cy.resetTestUser();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("merging", "mergeCustomerTest");
    cy.deleteFlows("mergeE2ETest", "mergeE2ETestRun");
  });
  const mergeStep = "mergeCustomerTest";
  const flowName1 = "mergeE2ETest";
  const flowName2 = "mergeE2ETestRun";
  it("Adding a Merge step to a new flow step", () => {
    //Creating a new merge step
    cy.waitUntil(() => curatePage.addNewStep()).click();
    createEditStepDialog.stepNameInput().type(mergeStep);
    createEditStepDialog.stepDescriptionInput().type("merge order step example");
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['${mergeStep}'])`);
    createEditStepDialog.setTimestampInput().type("/envelop/headers/createdOn");
    createEditStepDialog.saveButton("merging").click();
    curatePage.verifyStepNameIsVisible(mergeStep);
    //Add the step to new flow
    curatePage.addToNewFlow("Customer", mergeStep);
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName1);
    runPage.setFlowDescription(`${flowName1} description`);
    loadPage.confirmationOptions("Save").click();
    cy.verifyStepAddedToFlow("Merge", mergeStep);
    //Run the merge step
    runPage.runStep(mergeStep).click();
    cy.verifyStepRunResult("success", "Merging", mergeStep);
    tiles.closeRunMessage();
    //Delete the step
    runPage.deleteStep(mergeStep).click();
    loadPage.confirmationOptions("Yes").click();
  });
  it("Adding a Merge step to an existing flow step", () => {
    //Add the step to an existing flow
    curatePage.openExistingFlowDropdown("Customer", mergeStep);
    curatePage.getExistingFlowFromDropdown(flowName1).click();
    curatePage.addStepToFlowConfirmationMessage();
    curatePage.confirmAddStepToFlow(mergeStep, flowName1);
    cy.verifyStepAddedToFlow("Merge", mergeStep);
    //Step should automatically run
    runPage.runStep(mergeStep).click();
    cy.verifyStepRunResult("success", "Merging", mergeStep);
    tiles.closeRunMessage();
  });
  it("Adding a Merge step to a new flow step from Run Tile", () => {
    //Add the step to new flow from run tile
    curatePage.runStepInCardView(mergeStep).click();
    curatePage.runInNewFlow(mergeStep).click();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName2);
    runPage.setFlowDescription(`${flowName2} description`);
    loadPage.confirmationOptions("Save").click();
    cy.verifyStepAddedToFlow("Merge", mergeStep);
    //Step should automatically run
    cy.verifyStepRunResult("success", "Merging", mergeStep);
    tiles.closeRunMessage();
    //Delete the merge step
    runPage.deleteStep(mergeStep).click();
    loadPage.confirmationOptions("Yes").click();
  });
  it("Adding a Merge step to an existing flow step from Run Tile", () => {
    //Add the step to an existing flow
    curatePage.runStepInCardView(mergeStep).click();
    curatePage.runStepInExistingFlow(mergeStep, flowName2);
    curatePage.addStepToFlowRunConfirmationMessage();
    curatePage.confirmAddStepToFlow(mergeStep, flowName2);
    cy.verifyStepAddedToFlow("Merge", mergeStep);
    //Step should automatically run
    cy.verifyStepRunResult("success", "Merging", mergeStep);
    tiles.closeRunMessage();
  });
});
