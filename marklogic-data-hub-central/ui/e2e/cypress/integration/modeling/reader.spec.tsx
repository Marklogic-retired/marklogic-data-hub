/// <reference types="cypress"/>

import modelPage from "../../support/pages/model";
import {
  entityTypeModal,
  entityTypeTable,
  graphView,
  graphViewSidePanel,
  propertyModal,
  propertyTable
} from "../../support/components/model/index";
import {confirmationModal, toolbar} from "../../support/components/common/index";
import {Application} from "../../support/application.config";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";

describe("Entity Modeling: Reader Role", () => {
  //login with valid account
  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-saved-query-user").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    cy.waitForAsyncRequest();
    modelPage.selectView("table");
    cy.wait(1000);
    entityTypeTable.waitForTableToLoad();
  });
  after(() => {
    //resetting the test user back to only have 'hub-central-user' role
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("can navigate by clicking instance count and last processed, can not create, edit, or delete entity models", () => {
    // Removed navigation tests unitl DHFPROD-6152 is resolved

    // cy.waitUntil(() => entityTypeTable.getEntityLastProcessed('Person')).click();
    // tiles.getExploreTile().should('exist');
    // cy.waitUntil(() => browsePage.getSelectedEntity()).should('eq', 'Person');
    // browsePage.getClearAllButton().should('exist');

    // toolbar.getModelToolbarIcon().click();
    // tiles.getModelTile().should('exist');

    // cy.waitUntil(() => entityTypeTable.getEntityInstanceCount('Order')).click();
    // tiles.getExploreTile().should('exist');
    // cy.waitUntil(() => browsePage.getSelectedEntity().should('eq', 'Order'));
    // browsePage.getClearAllButton().should('not.exist');

    // cy.go('back');
    // cy.url().should('include', '/tiles/model');
    // tiles.getModelTile().should('exist');

    modelPage.getAddEntityButton().click({force: true});
    entityTypeModal.getAddButton().should("not.exist");

    modelPage.getSaveAllButton().click({force: true});
    confirmationModal.getSaveAllEntityText().should("not.exist");

    modelPage.getRevertAllButton().click({force: true});
    confirmationModal.getRevertEntityText().should("not.exist");

    entityTypeTable.getEntity("Customer").click({force: true});
    propertyModal.getSubmitButton().should("not.exist");

    entityTypeTable.getDeleteEntityIcon("Customer").click({force: true});
    confirmationModal.getDeleteEntityStepText().should("not.exist");

    entityTypeTable.getRevertEntityIcon("Customer").click({force: true});
    confirmationModal.getRevertEntityText().should("not.exist");

    entityTypeTable.getSaveEntityIcon("Customer").click({force: true});
    confirmationModal.getSaveEntityText().should("not.exist");

    entityTypeTable.getExpandEntityIcon("Customer").click();
    propertyTable.getAddPropertyButton("Customer").should("be.visible").click({force: true});
    propertyModal.getSubmitButton().should("not.exist");

    propertyTable.getDeletePropertyIcon("Customer", "pin").click({force: true});
    confirmationModal.getDeletePropertyStepWarnText().should("not.exist");

    propertyTable.getAddPropertyToStructureType("Address").click({force: true});
    propertyModal.getStructuredTypeName().should("not.exist");

    propertyTable.expandStructuredTypeIcon("shipping").click();
    propertyTable.expandStructuredTypeIcon("zip").click();

    propertyTable.getAddPropertyToStructureType("Zip").click({force: true});
    propertyModal.getStructuredTypeName().should("not.exist");

    propertyTable.getDeleteStructuredPropertyIcon("Customer", "Zip", "zip-fiveDigit").click({force: true});
    confirmationModal.getDeletePropertyStepWarnText().should("not.exist");

    // To verify modeling info is rendered properly in table view
    modelPage.clickModelingInfoIcon();
    modelPage.verifyModelingInfo();
  });

  it("can navigate to graph view from table view", () => {
    // Should be updated once the dummy entity links are replaced by actual graph nodes.
    entityTypeTable.viewEntityInGraphView("Customer");

    // To verify modeling info is rendered properly in graph view
    modelPage.clickModelingInfoIcon();
    modelPage.verifyModelingInfo();

    graphView.getFilterInput().should("be.visible");
    graphView.getAddButton().should("be.disabled");
    graphView.getPublishToDatabaseButton().should("be.visible");
    graphView.getExportGraphIcon().should("be.visible");
    graphViewSidePanel.getSelectedEntityHeading("Customer").should("be.visible");
    graphViewSidePanel.getPropertiesTab().should("be.visible");
    graphViewSidePanel.getEntityTypeTab().should("be.visible");
    graphViewSidePanel.getDeleteIcon("Customer").should("be.visible");

    //Properties tab should display property table
    graphViewSidePanel.getPropertyTableHeader("propertyName").should("be.visible");
    graphViewSidePanel.getPropertyTableHeader("type").should("be.visible");
    graphViewSidePanel.getPropertyTableHeader("delete").should("be.visible");

    //Verify table is populated with Customer properties
    graphViewSidePanel.getPropertyName("customerId").should("be.visible");
    graphViewSidePanel.getPropertyName("name").should("be.visible");
    graphViewSidePanel.getPropertyName("email").should("be.visible");

    graphViewSidePanel.closeSidePanel();
    graphViewSidePanel.getSelectedEntityHeading("Customer").should("not.exist");

    modelPage.selectView("table");
    entityTypeTable.viewEntityInGraphView("Person");
    graphViewSidePanel.getSelectedEntityHeading("Person").should("be.visible");

    //Verify Pan and Zoom in buttons are rendered properly
    cy.get(".vis-zoomOut").should("be.visible");
    cy.get(".vis-zoomIn").should("be.visible");
    cy.get(".vis-up").should("be.visible");
    cy.get(".vis-down").should("be.visible");
    cy.get(".vis-zoomExtends").should("be.visible");
    cy.get(".vis-right").should("be.visible");
    cy.get(".vis-left").should("be.visible");
  });
});
