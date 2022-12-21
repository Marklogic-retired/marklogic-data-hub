class ConceptClassModal {
  newConceptClassName(str: string) {
    cy.get("#concept-class-name").clear().type(str);
  }

  clearConceptClassName() {
    cy.get("#concept-class-name").focus().clear();
  }

  newConceptClassDescription(str: string) {
    cy.get("#description").type(str);
  }

  clearConceptClassDescription() {
    cy.get("#description").focus().clear();
  }

  conceptClassNameError() {
    return cy.findByLabelText("concept-class-name-error");
  }

  conceptModalValidationError() {
    return cy.get("div[class*='concept-class-modal_validationError']");
  }

  getConceptClassDescription() {
    return cy.get("#description");
  }

  getCancelButton() {
    return cy.get("#concept-class-modal-cancel");
  }

  getAddButton() {
    return cy.get("#concept-class-modal-add", {timeout: 20000});
  }
}

const conceptClassModal = new ConceptClassModal();
export default conceptClassModal;
