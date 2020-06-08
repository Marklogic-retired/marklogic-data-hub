class ConfirmationModal {
  getNoButton() {
    return cy.get('#confirm-modal-no');
  }
  getYesButton() {
    return cy.get('#confirm-modal-yes');
  }
}

const confirmationModal = new ConfirmationModal();
export default confirmationModal