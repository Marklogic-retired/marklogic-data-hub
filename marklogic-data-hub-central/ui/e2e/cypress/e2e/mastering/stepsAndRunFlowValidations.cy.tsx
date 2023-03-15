import {Application} from "../../support/application.config";
import loadPage from "../../support/pages/load";
import runPage from "../../support/pages/run";
import LoginPage from "../../support/pages/login";
import {
  entityTypeModal,
  entityTypeTable,
  propertyModal,
  propertyTable,
} from "../../support/components/model/index";
import modelPage from "../../support/pages/model";
import {confirmationModal, createEditStepDialog, toolbar} from "../../support/components/common/index";
import {ConfirmationType} from "../../support/types/modeling-types";
import curatePage from "../../support/pages/curate";
import {
  createEditMappingDialog,
  mappingStepDetail
} from "../../support/components/mapping/index";
import browsePage from "../../support/pages/browse";

const loadStepName = "loadAgent";
const flowName1 = "testFlows1";
const flowName2 = "testFlows2";
const flowName3 = "testFlows3";
const flowName4 = "testFlows4";
const mapStep = "agentMap";
const matchStep = "agentMatch";
const mergeStep = "agentMerge";


describe("Validate the scenarios when the steps are added in different flows", () => {

  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
  });
  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("ingestion", "loadAgent");
    cy.deleteSteps("mapping", "agentMap");
    cy.deleteSteps("matching", "agentMatch");
    cy.deleteSteps("merging", "agentMerge");
    cy.deleteFlows(flowName1, flowName2, flowName3, flowName4);
    cy.deleteEntities("Agent");
    cy.deleteRecordsInFinal("loadAgent", "agentMap", "agentMatch", "agentMerge");
    cy.deleteRecordsInFinal("sm-Agent-archived", "sm-Agent-mastered", "sm-Agent-merged", "sm-Agent-auditing", "sm-Agent-notification");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Create Client load Step", () => {
    toolbar.getLoadToolbarIcon().click({force: true});
    cy.waitForAsyncRequest();
    loadPage.stepName("ingestion-step").should("be.visible");
    loadPage.loadView("th-large").click();
    loadPage.addNewButton("card").click();
    loadPage.stepNameInput().clear().type(loadStepName);
    loadPage.saveButton().click();
    cy.findByText(loadStepName).should("be.visible");
  });
  it("Add Client load Step to New Flow", {defaultCommandTimeout: 120000}, () => {
    loadPage.addStepToNewFlow(loadStepName);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName1);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
    runPage.toggleFlowAccordion(flowName1);
    cy.verifyStepAddedToFlow("Loading", loadStepName, flowName1);
    runPage.runStep(loadStepName, flowName1);
    cy.get("input[type=\"file\"]").attachFile(["agents/agent1.json", "agents/agent2.json", "agents/agent3.json"], {force: true});
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    runPage.verifyFlowModalCompleted(flowName1);
    runPage.verifyStepRunResult(loadStepName, "success");
    runPage.closeFlowStatusModal(flowName1);
  });
  it("Create Client entity and Add properties", {defaultCommandTimeout: 120000}, () => {
    toolbar.getModelToolbarIcon().should("be.visible").click();
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    modelPage.getAddButton().click();
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});
    entityTypeModal.newEntityName("Agent");
    entityTypeModal.getAddButton().click();
    cy.waitForAsyncRequest();
    // Add properties
    propertyTable.getAddPropertyButton("Agent").should("be.visible").click();
    propertyModal.newPropertyName("Name");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getAddPropertyButton("Agent").should("be.visible").click();
    propertyModal.newPropertyName("ID");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string").click();
    propertyModal.getSubmitButton().click();
    cy.wait(1000);
    modelPage.getPublishButton().click({force: true});
    confirmationModal.getYesButton(ConfirmationType.PublishAll);
    toolbar.getModelToolbarIcon().should("be.visible");
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
  });
  it("Create Client mapping step", () => {
    toolbar.getCurateToolbarIcon().click();
    cy.waitForAsyncRequest();
    curatePage.getEntityTypePanel("Agent").should("be.visible");
    curatePage.toggleEntityTypeId("Agent");
    curatePage.addNewStep("Agent").click();
    createEditMappingDialog.setMappingName(mapStep);
    createEditMappingDialog.setCollectionInput(loadStepName);
    cy.get(`[aria-label="${loadStepName}"]`).click({force: true});
    cy.get(".rbt-input-main").should("have.value", loadStepName).then(() => { createEditMappingDialog.saveButton().click({force: true}); });
    cy.waitForAsyncRequest();
    curatePage.dataPresent().scrollIntoView().should("be.visible");
    curatePage.verifyStepDetailsOpen(mapStep);
  });
  it("Map source to Client entity", () => {
    mappingStepDetail.setXpathExpressionInput("Name", "Name");
    mappingStepDetail.setXpathExpressionInput("ID", "ID");
    mappingStepDetail.navigateUrisRight().click({force: true});
    mappingStepDetail.testMap().should("be.enabled");
    mappingStepDetail.expandEntity().click();
    mappingStepDetail.testMap().click({force: true});
    mappingStepDetail.goBackToCurateHomePage();
    cy.waitForAsyncRequest();
    curatePage.getEntityTypePanel("Agent").then(($ele) => {
      if ($ele.hasClass("accordion-button collapsed")) {
        cy.log("**Toggling Entity because it was closed.**");
        curatePage.toggleEntityTypeId("Agent");
      }
    });
  });
  it("Add Client map Step to New Flow", {defaultCommandTimeout: 120000}, () => {
    curatePage.addStepToNewFlow(mapStep);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName2);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
    runPage.runStep(mapStep, flowName2);
    cy.waitForAsyncRequest();
    runPage.verifyStepRunResult(mapStep, "success");
    runPage.closeFlowStatusModal(flowName2);
  });
  it("Create Client match step", () => {
    toolbar.getCurateToolbarIcon().click();
    cy.waitForAsyncRequest();
    curatePage.getEntityTypePanel("Agent").should("be.visible");
    curatePage.toggleEntityTypeId("Agent");
    curatePage.selectMatchTab("Agent");
    curatePage.addNewStep("Agent").should("be.visible").click();
    createEditStepDialog.stepNameInput().clear().type(matchStep);
    createEditStepDialog.stepDescriptionInput().clear().type("match agent step example", {timeout: 2000});
    createEditStepDialog.setCollectionInput(mapStep);
    cy.get(`[aria-label="${mapStep}"]`).click({force: true});
    cy.get(".rbt-input-main").should("have.value", mapStep).then(() => { createEditStepDialog.saveButton("matching").click(); });
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(matchStep);
  });
  it("Add Thresholds and rulesets by hitting API ", () => {
    cy.request({
      method: "PUT",
      url: `/api/steps/matching/${matchStep}`,
      body: {"batchSize": 100, "sourceDatabase": "data-hub-FINAL", "targetDatabase": "data-hub-FINAL", "targetEntityType": "Agent", "sourceQuery": "cts.collectionQuery(['agentMap'])", "collections": ["agentMatch"], "permissions": "data-hub-common,read,data-hub-common,update", "targetFormat": "JSON", "matchRulesets": [{"name": "ID - Exact", "weight": 20, "reduce": false, "matchRules": [{"entityPropertyPath": "ID", "matchType": "exact", "options": {}}]}], "thresholds": [{"thresholdName": "Match", "action": "merge", "score": 19}], "name": "agentMatch", "description": "match agent step example", "collection": "agentMap", "selectedSource": "collection", "additionalCollections": [], "headers": {}, "interceptors": [], "provenanceGranularityLevel": "off", "customHook": {}, "stepDefinitionName": "default-matching", "stepDefinitionType": "matching", "stepId": "agentMatch-matching", "acceptsBatch": true, "stepUpdate": false, "lastUpdated": "2021-09-20T14:55:49.007489-07:00"}
    }).then(response => {
      console.warn(`Match Step ${matchStep}: ${JSON.stringify(response.statusText)}`);
    });
  });
  it("Add Client match Step to New Flow", {defaultCommandTimeout: 120000}, () => {
    curatePage.addStepToNewFlow(matchStep);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName3);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
    runPage.runStep(matchStep, flowName3);
    cy.waitForAsyncRequest();
    runPage.verifyStepRunResult(matchStep, "success");
    runPage.closeFlowStatusModal(flowName3);
  });
  it("Create Client merge step ", () => {
    toolbar.getCurateToolbarIcon().click();
    cy.waitForAsyncRequest();
    curatePage.getEntityTypePanel("Agent").should("be.visible");
    curatePage.getEntityTypePanel("Agent").then(($ele) => {
      if ($ele.hasClass("accordion-button collapsed")) {
        cy.log("**Toggling Entity because it was closed.**");
        curatePage.toggleEntityTypeId("Agent");
      }
    });
    curatePage.selectMergeTab("Agent");
    curatePage.addNewStep("Agent").should("be.visible").click();
    createEditStepDialog.stepNameInput().clear().type(mergeStep, {timeout: 2000});
    createEditStepDialog.stepDescriptionInput().clear().type("merge agent step example", {timeout: 2000});
    createEditStepDialog.setCollectionInput(matchStep);
    cy.get(`[aria-label="${matchStep}"]`).click({force: true});
    cy.get(".rbt-input-main").should("have.value", matchStep).then(() => { createEditStepDialog.saveButton("merging").click(); });
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(mergeStep);
  });
  it("Add Client merge Step to New Flow", {defaultCommandTimeout: 120000}, () => {
    curatePage.addStepToNewFlow(mergeStep);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName4);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
    runPage.runStep(mergeStep, flowName4);
    cy.waitForAsyncRequest();
    runPage.verifyStepRunResult(mergeStep, "success");

    //Verify merged Data
    runPage.explorerLink(mergeStep).click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getTableView().click();
    browsePage.waitForHCTableToLoad();
    browsePage.getTotalDocuments().should("eq", 1);
  });
});
