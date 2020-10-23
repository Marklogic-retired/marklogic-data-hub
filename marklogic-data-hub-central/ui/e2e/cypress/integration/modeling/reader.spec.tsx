/// <reference types="cypress"/>

import modelPage from '../../support/pages/model';
import {
  entityTypeModal,
  entityTypeTable,
  propertyModal,
  propertyTable,
} from '../../support/components/model/index';
import { confirmationModal, toolbar, tiles } from '../../support/components/common/index';
import { Application } from '../../support/application.config';
import browsePage from '../../support/pages/browse';
import 'cypress-wait-until';

describe('Entity Modeling: Reader Role', () => {

  //login with valid account
  beforeEach(() => {
    cy.visit('/');
    cy.contains(Application.title);
    console.log(Cypress.env('mlHost'));
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-saved-query-user").withRequest();
    cy.waitUntil(() => toolbar.getModelToolbarIcon().should('have.css', 'cursor', 'pointer')).click();
    entityTypeTable.waitForTableToLoad();
  });

  after(() => {
      //resetting the test user back to only have 'hub-central-user' role
      cy.resetTestUser();
  });

  it('can navigate by clicking instance count and last processed, can not create, edit, or delete entity models', () => {
    // Removed navigation tests unitl DHFPROD-6152 is resolved
    
    // cy.waitUntil(() => entityTypeTable.getEntityLastProcessed('Person')).click();
    // tiles.getExploreTile().should('exist');
    // cy.waitUntil(() => browsePage.getSelectedEntity()).should('eq', 'Person');
    // browsePage.getClearAllButton().should('exist');

    // toolbar.getModelToolbarIcon().click();
    // tiles.getModelTile().should('exist');

    // cy.waitUntil(() => entityTypeTable.getEntityInstanceCount('Order')).click();
    // tiles.getExploreTile().should('exist');
    // cy.waitUntil(() => browsePage.getSelectedEntity().should('eq', 'Order'));
    // browsePage.getClearAllButton().should('not.exist');

    // cy.go('back');
    // cy.url().should('include', '/tiles/model');
    // tiles.getModelTile().should('exist');

    modelPage.getAddEntityButton().click({ force: true });
    cy.wait(100);
    entityTypeModal.getAddButton().should('not.be.visible');

    modelPage.getSaveAllButton().click({ force: true });
    cy.wait(100);
    confirmationModal.getSaveAllEntityText().should('not.be.visible');

    modelPage.getRevertAllButton().click({ force: true });
    cy.wait(100);
    confirmationModal.getRevertEntityText().should('not.be.visible');

    entityTypeTable.getEntity('Customer').click({ force: true });
    cy.wait(100);
    propertyModal.getSubmitButton().should('not.be.visible');

    entityTypeTable.getDeleteEntityIcon('Customer').click({ force: true });
    cy.wait(100);
    confirmationModal.getDeleteEntityStepText().should('not.be.visible');

    entityTypeTable.getRevertEntityIcon('Customer').click({ force: true });
    cy.wait(100);
    confirmationModal.getRevertEntityText().should('not.be.visible');

    entityTypeTable.getSaveEntityIcon('Customer').click({ force: true });
    cy.wait(100);
    confirmationModal.getSaveEntityText().should('not.be.visible');

    entityTypeTable.getExpandEntityIcon('Customer').click();
    propertyTable.getAddPropertyButton('Customer').should('be.visible').click({ force: true });
    cy.wait(100);
    propertyModal.getSubmitButton().should('not.be.visible');

    propertyTable.getDeletePropertyIcon('Customer','pin').click({ force: true });
    cy.wait(100);
    confirmationModal.getDeletePropertyStepWarnText().should('not.be.visible');

    propertyTable.getAddPropertyToStructureType('Address').click({ force: true });
    cy.wait(100);
    propertyModal.getStructuredTypeName().should('not.be.visible');

    propertyTable.expandStructuredTypeIcon('shipping').click();
    propertyTable.expandStructuredTypeIcon('zip').click();

    propertyTable.getAddPropertyToStructureType('Zip').click({ force: true });
    cy.wait(100);
    propertyModal.getStructuredTypeName().should('not.be.visible');

    propertyTable.getDeleteStructuredPropertyIcon('Customer', 'Zip', 'fiveDigit').click({ force: true });
    cy.wait(100);
    confirmationModal.getDeletePropertyStepWarnText().should('not.be.visible');
  });
});
