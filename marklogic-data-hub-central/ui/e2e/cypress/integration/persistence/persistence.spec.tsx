import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import loadPage from "../../support/pages/load";
import LoginPage from "../../support/pages/login";

describe("Validate persistence across Hub Central", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-load-writer", "hub-central-flow-writer").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-load-writer", "hub-central-flow-writer").withRequest();
    cy.waitForAsyncRequest();
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Switch to list view, sort, and then visit another tile. When returning to load tile the list view is persisted", () => {
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    loadPage.loadView("table").click();
    cy.findByTestId("loadTableName").click();
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    loadPage.addNewButton("list").should("be.visible");
    cy.get("[aria-label=\"icon: caret-up\"]").should("have.class", "anticon anticon-caret-up ant-table-column-sorter-up on");
  });
});
