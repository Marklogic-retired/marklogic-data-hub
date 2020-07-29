class PropertyTable {

  getAddPropertyButton(entityName: string) {
    return cy.findByLabelText(`${entityName}-add-property`, { timeout: 15000 });
  }

  getProperty(propertyName: string) {
    return cy.findByTestId(`${propertyName}-span`);
  }

  getEntityInstanceCount(entityName: string) {
    return cy.findByTestId(`${entityName}-instance-count`).then(function(value){
      return parseInt(value.text().replace(',',''));
    });
  }

  getEntityLastProcessed(entityName: string) {
    return cy.findByTestId(`${entityName}-last-processed`);
  }

  getIdentifierIcon(propertyName: string) {
    return cy.findByTestId(`identifier-${propertyName}`);
  }

  getMultipleIcon(propertyName: string) {
    return cy.findByTestId(`multiple-${propertyName}`);
  }

  getSortIcon(propertyName: string) {
    return cy.findByTestId(`sort-${propertyName}`);
  }

  getFacetIcon(propertyName: string) {
    return cy.findByTestId(`facet-${propertyName}`);
  }

  // getWildcardIcon(propertyName: string) {
  //   return cy.findByTestId(`wildcard-${propertyName}`);
  // }

  getPiiIcon(propertyName: string) {
    return cy.findByTestId(`pii-${propertyName}`);
  }

  getAddPropertyToStructureType(structureTypeName: string) {
    return cy.findByTestId(`add-struct-${structureTypeName}`);
  }

  editProperty(propertyName: string) {
    return cy.findByTestId(`${propertyName}-span`).click();
  }

  expandStructuredTypeIcon(propertyName: string) {
    return cy.findByTestId(`mltable-expand-${propertyName}`);
  }

  getDeletePropertyIcon(entityName: string, propertyName: string) {
    return cy.findByTestId(`delete-${entityName}-${propertyName}`);
  }

  getDeleteStructuredPropertyIcon(entityName: string, structuredTypeName: string, propertyName: string) {
    return cy.findByTestId(`delete-${entityName}-${structuredTypeName}-${propertyName}`);
  }
}

const propertyTable = new PropertyTable();
export default propertyTable
