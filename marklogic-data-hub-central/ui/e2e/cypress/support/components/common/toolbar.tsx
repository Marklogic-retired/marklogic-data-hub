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

  getMonitorToolbarIcon() {
    return cy.findByLabelText("tool-monitor");
  }

  getToolBarIcon(tile: string) {
    return cy.findByLabelText(`tool-${tile.toLowerCase()}`);
  }

  getHomePageInfoPopover() {
    return cy.findByLabelText("homePageInfoPopover");
  }

  getHomePageInfoIcon() {
    return cy.findByLabelText("homePageInfoIcon");
  }
}
const toolbar = new Toolbar();
export default toolbar;
