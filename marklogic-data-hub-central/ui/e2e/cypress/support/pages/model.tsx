class ModelPage {

  getAddEntityButton() {
    return cy.findByLabelText('add-entity');
  }

  getSaveAllButton() {
    return cy.findByLabelText('save-all');
  }

  getRevertAllButton() {
    return cy.findByLabelText('revert-all');
  }
}

const modelPage = new ModelPage();
export default modelPage;
