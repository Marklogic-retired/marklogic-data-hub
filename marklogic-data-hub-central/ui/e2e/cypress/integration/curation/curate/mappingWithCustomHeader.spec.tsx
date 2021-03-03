import {Application} from "../../../support/application.config";
import {tiles, toolbar} from "../../../support/components/common";
import {
  advancedSettingsDialog,
  createEditMappingDialog,
  sourceToEntityMap
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
  it("Edit load step and Run", () => {
    // Open step settings and switch to Advanced tab
    loadPage.editStepInCardView(loadStep).click({force: true});
    loadPage.switchEditAdvanced().click();
    // add custom header to load step
    advancedSettingsDialog.setHeaderContent("loadTile/customHeader");
    advancedSettingsDialog.saveSettings(loadStep).click();
    advancedSettingsDialog.saveSettings(loadStep).should("not.be.exist");
    // add step to a new flow
    loadPage.addStepToNewFlow(loadStep);
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    loadPage.confirmationOptions("Save").click();
    cy.verifyStepAddedToFlow("Load", loadStep);
    //Run the ingest with JSON
    cy.waitForAsyncRequest();
    runPage.runStep(loadStep);
    cy.uploadFile("input/10260.json");
    cy.waitForAsyncRequest();
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
    //close modal
    cy.get("body").type("{esc}");
    curatePage.verifyStepNameIsVisible(mapStep);
  });
  it("Edit Map step", () => {
    // Open step settings and switch to Advanced tab
    cy.waitUntil(() => curatePage.editStep(mapStep).click({force: true}));
    curatePage.switchEditAdvanced().click();
    // add custom header
    advancedSettingsDialog.setHeaderContent("curateTile/customHeader");
    cy.waitUntil(() => advancedSettingsDialog.saveSettings(mapStep).click({force: true}));
    advancedSettingsDialog.saveSettings(mapStep).should("not.exist");
    // map source to entity
    curatePage.openSourceToEntityMap("Order", mapStep);
    cy.waitUntil(() => sourceToEntityMap.expandCollapseEntity().should("be.visible")).click();
    sourceToEntityMap.setXpathExpressionInput("orderId", "OrderID");
    sourceToEntityMap.setXpathExpressionInput("address", "/");
    sourceToEntityMap.setXpathExpressionInput("city", "ShipCity");
    sourceToEntityMap.setXpathExpressionInput("state", "ShipAddress");
    sourceToEntityMap.setXpathExpressionInput("orderDetails", "/");
    sourceToEntityMap.setXpathExpressionInput("productID", "OrderDetails/ProductID");
    sourceToEntityMap.setXpathExpressionInput("unitPrice", "head(OrderDetails/UnitPrice)");
    sourceToEntityMap.setXpathExpressionInput("quantity", "OrderDetails/Quantity");
    sourceToEntityMap.setXpathExpressionInput("discount", "head(OrderDetails/Discount)");
    sourceToEntityMap.setXpathExpressionInput("shipRegion", "ShipRegion");
    sourceToEntityMap.setXpathExpressionInput("shippedDate", "ShippedDate");
    // close modal
    cy.get("body").type("{esc}");
  });
  it("Add Map step to new flow and Run", () => {
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
    cy.verifyStepRunResult("success", "Mapping", mapStep);
    tiles.closeRunMessage();
    runPage.deleteStep(mapStep).click();
    loadPage.confirmationOptions("Yes").click();
  });
  it("Add Map step to existing flow Run", () => {
    //Verify Run Map step in an existing Flow
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    curatePage.runStepInCardView(mapStep).click();
    curatePage.runStepSelectFlowConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName);
    //Step should automatically run
    cy.verifyStepRunResult("success", "Mapping", mapStep);
    tiles.closeRunMessage();
  });
  it("Delete the flow and Verify Run Map step in a new Flow", () => {
    runPage.deleteFlow(flowName).click();
    runPage.deleteFlowConfirmationMessage(flowName).should("be.visible");
    loadPage.confirmationOptions("Yes").click();
    runPage.getFlowName(flowName).should("not.be.visible");
    //Verify Run Map step in a new Flow
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    curatePage.runStepInCardView(mapStep).click();
    //Just deleted flow should not be visible on flows list
    cy.findByText(flowName).should("not.be.visible");
    curatePage.runInNewFlow(mapStep).click({force: true});
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    loadPage.confirmationOptions("Save").click();
    //Step should automatically run
    cy.verifyStepRunResult("success", "Mapping", mapStep);
    tiles.closeRunMessage();
  });
  it("Verify Run Map step in flow where step exists, should run automatically", () => {
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    curatePage.runStepInCardView(mapStep).click();
    curatePage.runStepExistsOneFlowConfirmation().should("be.visible");
    curatePage.confirmContinueRun();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Map", mapStep);
    cy.waitUntil(() => runPage.getFlowName(flowName).should("be.visible"));
    cy.verifyStepRunResult("success", "Mapping", mapStep);
    tiles.closeRunMessage();
  });
  it("Add step to a new flow, Run Map step where step exists in multiple flows and explore data", () => {
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    curatePage.addToNewFlow("Order", mapStep);
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName2);
    runPage.setFlowDescription(`${flowName2} description`);
    loadPage.confirmationOptions("Save").click();
    cy.verifyStepAddedToFlow("Map", mapStep);
    //Verify Run Map step where step exists in multiple flows, choose one to automatically run in
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    curatePage.runStepInCardView(mapStep).click();
    curatePage.runStepExistsMultFlowsConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Map", mapStep);
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