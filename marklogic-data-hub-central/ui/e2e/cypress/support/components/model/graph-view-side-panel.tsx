class GraphViewSidePanel {
  getSelectedEntityHeading(entityName: string) {
    return cy.findByLabelText(`${entityName}-selectedEntity`);
  }

  getDeleteIcon(entityName: string) {
    return cy.findByTestId(`${entityName}-delete`);
  }

  closeSidePanel() {
    return cy.findByLabelText("closeGraphViewSidePanel").scrollIntoView().trigger("mouseover").click({force: true});
  }

  getPropertiesTab() {
    return cy.get(`[data-rr-ui-event-key="properties"]`);
  }

  getEntityTypeTab() {
    return cy.get(`[data-rr-ui-event-key="entityType"]`);
  }

  getEntityTypeTabContent() {
    return cy.get(`[id="entityType-tab-content"`);
  }
  getEntityTypeName(entityName: string) {
    return cy.findByTestId(`${entityName}`);
  }
  getEntityTypeDescription() {
    return cy.get("#description");
  }
  getEntityTypeColor(entityName: string) {
    return cy.get(`[id="${entityName}-color-button"] > div`);
  }

  getPropertyTableHeader(headerName: string) {
    return cy.findByLabelText(`${headerName}-header`);
  }

  getPropertyName(propName: string) {
    return cy.findByTestId(`${propName}-span`);
  }

  getEntityDescription() {
    return cy.get("#description");
  }

  getEntityNamespace() {
    return cy.get("#namespace");
  }

  getEntityPrefix() {
    return cy.get("#prefix");
  }

  getGraphViewFilterInput() {
    return cy.get(".rbt-input");
  }

  selectEntityDropdown() {
    return cy.get(".dropdown-menu").click();
  }

  getPropertyTypeIcon(icon: string, property: string) {
    return cy.findByTestId(`${icon}-${property}`);
  }

  getIconTooltip(property: string, tooltip: string) {
    return cy.get(`#tooltip-${property}`, {timeout: 5000}).find("div.tooltip-inner").contains(`${tooltip}`).should("exist");
  }

  getEntityLabelDropdown(entityType: string) {
    return cy.get(`[id="${entityType}-entityLabel-select-wrapper"]`).scrollIntoView();
  }

  getEntityLabelDropdownOption(entityType: string, option: string) {
    return cy.get(`[aria-label="${entityType}-labelOption-${option}"]`).first().scrollIntoView();
  }

  getPropertiesOnHoverDropdown(entityType: string) {
    return cy.get(`[id="${entityType}-entityProperties-select-wrapper"]`).scrollIntoView();
  }

  getPropertiesOnHoverDropdownOption(entityType: string, option: string) {
    return cy.get(`[aria-label="${entityType}-propertiesOption-${option}"]`).first().scrollIntoView();
  }
}

const graphViewSidePanel = new GraphViewSidePanel();
export default graphViewSidePanel;
