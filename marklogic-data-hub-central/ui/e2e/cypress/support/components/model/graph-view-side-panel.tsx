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

  getPersonEntityNode() {
    return cy.findByTestId("Person-entityNode");
  }

  getPersonEntityDescription() {
    return cy.findByTestId("description");
  }

  getPersonEntityNamespace() {
    return cy.findByTestId("namespace");
  }

  getPersonEntityPrefix() {
    return cy.findByTestId("prefix");
  }

  getGraphViewFilterInput() {
    return cy.findByLabelText("graph-view-filter-input");
  }

  selectEntityDropdown() {
    return cy.get(".ant-select-dropdown--single").click();
  }

}

const graphViewSidePanel = new GraphViewSidePanel();
export default graphViewSidePanel;
