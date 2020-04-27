// in cypress/support/index.d.ts
// load type definitions that come with Cypress module
/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Custom command to login as a developer
       * @example 
       * cy.loginAsDeveloper().withRequest()
       * cy.loginAsDeveloper().withUI()
      */
      loginAsDeveloper(): Chainable<Element>

      /**
       * Custom command to login as a operator
       * @example 
       * cy.loginAsOperator().withRequest()
       * cy.loginAsOperator().withUI()
      */
      loginAsOperator(): Chainable<Element>

      /**
       * Custom command to login as a test user "hc-test-user" with hub-central-user role.
       * @example
       * cy.loginAsTestUser().withRequest()
       * cy.loginAsTestUser().withUI()
      */
      loginAsTestUser(): Chainable<Element>

      /**
       * Custom command to login as a generic test user "hc-test-user" with additional roles that a test may need.
       * The roles provided as arguments are added to this user. Every time this function is called the user is 
       * updated with roles in the arguments
       * @example 
       * cy.loginAsTestUserWithRoles("hub-central-mapping-reader", "hub-central-entity-exporter").withRequest()
       * cy.loginAsTestUserWithRoles("hub-central-mapping-reader", "hub-central-entity-exporter").withUI()
      */
      loginAsTestUserWithRoles(...roles: string[]): Chainable<Element>

      /**
       * Custom command to login via api request call.
       * @example
       *  cy.loginAsTestUser().withRequest()
       *  cy.loginAsDeveloper().withRequest()
       *  cy.loginAsTestUserWithRoles("hub-central-mapping-reader", "hub-central-entity-exporter").withRequest()
      */
      withRequest(): Chainable<Element>

      /**
       * Custom command to login via UI.
       * @example
       *  cy.loginAsTestUser().withUI()
       *  cy.loginAsDeveloper().withUI()
       *  cy.loginAsTestUserWithRoles("hub-central-mapping-reader", "hub-central-entity-exporter").withUI()
      */
      withUI(): Chainable<Element>

      /**
       * Custom command to logout via api request call.
       * @example cy.logout()
      */
      logout(): void
    }
  }