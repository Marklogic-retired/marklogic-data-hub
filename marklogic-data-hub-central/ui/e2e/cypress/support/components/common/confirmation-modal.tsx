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
    return cy.findByLabelText('save-text', {timeout: 25000});
  }
  getSaveAllEntityText() {
    return cy.findByLabelText('save-all-text', {timeout: 25000});
  }

  getRevertEntityText() {
    return cy.findByLabelText('revert-text', {timeout: 25000});
  }

  getRevertAllEntityText() {
    return cy.findByLabelText('revert-all-text', {timeout: 25000});
  }
  getDeleteEntityText() {
    return cy.findByLabelText('delete-text', {timeout: 15000});
  }
  getDeleteEntityRelationshipText() {
    return cy.findByLabelText('delete-relationship-text', {timeout: 15000});
  }
  getDeleteEntityStepText() {
    return cy.findByLabelText('delete-step-text', {timeout: 15000});
  }
  getDeletePropertyWarnText() {
    return cy.findByLabelText('delete-property-text', {timeout: 15000});
  }
  getDeletePropertyStepWarnText() {
    return cy.findByLabelText('delete-property-step-text', {timeout: 15000});
  }
  getNavigationWarnText() {
    return cy.findByLabelText('navigation-warn-text');
  }
}

const confirmationModal = new ConfirmationModal();

export default confirmationModal