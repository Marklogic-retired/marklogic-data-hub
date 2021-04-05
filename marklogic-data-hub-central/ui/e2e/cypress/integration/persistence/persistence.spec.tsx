import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import loadPage from "../../support/pages/load";
import LoginPage from "../../support/pages/login";

describe("Validate persistence across Hub Central", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer", "hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
    LoginPage.postLogin();
  });
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer", "hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
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
  it("Go to load tile, switch to list view, sort, and then visit another tile. When returning to load tile the list view is persisted", () => {
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    loadPage.loadView("table").click();
    cy.findByTestId("loadTableName").click();
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    loadPage.addNewButton("list").should("be.visible");
    cy.get("[aria-label=\"icon: caret-up\"]").should("have.class", "anticon anticon-caret-up ant-table-column-sorter-up on");
  });

  it("Go to model tile, expand entity and property tables, and then visit another tile. When returning to the model tile, the expanded rows are persisted.", () => {
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    cy.findByTestId("mltable-expand-Customer").click();
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    cy.findByTestId("shipping-shipping-span").should("be.visible");
    cy.findByTestId("mltable-expand-shipping").click();
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    cy.findByTestId("shipping-street-span").should("be.visible");
  });
  
  it("Switch to run view, expand flows, and then visit another tile. When returning to run tile, the expanded flows are persisted.", () => {
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.get("[id=\"personJSON\"]").should("have.class", "ant-collapse-item").click();
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.get("[id=\"personJSON\"]").should("have.class", "ant-collapse-item ant-collapse-item-active");
  });
});
