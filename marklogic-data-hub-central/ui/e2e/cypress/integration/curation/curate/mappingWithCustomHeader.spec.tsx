import {Application} from "../../../support/application.config";
import {toolbar} from "../../../support/components/common";
import {
  advancedSettingsDialog,
  createEditMappingDialog,
  mappingStepDetail
} from "../../../support/components/mapping/index";
import loadPage from "../../../support/pages/load";
import browsePage from "../../../support/pages/browse";
import curatePage from "../../../support/pages/curate";
import runPage from "../../../support/pages/run";
import LoginPage from "../../../support/pages/login";
import detailPage from "../../../support/pages/detail";
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
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("ingestion", "loadOrderCustomHeader");
    cy.deleteSteps("mapping", "mapOrderCustomHeader");
    // TODO DHFPROD-7711 no need to delete "orderE2eFlow" due to skip below
    //cy.deleteFlows("orderCustomHeaderFlow", "orderE2eFlow");
    cy.deleteFlows("orderCustomHeaderFlow");
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

    loadPage.stepName(loadStep).should("be.visible");
    // add step to a new flow
    loadPage.addStepToNewFlow(loadStep);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    loadPage.confirmationOptions("Save").click();
    cy.verifyStepAddedToFlow("Loading", loadStep, flowName);
    //Run the ingest with JSON
    cy.waitForAsyncRequest();
    runPage.runStep(loadStep, flowName);
    cy.uploadFile("input/10260.json");
    cy.waitForAsyncRequest();
    runPage.verifyStepRunResult(loadStep, "success");
    runPage.closeFlowStatusModal(flowName);
  });
  it("Create mapping step", () => {
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    cy.waitUntil(() => curatePage.addNewStep("Order").click());
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
    browsePage.waitForSpinnerToDisappear();
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
    //mappingStepDetail.goBackToCurateHomePage();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Order").should("be.visible"));
    //curatePage.toggleEntityTypeId("Order");
    curatePage.openExistingFlowDropdownAndTooltip("Order", mapStep);
    curatePage.getExistingFlowFromDropdown(mapStep, flowName).click();
    curatePage.addStepToFlowConfirmationMessage();
    curatePage.confirmAddStepToFlow(mapStep, flowName);
    cy.waitForAsyncRequest();
    runPage.runStep(mapStep, flowName);
    runPage.verifyStepRunResult(mapStep, "success");
    runPage.closeFlowStatusModal(flowName);
    runPage.deleteStep(mapStep, flowName).click();
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
    runPage.verifyStepRunResult(mapStep, "success");
    runPage.closeFlowStatusModal(flowName);
  });
  it("Delete the flow and Verify Run Map step in a new Flow", {defaultCommandTimeout: 120000}, () => {
    runPage.deleteFlow(flowName).click();
    runPage.deleteFlowConfirmationMessage(flowName).should("be.visible");
    loadPage.confirmationOptions("Yes").click();
    cy.get("body").should("not.contain", flowName);
    //Verify Run Map step in a new Flow
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    curatePage.runStepInCardView(mapStep).click();
    //Just deleted flow should not be visible on flows list
    cy.findByText(flowName).should("not.exist");
    loadPage.confirmationOptions("Close").click();
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    runPage.createFlowButton().click();
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    cy.wait(500);
    loadPage.confirmationOptions("Save").click();
    cy.wait(500);
    cy.waitForAsyncRequest();
    cy.waitUntil(() => runPage.getFlowName(flowName).first().should("be.visible"));
    runPage.addStep(flowName);
    runPage.addStepToFlow(mapStep);
    cy.verifyStepAddedToFlow("Mapping", mapStep, flowName2);
    runPage.runStep(mapStep, flowName);
    runPage.verifyStepRunResult(mapStep, "success");
    runPage.closeFlowStatusModal(flowName);
  });
  it("Verify Run Map step in flow where step exists, should run automatically", {defaultCommandTimeout: 120000}, () => {
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    curatePage.runStepInCardView(mapStep).click();
    curatePage.runStepExistsOneFlowConfirmation().should("be.visible");
    curatePage.confirmContinueRun();
    cy.waitForAsyncRequest();
    runPage.getFlowName(flowName).first().should("be.visible");
    runPage.verifyStepRunResult(mapStep, "success");
    runPage.closeFlowStatusModal(flowName);
    cy.verifyStepAddedToFlow("Mapping", mapStep, flowName);
  });
  it("Add step to a new flow, Run Map step where step exists in multiple flows and explore data", {defaultCommandTimeout: 120000}, () => {
    toolbar.getCurateToolbarIcon().click({force: true});
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
    cy.verifyStepAddedToFlow("Mapping", mapStep, flowName2);
    //Verify Run Map step where step exists in multiple flows, choose one to automatically run in
    toolbar.getCurateToolbarIcon().click({force: true});
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    curatePage.runStepInCardView(mapStep).click();
    curatePage.runStepExistsMultFlowsConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Mapping", mapStep, flowName);
    runPage.getFlowStatusSuccess(flowName).should("be.visible");
    runPage.verifyStepRunResult(mapStep, "success");
    // Commented until DHFPROD-7477 is done
    runPage.explorerLink(mapStep).click();
    browsePage.getTableView().click();
    browsePage.waitForSpinnerToDisappear();
    cy.wait(3000);
    browsePage.getFirstTableViewInstanceIcon().should("be.visible").click({force: true});
    detailPage.getDocumentSource().should("contain", "backup-ABC123");
    detailPage.getDocumentTimestamp().should("not.exist");
    detailPage.getSourceView().click();
    cy.contains("accessLevel");
    cy.contains("999ABC");
    // By default attachment is not present in detailed view of document
    detailPage.attachmentPresent().should("not.exist");
    toolbar.getCurateToolbarIcon().click();
    curatePage.toggleEntityTypeId("Order");
    // Open step settings and switch to Advanced tab
    cy.waitUntil(() => curatePage.editStep(mapStep).click({force: true}));
    curatePage.switchEditAdvanced().click();
    // user selects Yes for attachment present in advanced settings
    advancedSettingsDialog.attachSourceDocument().click();
    cy.waitUntil(() => advancedSettingsDialog.saveSettings(mapStep).click({force: true}));
    curatePage.runStepInCardView(mapStep).click();
    curatePage.runStepExistsMultFlowsConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName);
    cy.waitForAsyncRequest();
    // Commented until DHFPROD-7477 is done
    runPage.explorerLink(mapStep).click();

    browsePage.getFirstTableViewInstanceIcon().should("be.visible").click({force: true});
    detailPage.getSourceView().click();

    // attachment is present in detailed view of document
    detailPage.attachmentPresent().should("exist");
  });
});