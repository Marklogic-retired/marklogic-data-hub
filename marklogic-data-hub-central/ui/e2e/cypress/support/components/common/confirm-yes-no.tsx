class ConfirmationYesNo {
  getNoButton() {
    return cy.findByLabelText('No');
  }
  getYesButton() {
    return cy.findByLabelText('Yes');
  }
  getDiscardText() {
    return cy.findByLabelText('confirm-body');
  }
}

const confirmationYesNo = new ConfirmationYesNo();

export default confirmationYesNo;