/// <reference types="cypress"/>

import modelPage from "../../support/pages/model";
import {
  entityTypeModal,
  entityTypeTable,
  graphView,
  propertyTable,
} from "../../support/components/model/index";
import {toolbar} from "../../support/components/common/index";
import {Application} from "../../support/application.config";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";

const entityName = "ProductCategory";

describe("Entity Modeling: Graph View", () => {

  before(() => {
    cy.visit("/");
    cy.contains(Application.title);

    cy.log("**Logging into the app as a hub-central-entity-model-writer**");
    cy.loginAsTestUserWithRoles("hub-central-entity-model-writer").withRequest();
    LoginPage.postLogin();

    //Setup hubCentral config for testing
    cy.setupHubCentralConfig();

  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteEntities(entityName);
  });

  it("create an entity type for active the publish button", () => {
    cy.log("**Create an entity type**");
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click({force: true});
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    cy.waitUntil(() => modelPage.getAddButton()).click();
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});
    entityTypeModal.newEntityName(entityName);
    entityTypeModal.newEntityDescription("entity description");
    entityTypeModal.getAddButton().click();

    cy.log("**The entity type should be added to the table and expanded**");
    propertyTable.getAddPropertyButton(entityName).should("be.visible");

    cy.log("**Publish button should be enabled in table and graph view**");
    modelPage.getPublishButton().should("be.enabled");
    modelPage.selectView("project-diagram");
    graphView.getPublishToDatabaseButton().should("be.enabled");
    cy.logout();
  });

  it("login as entity model reader role and verify that the publish button that should be disabled", () => {
    cy.visit("/");
    cy.contains(Application.title);

    cy.log("**Logging into the app as a hub-central-entity-model-reader**");
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader").withRequest();
    LoginPage.postLogin();


    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click({force: true});
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();

    cy.log("**Publish button should be disabled in table and graph view**");
    modelPage.getPublishButton().should("be.disabled");
    modelPage.selectView("project-diagram");
    graphView.getPublishToDatabaseButton().should("be.disabled");
  });
});