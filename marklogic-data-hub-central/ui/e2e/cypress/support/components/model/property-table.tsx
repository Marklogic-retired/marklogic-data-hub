class PropertyTable {

  getAddPropertyButton(entityName: string) {
    return cy.findByLabelText(`${entityName}-add-property`, {timeout: 15000}).scrollIntoView();
  }

  getProperty(propertyName: string) {
    return cy.findByTestId(`${propertyName}-span`);
  }

  getEntityInstanceCount(entityName: string) {
    return cy.findByTestId(`${entityName}-instance-count`).then(function (value) {
      return parseInt(value.text().replace(",", ""));
    });
  }
  getSubProperty(property: string, subProperty: string) {
    return cy.get(`[data-testid=${property}-${subProperty}-tooltip-trigger]`);
  }
  getEntityLastProcessed(entityName: string) {
    return cy.findByTestId(`${entityName}-last-processed`);
  }

  getForeignIcon(propertyName: string) {
    return cy.findByTestId(`foreign-${propertyName}`);
  }

  getIdentifierIcon(propertyName: string) {
    return cy.findByTestId(`identifier-${propertyName}`);
  }

  getMultipleIcon(propertyName: string) {
    return cy.findByTestId(`multiple-icon-${propertyName}`);
  }

  getSortIcon(propertyName: string) {
    return cy.findByTestId(`sort-${propertyName}`);
  }

  getSortButton(propertyName: string) {
    return cy.get(`[data-testid=${propertyName}]`);
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
    return cy.findAllByTestId(`add-struct-${structureTypeName}`).eq(0).scrollIntoView();
  }

  editProperty(propertyName: string) {
    cy.findByTestId(`${propertyName}-span`).scrollIntoView().then(() => {
      cy.findByTestId(`${propertyName}-span`).click({force: true});
    });
  }

  expandExtraStructuredTypeIcon() {
    return cy.get(`.scroll-ffc26530ed-cfc97430bf-f0d870-efc97430bf > :nth-child(1) > .ant-table-row-expand-icon`);
  }

  getDeletePropertyIcon(entityName: string, propertyName: string) {
    return cy.findByTestId(`delete-${entityName}-${propertyName}`);
  }

  getDeleteStructuredPropertyIcon(entityName: string, structuredTypeName: string, propertyName: string) {
    return cy.findAllByTestId(`delete-${entityName}-${structuredTypeName}-${propertyName}`).eq(0);
  }

  verifyRelationshipIcon(propertyName: string) {
    return cy.findByTestId(`relationship-${propertyName}`);
  }

  verifyForeignKeyIcon(propertyName: string) {
    return cy.findByTestId(`foreign-${propertyName}`);
  }

  getExpandIcon(propertyName: string) {
    return cy.findByTestId(`${propertyName}-expand-icon`);
  }

  getTooltipForPropertyName(propertyName: string) {
    return cy.get(`[id=property-${propertyName}-tooltip]`);
  }

  getTooltipForAddIconInStructuredType(structuredTypeName: string) {
    return cy.get(`[id=add-struct-${structuredTypeName}-tooltip]`);
  }

  getTooltipForDeletePropertyIcon(entity: string, propertyName: string) {
    return cy.get(`[id=delete-${entity}-${propertyName}-tooltip]`);
  }

  getEntityToDelete(testId:string) {
    return cy.findByTestId(`${testId}`);
  }

  getPropertyName(property: string) {
    return cy.findByText(property);
  }

  getLinkAddButton(entity: string) {
    return cy.get(`[aria-label=${entity}-linkAddButton]`);
  }

  getPropertyType(property: string) {
    return cy.get(`[data-testid="${property}-type"]`);
  }

}

const propertyTable = new PropertyTable();
export default propertyTable;
