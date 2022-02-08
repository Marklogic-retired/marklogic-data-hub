/// <reference types="cypress"/>

import {Application} from "../../../support/application.config";
import {toolbar} from "../../../support/components/common";
import {mappingStepDetail} from "../../../support/components/mapping/index";
import curatePage from "../../../support/pages/curate";
import browsePage from "../../../support/pages/browse";
import LoginPage from "../../../support/pages/login";
import "cypress-wait-until";


describe("Mapping", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.log("**Logging into the app as a developer**");
    cy.loginAsTestUserWithRoles("hub-central-mapping-writer").withRequest();
    LoginPage.postLogin();
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    Cypress.Cookies.preserveOnce("HubCentralSession");
    cy.restoreLocalStorage();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Verify more/less functionality on filtering by name for structured properties", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    mappingStepDetail.customerEntity().click();
    curatePage.openMappingStepDetail("Customer", "mapCustomersJSON");
    browsePage.waitForSpinnerToDisappear();
    mappingStepDetail.searchIcon("Customer").click();
    mappingStepDetail.searchName().type("street");
    mappingStepDetail.searchButton().click();
    cy.findAllByText("more").should("have.length.gt", 1);
    cy.findAllByText("more").first().click();
    cy.findByText("less").should("be.visible");
  });
});