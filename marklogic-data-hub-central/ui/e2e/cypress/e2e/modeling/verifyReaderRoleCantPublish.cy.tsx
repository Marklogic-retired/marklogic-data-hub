import modelPage from "../../support/pages/model";
import "cypress-wait-until";

import {
  entityTypeModal,
  entityTypeTable,
  graphView,
  propertyTable,
} from "../../support/components/model/index";

const entityName = "ProductCategory";

describe("Entity Modeling: Graph View", () => {
  before(() => {
    cy.log("**Logging into the app as a hub-central-entity-model-writer**");
    cy.loginAsTestUserWithRoles("hub-central-entity-model-writer").withRequest();
    cy.setupHubCentralConfig();
    modelPage.navigate();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteEntities(entityName);
  });

  it("Create an entity type for active the publish button", () => {
    cy.log("**Create an entity type**");
    modelPage.switchTableView();
    entityTypeTable.waitForTableToLoad();
    modelPage.getAddButton().should("be.visible").click({force: true});
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});
    entityTypeModal.newEntityName(entityName);
    entityTypeModal.newEntityDescription("entity description");
    entityTypeModal.getAddButton().should("be.visible").click({force: true});

    cy.log("**The entity type should be added to the table and expanded**");
    propertyTable.getAddPropertyButton(entityName).should("be.visible");

    cy.log("**Publish button should be enabled in table and graph view**");
    modelPage.getPublishButton().should("be.enabled");
    modelPage.switchGraphView();
    graphView.getPublishToDatabaseButton().should("be.enabled");
    cy.logout();
    cy.waitForAsyncRequest();
  });

  it("Login as entity model reader role and verify that the publish button that should be disabled", () => {
    cy.log("**Logging into the app as a hub-central-entity-model-reader**");
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader").withRequest();
    cy.visit("tiles-model");
    cy.waitForAsyncRequest();

    modelPage.switchTableView();
    entityTypeTable.waitForTableToLoad();

    cy.log("**Publish button should be disabled in table and graph view**");
    modelPage.getPublishButton().should("be.disabled");
    modelPage.switchGraphView();
    graphView.getPublishToDatabaseButton().should("be.disabled");
  });
});