/// <reference types="cypress"/>

import BrowsePage from '../support/pages/browse';

const browsePage = new BrowsePage();

describe('table test scenarios', () => {

  beforeEach(() => {
    cy.visit('/');
    cy.contains('MarkLogic Data Hub');
    cy.fixture('users').then(user => {
      cy.login(user.username, user.password);
    })
    cy.wait(500);
    cy.visit('/browse');
  });

  it('has table', () => {
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    cy.wait(2000);
    browsePage.getHubPropertiesExpanded();
    browsePage.getTotalDocuments().should('be.greaterThan', '1008')
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
    cy.fixture('users').then(user => {
      cy.login(user.username, user.password);
    })
    cy.wait(500);
    cy.visit('/browse');
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