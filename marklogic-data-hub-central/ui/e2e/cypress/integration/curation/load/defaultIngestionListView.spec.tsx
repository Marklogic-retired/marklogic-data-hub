import {Application} from "../../../support/application.config";
import {tiles, toolbar} from "../../../support/components/common";
import loadPage from "../../../support/pages/load";
import runPage from "../../../support/pages/run";
import LoginPage from "../../../support/pages/login";

let stepName = "cyListView";
let flowName = "e2eFlow";
let flowName2 = "e2eFlow2";

describe("Validate CRUD functionality from list view", () => {
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
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Verify Cancel", () => {
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => loadPage.stepName("ingestion-step").should("be.visible"));
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
    loadPage.saveButton().click();
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
    loadPage.switchEditAdvanced().click();  // Advanced tab
    loadPage.selectTargetDB("FINAL");
    loadPage.targetCollectionInput().type("e2eTestCollection{enter}test1{enter}test2{enter}");
    cy.findByText("Default Collections").click();
    loadPage.defaultCollections(stepName).should("be.visible");
    loadPage.appendTargetPermissions("data-hub-common,update");
    loadPage.selectProvGranularity("Off");
    loadPage.setBatchSize("200");
    //Header JSON error
    cy.get("#headers").clear().type("{").tab();
    loadPage.jsonValidateError().should("be.visible");
    cy.findByTestId(`${stepName}-save-settings`).should("be.disabled"); // Errors disable save button
    loadPage.setHeaderContent("loadTile/headerContent");
    //Interceptors JSON error
    cy.findByText("Interceptors").click();
    cy.get("#interceptors").clear().type("[\"test\": \"fail\"]").tab();
    loadPage.jsonValidateError().should("be.visible");
    cy.findByText("Interceptors").click(); //closing the interceptor text area
    loadPage.setStepInterceptor("loadTile/stepInterceptor");
    //Custom Hook JSON error
    cy.findByText("Custom Hook").click();
    cy.get("#customHook").clear().type("{test}", {parseSpecialCharSequences: false}).tab();
    loadPage.jsonValidateError().should("be.visible");
    cy.findByText("Custom Hook").click(); //closing the custom hook text area
    loadPage.setCustomHook("loadTile/customHook");
    loadPage.cancelSettings(stepName).click();
    loadPage.confirmationOptions("No").click();
    cy.waitUntil(() => loadPage.saveSettings(stepName)).click({force: true});
    cy.waitForAsyncRequest();
    loadPage.stepName(stepName).should("be.visible");
  });
  it("Open settings, change setting, switch tabs, save", () => {
    loadPage.stepName(stepName).click();
    loadPage.stepDescriptionInput().clear().type("UPDATE2");
    loadPage.switchEditAdvanced().click();
    cy.waitUntil(() => loadPage.saveSettings(stepName)).click({force: true});
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
    // Verify that change was NOT saved.
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
    //should route user back to load page list view
    cy.waitUntil(() => loadPage.addNewButton("list").should("be.visible"));
  });
  // NOTE Moved testing of adding step to a new flow and running the step to RTL unit tests
  // SEE https://project.marklogic.com/jira/browse/DHFPROD-7109
  it("Create a new flow and navigate back to load step", () => {
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.waitUntil(() => runPage.getFlowName("personJSON").should("be.visible"));
    runPage.createFlowButton().click();
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName(flowName);
    loadPage.confirmationOptions("Save").click();
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    loadPage.loadView("table").click();
    cy.waitUntil(() => loadPage.addNewButton("list").should("be.visible"));
  });
  it("Verify Run in an existing flow", {defaultCommandTimeout: 120000}, () => {
    loadPage.loadView("table").click();
    loadPage.runStep(stepName).click();
    loadPage.runStepSelectFlowConfirmation().should("be.visible");
    loadPage.selectFlowToRunIn(flowName);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Load", stepName, flowName);
    //Upload file to start running, test with invalid input
    cy.uploadFile("input/test-1.json");
    cy.verifyStepRunResult("success", "Ingestion", stepName);
    tiles.closeRunMessage();
  });
  it("Delete the flow", () => {
    runPage.deleteFlow(flowName).click();
    runPage.deleteFlowConfirmationMessage(flowName).should("be.visible");
    loadPage.confirmationOptions("Yes").click();
    cy.wait(1000);
    runPage.getFlowName(flowName).should("not.exist");
  });
  // NOTE Moved testing of adding step to a new flow and running the step to RTL unit tests
  // SEE https://project.marklogic.com/jira/browse/DHFPROD-7109
  it("Verify Run in Flow popup, create new flow and add step", {defaultCommandTimeout: 120000}, () => {
    // check Run in Flow popup
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    loadPage.loadView("table").click();
    loadPage.runStep(stepName).click();
    // Just deleted flow should not be visible on flows list
    cy.findByText(flowName).should("not.exist");
    // cancel (instead of letting run)
    loadPage.cancelButton().click({force: true});
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    runPage.createFlowButton().click();
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    cy.wait(500);
    loadPage.confirmationOptions("Save").click();
    // add step to that new flow
    runPage.addStep(flowName);
    runPage.addStepToFlow(stepName);
    runPage.verifyStepInFlow("Load", stepName, flowName);
    cy.wait(500);
  });

  it("Verify Run Load step in flow where step exists, should run automatically", {defaultCommandTimeout: 120000}, () => {
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    loadPage.loadView("table").click();
    loadPage.runStep(stepName).click();
    loadPage.runStepExistsOneFlowConfirmation().should("be.visible");
    loadPage.confirmContinueRun();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Load", stepName, flowName);
    cy.uploadFile("input/test-1.json");
    cy.verifyStepRunResult("success", "Ingestion", stepName);
    tiles.closeRunMessage();
  });
  it("Add step to a new flow and Verify Run Load step where step exists in multiple flows", {defaultCommandTimeout: 120000}, () => {
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    loadPage.loadView("table").click();
    loadPage.addStepToNewFlowListView(stepName);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName2);
    runPage.setFlowDescription(`${flowName2} description`);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Load", stepName, flowName2);
    //Verify Run Load step where step exists in multiple flows, choose one to automatically run in
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    loadPage.loadView("table").click();
    loadPage.runStep(stepName).click();
    loadPage.runStepExistsMultFlowsConfirmation().should("be.visible");
    loadPage.selectFlowToRunIn(flowName);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Load", stepName, flowName);
    cy.uploadFile("input/test-1.json");
    cy.verifyStepRunResult("success", "Ingestion", stepName);
    tiles.closeRunMessage();
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
    //Verify Delete
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    loadPage.loadView("table").click();
    loadPage.deleteStep(stepName).click();
    loadPage.confirmationOptions("No").click();
    cy.waitForAsyncRequest();
    loadPage.stepName(stepName).should("be.visible");
    loadPage.deleteStep(stepName).click();
    cy.waitUntil(() => loadPage.confirmationOptions("Yes")).click();
    cy.waitForAsyncRequest();
    loadPage.stepName(stepName).should("not.exist");
  });
});
