import {advancedSettings} from "../../../support/components/common/index";
import loadPage from "../../../support/pages/load";
import runPage from "../../../support/pages/run";

let stepName = "cyListView";
let flowName = "e2eFlow";
let flowName2 = "e2eFlow2";

describe("Validate CRUD functionality from list view", () => {
  before(() => {
    cy.loginAsTestUserWithRoles("hub-central-load-writer", "hub-central-flow-writer").withRequest();
    loadPage.navigate();
  });

  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Verify Cancel", () => {
    loadPage.stepName("ingestion-step").should("be.visible");
    loadPage.loadView("table").click();
    loadPage.addNewButton("list").click();
    loadPage.stepNameInput().type(stepName);
    loadPage.stepDescriptionInput().type("cyTestDesc");
    loadPage.selectSourceFormat("XML");
    loadPage.selectTargetFormat("XML");
    loadPage.uriPrefixInput().type("/e2eLoad/");
    loadPage.cancelButton().click();
    cy.findByText("Discard changes?").should("be.visible");
    loadPage.confirmationOptions("No").click();
    loadPage.cancelButton().click({force: true});
    loadPage.confirmationOptions("Yes").click();
    cy.findByText(stepName).should("not.exist");
  });

  it("Verify Save", () => {
    loadPage.addNewButton("list").click();
    loadPage.stepNameInput().type(stepName);
    loadPage.stepDescriptionInput().type("cyTestDesc");
    loadPage.selectSourceFormat("XML");
    loadPage.selectTargetFormat("XML");
    loadPage.uriPrefixInput().type("/e2eLoad/");
    loadPage.saveButton().should("be.visible").click();
    cy.findByText(stepName).should("be.visible");
  });

  it("Verify Edit", () => {
    loadPage.stepName(stepName).click();
    loadPage.stepNameInput().should("be.disabled");
    loadPage.stepDescriptionInput().clear().type("UPDATED");
    loadPage.saveButton().click();
    cy.waitForAsyncRequest();
    cy.findByText("UPDATED").should("be.visible");
  });

  it("Verify Advanced Settings and Error validations", () => {
    loadPage.stepName(stepName).click();
    loadPage.switchEditAdvanced().click();
    loadPage.selectTargetDB("FINAL");
    loadPage.targetCollectionInput().type("e2eTestCollection{enter}test1{enter}test2{enter}", {force: true});
    cy.findByText("Default Collections:").click();
    loadPage.defaultCollections(stepName).should("be.visible");
    loadPage.appendTargetPermissions("data-hub-common,update");
    cy.log("**click on provGranularity and choise off**");
    advancedSettings.getProvGranularitySelectWrapper().click();
    advancedSettings.getProvGranularitySelectMenuList().find(`[data-testid="provOptions-Off"]`).click();
    loadPage.setBatchSize("200");
    cy.log("**Header JSON error**");
    cy.get("#headers").clear().type("{").blur();
    loadPage.jsonValidateError().should("be.visible");
    cy.findByTestId(`${stepName}-save-settings`).should("be.disabled");
    loadPage.setHeaderContent("loadTile/headerContent");
    cy.log("**Interceptors JSON error**");
    cy.findByText("Interceptors").click();
    cy.get("#interceptors").clear().type("[\"test\": \"fail\"]").blur();
    loadPage.jsonValidateError().should("be.visible");
    cy.findByText("Interceptors").click();
    loadPage.setStepInterceptor("loadTile/stepInterceptor");
    cy.log("**Custom Hook JSON error**");
    cy.findByText("Custom Hook").click();
    cy.get("#customHook").clear().type("{test}", {parseSpecialCharSequences: false}).blur();
    loadPage.jsonValidateError().should("be.visible");
    cy.findByText("Custom Hook").click();
    loadPage.setCustomHook("loadTile/customHook");
    loadPage.cancelSettings(stepName).click();
    loadPage.confirmationOptions("No").click();
    loadPage.saveSettings(stepName).click({force: true});
    cy.waitForAsyncRequest();
    loadPage.stepName(stepName).should("be.visible");
    loadPage.stepName(stepName).click();
    loadPage.stepDescriptionInput().clear().type("UPDATE2");
    loadPage.switchEditAdvanced().click();
    loadPage.saveSettings(stepName).click({force: true});
    cy.waitForAsyncRequest();
  });

  it("Verify that change was saved", () => {
    loadPage.stepName(stepName).click();
    loadPage.stepDescription("UPDATE2").should("be.visible");
    loadPage.cancelButton().click();
  });

  it("Open settings, change setting, switch tabs, cancel, discard changes", () => {
    loadPage.stepName(stepName).click();
    loadPage.stepDescriptionInput().clear().type("DISCARD");
    loadPage.switchEditAdvanced().click();
    cy.findByTestId(`${stepName}-cancel-settings`).click();
    cy.findByText("Discard changes?").should("be.visible");
    loadPage.confirmationOptions("Yes").click();
    cy.log("**Verify that change was NOT saved.**");
    loadPage.stepName(stepName).click();
    loadPage.stepDescription("UPDATE2").should("be.visible");
    loadPage.stepDescription("DISCARD").should("not.exist");
    loadPage.cancelButton().click();
  });

  it("Cancel Add to New Flow", () => {
    loadPage.addStepToNewFlowListView(stepName);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    loadPage.confirmationOptions("Cancel").click();
    cy.log("**should route user back to load page list view**");
    loadPage.addNewButton("list").should("be.visible");
  });

  it("Create a new flow and navigate back to load step", () => {
    runPage.navigate();
    runPage.getFlowName("personJSON").should("be.visible");
    runPage.createFlowButton().click();
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName(flowName);
    loadPage.confirmationOptions("Save").click();
    loadPage.navigate();
    loadPage.loadView("table").click();
    loadPage.addNewButton("list").should("be.visible");
  });

  it("Verify Run in an existing flow", {defaultCommandTimeout: 120000}, () => {
    loadPage.loadView("table").click();
    loadPage.runStep(stepName).click();
    loadPage.runStepSelectFlowConfirmation().should("be.visible");
    loadPage.selectFlowToRunIn(flowName);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Loading", stepName, flowName);

    cy.uploadFile("input/test-1.json");

    runPage.verifyStepRunResult(stepName, "success");

    cy.log("**only the load step should have run and not the other steps in flow**");
    runPage.verifyNoStepRunResult("mapPersonJSON", "success");
    runPage.verifyNoStepRunResult("match-person", "success");
    runPage.verifyNoStepRunResult("merge-person", "success");
    runPage.verifyNoStepRunResult("master-person", "success");

    runPage.closeFlowStatusModal(flowName);
  });

  it("Delete the flow", () => {
    runPage.deleteFlow(flowName).click();
    runPage.deleteFlowConfirmationMessage(flowName).should("be.visible");
    loadPage.confirmationOptions("Yes").click();
    cy.wait(1000);
    runPage.getFlowName(flowName).should("not.exist");
  });

  it("Verify Run in Flow popup, create new flow and add step", {defaultCommandTimeout: 120000}, () => {
    loadPage.navigate();
    loadPage.loadView("table").click();
    loadPage.runStep(stepName).click();
    cy.findByText(flowName).should("not.exist");

    cy.findByLabelText("Cancel").click({force: true});
    runPage.navigate();
    runPage.createFlowButton().click();
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    cy.wait(500);
    loadPage.confirmationOptions("Save").click();

    runPage.addStep(flowName);
    runPage.addStepToFlow(stepName);
    runPage.verifyStepInFlow("Loading", stepName, flowName);
    cy.wait(500);
  });

  it("Verify Run Load step in flow where step exists, should run automatically", {defaultCommandTimeout: 120000}, () => {
    loadPage.navigate();
    loadPage.loadView("table").click();
    loadPage.runStep(stepName).click();
    loadPage.runStepExistsOneFlowConfirmation().should("be.visible");
    loadPage.confirmContinueRun();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Loading", stepName, flowName);
    cy.uploadFile("input/test-1.json");
    runPage.verifyStepRunResult(stepName, "success");

    cy.log("**only the load step should have run and not the other steps in flow**");
    runPage.verifyNoStepRunResult("mapPersonJSON", "success");
    runPage.verifyNoStepRunResult("match-person", "success");
    runPage.verifyNoStepRunResult("merge-person", "success");
    runPage.verifyNoStepRunResult("master-person", "success");

    runPage.closeFlowStatusModal(flowName);
  });

  it("Add step to a new flow and Verify Run Load step where step exists in multiple flows", {defaultCommandTimeout: 120000}, () => {
    loadPage.navigate();
    loadPage.loadView("table").click();
    loadPage.addStepToNewFlowListView(stepName);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName2);
    runPage.setFlowDescription(`${flowName2} description`);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Loading", stepName, flowName2);
    loadPage.navigate();
    loadPage.loadView("table").click();
    loadPage.runStep(stepName).click();
    loadPage.runStepExistsMultFlowsConfirmation().should("be.visible");
    loadPage.selectFlowToRunIn(flowName);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Loading", stepName, flowName);
    cy.uploadFile("input/test-1.json");

    runPage.verifyStepRunResult(stepName, "success");
    runPage.closeFlowStatusModal(flowName);
  });

  it("Delete the flows and Verify Delete", () => {
    runPage.deleteFlow(flowName).click();
    runPage.deleteFlowConfirmationMessage(flowName).should("be.visible");
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
    cy.wait(1000);
    runPage.getFlowName(flowName).should("not.exist");
    runPage.deleteFlow(flowName2).click();
    runPage.deleteFlowConfirmationMessage(flowName2).should("be.visible");
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
    runPage.getFlowName(flowName2).should("not.exist");

    loadPage.navigate();
    loadPage.loadView("table").click();
    loadPage.deleteStep(stepName).click();
    loadPage.confirmationOptions("No").click();
    cy.waitForAsyncRequest();
    loadPage.stepName(stepName).should("be.visible");
    loadPage.deleteStep(stepName).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
    loadPage.stepName(stepName).should("not.exist");
  });
});
