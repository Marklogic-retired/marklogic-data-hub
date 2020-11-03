import { Application } from "../../../support/application.config";
import { tiles, toolbar } from "../../../support/components/common";
import {
  advancedSettingsDialog,
  createEditMappingDialog,
  sourceToEntityMap
} from '../../../support/components/mapping/index';
import loadPage from "../../../support/pages/load";
import browsePage from "../../../support/pages/browse";
import curatePage from "../../../support/pages/curate";
import runPage from "../../../support/pages/run";
import detailPage from "../../../support/pages/detail";
import 'cypress-wait-until';

describe('Mapping', () => {

  beforeEach(() => {
    cy.visit('/');
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer", "hub-central-load-writer").withRequest();
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel('Customer').should('be.visible'));
  });

  afterEach(() => {
    cy.resetTestUser();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps('ingestion', 'loadOrder', 'loadOrderCustomHeader');
    cy.deleteSteps('mapping', 'mapOrder', 'mapOrderCustomHeader');
    cy.deleteFlows( 'orderFlow', 'orderCustomHeaderFlow');
  });

  it('can create load step with processors & custom hook, can create mapping step with processors & custom hook, can create new flow, run both steps, and verify processors & custom hooks', () => {
    const flowName = 'orderFlow';
    const loadStep = 'loadOrder';
    const mapStep = 'mapOrder';
    // create load step
    toolbar.getLoadToolbarIcon().click();
    cy.waitUntil(() => loadPage.stepName('ingestion-step').should('be.visible'));
    loadPage.addNewButton('card').click();
    loadPage.saveButton().should('be.enabled');
    loadPage.stepNameInput().type(loadStep);
    loadPage.stepDescriptionInput().type('load order with processors');
    loadPage.confirmationOptions('Save').click();
    cy.findByText(loadStep).should('be.visible');

    // Open step settings and switch to Advanced tab
    loadPage.editStepInCardView(loadStep).click({force:true});
    loadPage.switchEditAdvanced().click(); 

    // add processor to load step
    advancedSettingsDialog.setStepProcessor('loadTile/orderCategoryCodeProcessor');

    //add cutomHook to load step
    advancedSettingsDialog.setCustomHook('loadTile/addPrimaryKeyHook');

    advancedSettingsDialog.saveSettings(loadStep).click();
    advancedSettingsDialog.saveSettings(loadStep).should('not.be.visible');
    
    // add step to new flow
    loadPage.addStepToNewFlow(loadStep);
    cy.findByText('New Flow').should('be.visible');
    runPage.editSave().should('be.enabled');
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    loadPage.confirmationOptions('Save').click();
    cy.verifyStepAddedToFlow('Load', loadStep);

    //Run the ingest with JSON
    runPage.runStep(loadStep).click();
    cy.uploadFile('input/10259.json');
    cy.verifyStepRunResult('success','Ingestion', loadStep);
    tiles.closeRunMessage().click();

    // create mapping step
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel('Customer').should('be.visible'));
    curatePage.toggleEntityTypeId('Order');
    cy.waitUntil(() => curatePage.addNewStep().click());

    createEditMappingDialog.setMappingName(mapStep);
    createEditMappingDialog.setMappingDescription('An order mapping with custom processors');
    createEditMappingDialog.setSourceRadio('Query');
    createEditMappingDialog.setQueryInput(`cts.collectionQuery(['${loadStep}'])`);
    createEditMappingDialog.saveButton().click(); 
    curatePage.verifyStepNameIsVisible(mapStep);

    // Open step settings and switch to Advanced tab
    cy.waitUntil(() => curatePage.editStep(mapStep).click({force:true}));
    curatePage.switchEditAdvanced().click(); 

    // add processors
    advancedSettingsDialog.setStepProcessor('curateTile/orderDateProcessor');

    // add customHook to mapping step
    //curatePage.stepSettings(mapStep).click();
    advancedSettingsDialog.setCustomHook('curateTile/customUriHook');

    advancedSettingsDialog.saveSettings(mapStep).click();
    advancedSettingsDialog.saveSettings(mapStep).should('not.be.visible');

    // map source to entity
    curatePage.openSourceToEntityMap('Order', mapStep);
    cy.waitUntil(() => sourceToEntityMap.expandCollapseEntity().should('be.visible')).click();
    sourceToEntityMap.setXpathExpressionInput('orderId', 'OrderID');
    sourceToEntityMap.setXpathExpressionInput('address', '/');
    sourceToEntityMap.setXpathExpressionInput('city', 'ShipCity');
    sourceToEntityMap.setXpathExpressionInput('state', 'ShipAddress');
    sourceToEntityMap.setXpathExpressionInput('orderDetails', '/');
    sourceToEntityMap.setXpathExpressionInput('productID', 'OrderDetails/ProductID');
    sourceToEntityMap.setXpathExpressionInput('unitPrice', 'head(OrderDetails/UnitPrice)');
    sourceToEntityMap.setXpathExpressionInput('quantity', 'OrderDetails/Quantity');
    sourceToEntityMap.setXpathExpressionInput('discount', 'head(OrderDetails/Discount)');
    sourceToEntityMap.setXpathExpressionInput('shipRegion', 'ShipRegion');
    sourceToEntityMap.setXpathExpressionInput('shippedDate', 'ShippedDate');
    // close modal
    cy.get('body').type('{esc}');

    curatePage.openExistingFlowDropdown('Order', mapStep);
    curatePage.getExistingFlowFromDropdown(flowName).click();
    curatePage.addStepToFlowConfirmationMessage();
    curatePage.confirmAddStepToFlow(mapStep, flowName);

    runPage.runStep(mapStep).click();
    cy.verifyStepRunResult('success','Mapping', mapStep);
    runPage.explorerLink().click();
    browsePage.getTableViewSourceIcon().click();
    cy.contains('mappedOrderDate');
    cy.contains('categoryCode');

    //Verifying the properties added by load and mapping custom hooks respectively
    cy.contains('primaryKey');
    cy.contains('uriFromCustomHook');
  });

  it('can create a load step with a custom header, can create a mapping step with a custom header, and run both steps and verify in the detail view, ', () => {
    const flowName = 'orderCustomHeaderFlow';
    const loadStep = 'loadOrderCustomHeader';
    const mapStep = 'mapOrderCustomHeader';
    // create load step
    toolbar.getLoadToolbarIcon().click();
    cy.waitUntil(() => loadPage.stepName('ingestion-step').should('be.visible'));
    loadPage.addNewButton('card').click();
    loadPage.stepNameInput().type(loadStep);
    loadPage.stepDescriptionInput().type('load order with a custom header');
    loadPage.confirmationOptions('Save').click();
    cy.findByText(loadStep).should('be.visible');

    // Open step settings and switch to Advanced tab
    loadPage.editStepInCardView(loadStep).click({force:true});
    loadPage.switchEditAdvanced().click(); 

    // add custom header to load step
    advancedSettingsDialog.setHeaderContent('loadTile/customHeader');
    advancedSettingsDialog.saveSettings(loadStep).click();
    advancedSettingsDialog.saveSettings(loadStep).should('not.be.visible');
    
    // add step to a new flow
    loadPage.addStepToNewFlow(loadStep);
    cy.findByText('New Flow').should('be.visible');
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    loadPage.confirmationOptions('Save').click();
    cy.verifyStepAddedToFlow('Load', loadStep);

    //Run the ingest with JSON
    runPage.runStep(loadStep).click();
    cy.uploadFile('input/10260.json');
    cy.verifyStepRunResult('success','Ingestion', loadStep);
    tiles.closeRunMessage().click();

    // create mapping step
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel('Customer').should('be.visible'));
    curatePage.toggleEntityTypeId('Order');
    cy.waitUntil(() => curatePage.addNewStep().click());

    createEditMappingDialog.setMappingName(mapStep);
    createEditMappingDialog.setMappingDescription('An order mapping with custom header');
    createEditMappingDialog.setSourceRadio('Query');
    createEditMappingDialog.setQueryInput(`cts.collectionQuery(['${loadStep}'])`);
    createEditMappingDialog.saveButton().click({force:true}); 
    curatePage.verifyStepNameIsVisible(mapStep);

    // Open step settings and switch to Advanced tab
    cy.waitUntil(() => curatePage.editStep(mapStep).click({force:true}));
    curatePage.switchEditAdvanced().click(); 

    // add custom header
    advancedSettingsDialog.setHeaderContent('curateTile/customHeader');
    cy.waitUntil(() => advancedSettingsDialog.saveSettings(mapStep).click({force:true}));
    advancedSettingsDialog.saveSettings(mapStep).should('not.be.visible');

    // map source to entity
    curatePage.openSourceToEntityMap('Order', mapStep);
    cy.waitUntil(() => sourceToEntityMap.expandCollapseEntity().should('be.visible')).click();
    sourceToEntityMap.setXpathExpressionInput('orderId', 'OrderID');
    sourceToEntityMap.setXpathExpressionInput('address', '/');
    sourceToEntityMap.setXpathExpressionInput('city', 'ShipCity');
    sourceToEntityMap.setXpathExpressionInput('state', 'ShipAddress');
    sourceToEntityMap.setXpathExpressionInput('orderDetails', '/');
    sourceToEntityMap.setXpathExpressionInput('productID', 'OrderDetails/ProductID');
    sourceToEntityMap.setXpathExpressionInput('unitPrice', 'head(OrderDetails/UnitPrice)');
    sourceToEntityMap.setXpathExpressionInput('quantity', 'OrderDetails/Quantity');
    sourceToEntityMap.setXpathExpressionInput('discount', 'head(OrderDetails/Discount)');
    sourceToEntityMap.setXpathExpressionInput('shipRegion', 'ShipRegion');
    sourceToEntityMap.setXpathExpressionInput('shippedDate', 'ShippedDate');
    // close modal
    cy.get('body').type('{esc}');

    //Cancel add to new flow 
    curatePage.addToNewFlow('Order', mapStep);
    cy.findByText('New Flow').should('be.visible');
    loadPage.confirmationOptions('Cancel').click();
    //should route user back to curate page
    cy.waitUntil(() => curatePage.getEntityTypePanel('Order').should('be.visible'));

    curatePage.openExistingFlowDropdown('Order', mapStep);
    curatePage.getExistingFlowFromDropdown(flowName).click();
    curatePage.addStepToFlowConfirmationMessage();
    curatePage.confirmAddStepToFlow(mapStep, flowName);

    runPage.runStep(mapStep).click();
    cy.verifyStepRunResult('success','Mapping', mapStep);

    tiles.closeRunMessage().click();
    runPage.deleteStep(mapStep).click();
    loadPage.confirmationOptions('Yes').click();

    //Verify Run Map step in an existing Flow
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel('Customer').should('be.visible'));
    curatePage.toggleEntityTypeId('Order');
    curatePage.runStepInCardView(mapStep).click();
    curatePage.runStepInExistingFlow(mapStep, flowName);
    curatePage.addStepToFlowRunConfirmationMessage().should('be.visible');
    curatePage.confirmAddStepToFlow(mapStep, flowName);
    //Step should automatically run
    cy.verifyStepRunResult('success','Mapping', mapStep);
    tiles.closeRunMessage().click();

    //Delete the flow
    runPage.deleteFlow(flowName).click();
    runPage.deleteFlowConfirmationMessage(flowName).should('be.visible');
    loadPage.confirmationOptions('Yes').click();

    //Verify Run Map step in a new Flow
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel('Customer').should('be.visible'));
    curatePage.toggleEntityTypeId('Order');
    curatePage.runStepInCardView(mapStep).click();
    curatePage.runInNewFlow(mapStep).click({force: true});
    cy.findByText('New Flow').should('be.visible');
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    loadPage.confirmationOptions('Save').click();
    //Step should automatically run
    cy.verifyStepRunResult('success','Mapping', mapStep);

    runPage.explorerLink().click()
    browsePage.getTableViewInstanceIcon().click();

    detailPage.getDocumentSource().should('contain', 'backup-ABC123');
    detailPage.getDocumentTimestamp().should('not.exist');

    detailPage.getSourceView().click();
    cy.contains('accessLevel');
    cy.contains('999ABC');
  });
});
