/// <reference types="cypress"/>

import { toolbar, tiles, projectInfo } from '../../support/components/common/index';
import 'cypress-wait-until';
import loadPage from "../../support/pages/load";
import runPage from "../../support/pages/run";
import curatePage from "../../support/pages/curate";

describe('customRole', () => {

  before(() => {
    cy.visit('/');
  });

  afterEach(() => {
    cy.logout();
  });

  after(() => {
    //resetting the test user back to only have 'hub-central-user' role
    cy.resetTestUser();
  });

  it('should be able to access all tiles with hc-custom-role', () => {
    cy.loginAsTestUserWithRoles('hc-custom-role').withUI()
      .url().should('include', '/tiles');

    toolbar.getLoadToolbarIcon().click();
    loadPage.loadView('th-large').should('be.visible');

    toolbar.getModelToolbarIcon().click();
    tiles.getModelTile().should('exist');

    let entityTypeId = 'Customer'
    toolbar.getCurateToolbarIcon().click();
    curatePage.toggleEntityTypeId(entityTypeId);
    curatePage.verifyTabs(entityTypeId, 'be.visible', 'be.visible');

    const flowName = 'personJSON';
    toolbar.getRunToolbarIcon().click();
    runPage.createFlowButton().should('be.disabled');
    cy.findByText(flowName).should('be.visible');

    toolbar.getExploreToolbarIcon().click();
    cy.findByText('Search through loaded data and curated data');

  });

});
