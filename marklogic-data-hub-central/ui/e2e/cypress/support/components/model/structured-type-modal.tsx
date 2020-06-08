class StructuredTypeModal {
  newName(str: string) {
    cy.get('#structured-name').type(str);
  }

  getCancelButton() {
    return cy.get('#structured-modal-cancel');
  }

  getAddButton() {
    return cy.get('#structured-modal-add');
  }

}

const structuredTypeModal = new StructuredTypeModal();
export default structuredTypeModal;