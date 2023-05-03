class GraphViewSidePanel {
  getSelectedEntityHeading(entityName: string) {
    return cy.findByLabelText(`${entityName}-selectedEntity`);
  }

  getSelectedConceptClassHeading(conceptName: string) {
    return cy.findByLabelText(`${conceptName}-selectedEntity`);
  }

  getSelectedConceptClassHeadingInfo(conceptName: string) {
    return cy.findByLabelText(`${conceptName}-conceptHeadingInfo`);
  }

  getDeleteIcon(entityName: string) {
    return cy.findByTestId(`${entityName}-delete`);
  }

  getRelatedConceptClassesDeleteIcon(relationshipName: string, conceptClass: string) {
    return cy.findByTestId(`${relationshipName}-${conceptClass}-delete`);
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
    return cy.get(`[id="entityType-tab-content"]`);
  }

  getRelatedConceptClassesTab() {
    return cy.get(`[data-rr-ui-event-key="relatedConceptClasses"]`);
  }
  getRelatedConceptPropertyName(propertyName:string) {
    return cy.get(`[data-testid="relationship-name-${propertyName}"]`);
  }

  getRelatedConceptClassesTabContent() {
    return cy.get(`[id="relatedConceptClasses"]`);
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
    return cy.get(`div[aria-label="${entityType}-property-to-match-dropdown"]`).scrollIntoView();
  }

  getPropertiesOnHoverDropdownOption(option: string) {
    return cy.get(`[aria-label="${option}-option"]`).first().scrollIntoView();
  }

  getConceptClassName(conceptClassName: string) {
    return cy.findByTestId(`${conceptClassName}`);
  }

  getConceptClassDescription() {
    return cy.get("#description");
  }

  getConceptClassColor(conceptClassName: string) {
    return cy.get(`[id="${conceptClassName}-color-button"] > div`);
  }
  getConfirmationModal() {
    return cy.findByTestId("confirmation-modal");
  }

  getAddPropertyLinkButton(entity: string) {
    return cy.get(`[aria-label=${entity}-linkAddButton]`);
  }

  getAddPropertyForStructuredProperties(structured: string) {
    return cy.get(`[data-testid=add-struct-${structured}]`);
  }
}

const graphViewSidePanel = new GraphViewSidePanel();
export default graphViewSidePanel;
