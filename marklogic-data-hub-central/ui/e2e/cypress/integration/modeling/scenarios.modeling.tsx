/// <reference types="cypress"/>

import modelPage from '../../support/pages/model';
import {
  entityTypeModal,
  entityTypeTable,
  propertyModal,
  propertyTable,
  structuredTypeModal
} from '../../support/components/model/index';
import { confirmationModal, toolbar, tiles } from '../../support/components/common/index';
import { Application } from '../../support/application.config';
import { ConfirmationType } from '../../support/types/modeling-types';
import 'cypress-wait-until';

describe('Entity Modeling', () => {

  //login with valid account
  beforeEach(() => {
    cy.visit('/');
    cy.contains(Application.title);
    console.log(Cypress.env('mlHost'));
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-entity-model-writer").withRequest()
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    entityTypeTable.waitForTableToLoad();
  });

  after(() => {
      //resetting the test user back to only have 'hub-central-user' role
      cy.resetTestUser();
  });

  it('can add a new property to an existing Entity, delete shows step warning', () => {
    entityTypeTable.expandEntityRow(1);
    propertyTable.getAddPropertyButton('Person').click();

    propertyModal.newPropertyName('newID');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('string').click();
    propertyModal.getNoRadio('identifier').click();
    propertyModal.getYesRadio('multiple').click();
    propertyModal.getYesRadio('pii').click();
    propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('newID').should('exist');
    propertyTable.getPiiIcon('newID').should('exist');
    propertyTable.getWildcardIcon('newID').should('exist');

    entityTypeTable.getDeleteEntityIcon('Person').click();
    cy.contains('Entity type is used in one or more steps.');
    cy.contains('Show Steps...');

    confirmationModal.getToggleStepsButton().click();
    cy.contains('mapPersonJSON');
    cy.contains('Hide Steps...');

    confirmationModal.getCloseButton(ConfirmationType.DeleteEntityStepWarn).click();
    entityTypeTable.getEntity('Person').should('exist');
  });

  it('can create a new entity, relationship type, and adding identifier confirmation, and delete entity', () => {
    modelPage.getAddEntityButton().should('exist');
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
    propertyModal.getSubmitButton().click();

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
    propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();

    propertyTable.getIdentifierIcon('newId').should('exist');
    propertyTable.getMultipleIcon('newId').should('exist');
    propertyTable.getWildcardIcon('newId').should('exist');

    // add basic type with identifier, show confirmation modal
    propertyTable.getAddPropertyButton('Product').click();
    propertyModal.newPropertyName('product-id');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('string').click();

    propertyModal.getYesRadio('identifier').click();
    confirmationModal.getYesButton(ConfirmationType.Identifer).click()
    propertyModal.getSubmitButton().click();

    propertyTable.getIdentifierIcon('newId').should('not.exist');
    propertyTable.getIdentifierIcon('product-id').should('exist');

    // edit property and change type to relationship
    propertyTable.editProperty('product-id');
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName('user-id');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Relationship').click();
    propertyModal.getCascadedTypeFromDropdown('Customer').click();

    propertyModal.getYesRadio('idenifier').should('not.exist');
    propertyModal.getYesRadio('multiple').click();
    propertyModal.getNoRadio('pii').should('not.exist');
    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('user-id').should('exist');
    propertyTable.getIdentifierIcon('user-id').should('not.exist');
    propertyTable.getPiiIcon('user-id').should('not.exist');
    propertyTable.getWildcardIcon('user-id').should('not.exist');

    entityTypeTable.getSaveEntityIcon('Product').click();
    confirmationModal.getYesButton(ConfirmationType.SaveEntity).click();
    confirmationModal.getSaveEntityText().should('exist');
    confirmationModal.getSaveEntityText().should('not.exist');

    entityTypeTable.getDeleteEntityIcon('Product').click();
    confirmationModal.getYesButton(ConfirmationType.DeleteEntity).click();
    confirmationModal.getDeleteEntityText().should('exist');
    confirmationModal.getDeleteEntityText().should('not.exist');
    entityTypeTable.getEntity('Product').should('not.exist');
  });

  it('can create entity, can create a structured type, and properties to structure type, and add structure type as property, and delete entity', () => {
    modelPage.getAddEntityButton().should('exist');
    modelPage.getAddEntityButton().click();
    entityTypeModal.newEntityName('User');
    entityTypeModal.newEntityDescription('An entity for User');
    entityTypeModal.getAddButton().click();

    propertyTable.getAddPropertyButton('User').click();

    propertyModal.newPropertyName('address');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Structured').click();
    propertyModal.getCascadedTypeFromDropdown('New Property Type').click();

    structuredTypeModal.newName('Address');
    structuredTypeModal.getAddButton().click();

    propertyModal.getYesRadio('multiple').click();
    propertyModal.getSubmitButton().click();

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
    propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('street').should('not.exist');
    propertyTable.getPiiIcon('street').should('exist');
    propertyTable.getWildcardIcon('street').should('exist');

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
    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('zip').should('exist');
    propertyTable.getPiiIcon('zip').should('not.exist');
    propertyTable.getWildcardIcon('zip').should('not.exist');

    // add properties to nested structured type
    propertyTable.getAddPropertyToStructureType('Zip').should('exist').trigger('mouseover');
    cy.contains(`Click to add properties within this structured property.`);
    propertyTable.getAddPropertyToStructureType('Zip').click({ force: true });

    propertyModal.getStructuredTypeName().should('have.text', 'Address.Zip');
    propertyModal.newPropertyName('fiveDigit')
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('More number types').click();
    propertyModal.getCascadedTypeFromDropdown('int').click();
    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('code').should('not.exist');
    propertyTable.getPiiIcon('code').should('not.exist');
    propertyTable.getWildcardIcon('code').should('not.exist');

    // Test for additional nesting of structured types
    propertyTable.getAddPropertyToStructureType('Zip').click({ force: true });
    propertyModal.newPropertyName('extra')
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Structured').click();
    propertyModal.getCascadedTypeFromDropdown('New Property Type').click();

    structuredTypeModal.newName('Extra');
    structuredTypeModal.getAddButton().click();

    propertyModal.getSubmitButton().click();

    propertyTable.getAddPropertyToStructureType('Extra').should('exist').trigger('mouseover');
    cy.contains(`Click to add properties within this structured property.`);
    propertyTable.getAddPropertyToStructureType('Extra').click({ force: true });

    propertyModal.newPropertyName('fourDigit')
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('integer').click();
    propertyModal.getYesRadio('pii').click();
    propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();

    propertyTable.expandNestedPropertyRow('User-extra-Zip-Extra');
    propertyTable.getMultipleIcon('fourDigit').should('not.exist');
    propertyTable.getPiiIcon('fourDigit').should('exist');
    propertyTable.getWildcardIcon('fourDigit').should('exist');

    //Edit Property Structured Property
    propertyTable.editProperty('street');
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName('Zip');
    propertyModal.getSubmitButton().click();
    cy.contains(`A property already exists with a name of Zip`);
    propertyModal.clearPropertyName();

    propertyModal.newPropertyName('streetAlt');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('More string types').click();
    propertyModal.getCascadedTypeFromDropdown('base64Binary').click();

    propertyModal.getYesRadio('idenifier').should('not.exist');
    propertyModal.getYesRadio('multiple').click();
    propertyModal.getNoRadio('pii').click();
    propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('streetAlt').should('exist');
    propertyTable.getPiiIcon('streetAlt').should('not.exist');
    propertyTable.getWildcardIcon('streetAlt').should('exist');

    //rename property and change type from structured to relationship
    propertyTable.editProperty('address');
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName('alt_address');

    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Relationship').click();
    propertyModal.getCascadedTypeFromDropdown('Person').click();

    propertyModal.getYesRadio('multiple').click();
    propertyModal.getYesRadio('idenifier').should('not.exist');
    propertyModal.getYesRadio('pii').should('not.exist');
    propertyModal.getCheckbox('wildcard').should('not.exist');

    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('alt_address').should('exist');
    propertyTable.getIdentifierIcon('alt_address').should('not.exist');
    propertyTable.getPiiIcon('alt_address').should('not.exist');

    // change relationship property to structured
    propertyTable.editProperty('alt_address');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Structured').click();
    propertyModal.getCascadedTypeFromDropdown('Address').click();
    propertyModal.getSubmitButton().click();
    propertyTable.expandNestedPropertyRow('User-alt_address-Address');
    propertyTable.getProperty('streetAlt').should('exist');

    entityTypeTable.getSaveEntityIcon('User').click();
    confirmationModal.getYesButton(ConfirmationType.SaveEntity).click();
    confirmationModal.getSaveEntityText().should('exist');
    confirmationModal.getSaveEntityText().should('not.exist');

    entityTypeTable.getDeleteEntityIcon('User').click();
    confirmationModal.getYesButton(ConfirmationType.DeleteEntity).click();
    confirmationModal.getDeleteEntityText().should('exist');
    confirmationModal.getDeleteEntityText().should('not.exist');
    entityTypeTable.getEntity('User').should('not.exist');
  });

  it('can add multiple entities, add properties, and save all entities', () => {
    modelPage.getAddEntityButton().should('exist');
    modelPage.getAddEntityButton().click();
    entityTypeModal.newEntityName('Concept');
    entityTypeModal.newEntityDescription('A concept entity');
    entityTypeModal.getAddButton().click();

    propertyTable.getAddPropertyButton('Concept').should('exist').trigger('mouseover');
    cy.contains(`Click to add properties to this entity type.`);
    propertyTable.getAddPropertyButton('Concept').click();

    propertyModal.newPropertyName('order');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Relationship').click();
    propertyModal.getCascadedTypeFromDropdown('Order').click();
    propertyModal.getYesRadio('multiple').click();
    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('order').should('exist');

    //create second Entity
    modelPage.getAddEntityButton().should('exist');
    modelPage.getAddEntityButton().click();
    entityTypeModal.newEntityName('Patient');
    entityTypeModal.newEntityDescription('An entity for patients');
    entityTypeModal.getAddButton().click();

    propertyTable.getAddPropertyButton('Patient').should('exist').trigger('mouseover');
    cy.contains(`Click to add properties to this entity type.`);
    propertyTable.getAddPropertyButton('Patient').click();
    propertyModal.newPropertyName('patientID');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('More number types').click();
    propertyModal.getCascadedTypeFromDropdown('byte').click();
    propertyModal.getYesRadio('identifier').click();
    propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();

    propertyTable.getIdentifierIcon('patientID').should('exist');
    propertyTable.getWildcardIcon('patientID').should('exist');

    propertyTable.getAddPropertyButton('Patient').should('exist');
    propertyTable.getAddPropertyButton('Patient').click();
    propertyModal.newPropertyName('conceptType');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Relationship').click();
    propertyModal.getCascadedTypeFromDropdown('Concept').click();
    propertyModal.getSubmitButton().click();

    propertyTable.getProperty('conceptType').should('exist');

    modelPage.getSaveAllButton().click();
    confirmationModal.getYesButton(ConfirmationType.SaveAll).click();
    confirmationModal.getSaveAllEntityText().should('exist');
    confirmationModal.getSaveAllEntityText().should('not.exist');

    entityTypeTable.getDeleteEntityIcon('Concept').click();
    confirmationModal.getYesButton(ConfirmationType.DeleteEntityRelationshipWarn).click();
    confirmationModal.getDeleteEntityRelationshipText().should('exist');
    confirmationModal.getDeleteEntityRelationshipText().should('not.exist');

    entityTypeTable.getEntity('Concept').should('not.exist');
    propertyTable.getProperty('conceptType').should('not.exist');

    entityTypeTable.getDeleteEntityIcon('Patient').click();
    confirmationModal.getYesButton(ConfirmationType.DeleteEntity).click();
    confirmationModal.getDeleteEntityText().should('exist');
    confirmationModal.getDeleteEntityText().should('not.exist');
    entityTypeTable.getEntity('Patient').should('not.exist');
  });
});
