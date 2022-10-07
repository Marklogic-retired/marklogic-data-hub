class ModelPage {

  /**
  * @param type - accepts `table` for table-view or `project-diagram` for graph-view
  */
  selectView(view: string) {
    cy.get(`[data-icon="${view}"]`).first().should("exist").scrollIntoView().trigger("mouseover").click({force: true});
    cy.wait(1000);
    cy.get("body")
      .then(($body) => {
        if ($body.find("[class*=\"rbt-input\"]")) {
          cy.get(`[data-icon="${view}"]`).first().should("exist").scrollIntoView().trigger("mouseover").click({force: true});
        }
      });
  }

  closeSidePanel() {
    return cy.findByLabelText("closeGraphViewSidePanel").click({force: true});
  }

  getAddButton() {
    return cy.get(`[aria-label="add-entity-type-concept-class"] > button`);
  }

  getAddEntityButton() {
    return cy.findByLabelText("add-entity");
  }

  getAddEntityTypeOption() {
    return cy.get(`[aria-label="add-entity-type"]`);
  }

  getAddConceptClassOption() {
    return cy.get(`[aria-label="add-concept-class"]`);
  }

  getPublishButton() {
    return cy.findByLabelText("publish-to-database");
  }

  getRevertButton() {
    return cy.get("[aria-label=\"revert-changes-table-view\"]").scrollIntoView();
  }

  getPublishButtonDisabledTooltip() {
    return cy.get(`[id="publish-disabled-tooltip"]`);
  }

  getEntityModifiedAlert() {
    return cy.findByLabelText("entity-modified-alert");
  }

  clickModelingInfoIcon() {
    return cy.findByLabelText("modelInfoIcon").trigger("click");
  }

  verifyModelingInfo() {
    return cy.findByLabelText("modelingInfo").should("exist");
  }

  scrollPageBottom() {
    return cy.get(".mosaic-window > :nth-child(2)").scrollTo("bottom");
  }

  scrollPageTop() {
    return cy.get(".mosaic-window > :nth-child(2)").scrollTo("top");
  }

  openIconSelector(entityName: string) {
    return cy.get(`[data-testid="${entityName}-icon-selector"]`).click();
  }

  selectIcon(entitType: string, icon: string) {
    return cy.get(`[data-testid="${entitType}-${icon}-icon-option"]`).click();
  }

  getSortIndicator() {
    return cy.get(`[aria-label^="Name"] [aria-label="icon: caret-up"]`);
  }

  getEntityLabelNames() {
    return cy.get(`[class^="hc-table_tableCell"] [class^="entity-type-table_link"]`);
  }

  getIconSelected(entityName:string, iconName: string) {
    return cy.get(`[aria-label="${entityName}-${iconName}-icon"]`);
  }

  getColorSelected(entityName:string, color:string) {
    return cy.get(`[aria-label="${entityName}-${color}-color"]`);
  }

  toggleColorSelector(entityType: string) {
    return cy.get(`[id="${entityType}-color-button"]`).click();
  }

  selectColorFromPicker(color: string) {
    return cy.findByTitle(`${color}`);
  }

}

const modelPage = new ModelPage();
export default modelPage;
