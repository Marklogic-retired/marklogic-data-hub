/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import {Application} from "../../support/application.config";
import "cypress-wait-until";
import {toolbar} from "../../support/components/common";
import LoginPage from "../../support/pages/login";

describe("Validate table and column selector in explore", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });
  beforeEach(() => {
    cy.loginAsDeveloper().withRequest();
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
  it("Navigate to Explore", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForTableToLoad();
  });
  it("Validate the table and expandable rows", () => {
    browsePage.getSelectedEntity().should("contain", "All Entities");
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    browsePage.getTableRows().should("have.length", 20);
    browsePage.getTableColumns().should("be.visible");
    browsePage.getExpandable().should("be.visible");
  });
  it("Validate columns selector popover, draggable titles and checkable titles", () => {
    browsePage.selectEntity("Customer");
    browsePage.getSelectedEntity().should("contain", "Customer");
    browsePage.getColumnSelectorIcon().should("be.visible");
    browsePage.getColumnSelectorIcon().click();
    browsePage.getColumnSelector().should("be.visible");
    browsePage.getTreeItemTitle(2).should("have.class", "draggable");
    browsePage.getTreeItem(2).should("have.class", "ant-tree-treenode-checkbox-checked");
  });
});

