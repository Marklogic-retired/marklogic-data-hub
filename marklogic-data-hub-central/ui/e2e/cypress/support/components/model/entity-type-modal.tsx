class EntityTypeModal {
  newEntityName(str: string) {
    cy.get('#name').type(str);
  }

  newEntityDescription(str: string) {
    cy.get('#description').type(str);
  }

  getCancelButton() {
    return cy.get('#entity-modal-cancel');
  }

  getAddButton() {
    return cy.get('#entity-modal-add');
  }

}

export default EntityTypeModal