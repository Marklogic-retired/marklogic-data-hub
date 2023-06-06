
import {confirmationModal} from "../../support/components/common/index";
import {ConfirmationType} from "../../support/types/modeling-types";
import modelPage from "../../support/pages/model";
import "cypress-wait-until";

import {
  entityTypeModal,
  entityTypeTable,
} from "../../support/components/model/index";

const userRoles = [
  "hub-central-entity-model-reader",
  "hub-central-entity-model-writer",
  "hub-central-mapping-writer",
  "hub-central-saved-query-user"
];

describe("Entity Modeling: Graph View", () => {
  before(() => {
    cy.loginAsTestUserWithRoles(...userRoles).withRequest();
    cy.setupHubCentralConfig();
    modelPage.navigate();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Test revert unpublished changes", {defaultCommandTimeout: 120000}, () => {
    cy.log("**Creating new entity student in table view**");
    modelPage.scrollPageTop();
    modelPage.switchTableView();
    entityTypeTable.waitForTableToLoad();
    cy.waitUntil(() => modelPage.getAddButton()).click();
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});
    entityTypeModal.newEntityName("Student");
    entityTypeModal.newEntityDescription("Student entity description");
    cy.waitUntil(() => entityTypeModal.getAddButton().click());

    cy.log("**Clicking on revert change button to discard unpublished changes in table view**");
    entityTypeTable.getRevertButtonTableView().click();
    confirmationModal.getYesButton(ConfirmationType.RevertChanges);
    cy.waitForAsyncRequest();
    entityTypeTable.getEntity("Student").should("not.exist");

    cy.log("**Creating new entity Employee in graph view**");
    cy.waitUntil(() => modelPage.getAddButton()).click();
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});
    entityTypeModal.newEntityName("Employee");
    entityTypeModal.newEntityDescription("Employee entity description");
    cy.waitUntil(() => entityTypeModal.getAddButton().click());
    entityTypeTable.viewEntityInGraphView("Employee");

    cy.log("**Clicking on revert change button to discard unpublished changes in graph view**");
    modelPage.getRevertButton().click();
    confirmationModal.getYesButton(ConfirmationType.RevertChanges);
    cy.waitForAsyncRequest();
    modelPage.scrollPageTop();
    modelPage.switchTableView();
    entityTypeTable.waitForTableToLoad();
    entityTypeTable.getEntity("Employee").should("not.exist");
  });
});
