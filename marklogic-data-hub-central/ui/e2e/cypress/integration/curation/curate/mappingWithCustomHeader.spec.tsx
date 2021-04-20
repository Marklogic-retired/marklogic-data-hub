import {Application} from "../../../support/application.config";
import {tiles, toolbar} from "../../../support/components/common";
import {
  advancedSettingsDialog,
  createEditMappingDialog,
  mappingStepDetail
} from "../../../support/components/mapping/index";
import loadPage from "../../../support/pages/load";
import browsePage from "../../../support/pages/browse";
import curatePage from "../../../support/pages/curate";
import runPage from "../../../support/pages/run";
import detailPage from "../../../support/pages/detail";
import LoginPage from "../../../support/pages/login";
import "cypress-wait-until";

const flowName = "orderCustomHeaderFlow";
const flowName2 = "orderE2eFlow";
const loadStep = "loadOrderCustomHeader";
const mapStep = "mapOrderCustomHeader";

describe("Create and verify load steps, map step and flows with a custom header", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer", "hub-central-load-writer").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer", "hub-central-load-writer").withRequest();
    cy.waitForAsyncRequest();
    cy.intercept("/api/jobs/**").as("getJobs");
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("ingestion", "loadOrderCustomHeader");
    cy.deleteSteps("mapping", "mapOrderCustomHeader");
    cy.deleteFlows("orderCustomHeaderFlow", "orderE2eFlow");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Create load step", () => {
    toolbar.getLoadToolbarIcon().click();
    cy.waitUntil(() => loadPage.stepName("ingestion-step").should("be.visible"));
    loadPage.addNewButton("card").click();
    loadPage.stepNameInput().type(loadStep);
    loadPage.stepDescriptionInput().type("load order with a custom header");
    loadPage.stepSourceNameInput().type("backup-ABC123");
    loadPage.confirmationOptions("Save").click();
    cy.findByText(loadStep).should("be.visible");
  });
  it("Edit load step and Run", {defaultCommandTimeout: 120000}, () => {
    // Open step settings and switch to Advanced tab
    loadPage.editStepInCardView(loadStep).click({force: true});
    loadPage.switchEditAdvanced().click();
    // add custom header to load step
    advancedSettingsDialog.setHeaderContent("loadTile/customHeader");
    advancedSettingsDialog.saveSettings(loadStep).click();
    advancedSettingsDialog.saveSettings(loadStep).should("not.be.exist");
    // add step to a new flow
    loadPage.addStepToNewFlow(loadStep);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    loadPage.confirmationOptions("Save").click();
    cy.verifyStepAddedToFlow("Load", loadStep, flowName);
    //Run the ingest with JSON
    cy.waitForAsyncRequest();
    runPage.runStep(loadStep);
    cy.uploadFile("input/10260.json");
    cy.waitForAsyncRequest();
    cy.wait("@getJobs").its("response.statusCode").should("eq", 200);
    cy.verifyStepRunResult("success", "Ingestion", loadStep);
    tiles.closeRunMessage();
  });
  it("Create mapping step", () => {
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    cy.waitUntil(() => curatePage.addNewStep().click());
    createEditMappingDialog.setMappingName(mapStep);
    createEditMappingDialog.setMappingDescription("An order mapping with custom header");
    createEditMappingDialog.setSourceRadio("Query");
    createEditMappingDialog.setQueryInput(`cts.collectionQuery(['${loadStep}'])`);
    createEditMappingDialog.saveButton().click({force: true});
    //verify that step details automatically opens after step creation
    curatePage.verifyStepDetailsOpen(mapStep);
    //Go back to curate homepage
    mappingStepDetail.goBackToCurateHomePage();
  });
  it("Edit Map step", () => {
    curatePage.toggleEntityTypeId("Order");
    // Open step settings and switch to Advanced tab
    cy.waitUntil(() => curatePage.editStep(mapStep).click({force: true}));
    curatePage.switchEditAdvanced().click();
    // add custom header
    advancedSettingsDialog.setHeaderContent("curateTile/customHeader");
    cy.waitUntil(() => advancedSettingsDialog.saveSettings(mapStep).click({force: true}));
    advancedSettingsDialog.saveSettings(mapStep).should("not.exist");
    // map source to entity
    curatePage.openMappingStepDetail("Order", mapStep);
    cy.waitUntil(() => mappingStepDetail.expandEntity());
    mappingStepDetail.setXpathExpressionInput("orderId", "OrderID");
    mappingStepDetail.setXpathExpressionInput("address", "/");
    mappingStepDetail.setXpathExpressionInput("city", "ShipCity");
    mappingStepDetail.setXpathExpressionInput("state", "ShipAddress");
    mappingStepDetail.setXpathExpressionInput("orderDetails", "/");
    mappingStepDetail.setXpathExpressionInput("productID", "OrderDetails/ProductID");
    mappingStepDetail.setXpathExpressionInput("unitPrice", "head(OrderDetails/UnitPrice)");
    mappingStepDetail.setXpathExpressionInput("quantity", "OrderDetails/Quantity");
    mappingStepDetail.setXpathExpressionInput("discount", "head(OrderDetails/Discount)");
    mappingStepDetail.setXpathExpressionInput("shipRegion", "ShipRegion");
    mappingStepDetail.setXpathExpressionInput("shippedDate", "ShippedDate");

    //Go back to curate homepage
    mappingStepDetail.goBackToCurateHomePage();
  });
  it("Add Map step to new flow and Run", {defaultCommandTimeout: 120000}, () => {
    curatePage.toggleEntityTypeId("Order");
    //Cancel add to new flow
    curatePage.addToNewFlow("Order", mapStep);
    cy.findByText("New Flow").should("be.visible");
    loadPage.confirmationOptions("Cancel").click();
    //should route user back to curate page
    cy.waitUntil(() => curatePage.getEntityTypePanel("Order").should("be.visible"));
    curatePage.openExistingFlowDropdown("Order", mapStep);
    curatePage.getExistingFlowFromDropdown(flowName).click();
    curatePage.addStepToFlowConfirmationMessage();
    curatePage.confirmAddStepToFlow(mapStep, flowName);
    cy.waitForAsyncRequest();
    runPage.runStep(mapStep);
    cy.wait("@getJobs").its("response.statusCode").should("eq", 200);
    cy.verifyStepRunResult("success", "Mapping", mapStep);
    tiles.closeRunMessage();
    runPage.deleteStep(mapStep).click();
    loadPage.confirmationOptions("Yes").click();
  });
  it("Add Map step to existing flow Run", {defaultCommandTimeout: 120000}, () => {
    //Verify Run Map step in an existing Flow
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    curatePage.runStepInCardView(mapStep).click();
    curatePage.runStepSelectFlowConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName);
    //Step should automatically run
    cy.wait("@getJobs").its("response.statusCode").should("eq", 200);
    cy.verifyStepRunResult("success", "Mapping", mapStep);
    tiles.closeRunMessage();
  });
  it("Delete the flow and Verify Run Map step in a new Flow", {defaultCommandTimeout: 120000}, () => {
    runPage.deleteFlow(flowName).click();
    runPage.deleteFlowConfirmationMessage(flowName).should("be.visible");
    loadPage.confirmationOptions("Yes").click();
    runPage.getFlowName(flowName).should("not.exist");
    //Verify Run Map step in a new Flow
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    curatePage.runStepInCardView(mapStep).click();
    //Just deleted flow should not be visible on flows list
    cy.findByText(flowName).should("not.exist");
    curatePage.runInNewFlow(mapStep).click({force: true});
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    loadPage.confirmationOptions("Save").click();
    //Step should automatically run
    cy.wait("@getJobs").its("response.statusCode").should("eq", 200);
    cy.verifyStepRunResult("success", "Mapping", mapStep);
    tiles.closeRunMessage();
  });
  it("Verify Run Map step in flow where step exists, should run automatically", {defaultCommandTimeout: 120000}, () => {
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    curatePage.runStepInCardView(mapStep).click();
    curatePage.runStepExistsOneFlowConfirmation().should("be.visible");
    curatePage.confirmContinueRun();
    cy.waitForAsyncRequest();
    cy.wait("@getJobs").its("response.statusCode").should("eq", 200);
    cy.waitUntil(() => runPage.getFlowName(flowName).should("be.visible"));
    cy.verifyStepRunResult("success", "Mapping", mapStep);
    tiles.closeRunMessage();
    cy.verifyStepAddedToFlow("Map", mapStep, flowName);
  });
  it("Add step to a new flow, Run Map step where step exists in multiple flows and explore data", {defaultCommandTimeout: 120000}, () => {
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    curatePage.addToNewFlow("Order", mapStep);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName2);
    runPage.setFlowDescription(`${flowName2} description`);
    cy.wait(500);
    loadPage.confirmationOptions("Save").click();
    cy.wait(500);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Map", mapStep, flowName2);
    //Verify Run Map step where step exists in multiple flows, choose one to automatically run in
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    curatePage.runStepInCardView(mapStep).click();
    curatePage.runStepExistsMultFlowsConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName);
    cy.waitForAsyncRequest();
    cy.wait("@getJobs").its("response.statusCode").should("eq", 200);
    cy.verifyStepAddedToFlow("Map", mapStep, flowName);
    cy.waitUntil(() => runPage.getFlowName(flowName).should("be.visible"));
    cy.verifyStepRunResult("success", "Mapping", mapStep);
    runPage.explorerLink().click();
    browsePage.getTableViewInstanceIcon().click();
    detailPage.getDocumentSource().should("contain", "backup-ABC123");
    detailPage.getDocumentTimestamp().should("not.exist");
    detailPage.getSourceView().click();
    cy.contains("accessLevel");
    cy.contains("999ABC");
  });
});