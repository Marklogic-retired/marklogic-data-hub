class ConfirmationModal {
  getNoButton() {
    return cy.get('#confirm-modal-no');
  }
  getYesButton() {
    return cy.get('#confirm-modal-yes');
  }
}

export default ConfirmationModal