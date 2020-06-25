/// <reference types="cypress"/>

import loginPage from '../support/pages/login';
import { Application } from '../support/application.config';
import { toolbar, tiles, projectInfo } from '../support/components/common/index';
import 'cypress-wait-until';

describe('login', () => {

  before(() => {
    cy.visit('/');
  });

  after(() => {
    //resetting the test user back to only have 'hub-central-user' role
    cy.resetTestUser();
  });

  it('greets with Data Hub Central title and footer links', () => {
      cy.contains(Application.title);
      cy.contains('Policies');
      cy.contains('Terms and Conditions');
  });

  it('should verify all the error conditions for login', () => {
      //Verify username/password is required and login button is disabled
      loginPage.getUsername().type('{enter}').blur();
      loginPage.getPassword().type('{enter}').blur();
      cy.contains('Username is required');
      cy.contains('Password is required');
      loginPage.getLoginButton().should('be.disabled');

      //Verify invalid credentials error message
      loginPage.getUsername().type('test');
      loginPage.getPassword().type('password');
      loginPage.getLoginButton().click();
      cy.contains('The username and password combination is not recognized by MarkLogic.');

      //Verify admin cannot login
      loginPage.getUsername().clear();
      loginPage.getPassword().clear();
      cy.fixture('users/admin').then(user => {
          loginPage.getUsername().type(user['user-name']);
          loginPage.getPassword().type(user.password);
      });
      loginPage.getLoginButton().click();
      cy.contains('User does not have the required permissions to run Data Hub.');

  });

  xit('should verify auto logout after inactivity', () => {
      cy.loginAsDeveloper().withUI();
      toolbar.getCurateToolbarIcon().click();
      tiles.getCurateTile().should('exist');
      //Verify warning appears before automatic logout
      cy.findByText('Customer').click();
      cy.findByText('Mapping').should('exist');



      //Timeout pop up doesnt close an open modal

      //Verify user is logged out after inactivity
  });

  xit('should verify download of an HC project', () => {
      cy.loginAsTestUserWithRoles('hub-central-downloader').withUI();
      projectInfo.getAboutProject();
      projectInfo.getDownloadButton().click();

  });

  it('should display appropriate tiles for hub-central-user', () => {
      cy.loginAsTestUser().withUI()
          .url().should('include', '/tile');
        //All tiles but Explore, should show a tooltip that says contact your administrator
      ['Load', 'Model', 'Curate', 'Run'].forEach((tile) => {
          toolbar.getToolBarIcon(tile).trigger('mouseover');
        //   cy.contains(`${tile}: Contact your security administrator to get the roles and permissions required to access this functionality.`);
          cy.waitUntil(() => cy.contains(`${tile}: Contact your security administrator to get the roles and permissions required to access this functionality.`))

      });

      toolbar.getExploreToolbarIcon().trigger('mouseover');
      cy.contains('Explore');
      cy.visit('/tiles');
      cy.location('pathname', { timeout: 10000 }).should('include', '/tiles');
      projectInfo.getAboutProject().should('exist');
      cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
      tiles.getExploreTile().should('exist');
  });

  it('should display appropriate tiles for hub-central-entity-model-reader', () => {
      cy.loginAsTestUserWithRoles('hub-central-entity-model-reader').withUI()
          .url().should('include', '/tile');
      //All tiles but Explore and Model, should show a tooltip that says contact your administrator
      ['Load', 'Curate', 'Run'].forEach((tile) => {
          toolbar.getToolBarIcon(tile).trigger('mouseover');
        //   cy.contains(`${tile}: Contact your security administrator to get the roles and permissions required to access this functionality.`);
          cy.waitUntil(() => cy.contains(`${tile}: Contact your security administrator to get the roles and permissions required to access this functionality.`))
      });

      ['Model', 'Explore'].forEach((tile) => {
          toolbar.getToolBarIcon(tile).trigger('mouseover');
        //   cy.contains(`${tile}`);
          cy.waitUntil(() => cy.contains(`${tile}`))
      });

      //Modeling tests will verify that a valid user is able to access Model tile and its features
  });

  it('should display appropriate tiles for hub-central-load-reader', () => {
      cy.loginAsTestUserWithRoles('hub-central-load-reader').withUI()
          .url().should('include', '/tile');
      //All tiles but Explore and Model, should show a tooltip that says contact your administrator
      ['Model', 'Curate', 'Run'].forEach((tile) => {
          toolbar.getToolBarIcon(tile).trigger('mouseover');
        //   cy.contains(`${tile}: Contact your security administrator to get the roles and permissions required to access this functionality.`);
          cy.waitUntil(() => cy.contains(`${tile}: Contact your security administrator to get the roles and permissions required to access this functionality.`))
      });

      ['Load', 'Explore'].forEach((tile) => {
          toolbar.getToolBarIcon(tile).trigger('mouseover');
        //   cy.contains(`${tile}`);
          cy.waitUntil(() => cy.contains(`${tile}`))
      });

      //Load Data tests will verify that a valid user is able to access Load tile and its features
  });

  it('should display appropriate tiles for hub-central-mapping-reader', () => {
      cy.loginAsTestUserWithRoles('hub-central-mapping-reader').withUI()
          .url().should('include', '/tile');
      //All tiles but Explore and Model, should show a tooltip that says contact your administrator
      ['Load', 'Model', 'Run'].forEach((tile) => {
          toolbar.getToolBarIcon(tile).trigger('mouseover');
        //   cy.contains(`${tile}: Contact your security administrator to get the roles and permissions required to access this functionality.`);
          cy.waitUntil(() => cy.contains(`${tile}: Contact your security administrator to get the roles and permissions required to access this functionality.`))
      });

      ['Curate', 'Explore'].forEach((tile) => {
          toolbar.getToolBarIcon(tile).trigger('mouseover');
        //   cy.contains(`${tile}`);
          cy.waitUntil(() => cy.contains(`${tile}`))
      });

      //Mapping tests will verify that a valid user is able to access Curate tile and its features
  });

  it('should display appropriate tiles for hub-central-step-runner', () => {
      cy.loginAsTestUserWithRoles('hub-central-step-runner').withUI()
          .url().should('include', '/tile');
      //All tiles but TBD, should show a tooltip that says contact your administrator
      ['Load', 'Model', 'Curate'].forEach((tile) => {
          toolbar.getToolBarIcon(tile).trigger('mouseover');
        //   cy.contains(`${tile}: Contact your security administrator to get the roles and permissions required to access this functionality.`);
          cy.waitUntil(() => cy.contains(`${tile}: Contact your security administrator to get the roles and permissions required to access this functionality.`))
      });

      ['Run', 'Explore'].forEach((tile) => {
          toolbar.getToolBarIcon(tile).trigger('mouseover');
        //   cy.contains(`${tile}`);
          cy.waitUntil(() => cy.contains(`${tile}`))
      });

      //Run steps tests will verify that a valid user is able to access Run tile and its features
  });

  xit('should display appropriate tiles for hub-central-flow-writer', () => {
      cy.loginAsTestUserWithRoles('hub-central-flow-writer').withUI()
          .url().should('include', '/tile');
      //All tiles but TBD, should show a tooltip that says contact your administrator
      ['TBD'].forEach((tile) => {
          toolbar.getToolBarIcon(tile).trigger('mouseover');
          cy.waitUntil(() => cy.contains(`${tile}: Contact your security administrator to get the roles and permissions required to access this functionality.`))
        });

      ['TBD'].forEach((tile) => {
          toolbar.getToolBarIcon(tile).trigger('mouseover');
        //   cy.contains(`${tile}`);
          cy.waitUntil(() => cy.contains(`${tile}`))
      });

      //Run flow tests will verify that a valid user is able to access Run tile and its features
  });
});
