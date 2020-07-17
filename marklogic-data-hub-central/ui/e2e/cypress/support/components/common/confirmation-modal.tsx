import { ConfirmationType } from '../../types/modeling-types';

class ConfirmationModal {
  getNoButton(type: ConfirmationType) {
    return cy.findByLabelText(`confirm-${type}-no`);
  }
  getCloseButton(type: ConfirmationType) {
    return cy.findByLabelText(`confirm-${type}-close`);
  }
  getYesButton(type: ConfirmationType) {
    return cy.findByLabelText(`confirm-${type}-yes`);
  }
  getToggleStepsButton() {
    return cy.findByLabelText('toggle-steps');
  }
  getSaveEntityText() {
    return cy.get('#save-text', {timeout: 25000});
  }
  getSaveAllEntityText() {
    return cy.get('#save-all-text', {timeout: 25000});
  }
  getDeleteEntityText() {
    return cy.get('#delete-text', {timeout: 15000});
  }
  getDeleteEntityRelationshipText() {
    return cy.get('#delete-relationship-text', {timeout: 15000});
  }
  getDeleteEntityStepText() {
    return cy.get('#delete-step-text', {timeout: 15000});
  }
  getDeletePropertyWarnText() {
    return cy.get('#delete-property-text', {timeout: 15000});
  }
  getDeletePropertyStepWarnText() {
    return cy.get('#delete-property-step-text', {timeout: 15000});
  }
}

const confirmationModal = new ConfirmationModal();

export default confirmationModal