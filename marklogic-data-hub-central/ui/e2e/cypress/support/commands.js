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

import LoginPage from '../support/pages/login';

const loginPage = new LoginPage();

Cypress.Commands.add("login", (username, password) => {
    loginPage.getUsername().type(username)
    loginPage.getPassword().type(password)
    loginPage.getLoginButton().click();
})

Cypress.Commands.add('loginAsDeveloper', () => {
  cy.fixture('users/developer').then(developer => {
    cy.login(developer['user-name'], developer.password)
  })
})

Cypress.Commands.add("loginAsOperator", () => {
  cy.fixture('users/operator').then(operator => {
    cy.login(operator['user-name'], operator.password)
  })
})

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
  })

// Cypress.Commands.add('login', () => {
//     cy.request({
//         method: 'POST',
//         url: 'http://localhost:3000/datahub/v2/login',
//         body: {
//                 username: 'admin',
//                 password: 'admin'
//         }
//     })
//     .then((resp) => {
//         window.localStorage.setItem('adm', resp.body.user.token)
//     })
// })


