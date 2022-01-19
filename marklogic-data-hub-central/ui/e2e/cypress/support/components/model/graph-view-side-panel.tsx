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
  getEntityTypeName(entityName: string) {
    return cy.findByTestId(`${entityName}`);
  }
  getEntityTypeDescription() {
    return cy.get("#description");
  }
  getEntityTypeColor(entityName: string) {
    return cy.get(`[data-testid="${entityName}-color"]`);
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
    return cy.get(`#tooltip-${property}`).contains(`${tooltip}`).should("exist");
  }
}

const graphViewSidePanel = new GraphViewSidePanel();
export default graphViewSidePanel;
