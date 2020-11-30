class ModelPage {

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
