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
import LoginPage from "../../../support/pages/login";
import "cypress-wait-until";

const flowName = "orderFlow";
const loadStep = "loadOrder";
const mapStep = "mapOrder";

describe("Create and verify load steps, map step and flows with interceptors & custom hook", () => {
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
    cy.deleteSteps("ingestion", "loadOrder");
    cy.deleteSteps("mapping", "mapOrder", "mapCustomer");
    cy.deleteFlows("orderFlow");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Create load step", () => {
    toolbar.getLoadToolbarIcon().click();
    cy.waitUntil(() => loadPage.stepName("ingestion-step").should("be.visible"));
    loadPage.addNewButton("card").click();
    loadPage.saveButton().should("be.enabled");
    loadPage.stepNameInput().type(loadStep);
    loadPage.stepDescriptionInput().type("load order with interceptors");
    //verify advanced setting modifications during creation
    loadPage.switchEditAdvanced().click();
    // add interceptor to load step
    advancedSettingsDialog.setStepInterceptor("loadTile/orderCategoryCodeInterceptor");

    loadPage.confirmationOptions("Save").click({force: true});
    cy.waitForAsyncRequest();
    cy.findByText(loadStep).should("be.visible");
  });
  it("Edit load step", () => {
    // Open step settings and switch to Advanced tab
    loadPage.editStepInCardView(loadStep).click({force: true});
    loadPage.switchEditAdvanced().click();

    //interceptor should already be set during creation
    cy.findByLabelText("interceptors-expand").trigger("mouseover").click();
    cy.get("#interceptors").should("not.be.empty");

    //add customHook to load step
    advancedSettingsDialog.setCustomHook("loadTile/addPrimaryKeyHook");

    advancedSettingsDialog.saveSettings(loadStep).click();
    advancedSettingsDialog.saveSettings(loadStep).should("not.be.visible");
  });
  it("Verify load step with duplicate name cannot be created", () => {
    loadPage.addNewButton("card").click();
    loadPage.saveButton().should("be.enabled");
    loadPage.stepNameInput().type(loadStep);
    loadPage.confirmationOptions("Save").click({force: true});
    loadPage.duplicateStepErrorMessage();
    loadPage.confirmationOptions("OK").click();
    loadPage.duplicateStepErrorMessageClosed();
  });
  it("Add step to new flow and Run", () => {
    loadPage.addStepToNewFlow(loadStep);
    cy.findByText("New Flow").should("be.visible");
    runPage.editSave().should("be.enabled");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    loadPage.confirmationOptions("Save").click();
    cy.verifyStepAddedToFlow("Load", loadStep);
    //Run the ingest with JSON
    cy.waitForAsyncRequest();
    runPage.runStep(loadStep);
    cy.uploadFile("input/10259.json");
    cy.verifyStepRunResult("success", "Ingestion", loadStep);
    tiles.closeRunMessage();
  });
  it("Create mapping step", () => {
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    cy.waitUntil(() => curatePage.addNewStep().click());
    createEditMappingDialog.setMappingName(mapStep);
    createEditMappingDialog.setMappingDescription("An order mapping with custom interceptors");
    createEditMappingDialog.setSourceRadio("Query");
    createEditMappingDialog.setQueryInput(`cts.collectionQuery(['${loadStep}'])`);
    //verify advanced setting modifications during creation
    loadPage.switchEditAdvanced().click();
    // add interceptor to map step
    advancedSettingsDialog.setStepInterceptor("curateTile/orderDateInterceptor");
    createEditMappingDialog.saveButton().click({force: true});
    cy.waitForAsyncRequest();
    cy.waitUntil(() => curatePage.dataPresent().should("be.visible"));
    //verify that step details automatically opens after step creation
    curatePage.verifyStepDetailsOpen(mapStep);
  });
  it("Validate xpath expressions are blank by default", () => {
    curatePage.xpathExpression("orderId").should("have.value", "");
    curatePage.xpathExpression("address").should("have.value", "");
    curatePage.xpathExpression("city").should("have.value", "");
    curatePage.xpathExpression("state").should("have.value", "");
    curatePage.xpathExpression("orderDetails").should("have.value", "");
    curatePage.xpathExpression("productID").should("have.value", "");
    curatePage.xpathExpression("unitPrice").should("have.value", "");
    curatePage.xpathExpression("quantity").should("have.value", "");
    curatePage.xpathExpression("discount").should("have.value", "");
    curatePage.xpathExpression("shipRegion").should("have.value", "");
    curatePage.xpathExpression("shippedDate").should("have.value", "");
  });
  it("Map source to entity and Test the mappings", () => {
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
    curatePage.dataPresent().should("be.visible");
    sourceToEntityMap.expandCollapseEntity().click();
    // Test the mappings
    cy.waitUntil(() => sourceToEntityMap.testMap().should("be.enabled"));
    sourceToEntityMap.testMap().click();
    sourceToEntityMap.validateMapValues("orderId", "10259");
    sourceToEntityMap.validateMapValues("address", "");
    sourceToEntityMap.validateMapValues("city", "Houston");
    sourceToEntityMap.validateMapValues("state", "100 Main Street");
    sourceToEntityMap.validateMapValues("orderDetails", "");
    sourceToEntityMap.validateMapValues("productID", "77");
    sourceToEntityMap.validateMapValues("unitPrice", "70.4");
    sourceToEntityMap.validateMapValues("quantity", "72");
    sourceToEntityMap.validateMapValues("discount", "0");
    sourceToEntityMap.validateMapValues("shipRegion", "region1\nregion4\n");
    sourceToEntityMap.validateMapValues("shippedDate", "1996-07-17T00:28:30");
    //close modal
    cy.get("body").type("{esc}");
    curatePage.verifyStepNameIsVisible(mapStep);
  });
  it("Edit Map step", () => {
    // Open step details and switch to Advanced tab in step settings
    curatePage.openStepDetails(mapStep);
    cy.waitUntil(() => curatePage.dataPresent().should("be.visible"));
    sourceToEntityMap.testMap().click();
    sourceToEntityMap.validateMapValues("orderId", "10259");
    sourceToEntityMap.stepSettingsLink().click();
    curatePage.switchEditAdvanced().click();
    //interceptor should already be set during creation
    cy.findByLabelText("interceptors-expand").trigger("mouseover").click();
    cy.get("#interceptors").should("not.be.empty");
    // add customHook to mapping step
    advancedSettingsDialog.setCustomHook("curateTile/customUriHook");
    advancedSettingsDialog.saveSettings(mapStep).click();
    advancedSettingsDialog.saveSettings(mapStep).should("not.be.visible");
  });
  it("Verify mapping step with duplicate name cannot be created", () => {
    cy.waitUntil(() => curatePage.addNewStep().click());
    createEditMappingDialog.setMappingName(mapStep);
    createEditMappingDialog.setSourceRadio("Query");
    createEditMappingDialog.setQueryInput("test");
    createEditMappingDialog.saveButton().click({force: true});
    //error message should be displayed instead of step details auto open
    cy.findByLabelText(`${mapStep}-details-header`).should("not.be.visible");
    loadPage.duplicateStepErrorMessage();
    loadPage.confirmationOptions("OK").click();
    loadPage.duplicateStepErrorMessageClosed();
  });
  it("Verify link to settings, Add mapstep to existing flow, Run the flow and explore the data", () => {
    // link to settings and back
    curatePage.openSourceToEntityMap("Order", mapStep);
    cy.waitUntil(() => sourceToEntityMap.expandCollapseEntity().should("be.visible")).click();
    sourceToEntityMap.stepSettingsLink().click();
    cy.waitUntil(() => createEditMappingDialog.stepDetailsLink().click());
    cy.waitUntil(() => sourceToEntityMap.expandCollapseEntity().should("be.visible"));

    // close modal
    cy.get("body").type("{esc}");

    curatePage.openExistingFlowDropdown("Order", mapStep);
    curatePage.getExistingFlowFromDropdown(flowName).click();
    curatePage.addStepToFlowConfirmationMessage();
    curatePage.confirmAddStepToFlow(mapStep, flowName);

    cy.waitForAsyncRequest();
    runPage.runStep(mapStep);
    cy.waitForAsyncRequest();
    cy.verifyStepRunResult("success", "Mapping", mapStep);
    runPage.explorerLink().click();
    browsePage.getTableViewSourceIcon().click();
    cy.contains("mappedOrderDate");
    cy.contains("categoryCode");

    //Verifying the properties added by load and mapping custom hooks respectively
    cy.contains("primaryKey");
    cy.contains("uriFromCustomHook");
  });
  it("Create a map step under another entity", () => {
    // create mapping step
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    cy.waitUntil(() => curatePage.addNewStep().click());
    createEditMappingDialog.setMappingName("mapCustomer");
    createEditMappingDialog.setSourceRadio("Query");
    createEditMappingDialog.setQueryInput(`cts.collectionQuery(['loadCustomersJSON'])`);
    createEditMappingDialog.saveButton().click({force: true});
    cy.waitForAsyncRequest();
    cy.waitUntil(() => curatePage.dataPresent().should("be.visible"));
    //close modal
    cy.get("body").type("{esc}");
  });
});
