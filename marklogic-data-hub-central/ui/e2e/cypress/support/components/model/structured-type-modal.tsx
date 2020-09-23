class StructuredTypeModal {
  newName(str: string) {
    cy.get('#structured-name').focus().type(str);
  }

  clearName() {
    cy.get('#structured-name').focus().clear();
  }

  getCancelButton() {
    return cy.get('[aria-label="structured-type-modal-cancel"');
  }

  getAddButton() {
    return cy.get('[aria-label="structured-type-modal-submit"');
  }

}

const structuredTypeModal = new StructuredTypeModal();
export default structuredTypeModal;