class GraphViewSidePanel {
  getSelectedEntityHeading(entityName: string) {
    return cy.findByLabelText(`${entityName}-selectedEntity`);
  }

  getDeleteIcon(entityName: string) {
    return cy.findByTestId(`${entityName}-delete`);
  }

  closeSidePanel() {
    return cy.findByLabelText("closeGraphViewSidePanel").trigger("mouseover").click();
  }

  getPropertiesTab() {
    return cy.findByLabelText("propertiesTabInSidePanel");
  }

  getEntityTypeTab() {
    return cy.findByLabelText("entityTypeTabInSidePanel");
  }
  getEntityTypeName(entityName: string) {
    return cy.findByTestId(`${entityName}`);
  }
  getEntityTypeDescription() {
    return cy.findByTestId("description");
  }

  getEditEntityTypeColor() {
    return cy.findByTestId("edit-color-icon");
  }

  selectColorFromPicker(color: string) {
    return cy.findByTitle(`${color}`);
  }

  getEntityTypeColor(entityName: string) {
    return cy.findByTestId(`${entityName}-color`);
  }

  getPropertyTableHeader(headerName: string) {
    return cy.findByLabelText(`${headerName}-header`);
  }

  getPropertyName(propName: string) {
    return cy.findByTestId(`${propName}-span`);
  }

  getEntityDescription() {
    return cy.findByTestId("description");
  }

  getEntityNamespace() {
    return cy.findByTestId("namespace");
  }

  getEntityPrefix() {
    return cy.findByTestId("prefix");
  }

  getGraphViewFilterInput() {
    return cy.findByLabelText("graph-view-filter-input");
  }

  selectEntityDropdown() {
    return cy.get(".ant-select-dropdown--single").click();
  }

  getPropertyTypeIcon(icon:string, property:string) {
    return cy.findByTestId(`${icon}-${property}`).trigger("mouseover");
  }

  getIconTooltip(tooltip: string) {
    return cy.waitUntil(() => cy.findAllByText(`${tooltip}`));
  }
}

const graphViewSidePanel = new GraphViewSidePanel();
export default graphViewSidePanel;
