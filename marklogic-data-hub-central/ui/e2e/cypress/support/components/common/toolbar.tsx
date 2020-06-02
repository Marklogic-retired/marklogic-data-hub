class Toolbar {

  getLoadToolbarIcon() {
    return cy.get('[aria-label=tool-load]');
  }

  getModelToolbarIcon() {
    return cy.get('[aria-label=tool-model]');
  }

  getCurateToolbarIcon() {
    return cy.get('[aria-label=tool-curate]');
  }

  getRunToolbarIcon() {
    return cy.get('[aria-label=tool-run]');
  }

  getExploreToolbarIcon() {
    return cy.get('[aria-label=tool-explore]');
  }
}

export default Toolbar;