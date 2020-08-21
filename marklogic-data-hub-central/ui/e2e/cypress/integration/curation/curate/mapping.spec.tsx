import { Application } from "../../../support/application.config";
import { tiles, toolbar } from "../../../support/components/common";
import {
  advancedSettingsDialog,
  createEditMappingDialog,
  sourceToEntityMap
} from '../../../support/components/mapping/index';
import browsePage from "../../../support/pages/browse";
import curatePage from "../../../support/pages/curate";
import runPage from "../../../support/pages/run";
import 'cypress-wait-until';

describe('Mapping', () => {

  beforeEach(() => {
    cy.visit('/');
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer").withRequest();
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel('Customer').should('be.visible'));
  });

  afterEach(() => {
    cy.resetTestUser();
  })

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps('mapping', 'order-processors');
    cy.deleteFlows( 'orderFlow');
  })

  it('can create mapping with processors, create new flow, add mapping step, run flow and verify processors', () => {
    const stepProcessors = '[{{}"path":"/custom-modules/step-processors/addHeaders.sjs","when":"beforeContentPersisted","vars":{{}"exampleVariable":"testValue"{}} {}},{{}"path":"/org.example/addPermissions.sjs","when":"beforeContentPersisted"{}}]'

    curatePage.toggleEntityTypeId('Order');
    curatePage.addNewMapStep().click();

    // create mapping step
    createEditMappingDialog.setMappingName('order-processors');
    createEditMappingDialog.setMappingDescription('An order mapping with custom processors');
    createEditMappingDialog.setSourceRadio('Query');
    createEditMappingDialog.setQueryInput("cts.collectionQuery(['ingest-orders'])")
    createEditMappingDialog.saveButton().click(); 
    curatePage.verifyStepNameIsVisible('order-processors');

    // add processors
    curatePage.stepSettings('order-processors').click();
    advancedSettingsDialog.toggleProcessors();
    advancedSettingsDialog.getProcessors().clear();
    advancedSettingsDialog.setProcessors(stepProcessors);
    advancedSettingsDialog.saveSettings('order-processors').click();
    advancedSettingsDialog.saveSettings('order-processors').should('not.be.visible');

    // map source to entity
    curatePage.openSourceToEntityMap('Order', 'order-processors');
    sourceToEntityMap.expandCollapseEntity().should('be.visible').click();
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

    curatePage.addToNewFlow('Order', 'order-processors');
    runPage.setFlowName('orderFlow');
    runPage.editSave().click();
    runPage.runStep('order-processors').click();
    cy.verifyStepRunResult('success','Mapping', 'order-processors');
    runPage.explorerLink().click()
    browsePage.getTableViewSourceIcon().click();
    cy.contains('mappedOrderDate')
  })
})
