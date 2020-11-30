class Toolbar {

  getLoadToolbarIcon() {
    return cy.findByLabelText("tool-load");
  }

  getModelToolbarIcon() {
    return cy.findByLabelText("tool-model");
  }

  getCurateToolbarIcon() {
    return cy.findByLabelText("tool-curate");
  }

  getRunToolbarIcon() {
    return cy.findByLabelText("tool-run");
  }

  getExploreToolbarIcon() {
    return cy.findByLabelText("tool-explore");
  }

  getToolBarIcon(tile: string) {
    return cy.findByLabelText(`tool-${tile.toLowerCase()}`);
  }
}
const toolbar = new Toolbar();
export default toolbar;
