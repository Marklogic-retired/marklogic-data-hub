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
        url: '/api/environment/project-info'
      }).then(response => {
        window.localStorage.setItem('environment', JSON.stringify(response.body))
      });
      
      //window.localStorage.setItem(`dataHubExplorerUserPreferences-${username}`, JSON.stringify(userPreference))

      cy.visit('/')
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

function setTestUserRoles(roles) {
  roles = '"' + roles.join('", "') + '"'
  cy.exec(`curl -X PUT --anyauth -u test-admin-for-data-hub-tests:password -H "Content-Type:application/json" \
  -d '{"role": [ "hub-central-user", ${roles} ]}' http://${Cypress.env('mlHost')}:8002/manage/v2/users/hc-test-user/properties`)
}

function resetTestUser() {
  cy.exec(`curl -X PUT --anyauth -u test-admin-for-data-hub-tests:password -H "Content-Type:application/json" \
  -d '{"role": [ "hub-central-user" ]}' http://${Cypress.env('mlHost')}:8002/manage/v2/users/hc-test-user/properties`)
}

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
  })
