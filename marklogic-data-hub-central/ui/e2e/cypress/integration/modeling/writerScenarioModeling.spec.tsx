/// <reference types="cypress"/>
import modelPage from "../../support/pages/model";
import {
  entityTypeModal,
  entityTypeTable,
  graphView,
} from "../../support/components/model/index";
import {confirmationModal, toolbar} from "../../support/components/common/index";
import {ConfirmationType} from "../../support/types/modeling-types";
import {Application} from "../../support/application.config";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";

describe("Entity Modeling: Graph View", () => {
  //Setup hubCentral config for testing
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-mapping-writer", "hub-central-saved-query-user").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
    cy.setupHubCentralConfig();
    cy.waitForAsyncRequest();
  });
  //login with valid account
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-mapping-writer", "hub-central-saved-query-user").withRequest();
    cy.waitForAsyncRequest();
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Test revert unpublished changes", {defaultCommandTimeout: 120000}, () => {
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click({force: true});
    cy.log("**Creating new entity student in table view**");
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    modelPage.getAddEntityButton().should("exist").click();
    entityTypeModal.newEntityName("Student");
    entityTypeModal.newEntityDescription("Student entity description");
    cy.waitUntil(() => entityTypeModal.getAddButton().click());

    cy.log("**Clicking on revert change button to discard unpublished changes in table view**");
    entityTypeTable.getRevertButtonTableView().click();
    confirmationModal.getYesButton(ConfirmationType.RevertChanges);
    cy.waitForAsyncRequest();
    entityTypeTable.getEntity("Student").should("not.exist");

    cy.log("**Creating new entity Employee in graph view**");
    modelPage.getAddEntityButton().should("exist").click();
    entityTypeModal.newEntityName("Employee");
    entityTypeModal.newEntityDescription("Employee entity description");
    cy.waitUntil(() => entityTypeModal.getAddButton().click());
    entityTypeTable.viewEntityInGraphView("Employee");

    cy.log("**Clicking on revert change button to discard unpublished changes in graph view**");
    graphView.getRevertButtonGraphView().click();
    confirmationModal.getYesButton(ConfirmationType.RevertChanges);
    cy.waitForAsyncRequest();
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    entityTypeTable.getEntity("Employee").should("not.exist");
  });
});
