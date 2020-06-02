class PropertyTable {

  getAddPropertyButton(entityName: string) {
    return cy.get(`[aria-label=${entityName}-add-property]`);
  }

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

  getAdvancedSearchIcon(propertyName: string) {
    return cy.get(`[data-testid=adv-srch-${propertyName}]`);
  }

  getPiiIcon(propertyName: string) {
    return cy.get(`[data-testid=pii-${propertyName}]`);
  }
}

export default PropertyTable