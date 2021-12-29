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
       * Resets the test user so it only has 'hub-central-user' role
       */
      resetTestUser(): Chainable<Element>

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

      /**
       * GETs all the saved queries and DELETEs them iteratively using cy.request
       * @example cy.deleteSavedQueries()
      */
      deleteSavedQueries(): Chainable<Element>

      deleteFlows(...flowNames: any[]): Chainable<Element>

      deleteSteps(stepType: string, ...stepNames: any[]): Chainable<Element>

      deleteEntities(...entityNames: any[]): Chainable<Element>

      deleteRecordsInFinal(...collections: any[]): Chainable<Element>

      waitForModalToDisappear(): void

      runStep(flowName: string, stepNumber: string): Chainable<Element>

      verifyStepAddedToFlow(stepType: string, stepName: string, flowName: string): Chainable<Element>

      /**
       * Custom command to upload files for running a load step.
       * @param filePath - a list of input file path
      */
      uploadFile(filePath: string): Chainable<Element>

      /**
       * Custom command to verify status of a step when run in a flow
       * @param jobStatus - success, failed or failed_with_error
       * @param stepType - Ingestion, Mapping, Matching, Merging, Mastering or Custom
       * @param stepName - name of the step
       */
      verifyStepRunResult(jobStatus: string, stepType: string, stepName: string): Chainable<Element>

      waitForAsyncRequest(): Chainable<WaitXHR>

      getAttached(selector: any): Chainable<Element>

      setupHubCentralConfig(): Chainable<Element>

      publishEntityModel(): Chainable<Element>

      /**
       * Save Local Storage Data
       */
      saveLocalStorage(): Chainable<Element>

      /**
       * Restore (preserve) Local Storage Data
       */
      restoreLocalStorage(): Chainable<Element>

      /**
       * Custom command to trigger tab out
       * @example
       * cy.get("input").typeTab()
       */
      typeTab(): Chainable<Element>
    }
  }
