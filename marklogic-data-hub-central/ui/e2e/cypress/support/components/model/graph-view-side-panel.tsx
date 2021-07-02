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

  getPropertyTableHeader(headerName: string) {
    return cy.findByLabelText(`${headerName}-header`);
  }

  getPropertyName(propName: string) {
    return cy.findByTestId(`${propName}-span`);
  }

  getPersonEntityNode() {
    return cy.findByTestId("Person-entityNode").click();
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
}

const graphViewSidePanel = new GraphViewSidePanel();
export default graphViewSidePanel;
