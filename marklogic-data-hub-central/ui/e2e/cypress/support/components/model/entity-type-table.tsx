class EntityTypeTable {
  getEntity(entityName: string) {
    return cy.findByTestId(`${entityName}-span`);
  }

  getEntityInstanceCount(entityName: string) {
    return cy.findByTestId(`${entityName}-instance-count`);
  }

  getEntityInstanceCountValue(entityName: string) {
    return cy.findByTestId(`${entityName}-instance-count`).then(function(value){
      return parseInt(value.text().replace(',',''));
    });
  }

  getEntityLastProcessed(entityName: string) {
    return cy.findByTestId(`${entityName}-last-processed`);
  }

  getExpandEntityIcon(entityName: string) {
    return cy.findByTestId(`mltable-expand-${entityName}`);
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

  getDeleteEntityIcon(entityName: string) {
    return cy.findByTestId(`${entityName}-trash-icon`);
  }

  getSaveEntityIcon(entityName: string) {
    return cy.findByTestId(`${entityName}-save-icon`);
  }

  getRevertEntityIcon(entityName: string) {
    return cy.findByTestId(`${entityName}-revert-icon`);
  }

  waitForTableToLoad() {
      cy.waitUntil(() => cy.get('.ant-table-row').should('have.length.gt',0));
  }
}

const entityTypeTable = new EntityTypeTable();
export default entityTypeTable;
