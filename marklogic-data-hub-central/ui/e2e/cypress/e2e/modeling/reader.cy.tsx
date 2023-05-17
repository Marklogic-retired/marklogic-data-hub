import {confirmationModal} from "../../support/components/common/index";
import graphVis from "../../support/components/model/graph-vis";
import modelPage from "../../support/pages/model";
import "cypress-wait-until";

import {
  entityTypeModal,
  entityTypeTable,
  graphView,
  graphViewSidePanel,
  propertyModal,
  propertyTable,
  relationshipModal
} from "../../support/components/model/index";

describe("Entity Modeling: Reader Role", () => {
  before(() => {
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-saved-query-user").withRequest();
    cy.setupHubCentralConfig();
  });

  beforeEach(() => {
    cy.visit("/tiles/model");
    cy.wait(2000);
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
  });

  after(() => {
    cy.resetTestUser();
  });

  it("Can navigate by clicking instance count and last processed, can not create, edit, or delete entity models", () => {
    // Removed navigation tests until DHFPROD-6152 is resolved

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

    modelPage.getAddButton().should("be.disabled");
    entityTypeModal.getAddButton().should("not.exist");

    modelPage.getPublishButton().click({force: true});
    modelPage.getPublishButtonDisabledTooltip().should("exist");

    entityTypeTable.getEntity("Customer").click({force: true});
    propertyModal.getSubmitButton().should("not.exist");

    entityTypeTable.getDeleteEntityIcon("Customer").click({force: true});
    confirmationModal.getDeleteEntityStepText().should("not.exist");

    entityTypeTable.getExpandEntityIcon("Customer");
    propertyTable.getAddPropertyButton("Customer").should("be.visible").click({force: true});
    propertyModal.getSubmitButton().should("not.exist");

    propertyTable.getDeletePropertyIcon("Customer", "pin").click({force: true});
    confirmationModal.getDeletePropertyStepWarnText().should("not.exist");

    propertyTable.getAddPropertyToStructureType("shipping").click({force: true});
    propertyModal.getStructuredTypeName().should("not.exist");

    //TODO: re-test without using mltable-expand
    // propertyTable.expandStructuredTypeIcon("shipping").click();
    // propertyTable.expandStructuredTypeIcon("zip").scrollIntoView().click();

    // propertyTable.getAddPropertyToStructureType("Zip").click({force: true});
    // propertyModal.getStructuredTypeName().should("not.exist");

    // propertyTable.getDeleteStructuredPropertyIcon("Customer", "Zip", "zip-fiveDigit").click({force: true});
    // confirmationModal.getDeletePropertyStepWarnText().should("not.exist");

    // To verify modeling info is rendered properly in table view
    modelPage.clickModelingInfoIcon();
    modelPage.verifyModelingInfo();
  });

  it("Can navigate to graph view from table view", () => {
    entityTypeTable.viewEntityInGraphView("Customer");

    graphView.getFilterInput().should("be.visible");
    graphView.getAddButton().should("be.disabled");
    graphView.getPublishToDatabaseButton().should("be.visible");
    graphView.getExportGraphIcon().should("be.visible");
    graphViewSidePanel.getSelectedEntityHeading("Customer").should("be.visible");
    graphViewSidePanel.getPropertiesTab().should("be.visible");
    graphViewSidePanel.getEntityTypeTab().should("be.visible");
    graphViewSidePanel.getDeleteIcon("Customer").should("be.visible");

    //To verify properties tab should display property table
    graphViewSidePanel.getPropertyTableHeader("propertyName").should("be.visible");
    graphViewSidePanel.getPropertyTableHeader("type").should("be.visible");
    graphViewSidePanel.getPropertyTableHeader("delete").should("be.visible");

    //To verify table is populated with Customer properties
    graphViewSidePanel.getPropertyName("customerId").should("be.visible");
    graphViewSidePanel.getPropertyName("name").should("be.visible");
    graphViewSidePanel.getPropertyName("email").should("be.visible");

    //To verify cannot edit Entity Type tab without permissions (except color)
    graphViewSidePanel.getEntityTypeTab().click();
    graphViewSidePanel.getEntityDescription().should("be.disabled");
    graphViewSidePanel.getEntityNamespace().should("be.disabled");
    graphViewSidePanel.getEntityPrefix().should("be.disabled");
    cy.intercept("GET", "/api/models").as("colorUpdated");
    modelPage.toggleColorSelector("Customer");
    modelPage.selectColorFromPicker("#D5D3DD").click();
    if (Cypress.isBrowser("!firefox")) {
      graphViewSidePanel.getEntityTypeColor("Customer").should("have.css", "background", "rgb(213, 211, 221) none repeat scroll 0% 0% / auto padding-box border-box");
    }
    if (Cypress.isBrowser("firefox")) {
      graphViewSidePanel.getEntityTypeColor("Customer").should("have.css", "background-color", "rgb(213, 211, 221)");
    }
    cy.wait("@colorUpdated");
    modelPage.openIconSelector("Customer");
    modelPage.selectIcon("Customer", "FaAccessibleIcon");
    modelPage.getIconSelected("Customer", "FaAccessibleIcon").should("exist");

    graphViewSidePanel.closeSidePanel();
    graphViewSidePanel.getSelectedEntityHeading("Customer").should("not.exist");

    //To verify cannot edit without permissions
    graphVis.getPositionOfEdgeBetween("Customer,BabyRegistry").then((edgePosition: any) => {
      const canvas = graphVis.getGraphVisCanvas();
      const trigger = canvas.trigger("mouseover", edgePosition.x, edgePosition.y);
      trigger.click({force: true});
    });

    relationshipModal.getModalHeader().should("not.exist");

    //To test graph view model png is downloaded successfully
    if (Cypress.isBrowser("!firefox")) {
      graphView.getExportGraphIcon().scrollIntoView().click({force: true}).then(
        () => {
          cy.readFile("./cypress/downloads/graph-view-model.png", "base64").then(
            (downloadPng) => {
              expect(downloadPng).exist;
            });
        });
    }

    modelPage.scrollPageTop();
    // To verify modeling info is rendered properly in graph view
    modelPage.clickModelingInfoIcon();
    modelPage.verifyModelingInfo();

    //To verify Pan and Zoom in buttons are rendered properly
    cy.get(".vis-zoomOut").should("be.visible");
    cy.get(".vis-zoomIn").should("be.visible");
    cy.get(".vis-up").should("be.visible");
    cy.get(".vis-down").should("be.visible");
    cy.get(".vis-zoomExtends").should("be.visible");
    cy.get(".vis-right").should("be.visible");
    cy.get(".vis-left").should("be.visible");
  });
});
