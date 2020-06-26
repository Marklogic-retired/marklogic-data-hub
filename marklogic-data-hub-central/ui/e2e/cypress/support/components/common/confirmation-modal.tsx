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
}

const confirmationModal = new ConfirmationModal();

export default confirmationModal