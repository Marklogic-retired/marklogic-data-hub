class ModelPage {

  getAddEntityButton() {
    return cy.get('[aria-label=add-entity]');
  }

  getSaveAllButton() {
    return cy.get('[aria-label=save-all]');
  }

  getRevertAllButton() {
    return cy.get('[aria-label=revert-all]');
  }
}

const modelPage = new ModelPage();
export default modelPage;
