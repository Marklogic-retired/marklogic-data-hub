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
    return cy.get("[class^=Overview_popoverHomePageInfoBody]");
  }

  getHomePageInfoIcon() {
    return cy.findByLabelText("homePageInfoIcon");
  }

  getHomePageNotificationIcon() {
    return cy.get(`[aria-label="icon: notification-bell"]`);
  }

  getNotificationBadgeCount() {
    return cy.get(`[aria-label="notification-link"]`).children().children();
  }

  getNotificationTitle() {
    return cy.get(`[aria-label="notification-modal-title"]`);
  }

  closeNotificationModal() {
    return cy.get(`[aria-label="Close"]`).click();
  }
}
const toolbar = new Toolbar();
export default toolbar;
