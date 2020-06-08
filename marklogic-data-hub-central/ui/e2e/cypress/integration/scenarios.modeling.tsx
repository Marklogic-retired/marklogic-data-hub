/// <reference types="cypress"/>

import modelPage from '../support/pages/model';
import {
  entityTypeModal,
  entityTypeTable,
  propertyModal,
  propertyTable,
  structuredTypeModal
} from '../support/components/model/index'; 
import { confirmationModal, toolbar, tiles } from '../support/components/common/index';
import { Application } from '../support/application.config';


describe('Entity Modeling', () => {

  //login with valid account
  beforeEach(() => {
    cy.visit('/');
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-entity-model-writer").withRequest()    

    toolbar.getModelToolbarIcon().should('exist');
    toolbar.getModelToolbarIcon().click();
    tiles.getModelTile().should('exist');
  });

  after(() => {
      //resetting the test user back to only have 'hub-central-user' role
      cy.resetTestUser();
  });

  it('can add a new property to an existing Entity', () => {
    entityTypeTable.expandEntityRow(0);
    propertyTable.getAddPropertyButton('PersonXML').click();

    propertyModal.newPropertyName('newID');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('string').click();
    propertyModal.getNoRadio('identifier').click();
    propertyModal.getYesRadio('multiple').click();
    propertyModal.getYesRadio('pii').click();
    propertyModal.clickCheckbox('advancedSearch');
    propertyModal.getAddButton().click();

    propertyTable.getMultipleIcon('newID').should('exist');
    propertyTable.getPiiIcon('newID').should('exist');
    propertyTable.getAdvancedSearchIcon('newID').should('exist');
  });

  it('can create a new entity, relationship type, and adding identifier confirmation', () => {
    modelPage.getAddEntityButton().click();
    entityTypeModal.newEntityName('Product');
    entityTypeModal.newEntityDescription('An entity for Products');
    entityTypeModal.getAddButton().click();
  
    propertyTable.getAddPropertyButton('Product').should('exist').trigger('mouseover');
    cy.contains(`Click to add properties to this entity type.`);
    propertyTable.getAddPropertyButton('Product').click();

    propertyModal.newPropertyName('user');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Relationship').click();    
    propertyModal.getCascadedTypeFromDropdown('Person').click();
    propertyModal.getYesRadio('multiple').click();
    propertyModal.getAddButton().click();

    propertyTable.getMultipleIcon('user').should('exist');

    //Add cascaded type with identifer
    propertyTable.getAddPropertyButton('Product').click();
    propertyModal.newPropertyName('newId');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('More string types').click();    
    propertyModal.getCascadedTypeFromDropdown('hexBinary').click(); 

    propertyModal.getYesRadio('identifier').click();
    propertyModal.getYesRadio('multiple').click();
    propertyModal.getNoRadio('pii').click();
    propertyModal.clickCheckbox('advancedSearch');
    propertyModal.getAddButton().click();

    propertyTable.getIdentifierIcon('newId').should('exist');
    propertyTable.getMultipleIcon('newId').should('exist');
    propertyTable.getAdvancedSearchIcon('newId').should('exist');

    // add basic type with identifier, show confirmation modal
    propertyTable.getAddPropertyButton('Product').click();
    propertyModal.newPropertyName('product-id');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('string').click();    

    propertyModal.getYesRadio('identifier').click();
    confirmationModal.getYesButton().click()
    propertyModal.getAddButton().click();

    propertyTable.getIdentifierIcon('newId').should('not.exist');
    propertyTable.getIdentifierIcon('product-id').should('exist');
  });

  it('can create a structured type, and properties to structure type, and add structure type as property', () => {
    entityTypeTable.expandEntityRow(1);
    propertyTable.getAddPropertyButton('Product').click();


    propertyModal.newPropertyName('address');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Structured').click();    
    propertyModal.getCascadedTypeFromDropdown('New Property Type').click();

    structuredTypeModal.newName('Address');
    structuredTypeModal.getAddButton().click();

    propertyModal.getYesRadio('multiple').click();
    propertyModal.getAddButton().click();

    propertyTable.getMultipleIcon('address').should('exist');

    // add basic property to structured type
    propertyTable.getAddPropertyToStructureType('Address').should('exist').trigger('mouseover');
    cy.contains(`Click to add properties within this structured property.`);
    propertyTable.getAddPropertyToStructureType('Address').click({ force: true });
    propertyModal.getStructuredTypeName().should('have.text', 'Address');
    propertyModal.newPropertyName('street');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('More string types').click();    
    propertyModal.getCascadedTypeFromDropdown('hexBinary').click(); 

    propertyModal.getNoRadio('multiple').click();
    propertyModal.getYesRadio('pii').click();
    propertyModal.clickCheckbox('advancedSearch');
    propertyModal.getAddButton().click();

    propertyTable.getMultipleIcon('street').should('not.exist');
    propertyTable.getPiiIcon('street').should('exist');
    propertyTable.getAdvancedSearchIcon('street').should('exist');

    // add structured property to structured type
    propertyTable.getAddPropertyToStructureType('Address').click({ force: true });
    propertyModal.newPropertyName('zip')
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Structured').click();    
    propertyModal.getCascadedTypeFromDropdown('New Property Type').click();

    structuredTypeModal.newName('Zip');
    structuredTypeModal.getAddButton().click();

    propertyModal.getYesRadio('multiple').click();
    propertyModal.getNoRadio('pii').click();
    propertyModal.getAddButton().click();

    propertyTable.getMultipleIcon('zip').should('exist');
    propertyTable.getPiiIcon('zip').should('not.exist');
    propertyTable.getAdvancedSearchIcon('zip').should('not.exist');

    // add properties to nested structured type
    propertyTable.getAddPropertyToStructureType('Zip').should('exist').trigger('mouseover');
    cy.contains(`Click to add properties within this structured property.`);
    propertyTable.getAddPropertyToStructureType('Zip').click({ force: true });

    propertyModal.getStructuredTypeName().should('have.text', 'Address.Zip');
    propertyModal.newPropertyName('fiveDigit')
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('More number types').click();    
    propertyModal.getCascadedTypeFromDropdown('int').click();
    propertyModal.getAddButton().click();

    propertyTable.getMultipleIcon('code').should('not.exist');
    propertyTable.getPiiIcon('code').should('not.exist');
    propertyTable.getAdvancedSearchIcon('code').should('not.exist');
  })
});
