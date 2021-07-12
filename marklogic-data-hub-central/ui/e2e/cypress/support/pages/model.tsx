class ModelPage {

  /**
  * @param type - accepts `table` for table-view or `project-diagram` for graph-view
  */
  selectView(view: string) {
    return cy.get(`[data-icon="${view}"]`).trigger("mouseover").click({force: true});
  }

  getAddEntityButton() {
    return cy.findByLabelText("add-entity");
  }

  getSaveAllButton() {
    return cy.findByLabelText("save-all");
  }

  getRevertAllButton() {
    return cy.findByLabelText("revert-all");
  }

  getEntityModifiedAlert() {
    return cy.findByLabelText("entity-modified-alert");
  }
}

const modelPage = new ModelPage();
export default modelPage;
