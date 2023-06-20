import {advancedSettings} from "../../../support/components/common/index";
import {toolbar} from "../../../support/components/common";
import loadPage from "../../../support/pages/load";
import runPage from "../../../support/pages/run";

let stepName = "cyCardView";
let flowName = "newE2eFlow";
let flowName1 = "newE2eFlow1";
let flowName2 = "newE2eFlow2";

describe("Validate CRUD functionality from card view and run in a flow", () => {
  before(() => {
    cy.loginAsTestUserWithRoles("hub-central-load-writer", "hub-central-flow-writer").withRequest();
    loadPage.navigate();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("ingestion", "cyCardView");
    cy.deleteSteps("ingestion", "TestLoad");
    cy.deleteFlows("newE2eFlow1", "newE2eFlow2");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Verify Load tile is visible after navigation", () => {
    cy.log("DHFPROD-8332: Every tile is getting rendered blank after navigation from Home");
    loadPage.getContainerTitle().should("be.visible");
  });

  it("Verify Cancel", () => {
    loadPage.navigate();
    loadPage.stepName("ingestion-step").should("be.visible");
    loadPage.loadView("th-large").click();
    loadPage.addNewButton("card").click();
    loadPage.stepNameInput().type(stepName);
    loadPage.stepDescriptionInput().type("cyTestDesc");
    loadPage.selectSourceFormat("TEXT");
    loadPage.selectTargetFormat("TEXT");
    loadPage.uriPrefixInput().type("/e2eLoad/");
    loadPage.cancelButton().click();
    cy.findByText("Discard changes?").should("be.visible");
    loadPage.confirmationOptions("No").click();
    loadPage.cancelButton().click();
    loadPage.confirmationOptions("Yes").click();
    cy.findByText(stepName).should("not.exist");
  });

  it("Verify Save", () => {
    loadPage.addNewButton("card").click();
    loadPage.stepNameInput().type(stepName);
    loadPage.stepDescriptionInput().type("cyTestDesc");
    loadPage.uriPrefixInput().type("/e2eJSON/");
    loadPage.saveButton().click();
    cy.findByText(stepName).should("be.visible");
  });

  it("Verify Edit", () => {
    loadPage.editStepInCardView(stepName).click();
    loadPage.stepNameInput().should("be.disabled");
    loadPage.stepDescriptionInput().clear().type("UPDATE");
    loadPage.saveButton().click();
    cy.waitForAsyncRequest();
    loadPage.stepName(stepName).should("be.visible");
  });

  it("Verify Advanced Settings and Error validations", () => {
    cy.waitForAsyncRequest();
    loadPage.editStepInCardView(stepName).click();
    loadPage.switchEditAdvanced().click();
    loadPage.selectTargetDB("STAGING");
    loadPage.targetCollectionInput().type("e2eTestCollection{enter}test1{enter}test2{enter}", {force: true});
    cy.findByText("Default Collections:").click();
    loadPage.defaultCollections(stepName).should("be.visible");
    loadPage.setTargetPermissions("data-hub-common,read,data-hub-common,update");
    advancedSettings.getProvGranularitySelectWrapper().click();
    advancedSettings.getProvGranularitySelectMenuList().find(`[data-testid="provOptions-Off"]`).click();
    loadPage.setBatchSize("200");
    cy.log("**Header JSON error**");
    cy.get("#headers").clear().type("{").blur();
    loadPage.jsonValidateError().should("be.visible");
    loadPage.setHeaderContent("loadTile/headerContent");
    cy.log("**Interceptors JSON error**");
    cy.findByText("Interceptors").click();
    cy.get("#interceptors").clear().type("[\"test\": \"fail\"]").blur();
    loadPage.jsonValidateError().should("be.visible");
    cy.findByText("Interceptors").click();
    loadPage.setStepInterceptor("");
    cy.log("**Custom Hook JSON error**");
    cy.findByText("Custom Hook").click();
    cy.get("#customHook").clear().type("{test}", {parseSpecialCharSequences: false}).blur();
    loadPage.jsonValidateError().should("be.visible");
    cy.findByText("Custom Hook").click();
    loadPage.setCustomHook("");
    loadPage.cancelSettings(stepName).click();
    loadPage.confirmationOptions("No").click();
    loadPage.saveSettings(stepName).click({force: true});
    cy.waitForAsyncRequest();
    loadPage.stepName(stepName).should("be.visible");
  });

  it("Cancel Add to New Flow", () => {
    loadPage.addStepToNewFlow(stepName);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    loadPage.confirmationOptions("Cancel").click();
    cy.waitForAsyncRequest();
    cy.log("**should route user back to load page card view**");
    loadPage.addNewButton("card").should("be.visible");
  });

  it("Verify Add to New Flow", () => {
    loadPage.addStepToNewFlow(stepName);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    cy.wait(500);
    loadPage.confirmationOptions("Save").click();
    cy.wait(500);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Loading", stepName, flowName);
  });

  it("Delete the step and Navigate back to load step", () => {
    runPage.deleteStep(stepName, flowName).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
    toolbar.getLoadToolbarIcon().click();
    loadPage.addNewButton("card").should("be.visible");
  });

  it("Verify Run Load step in an Existing Flow", {defaultCommandTimeout: 120000}, () => {
    loadPage.runStep(stepName).click();
    loadPage.runStepSelectFlowConfirmation().should("be.visible");
    loadPage.selectFlowToRunIn(flowName);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Loading", stepName, flowName);
    cy.log("**Upload file to start running, test with invalid input**");
    cy.uploadFile("input/test-1");
    runPage.verifyStepRunResult(stepName, "failure");
    runPage.closeFlowStatusModal(flowName);
  });

  it("Run the flow with JSON input", {defaultCommandTimeout: 120000}, () => {
    runPage.runStep(stepName, flowName);
    cy.uploadFile("input/test-1.json");
    runPage.verifyStepRunResult(stepName, "success");
    runPage.closeFlowStatusModal(flowName);
    runPage.deleteStep(stepName, flowName).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
    cy.log("**Delete the flow**");
    runPage.deleteFlow(flowName).click();
    runPage.deleteFlowConfirmationMessage(flowName).should("be.visible");
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
    cy.wait(500);
    runPage.isFlowNotVisible(flowName);
    cy.wait(1000);
  });

  it("Verify Run Load step in a New Flow", {defaultCommandTimeout: 120000}, () => {
    loadPage.navigate();
    loadPage.addNewButton("card").should("be.visible");
    loadPage.runStep(stepName).click();
    cy.log("**Just deleted flow should not be visible on flows list**");
    cy.findByText(flowName).should("not.exist");
    loadPage.confirmationOptions("Close").click();
    runPage.navigate();
    runPage.createFlowButton().click();
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName(flowName1);
    runPage.setFlowDescription(`${flowName1} description`);
    cy.wait(500);
    loadPage.confirmationOptions("Save").click();
    cy.wait(2000);
    cy.log("**Add step to that new flow**");
    runPage.addStep(flowName1);
    cy.wait(1000);
    runPage.addStepToFlow(stepName);
    cy.wait(1000);
    runPage.runStep(stepName, flowName1);
    cy.uploadFile("input/test-1.json");
    cy.waitForAsyncRequest();
    runPage.verifyStepRunResult(stepName, "success");
    runPage.closeFlowStatusModal(flowName1);
  });

  it("Verify Run Load step in a New Flow and use a name that already exists", () => {
    loadPage.navigate();
    cy.waitForAsyncRequest();
    loadPage.addNewButton("card").click();
    loadPage.stepNameInput().type("TestLoad");
    loadPage.saveButton().click();
    loadPage.runStep("TestLoad").click();
    loadPage.newFlow().click();
    runPage.newFlowModal().should("be.visible");
    cy.waitForAsyncRequest();
    runPage.setFlowName("personJSON");
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
    cy.findByTestId("flowAlreadyExists").should("exist");
    runPage.confirmModalError().click();
    runPage.closeModalNewFlow().click();
  });

  it("Verify Run Load step in flow where step exists, should run automatically", {defaultCommandTimeout: 120000}, () => {
    loadPage.navigate();
    loadPage.addNewButton("card").should("be.visible");
    loadPage.runStep(stepName).click();
    loadPage.runStepExistsOneFlowConfirmation().should("be.visible");
    loadPage.confirmContinueRun();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Loading", stepName, flowName1);
    cy.uploadFile("input/test-1.json");
    runPage.verifyStepRunResult(stepName, "success");
    runPage.closeFlowStatusModal(flowName1);
  });

  it("Add step to a new flow and Verify Run Load step where step exists in multiple flows", {defaultCommandTimeout: 120000}, () => {
    loadPage.navigate();
    loadPage.addNewButton("card").should("be.visible");
    loadPage.addStepToNewFlow(stepName);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName2);
    runPage.setFlowDescription(`${flowName2} description`);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Loading", stepName, flowName2);
    cy.log("**Verify Run Load step where step exists in multiple flows, choose one to automatically run in**");
    loadPage.navigate();
    loadPage.addNewButton("card").should("be.visible");
    loadPage.runStep(stepName).click();
    loadPage.runStepExistsMultFlowsConfirmation().should("be.visible");
    loadPage.selectFlowToRunIn(flowName1);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Loading", stepName, flowName1);
    cy.uploadFile("input/test-1.json");

    runPage.verifyStepRunResult(stepName, "success");
    runPage.closeFlowStatusModal(flowName1);
  });

  it("Delete the step and Navigate back to load step", () => {
    runPage.deleteStep(stepName, flowName1).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
    loadPage.navigate();
    loadPage.addNewButton("card").should("be.visible");
  });

  it("Verify Add to Existing Flow after changing source/target format to TEXT", {defaultCommandTimeout: 120000}, () => {
    loadPage.loadView("th-large").click();
    loadPage.editStepInCardView(stepName).click();
    loadPage.selectSourceFormat("TEXT");
    loadPage.selectTargetFormat("TEXT");
    cy.wait(2000);
    loadPage.saveButton().click();
    cy.wait(2000);
    cy.waitForAsyncRequest();
    loadPage.stepName(stepName).should("be.visible");
    loadPage.addStepToExistingFlow(stepName, flowName1);
    loadPage.addStepToFlowConfirmationMessage().should("be.visible");
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Loading", stepName, flowName1);
    cy.log("**Run the flow with TEXT input**");
    runPage.runLastStepInAFlow(stepName);
    cy.uploadFile("input/test-1.txt");
    runPage.verifyStepRunResult(stepName, "success");
    runPage.closeFlowStatusModal(flowName1);
  });
});
