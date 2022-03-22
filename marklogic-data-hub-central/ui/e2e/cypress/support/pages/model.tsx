class ModelPage {

  /**
  * @param type - accepts `table` for table-view or `project-diagram` for graph-view
  */
  selectView(view: string) {
    cy.get(`[data-icon="${view}"]`).first().scrollIntoView().trigger("mouseover").click({force: true});
    cy.wait(1000);
    cy.get("body")
      .then(($body) => {
        if ($body.find("[class*=\"rbt-input\"]")) {
          cy.get(`[data-icon="${view}"]`).first().scrollIntoView().trigger("mouseover").click({force: true});
        }
      });
  }

  closeSidePanel() {
    return cy.findByLabelText("closeGraphViewSidePanel").click({force: true});
  }

  getAddEntityButton() {
    return cy.findByLabelText("add-entity");
  }

  getPublishButton() {
    return cy.findByLabelText("publish-to-database");
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

  selectNthIcon(order: number) {
    return cy.get(`.sc-gsDKAQ > :nth-child(${order}) > svg > path`).click();
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
