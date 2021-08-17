/// <reference types="cypress"/>

import modelPage from "../../support/pages/model";
import {
  entityTypeModal,
  entityTypeTable,
  graphView,
  graphViewSidePanel,
} from "../../support/components/model/index";
import {toolbar} from "../../support/components/common/index";
import {Application} from "../../support/application.config";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";

const entityName = "GraphEntity";
const entityDescription = "Graph entity description";

describe("Entity Modeling: Graph View", () => {
  //login with valid account
  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    cy.waitForAsyncRequest();
    modelPage.selectView("table");
    cy.wait(1000);
    entityTypeTable.waitForTableToLoad();
  });
  afterEach(() => {});
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteEntities(entityName);
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it.only("can create a new entity in graph view, showing its details in side panel", () => {
    cy.loginAsDeveloper().withRequest();
    entityTypeTable.viewEntityInGraphView("Person");

    // Create new entity from graph view
    graphView.getAddButton().click();
    graphView.getAddEntityTypeOption().click();
    entityTypeModal.newEntityName(entityName);
    entityTypeModal.newEntityDescription(entityDescription);
    entityTypeModal.getAddButton().click();

    // Verify new entity shown in side panel
    graphViewSidePanel.getSelectedEntityHeading(entityName).should("be.visible");
    graphViewSidePanel.getEntityTypeTab().click();
    graphViewSidePanel.getEntityTypeName(entityName).should("exist");
    graphViewSidePanel.getEntityTypeDescription().should("have.value", entityDescription);
  });
  it("can delete an entity in graph view", () => {
    // TODO
  });
});
