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

Cypress.Commands.add("login", (email, password) => {
    loginPage.getUsername().type(email)
    loginPage.getPassword().type(password)
    loginPage.getSubmitButton().click();
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


