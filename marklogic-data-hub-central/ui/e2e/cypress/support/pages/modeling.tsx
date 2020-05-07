class ModelingPage {

  // Entity Type Modal
  addEntityType() {
    return cy.get('[data-testid=add-btn').click();
  }

  newEntityName(str: string) {
    cy.get('#name').type(str);
  }

  newEntityDescription(str: string) {
    cy.get('#description').type(str);
  }

  submitNewEntityForm() {
    cy.get('#entity-type-form').submit()
  }

  nameValidationMessage() {
    return cy.get('.ant-form-explain');
  }

  // Entity Type Table
  getEntity(entityName: string) {
    return cy.get('[data-testid=' + entityName + '-span]');
  }

  getEntityInstanceCount(entityName: string) {
    return cy.get('[data-testid=' + entityName + '-instance-count]').then(function(value){
      return parseInt(value.text().replace(',',''));
    });
  }

  getEntityLastProcessed(entityName: string) {
    return cy.get('[data-testid=' + entityName + '-last-processed]');
  }

  sortByEntityName() {
    return cy.get('th').eq(0).click();
  }

  sortByInstanceCount() {
    return cy.get('th').eq(1).click();
  }

  sortByLastProcessed() {
    return cy.get('th').eq(2).click();
  }
}

export default ModelingPage;