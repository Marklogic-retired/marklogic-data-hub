/// <reference types="cypress"/>

import {toolbar, tiles} from "../../support/components/common/index";
import "cypress-wait-until";
import loadPage from "../../support/pages/load";
import runPage from "../../support/pages/run";
import curatePage from "../../support/pages/curate";

describe("customRole", () => {

  before(() => {
    cy.visit("/");
    cy.waitForAsyncRequest();
  });

  afterEach(() => {
    cy.logout();
    cy.waitForAsyncRequest();
  });

  after(() => {
    //resetting the test user back to only have 'hub-central-user' role
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("should be able to access all tiles with hc-custom-role", () => {
    cy.loginAsTestUserWithRoles("hc-custom-role").withUI()
      .url().should("include", "/tiles");

    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitForAsyncRequest();
    loadPage.loadView("th-large").should("be.visible");

    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    cy.waitForAsyncRequest();
    tiles.getModelTile().should("exist");

    let entityTypeId = "Customer";
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitForAsyncRequest();
    curatePage.toggleEntityTypeId(entityTypeId);
    curatePage.verifyTabs(entityTypeId, "be.visible", "be.visible");

    const flowName = "personJSON";
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.waitForAsyncRequest();
    runPage.createFlowButton().should("be.disabled");
    cy.findByText(flowName).should("be.visible");

    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitForAsyncRequest();
    cy.findByText("Search, filter, review, and export your data.");

  });

});
