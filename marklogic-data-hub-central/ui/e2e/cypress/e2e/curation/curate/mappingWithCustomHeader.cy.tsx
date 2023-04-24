import {toolbar} from "../../../support/components/common";
import browsePage from "../../../support/pages/browse";
import detailPage from "../../../support/pages/detail";
import curatePage from "../../../support/pages/curate";
import LoginPage from "../../../support/pages/login";
import loadPage from "../../../support/pages/load";
import runPage from "../../../support/pages/run";
import {
  advancedSettingsDialog,
  createEditMappingDialog,
  mappingStepDetail
} from "../../../support/components/mapping/index";

import "cypress-wait-until";

const flowName = "orderCustomHeaderFlow";
const flowName2 = "orderE2eFlow";
const loadStep = "loadOrderCustomHeader";
const mapStep = "mapOrderCustomHeader";
const userRoles = ["hub-central-flow-writer",
  "hub-central-mapping-writer",
  "hub-central-load-writer"
];

describe("Create and verify load steps, map step and flows with a custom header", () => {
  before(() => {
    cy.loginAsTestUserWithRoles(...userRoles).withRequest();
    LoginPage.navigateToMainPage();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("ingestion", "loadOrderCustomHeader");
    cy.deleteSteps("mapping", "mapOrderCustomHeader");
    cy.deleteFlows("orderCustomHeaderFlow");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Create load step", () => {
    toolbar.getLoadToolbarIcon().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => loadPage.stepName("ingestion-step").should("be.visible"));
    loadPage.addNewButton("card").click();
    loadPage.stepNameInput().type(loadStep);
    loadPage.stepDescriptionInput().type("load order with a custom header");
    loadPage.stepSourceNameInput().type("backup-ABC123");
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
    cy.findByText(loadStep).should("be.visible");
  });

  it("Edit load step and Run", {defaultCommandTimeout: 120000}, () => {
    loadPage.editStepInCardView(loadStep).should("be.visible").click({force: true});
    loadPage.switchEditAdvanced().click();
    advancedSettingsDialog.setHeaderContent("loadTile/customHeader");
    cy.intercept("PUT", "/api/steps/ingestion/loadOrderCustomHeader").as("loadOrderCustomHeaderStep");
    cy.intercept("GET", "/api/steps/ingestion").as("ingestionSteps");
    advancedSettingsDialog.saveSettings(loadStep).click();
    cy.wait("@loadOrderCustomHeaderStep").its("response.statusCode").should("eq", 200);
    cy.wait("@ingestionSteps").its("response.statusCode").should("eq", 200);
    advancedSettingsDialog.saveSettings(loadStep).should("not.be.exist");

    loadPage.stepName(loadStep).should("be.visible");
    loadPage.addStepToNewFlow(loadStep);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    loadPage.confirmationOptions("Save").click();
    cy.verifyStepAddedToFlow("Loading", loadStep, flowName);
    cy.waitForAsyncRequest();
    cy.intercept("GET", "/api/jobs/*").as("runResponse");
    runPage.runStep(loadStep, flowName);
    cy.uploadFile("input/10260.json");
    cy.wait("@runResponse");
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
    cy.waitForAsyncRequest();
    curatePage.verifyStepDetailsOpen(mapStep);
  });

  it("Edit Map step", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();

    cy.log("**Open Order to see steps**");
    curatePage.getEntityTypePanel("Order").then(($ele) => {
      if ($ele.hasClass("accordion-button collapsed")) {
        cy.log("**Toggling Entity because it was closed.**");
        curatePage.toggleEntityTypeId("Order");
      }
    });

    cy.log("**Open step settings and switch to Advanced tab**");
    curatePage.editStep(mapStep).should("be.visible").click();
    cy.waitForAsyncRequest();
    curatePage.switchEditAdvanced().should("be.visible").click();
    cy.intercept("PUT", "/api/steps/mapping/mapOrderCustomHeader").as("mapOrderCustomHeaderStep");
    cy.intercept("GET", "/api/steps/mapping").as("mappingSteps");
    advancedSettingsDialog.setHeaderContent("curateTile/customHeader");
    advancedSettingsDialog.saveSettings(mapStep).click({force: true});
    cy.wait("@mapOrderCustomHeaderStep").its("response.statusCode").should("eq", 200);
    cy.wait("@mappingSteps").its("response.statusCode").should("eq", 200);
    advancedSettingsDialog.saveSettings(mapStep).should("not.exist");
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
    cy.wait(3000);
    cy.waitForAsyncRequest();
  });

  it("Add Map step to new flow and Run", {defaultCommandTimeout: 120000}, () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();

    cy.log("**Open Order to see steps**");
    curatePage.getEntityTypePanel("Order").should("be.visible").click({force: true});

    cy.log("**Cancel add to new flow**");
    curatePage.addToNewFlow("Order", mapStep);
    cy.findByText("New Flow").should("be.visible");
    loadPage.confirmationOptions("Cancel").should("be.visible").click({force: true});
    cy.waitForAsyncRequest();
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Order").should("be.visible").click());

    // TODO: Need to wait do to a second re-render. BUG: DHFPROD-9222
    cy.wait(1000);
    curatePage.openExistingFlowDropdownAndTooltip("Order", mapStep);
    curatePage.getExistingFlowFromDropdown(mapStep, flowName).click();
    curatePage.addStepToFlowConfirmationMessage();
    curatePage.confirmAddStepToFlow(mapStep, flowName);
    cy.waitForAsyncRequest();
    cy.intercept("GET", "/api/jobs/*").as("runResponse");
    runPage.runStep(mapStep, flowName);
    cy.wait("@runResponse", {timeout: 12000});
    runPage.verifyStepRunResult(mapStep, "success");
    runPage.closeFlowStatusModal(flowName);
    runPage.deleteStep(mapStep, flowName).click();
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
  });

  it("Add Map step to existing flow Run", {defaultCommandTimeout: 120000}, () => {
    toolbar.getCurateToolbarIcon().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    cy.intercept("GET", "/api/jobs/*").as("runResponse");
    curatePage.runStepInCardView(mapStep).click();
    curatePage.runStepSelectFlowConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName);
    cy.wait("@runResponse", {timeout: 12000});
    runPage.verifyStepRunResult(mapStep, "success");
    runPage.verifyNoStepRunResult("loadOrder", "success");
    runPage.closeFlowStatusModal(flowName);
  });

  it("Delete the flow and Verify Run Map step in a new Flow", {defaultCommandTimeout: 120000}, () => {
    runPage.deleteFlow(flowName).click();
    runPage.deleteFlowConfirmationMessage(flowName).should("be.visible");
    loadPage.confirmationOptions("Yes").click();
    cy.waitForAsyncRequest();
    cy.get("body").should("not.contain", flowName);
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.runStepInCardView(mapStep).click();
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
    cy.intercept("GET", "/api/jobs/*").as("runResponse");
    runPage.runStep(mapStep, flowName);
    cy.wait("@runResponse", {timeout: 12000});
    runPage.verifyStepRunResult(mapStep, "success");
    runPage.closeFlowStatusModal(flowName);
  });

  it("Verify Run Map step in flow where step exists, should run automatically", {defaultCommandTimeout: 120000}, () => {
    toolbar.getCurateToolbarIcon().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    cy.intercept("GET", "/api/jobs/*").as("runResponse");
    curatePage.runStepInCardView(mapStep).click();
    curatePage.runStepExistsOneFlowConfirmation().should("be.visible");
    curatePage.confirmContinueRun();
    cy.wait("@runResponse", {timeout: 12000});
    cy.waitForAsyncRequest();
    runPage.getFlowName(flowName).first().should("be.visible");
    runPage.verifyStepRunResult(mapStep, "success");
    runPage.verifyNoStepRunResult("loadOrder", "success");

    runPage.closeFlowStatusModal(flowName);
    cy.verifyStepAddedToFlow("Mapping", mapStep, flowName);
  });

  it("Add step to a new flow, Run Map step where step exists in multiple flows and explore data", {defaultCommandTimeout: 120000}, () => {
    toolbar.getCurateToolbarIcon().click({force: true});
    cy.waitForAsyncRequest();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
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
    toolbar.getCurateToolbarIcon().click({force: true});
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    cy.intercept("GET", "/api/jobs/*").as("runResponse");
    curatePage.runStepInCardView(mapStep).click();
    curatePage.runStepExistsMultFlowsConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName);
    cy.wait("@runResponse", {timeout: 12000});
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Mapping", mapStep, flowName);
    runPage.getFlowStatusSuccess(flowName).should("be.visible");
    runPage.verifyStepRunResult(mapStep, "success");
    runPage.explorerLink(mapStep).click();
    browsePage.getTableView().click();
    browsePage.waitForSpinnerToDisappear();
    cy.wait(3000);
    curatePage.getFirstTableViewInstanceIcon().should("be.visible").click({force: true});
    detailPage.getDocumentSource().should("contain", "backup-ABC123");
    detailPage.getDocumentTimestamp().should("not.exist");
    detailPage.getSourceView().click();
    cy.contains("accessLevel");
    cy.contains("999ABC");
    // By default attachment is not present in detailed view of document
    detailPage.attachmentPresent().should("not.exist");
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.editStep(mapStep).click({force: true}));
    curatePage.switchEditAdvanced().click();
    advancedSettingsDialog.attachSourceDocument().click();
    cy.intercept("PUT", "/api/steps/mapping/mapOrderCustomHeader").as("mapOrderCustomHeaderStep");
    cy.intercept("GET", "/api/steps/mapping").as("mappingSteps");
    cy.intercept("GET", "/api/jobs/*").as("runResponse");
    cy.waitUntil(() => advancedSettingsDialog.saveSettings(mapStep).click({force: true}));
    cy.wait("@mapOrderCustomHeaderStep").its("response.statusCode").should("eq", 200);
    cy.wait("@mappingSteps").its("response.statusCode").should("eq", 200);
    curatePage.runStepInCardView(mapStep).click();
    curatePage.runStepExistsMultFlowsConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName);
    cy.wait("@runResponse", {timeout: 12000});
    cy.waitForAsyncRequest();
    runPage.explorerLink(mapStep).click();

    curatePage.getFirstTableViewInstanceIcon().should("be.visible").click({force: true});
    detailPage.getSourceView().click();
    detailPage.attachmentPresent().should("exist");
  });
});