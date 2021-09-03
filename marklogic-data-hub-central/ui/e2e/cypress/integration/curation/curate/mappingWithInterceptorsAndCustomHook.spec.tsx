import {Application} from "../../../support/application.config";
import {tiles, toolbar} from "../../../support/components/common";
import {
  advancedSettingsDialog,
  createEditMappingDialog,
  mappingStepDetail
} from "../../../support/components/mapping/index";
import loadPage from "../../../support/pages/load";
//import browsePage from "../../../support/pages/browse";
import curatePage from "../../../support/pages/curate";
import runPage from "../../../support/pages/run";
import LoginPage from "../../../support/pages/login";
import browsePage from "../../../support/pages/browse";
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
    cy.deleteSteps("mapping", "mapOrder");
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
  it("Edit load step", {defaultCommandTimeout: 120000}, () => {
    // Open step settings and switch to Advanced tab
    loadPage.editStepInCardView(loadStep).click({force: true});
    loadPage.switchEditAdvanced().click();

    //interceptor should already be set during creation
    cy.findByLabelText("interceptors-expand").trigger("mouseover").click();
    cy.get("#interceptors").should("not.be.empty");

    //add customHook to load step
    advancedSettingsDialog.setCustomHook("loadTile/addPrimaryKeyHook");

    advancedSettingsDialog.saveSettings(loadStep).click();
    advancedSettingsDialog.saveSettings(loadStep).should("not.exist");
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
  it("Add step to new flow and Run", {defaultCommandTimeout: 120000}, () => {
    cy.intercept("/api/jobs/**").as("getJobs");
    loadPage.addStepToNewFlow(loadStep);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.editSave().should("be.enabled");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    cy.wait(500);
    loadPage.confirmationOptions("Save").click();
    cy.wait(500);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Load", loadStep, flowName);
    //Run the ingest with JSON
    cy.waitForAsyncRequest();
    runPage.runStep(loadStep, flowName);
    cy.uploadFile("input/10259.json");
    cy.verifyStepRunResult("success", "Ingestion", loadStep);
    tiles.closeRunMessage();
  });
  it("Create mapping step", () => {
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    cy.waitUntil(() => curatePage.addNewStep("Order").click());
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
    browsePage.waitForSpinnerToDisappear();
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
    cy.findByTestId("shippedDate-mapexpression").blur();
    curatePage.dataPresent().should("be.visible");
    // Test the mappings
    cy.waitUntil(() => mappingStepDetail.testMap().should("be.enabled"));
    mappingStepDetail.testMap().click();
    mappingStepDetail.validateMapValue("Order", "orderId", "10259");
    mappingStepDetail.validateMapValue("Order", "address", "");
    mappingStepDetail.validateMapValue("Order", "city", "Houston");
    mappingStepDetail.validateMapValue("Order", "state", "100 Main Street");
    mappingStepDetail.validateMapValue("Order", "orderDetails", "");
    mappingStepDetail.validateMapValue("Order", "productID", "77");
    mappingStepDetail.validateMapValue("Order", "unitPrice", "70.4");
    mappingStepDetail.validateMapValue("Order", "quantity", "72");
    mappingStepDetail.validateMapValue("Order", "discount", "0");
    mappingStepDetail.validateMapValueP("Order", "shipRegion", "region1\nregion4\n");
    mappingStepDetail.validateMapValue("Order", "shippedDate", "1996-07-17T00:28:30");
  });
  it("Verify mapping step filtering for Entity table", () => {
    mappingStepDetail.toggleEntityFilterMenu();
    mappingStepDetail.setEntitySearch("city");
    mappingStepDetail.validateMapValue("Order", "city", "Houston");
    mappingStepDetail.submitEntitySearch().click();
    cy.waitUntil(() => mappingStepDetail.moreLink()).should("be.visible");
    mappingStepDetail.moreLink().click();
    cy.waitUntil(() => mappingStepDetail.lessLink()).should("be.visible");
    mappingStepDetail.validateMapValue("Order", "city", "Houston");
    mappingStepDetail.validateMapValue("Order", "state", "100 Main Street");
    mappingStepDetail.lessLink().click();
    mappingStepDetail.toggleEntityFilterMenu();
    mappingStepDetail.resetEntitySearch().click();
  });
  it("Edit Map step", () => {
    //Go back to curate homepage
    mappingStepDetail.goBackToCurateHomePage();
    curatePage.toggleEntityTypeId("Order");
    // Open step details and switch to Advanced tab in step settings
    curatePage.openStepDetails(mapStep);
    cy.waitUntil(() => curatePage.dataPresent().should("be.visible"));
    mappingStepDetail.testMap().click();
    mappingStepDetail.validateMapValue("Order", "orderId", "10259");
    mappingStepDetail.stepSettingsLink().click();
    curatePage.switchEditAdvanced().click();
    //interceptor should already be set during creation
    cy.findByLabelText("interceptors-expand").trigger("mouseover").click();
    cy.get("#interceptors").should("not.be.empty");
    // add customHook to mapping step
    advancedSettingsDialog.setCustomHook("curateTile/customUriHook");
    advancedSettingsDialog.saveSettings(mapStep).click();
    advancedSettingsDialog.saveSettings(mapStep).should("not.exist");

    //verify that step details page remains opens when step settings was opened from within the step details page
    cy.waitUntil(() => curatePage.dataPresent().should("be.visible"));
    curatePage.verifyStepDetailsOpen(mapStep);
    cy.wait(2000);
  });
  // TODO: skip failing test brought from develop branch since it's blocking ant replacement feature branch.
  // will unskip next test when pending PR are merged in ant-lib-replacement
  it.skip("verify Map step settings change from within map step details page", () => {
    //Check that the source data is visible
    cy.waitUntil(() => curatePage.dataPresent().should("be.visible"));
    // Open step settings and switch to Advanced tab in step settings
    mappingStepDetail.stepSettingsLink().click();
    createEditMappingDialog.getMappingDescriptionInput().should("have.value", "An order mapping with custom interceptors");
    createEditMappingDialog.setMappingDescription("Test description for Order");
    curatePage.switchEditAdvanced().click();
    // change source database
    advancedSettingsDialog.setSourceDatabase("data-hub-FINAL");
    advancedSettingsDialog.saveSettings(mapStep).click();
    advancedSettingsDialog.saveSettings(mapStep).should("not.exist");
    //verify that step details is updated based on recent changes
    // cy.waitUntil(() => mappingStepDetail.noDataAvailable().should("be.visible"));
    curatePage.verifyStepDetailsOpen(mapStep);

    //Change the source Database again to see if the previous data comes back
    mappingStepDetail.stepSettingsLink().click();
    createEditMappingDialog.getMappingDescriptionInput().should("have.value", "Test description for Order");
    createEditMappingDialog.setMappingDescription("An order mapping with custom interceptors");
    curatePage.switchEditAdvanced().click();
    // change source database
    advancedSettingsDialog.setSourceDatabase("data-hub-STAGING");
    advancedSettingsDialog.saveSettings(mapStep).click();
    advancedSettingsDialog.saveSettings(mapStep).should("not.exist");
    //Step source data is present now.
    cy.waitUntil(() => curatePage.dataPresent().should("be.visible"));
    curatePage.verifyStepDetailsOpen(mapStep);

    mappingStepDetail.entitySettingsLink().click();
    advancedSettingsDialog.getTargetPermissions().should("have.value", "data-hub-common,read,data-hub-common,update");
    advancedSettingsDialog.setTargetPermissions("data-hub-common,read");
    advancedSettingsDialog.saveEntitySettings();

    mappingStepDetail.entitySettingsLink().click();
    advancedSettingsDialog.getTargetPermissions().should("have.value", "data-hub-common,read");
    advancedSettingsDialog.setTargetPermissions("data-hub-common,read,data-hub-common,update");
    advancedSettingsDialog.cancelEntitySettings();

    //Go back to curate homepage
    mappingStepDetail.goBackToCurateHomePage();
  });

  // TODO: skip failing test brought from develop branch since it's blocking ant replacement feature branch.
  // will unskip next test when pending PR are merged in ant-lib-replacement
  it.skip("Verify mapping step with duplicate name cannot be created", () => {
    curatePage.toggleEntityTypeId("Order");
    cy.waitUntil(() => curatePage.addNewStep("Order").click());
    createEditMappingDialog.setMappingName(mapStep);
    createEditMappingDialog.setSourceRadio("Query");
    createEditMappingDialog.setQueryInput("test");
    createEditMappingDialog.saveButton().click({force: true});
    //error message should be displayed instead of step details auto open
    cy.findByLabelText(`${mapStep}-details-header`).should("not.exist");
    loadPage.duplicateStepErrorMessage();
    loadPage.confirmationOptions("OK").click();
    loadPage.duplicateStepErrorMessageClosed();
  });
  /*  it("Verify link to settings, Add mapstep to existing flow, Run the flow and explore the data", () => {
    // link to settings and back
    curatePage.openMappingStepDetail("Order", mapStep);
    cy.waitUntil(() => mappingStepDetail.expandEntity().should("be.visible")).click();
    mappingStepDetail.stepSettingsLink().click();
    cy.waitUntil(() => createEditMappingDialog.stepDetailsLink().click());

    cy.wait(1000);
    cy.waitForAsyncRequest();
    cy.waitUntil(() => mappingStepDetail.expandEntity().should("be.visible"));

    //Go back to curate homepage
    mappingStepDetail.goBackToCurateHomePage();

    //open the order entity panel
    curatePage.toggleEntityTypeId("Order");

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
    //Go back to curate homepage
    mappingStepDetail.goBackToCurateHomePage();
  });*/
});
