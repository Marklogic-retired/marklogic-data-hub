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
    return cy.get(`.modal-body [aria-label="Close"]`).click();
  }

  getTrashIcon(id: string) {
    return cy.get(`[data-testid="${id}"]`);
  }

  getDeleteModalButton(label:string) {
    return cy.get(`[aria-label="${label}"]`);
  }

  existsNotification() {
    let exist = false;
    cy.get("body").then($body => {
      if ($body.find("[class^=header_notificationBadge]").length > 0) {
        //evaluates if exists badge/notification
        exist = true;
      } else {
        exist = false;
      }
    });
    return exist;
  }

  countNotifications(count: number) {
    if (this.existsNotification()) {
      this.getNotificationBadgeCount().should("exist").should("have.text", count);//poner 2 como estaba y cambiar  en e lheader tsx
    } else {
      cy.log("** 0 notifications **");
    }
  }

  verifyModalContent() {
    if (toolbar.existsNotification()) {
      cy.get("*[class^=\"header_notificationBadge").then(function ($elem) {
        if (!$elem.text()) {
          cy.log("** Verifing modal **");
        } else {
          cy.log("** Counting table's rows **");
          cy.get("#mainTable tbody").find("tr").should("have.length", $elem.text());
        }
      });
    }
  }

}
const toolbar = new Toolbar();
export default toolbar;
