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

describe("Mapping", () => {

  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer", "hub-central-load-writer").withRequest();
    LoginPage.postLogin();
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
  });

  afterEach(() => {
    cy.resetTestUser();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("ingestion", "loadOrder", "loadOrderCustomHeader");
    cy.deleteSteps("mapping", "mapOrder", "mapOrderCustomHeader");
    cy.deleteSteps("mapping", "mapCustomer");
    cy.deleteFlows("orderFlow", "orderCustomHeaderFlow");
  });

  it("can create load step with interceptors & custom hook, can create mapping step with interceptors & custom hook, can create new flow, run both steps, and verify interceptors & custom hooks", () => {
    const flowName = "orderFlow";
    const loadStep = "loadOrder";
    const mapStep = "mapOrder";
    // create load step
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
    cy.findByText(loadStep).should("be.visible");

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

    //verify load step with duplicate name cannot be created
    loadPage.addNewButton("card").click();
    loadPage.saveButton().should("be.enabled");
    loadPage.stepNameInput().type(loadStep);
    loadPage.confirmationOptions("Save").click({force: true});
    loadPage.duplicateStepErrorMessage();
    loadPage.confirmationOptions("OK").click();
    loadPage.duplicateStepErrorMessageClosed();

    // add step to new flow
    loadPage.addStepToNewFlow(loadStep);
    cy.findByText("New Flow").should("be.visible");
    runPage.editSave().should("be.enabled");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    loadPage.confirmationOptions("Save").click();
    cy.verifyStepAddedToFlow("Load", loadStep);

    //Run the ingest with JSON
    runPage.runStep(loadStep).click();
    cy.uploadFile("input/10259.json");
    cy.verifyStepRunResult("success", "Ingestion", loadStep);
    tiles.closeRunMessage();

    // create mapping step
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

    //Validate xpath expressions are blank by default
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

    //Map source to entity
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

    //Test the mappings
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

    //verify mapping step with duplicate name cannot be created
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

    runPage.runStep(mapStep).click();
    cy.verifyStepRunResult("success", "Mapping", mapStep);
    runPage.explorerLink().click();
    browsePage.getTableViewSourceIcon().click();
    cy.contains("mappedOrderDate");
    cy.contains("categoryCode");

    //Verifying the properties added by load and mapping custom hooks respectively
    cy.contains("primaryKey");
    cy.contains("uriFromCustomHook");

    //Create a map step under another entity", () => {
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

  it("can create a load step with a custom header, can create a mapping step with a custom header, and run both steps and verify in the detail view, ", () => {
    const flowName = "orderCustomHeaderFlow";
    const flowName2 = "orderE2eFlow";
    const loadStep = "loadOrderCustomHeader";
    const mapStep = "mapOrderCustomHeader";
    // create load step
    toolbar.getLoadToolbarIcon().click();
    cy.waitUntil(() => loadPage.stepName("ingestion-step").should("be.visible"));
    loadPage.addNewButton("card").click();
    loadPage.stepNameInput().type(loadStep);
    loadPage.stepDescriptionInput().type("load order with a custom header");
    loadPage.stepSourceNameInput().type("backup-ABC123");
    loadPage.confirmationOptions("Save").click();
    cy.findByText(loadStep).should("be.visible");

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
    runPage.runStep(loadStep).click();
    cy.uploadFile("input/10260.json");
    cy.verifyStepRunResult("success", "Ingestion", loadStep);
    tiles.closeRunMessage();

    // create mapping step
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

    runPage.runStep(mapStep).click();
    cy.verifyStepRunResult("success", "Mapping", mapStep);

    tiles.closeRunMessage();
    runPage.deleteStep(mapStep).click();
    loadPage.confirmationOptions("Yes").click();

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

    //Delete the flow
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

    //Verify Run Map step in flow where step exists, should run automatically
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

    // add step to a new flow
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
