/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common/index";
import "cypress-wait-until";
import LoginPage from "../../support/pages/login";

describe("save/manage queries scenarios, developer role", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
    cy.deleteSavedQueries();
  });
  beforeEach(() => {
    cy.loginAsDeveloper().withRequest();
    cy.waitForAsyncRequest();
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  after(() => {
    //clearing all the saved queries
    cy.loginAsDeveloper().withRequest();
    cy.deleteSavedQueries();
    cy.waitForAsyncRequest();
  });
  it("Load graph and select Customer entities", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForGraphToLoad();
    browsePage.getGraph();
  });
});