class StructuredTypeModal {
  newName(str: string) {
    cy.get("#structured-name").focus().type(str);
  }

  clearName() {
    cy.get("#structured-name").focus().clear();
  }

  newNamespace(str: string) {
    cy.get("#structured-namespace").focus().type(str);
  }

  clearNamespace() {
    cy.get("#structured-namespace").focus().clear();
  }

  newPrefix(str: string) {
    cy.get("#structured-prefix").focus().type(str);
  }

  clearPrefix() {
    cy.get("#structured-prefix").focus().clear();
  }

  getCancelButton() {
    return cy.get("[aria-label=\"structured-type-modal-cancel\"");
  }

  getAddButton() {
    return cy.get("[aria-label=\"structured-type-modal-submit\"");
  }

  verifyPrefixNameError() {
    return cy.findByTestId("prefix-error").should("be.visible");
  }

  verifyNamespaceError() {
    return cy.findByTestId("namespace-error").should("be.visible");
  }
}

const structuredTypeModal = new StructuredTypeModal();
export default structuredTypeModal;