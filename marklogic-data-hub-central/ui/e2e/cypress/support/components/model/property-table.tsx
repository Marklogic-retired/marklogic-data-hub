class PropertyTable {

  getAddPropertyButton(entityName: string) {
    return cy.get(`[aria-label=${entityName}-add-property]`);
  }

  getProperty(propertyName: string) {
    return cy.get('[data-testid=' + propertyName + '-span]');
  }

  getEntityInstanceCount(entityName: string) {
    return cy.get('[data-testid=' + entityName + '-instance-count]').then(function(value){
      return parseInt(value.text().replace(',',''));
    });
  }

  getEntityLastProcessed(entityName: string) {
    return cy.get('[data-testid=' + entityName + '-last-processed]');
  }

  getIdentifierIcon(propertyName: string) {
    return cy.get(`[data-testid=identifier-${propertyName}]`);
  }

  getMultipleIcon(propertyName: string) {
    return cy.get(`[data-testid=multiple-${propertyName}]`);
  }

  getSortIcon(propertyName: string) {
    return cy.get(`[data-testid=sort-${propertyName}]`);
  }

  getFacetIcon(propertyName: string) {
    return cy.get(`[data-testid=facet-${propertyName}]`);
  }

  getWildcardIcon(propertyName: string) {
    return cy.get(`[data-testid=wildcard-${propertyName}]`);
  }

  getPiiIcon(propertyName: string) {
    return cy.get(`[data-testid=pii-${propertyName}]`);
  }

  getAddPropertyToStructureType(structureTypeName: string) {
    return cy.get(`[data-testid=add-struct-${structureTypeName}]`);
  }

  editProperty(propertyName: string) {
    return cy.get('[data-testid=' + propertyName + '-span]').click();
  }

  //Format: EntityTypeName-PropertyName-Definition-Definition
  expandNestedPropertyRow(nestedStructureClass: string) {
    return cy.get(`.${nestedStructureClass}`).find('td > div > [role=img]').eq(0).click();
  }
}

const propertyTable = new PropertyTable();
export default propertyTable
