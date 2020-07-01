// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
//import { defaultUserPreferences as userPreference } from "../../../src/services/user-preferences"
import loginPage from '../support/pages/login';
import '@testing-library/cypress/add-commands'

//cy.fixture('users/developer.json').as('developer')

let protocol = 'http';
if(`${Cypress.env('mlHost')}` !== 'localhost')
  protocol = 'https';

Cypress.Commands.add('withUI', { prevSubject: 'optional'}, (subject) => {
  if (subject) {
    cy.wrap(subject).then(user => {
      cy.visit('/')
      loginPage.getUsername().type(user['user-name'])
      loginPage.getPassword().type(user.password)
      loginPage.getLoginButton().click();
    })
  }
})

Cypress.Commands.add('withRequest', { prevSubject: 'optional'}, (subject) => {
  if (subject) {
    cy.wrap(subject).then(user => {

      //const sessionCookieName = 'HubCentralSession';
      const username = user['user-name']
      const password = user.password

      cy.request({
      method: 'POST',
      url: '/api/login',
      body: { username, password }
      }).then(response => {
        window.localStorage.setItem('dataHubUser', username)
        window.localStorage.setItem('loginResp', JSON.stringify(response.body))
        window.localStorage.setItem('projectName', response.body.projectName)
      });

      cy.request({
        method: 'GET',
        url: '/api/environment/systemInfo'
      }).then(response => {
        window.localStorage.setItem('environment', JSON.stringify(response.body))
        window.localStorage.setItem('serviceName', response.body.serviceName)
      });

      //window.localStorage.setItem(`dataHubExplorerUserPreferences-${username}`, JSON.stringify(userPreference))

      cy.visit('/tiles')
      cy.location('pathname', { timeout: 10000 }).should('include', '/tiles');
      cy.wait(200);
    })
  }
})

Cypress.Commands.add('loginAsDeveloper', () => {
  return cy.fixture('users/developer')
})

Cypress.Commands.add("loginAsOperator", () => {
  return cy.fixture('users/operator')
})

Cypress.Commands.add('loginAsTestUser', () => {
  return cy.fixture('users/hub-user')
})

Cypress.Commands.add('loginAsTestUserWithRoles', (...roles) => {
  setTestUserRoles(roles)
  return cy.fixture('users/hub-user')
})

Cypress.Commands.add('resetTestUser', () => {
  return resetTestUser()
})

Cypress.Commands.add('logout', () => {
  cy.request({
    request: 'GET',
    url: '/api/logout'
  }).then(response => {
    cy.visit('/')
  })
})

function getSavedQueries() {
  return cy.request({
    request: 'GET',
    url: '/api/entitySearch/savedQueries'
  }).then( response => {
    return response.body;
  });
}

Cypress.Commands.add('deleteSavedQueries', () => {
  getSavedQueries().each(query => {
    cy.request({
      method: 'DELETE',
      url: `/api/entitySearch/savedQueries/query?id=${query.savedQuery.id}`,
    }).then(response => {
      console.log("DELETE RESPONSE: " + JSON.stringify(response.statusText));
    });
  })
})

function setTestUserRoles(roles) {
  //To get roles within quotes and comma separated
  roles = '"' + roles.join('", "') + '"'
  cy.exec(`curl -X PUT --anyauth -u test-admin-for-data-hub-tests:password -H "Content-Type:application/json" \
  -d '{"role": [ "hub-central-user", ${roles} ]}' ${protocol}://${Cypress.env('mlHost')}:8002/manage/v2/users/hc-test-user/properties`)
  cy.wait(500);
}

function resetTestUser() {
  cy.exec(`curl -X PUT --anyauth -u test-admin-for-data-hub-tests:password -H "Content-Type:application/json" \
  -d '{"role": [ "hub-central-user" ]}' ${protocol}://${Cypress.env('mlHost')}:8002/manage/v2/users/hc-test-user/properties`)
}

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
  })
