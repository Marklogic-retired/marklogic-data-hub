/// <reference types="cypress"/>

import BrowsePage from '../support/pages/browse';
import HomePage from "../support/pages/home";

const browsePage = new BrowsePage();
const homePage = new HomePage();

describe('table test scenarios', () => {

  beforeEach(() => {
    cy.visit('/');
    cy.contains('MarkLogic Data Hub');
    cy.loginAsDeveloper();
    cy.wait(500);
    // temporary change as tile is not working
    homePage.getTitle().click();
    cy.wait(500);
    // temporary change end here
    homePage.getBrowseEntities().click();
  });

  it('has table', () => {
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    cy.wait(2000);
    browsePage.getHubPropertiesExpanded();
    browsePage.getTotalDocuments().should('be.greaterThan', 1008)
    browsePage.getTableRows().should('be.visible');
    browsePage.getTableColumns().should('be.visible');
  });

  it('has expandable rows', () => {
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    cy.wait(2000);
    browsePage.getExpandable().should('be.visible');
  });

});

describe('column selector test scenarios', () => {

  beforeEach(() => {
    cy.visit('/');
    cy.contains('MarkLogic Data Hub');
    cy.loginAsDeveloper();
    cy.wait(500);
    // temporary change as tile is not working
    homePage.getTitle().click();
    cy.wait(500);
    // temporary change end here
    homePage.getBrowseEntities().click();
  });

  it('has columns selector popover', () => {
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    cy.wait(2000);
    browsePage.getHubPropertiesExpanded();
    browsePage.getColumnSelectorIcon().should('be.visible')
    browsePage.getColumnSelectorIcon().click()
    browsePage.getColumnSelector().should('be.visible')
  });

  it('has draggable titles', () => {
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    cy.wait(2000);
    browsePage.getHubPropertiesExpanded();
    browsePage.getColumnSelectorIcon().should('be.visible')
    browsePage.getColumnSelectorIcon().click()
    browsePage.getColumnSelector().should('be.visible')
    browsePage.getTreeItemTitle(2).should('have.class', 'draggable')
  });

  it('has checkable titles ', () => {
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    cy.wait(2000);
    browsePage.getHubPropertiesExpanded();
    browsePage.getColumnSelectorIcon().should('be.visible')
    browsePage.getColumnSelectorIcon().click()
    browsePage.getColumnSelector().should('be.visible')
    browsePage.getTreeItem(2).should('have.class', 'ant-tree-treenode-checkbox-checked')
  });

});
