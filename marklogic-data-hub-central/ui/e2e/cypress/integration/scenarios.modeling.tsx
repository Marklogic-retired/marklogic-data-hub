/// <reference types="cypress"/>

import ModelPage from '../support/pages/model';
import {
  EntityTypeModal,
  EntityTypeTable,
  PropertyModal,
  PropertyTable
} from '../support/components/model/index'; 
import { ConfirmationModal, Toolbar, Tiles } from '../support/components/common/index';
import { Application } from '../support/application.config';

const modelPage = new ModelPage();

const entityTypeModal = new EntityTypeModal();
const entityTypeTable = new EntityTypeTable();
const propertyModal = new PropertyModal();
const propertyTable = new PropertyTable();

const confirmationModal = new ConfirmationModal();
const toolbar = new Toolbar();
const tiles = new Tiles();


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

  // Blocked by DHFPROD-5096
  // it('can create a new entity, relationship type, and adding identifier confirmation', () => {
  //   modelPage.getAddEntityButton().click();
  //   entityTypeModal.newEntityName('Product');
  //   entityTypeModal.newEntityDescription('An entity for Products');
  //   entityTypeModal.getAddButton().click();
  //   cy.wait(1000);
  //   //Add relationship type
  //   propertyTable.getAddPropertyButton('Product').click();
  //   propertyModal.newPropertyName('user');
  //   propertyModal.openPropertyDropdown();
  //   propertyModal.getTypeFromDropdown('Relationship').click();    
  //   propertyModal.getCascadedTypeFromDropdown('Person').click();
  //   propertyModal.getYesRadio('multiple').click();
  //   propertyModal.getAddButton().click();

  //   propertyTable.getMultipleIcon('user').should('exist');

  //   //Add cascaded type with identifer
  //   propertyTable.getAddPropertyButton('Product').click();
  //   propertyModal.newPropertyName('newId');
  //   propertyModal.openPropertyDropdown();
  //   propertyModal.getTypeFromDropdown('More string types').click();    
  //   propertyModal.getCascadedTypeFromDropdown('hexBinary').click(); 

  //   propertyModal.getYesRadio('identifier').click();
  //   propertyModal.getYesRadio('multiple').click();
  //   propertyModal.getNoRadio('pii').click();
  //   propertyModal.clickCheckbox('advancedSearch');
  //   propertyModal.getAddButton().click();

  //   propertyTable.getIdentifierIcon('newId').should('exist');
  //   propertyTable.getMultipleIcon('newId').should('exist');
  //   propertyTable.getAdvancedSearchIcon('newId').should('exist');

  //   // add basic type with identifier
  //   propertyTable.getAddPropertyButton('Product').click();
  //   propertyModal.newPropertyName('product-id');
  //   propertyModal.openPropertyDropdown();
  //   propertyModal.getTypeFromDropdown('string').click();    

  //   propertyModal.getYesRadio('identifier').click();
  //   confirmationModal.getYesButton().click()
  //   propertyModal.getAddButton().click();

  //   propertyTable.getIdentifierIcon('newId').should('not.exist');
  //   propertyTable.getIdentifierIcon('product-id').should('exist');
  // });

});
