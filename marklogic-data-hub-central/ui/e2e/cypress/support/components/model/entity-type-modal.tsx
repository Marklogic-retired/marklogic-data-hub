class EntityTypeModal {
  newEntityName(str: string) {
    cy.get("#entity-name").clear().type(str);
  }

  clearEntityName() {
    cy.get("#entity-name").focus().clear();
  }

  newEntityDescription(str: string) {
    cy.get("#description").type(str);
  }

  newEntityVersion(str: string) {
    cy.get("#version").clear().type(str);
  }

  getEntityVersion() {
    return cy.get("#version");
  }

  clearEntityDescription() {
    cy.get("#description").focus().clear();
  }

  entityNameError() {
    return cy.findByLabelText("entity-name-error");
  }
  getEntityDescription() {
    return cy.get("#description");
  }

  getCancelButton() {
    return cy.get("#entity-modal-cancel");
  }

  getAddButton() {
    return cy.get("#entity-modal-add", {timeout: 20000});
  }

  getNamespaceInput() {
    return cy.get("#namespace");
  }

  getPrefixInput() {
    return cy.get("#prefix");
  }

}

const entityTypeModal = new EntityTypeModal();
export default entityTypeModal;
