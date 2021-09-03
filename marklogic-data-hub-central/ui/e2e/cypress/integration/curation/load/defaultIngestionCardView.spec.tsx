import {Application} from "../../../support/application.config";
import {tiles, toolbar} from "../../../support/components/common";
import loadPage from "../../../support/pages/load";
import runPage from "../../../support/pages/run";
import LoginPage from "../../../support/pages/login";

let stepName = "cyCardView";
let flowName= "newE2eFlow";
let flowName1= "newE2eFlow1";
let flowName2 = "newE2eFlow2";

describe("Validate CRUD functionality from card view and run in a flow", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-load-writer", "hub-central-flow-writer").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-load-writer", "hub-central-flow-writer").withRequest();
    cy.waitForAsyncRequest();
    cy.intercept("/api/jobs/**").as("getJobs");
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("ingestion", "cyCardView");
    cy.deleteFlows("newE2eFlow1", "newE2eFlow2");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Verify Cancel", () => {
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => loadPage.stepName("ingestion-step").should("be.visible"));
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
    loadPage.switchEditAdvanced().click(); // Advanced tab
    loadPage.selectTargetDB("STAGING");
    loadPage.targetCollectionInput().type("e2eTestCollection{enter}test1{enter}test2{enter}");
    cy.findByText("Default Collections").click();
    loadPage.defaultCollections(stepName).should("be.visible");
    loadPage.setTargetPermissions("data-hub-common,read,data-hub-common,update");
    loadPage.selectProvGranularity("Off");
    loadPage.setBatchSize("200");
    //Header JSON error
    cy.get("#headers").clear().type("{").tab({force: true});
    loadPage.jsonValidateError().should("be.visible");
    loadPage.setHeaderContent("loadTile/headerContent");
    //Interceptors JSON error
    cy.findByText("Interceptors").click();
    cy.get("#interceptors").clear().type("[\"test\": \"fail\"]").tab();
    loadPage.jsonValidateError().should("be.visible");
    cy.findByText("Interceptors").click(); //closing the interceptor text area
    loadPage.setStepInterceptor("");
    //Custom Hook JSON error
    cy.findByText("Custom Hook").click();
    cy.get("#customHook").clear().type("{test}", {parseSpecialCharSequences: false}).tab();
    loadPage.jsonValidateError().should("be.visible");
    cy.findByText("Custom Hook").click(); //closing the custom hook text area
    loadPage.setCustomHook("");
    loadPage.cancelSettings(stepName).click();
    loadPage.confirmationOptions("No").click();
    cy.waitUntil(() => loadPage.saveSettings(stepName)).click({force: true});
    cy.waitForAsyncRequest();
    loadPage.stepName(stepName).should("be.visible");
  });
  it("Cancel Add to New Flow", () => {
    loadPage.addStepToNewFlow(stepName);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    loadPage.confirmationOptions("Cancel").click();
    cy.waitForAsyncRequest();
    //should route user back to load page card view
    cy.waitUntil(() => loadPage.addNewButton("card").should("be.visible"));
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
    cy.verifyStepAddedToFlow("Load", stepName, flowName);
  });
  it("Delete the step and Navigate back to load step", () => {
    runPage.deleteStep(stepName, flowName).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => loadPage.addNewButton("card").should("be.visible"));
  });
  it("Verify Run Load step in an Existing Flow", {defaultCommandTimeout: 120000}, () => {
    loadPage.runStep(stepName).click();
    loadPage.runStepSelectFlowConfirmation().should("be.visible");
    loadPage.selectFlowToRunIn(flowName);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Load", stepName, flowName);
    //Upload file to start running, test with invalid input
    cy.uploadFile("input/test-1");
    cy.verifyStepRunResult("failed", "Ingestion", stepName)
      .should("contain.text", "Document is not JSON");
    tiles.closeRunMessage();
  });
  it("Run the flow with JSON input", {defaultCommandTimeout: 120000}, () => {
    runPage.runStep(stepName, flowName);
    cy.uploadFile("input/test-1.json");
    cy.verifyStepRunResult("success", "Ingestion", stepName);
    tiles.closeRunMessage();
    runPage.deleteStep(stepName, flowName).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
    //Delete the flow
    runPage.deleteFlow(flowName).click();
    runPage.deleteFlowConfirmationMessage(flowName).should("be.visible");
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
    runPage.getFlowName(flowName).should("not.exist");
    cy.wait(1000);
  });
  it("Verify Run Load step in a New Flow", {defaultCommandTimeout: 120000}, () => {
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click({force: true});
    cy.waitUntil(() => loadPage.addNewButton("card").should("be.visible"));
    loadPage.runStep(stepName).click();
    //Just deleted flow should not be visible on flows list
    cy.findByText(flowName).should("not.exist");
    loadPage.confirmationOptions("Close").click();
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    runPage.createFlowButton().click();
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName(flowName1);
    runPage.setFlowDescription(`${flowName1} description`);
    cy.wait(500);
    loadPage.confirmationOptions("Save").click();
    cy.wait(2000);
    // add step to that new flow
    runPage.addStep(flowName1);
    cy.wait(1000);
    runPage.addStepToFlow(stepName);
    runPage.runStep(stepName, flowName1);
    cy.uploadFile("input/test-1.json");
    cy.waitForAsyncRequest();
    cy.verifyStepRunResult("success", "Ingestion", stepName);
    tiles.closeRunMessage();
  });
  it("Verify Run Load step in flow where step exists, should run automatically", {defaultCommandTimeout: 120000}, () => {
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => loadPage.addNewButton("card").should("be.visible"));
    loadPage.runStep(stepName).click();
    loadPage.runStepExistsOneFlowConfirmation().should("be.visible");
    loadPage.confirmContinueRun();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Load", stepName, flowName1);
    cy.uploadFile("input/test-1.json");
    cy.verifyStepRunResult("success", "Ingestion", stepName);
    tiles.closeRunMessage();
  });
  it("add step to a new flow and Verify Run Load step where step exists in multiple flows", {defaultCommandTimeout: 120000}, () => {
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => loadPage.addNewButton("card").should("be.visible"));
    loadPage.addStepToNewFlow(stepName);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName2);
    runPage.setFlowDescription(`${flowName2} description`);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Load", stepName, flowName2);
    //Verify Run Load step where step exists in multiple flows, choose one to automatically run in
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => loadPage.addNewButton("card").should("be.visible"));
    loadPage.runStep(stepName).click();
    loadPage.runStepExistsMultFlowsConfirmation().should("be.visible");
    loadPage.selectFlowToRunIn(flowName1);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Load", stepName, flowName1);
    cy.uploadFile("input/test-1.json");
    cy.verifyStepRunResult("success", "Ingestion", stepName);
    tiles.closeRunMessage();
  });
  it("Delete the step and Navigate back to load step", () => {
    runPage.deleteStep(stepName, flowName1).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => loadPage.addNewButton("card").should("be.visible"));
  });
  it("Verify Add to Existing Flow after changing source/target format to TEXT", {defaultCommandTimeout: 120000}, () => {
    loadPage.loadView("th-large").click();
    loadPage.editStepInCardView(stepName).click();
    loadPage.selectSourceFormat("TEXT");
    loadPage.selectTargetFormat("TEXT");
    loadPage.saveButton().click();
    cy.wait(2000);
    cy.waitForAsyncRequest();
    loadPage.stepName(stepName).should("be.visible");
    loadPage.addStepToExistingFlow(stepName, flowName1);
    loadPage.addStepToFlowConfirmationMessage().should("be.visible");
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Load", stepName, flowName1);
    //Run the flow with TEXT input
    runPage.runLastStepInAFlow(stepName);
    cy.uploadFile("input/test-1.txt");
    cy.verifyStepRunResult("success", "Ingestion", stepName);
    tiles.closeRunMessage();
  });
});