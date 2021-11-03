class ModelPage {

  /**
  * @param type - accepts `table` for table-view or `project-diagram` for graph-view
  */
  selectView(view: string) {
    cy.get(`[data-icon="${view}"]`).first().trigger("mouseover").click({force: true});
    cy.wait(1000);
    cy.get("body")
      .then(($body) => {
        if ($body.find("[aria-label=graph-view-filter-input]").length) {
          cy.get(`[data-icon="${view}"]`).first().trigger("mouseover").click({force: true});
        }
      });
  }

  getAddEntityButton() {
    return cy.findByLabelText("add-entity");
  }

  getPublishButton() {
    return cy.findByLabelText("publish-to-database");
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
}

const modelPage = new ModelPage();
export default modelPage;
