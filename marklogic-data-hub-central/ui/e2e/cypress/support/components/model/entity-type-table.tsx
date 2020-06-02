class EntityTypeTable {
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

  expandEntityRow(index: number) {
    return cy.get('[role=button]').eq(index).click();
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

export default EntityTypeTable