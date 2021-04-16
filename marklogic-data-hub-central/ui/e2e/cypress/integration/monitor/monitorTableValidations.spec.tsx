import monitorPage from "../../support/pages/monitor";
import {Application} from "../../support/application.config";
import "cypress-wait-until";
import {toolbar} from "../../support/components/common";
import LoginPage from "../../support/pages/login";

describe("Monitor Tile", () => {

  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-job-monitor").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });
  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Navigate to Monitor Tile", () => {
    cy.waitUntil(() => toolbar.getMonitorToolbarIcon()).click();
    monitorPage.waitForMonitorTableToLoad();
    monitorPage.getTableRows().should("have.length", 20);
    monitorPage.getPaginationPageSizeOptions().then(attr => {
      attr[0].click();
      monitorPage.getPageSizeOption("10 / page").click();
    });
    monitorPage.getTableRows().should("have.length", 10);
  });
});

