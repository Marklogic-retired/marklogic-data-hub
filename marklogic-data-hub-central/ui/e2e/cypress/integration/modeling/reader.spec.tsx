/// <reference types="cypress"/>

import modelPage from "../../support/pages/model";
import {
  entityTypeModal,
  entityTypeTable,
  graphView,
  graphViewSidePanel,
  propertyModal,
  propertyTable,
} from "../../support/components/model/index";
import {confirmationModal, toolbar} from "../../support/components/common/index";
import {Application} from "../../support/application.config";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";
import graphVis from "../../support/components/model/graph-vis";

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
  });

  it("can navigate to graph view from table view", () => {
    // Should be updated once the dummy entity links are replaced by actual graph nodes.
    entityTypeTable.viewEntityInGraphView("Customer").click({force: true});
    graphView.getFilterInput().should("be.visible");
    graphView.getAddEntityButton().should("be.visible");
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
    entityTypeTable.viewEntityInGraphView("Person").click({force: true});
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

  it("can view and edit Entity Type tab in side panel", () => {
    cy.loginAsDeveloper().withRequest();
    entityTypeTable.viewEntityInGraphView("Person").click({force: true});
    graphViewSidePanel.getEntityTypeTab().click();
    graphViewSidePanel.getPersonEntityDescription().should("be.visible");
    graphViewSidePanel.getPersonEntityDescription().clear();
    graphViewSidePanel.getPersonEntityNamespace().clear();
    graphViewSidePanel.getPersonEntityPrefix().clear();

    graphViewSidePanel.getPersonEntityDescription().clear();
    graphViewSidePanel.getPersonEntityNamespace().clear();
    graphViewSidePanel.getPersonEntityPrefix().clear();
    graphViewSidePanel.getPersonEntityDescription().type("test description");
    graphViewSidePanel.getPersonEntityNamespace().type("test");
    graphViewSidePanel.getPersonEntityDescription().click();
    cy.findByText("Since you entered a namespace, you must specify a prefix.").should("be.visible");
    graphViewSidePanel.getPersonEntityPrefix().type("pre");
    graphViewSidePanel.getPersonEntityDescription().click();
    cy.findByText("Invalid model: Namespace property must be a valid absolute URI. Value is test.").should("be.visible");
    graphViewSidePanel.getPersonEntityDescription().clear();
    graphViewSidePanel.getPersonEntityNamespace().type("http://example.org/test");
    graphViewSidePanel.getPersonEntityDescription().click();
    cy.findByText("Invalid model: Namespace property must be a valid absolute URI. Value is test.").should("not.exist");
  });

  //Below is just an example test to showcase how to use the graph library functional library in cypress
  it("can select required entity nodes and edges, within the graph view", () => {
    cy.loginAsDeveloper().withRequest();
    entityTypeTable.viewEntityInGraphView("Person").click({force: true});
    //Select an entity node from within the graph view and ensure that side panel opens up
    graphVis.getPositionsOfNodes("Order").then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions["Order"];
      graphVis.getGraphVisCanvas().click(orderCoordinates.x, orderCoordinates.y);
    });
    //Verifying the content of side panel
    graphViewSidePanel.getSelectedEntityHeading("Order").should("be.visible");
    graphViewSidePanel.getPropertiesTab().should("be.visible");
    graphViewSidePanel.getEntityTypeTab().should("be.visible");
    graphViewSidePanel.getDeleteIcon("Order").should("be.visible");


    //Fetching the edge coordinates between two nodes and later performing some action on it like hover or click
    graphVis.getPositionOfEdgeBetween("Customer,BabyRegistry").then((edgePosition: any) => {
      cy.waitUntil(() => graphVis.getGraphVisCanvas().trigger("mousemove", edgePosition.x, edgePosition.y));
    });

    //Fetch coordinates of all the nodes in the canvas and then use the response to perform an action (in this case, a click)
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let babyRegistryCoordinates: any = nodePositions["BabyRegistry"];
      graphVis.getGraphVisCanvas().click(babyRegistryCoordinates.x, babyRegistryCoordinates.y);
    });
  });

  it("can filter and select entity type in graph view", () => {
    modelPage.selectView("project-diagram");
    graphViewSidePanel.getSelectedEntityHeading("BabyRegistry").should("not.exist");
    //Enter First 3+ characters to select option from dropdown
    graphViewSidePanel.getGraphViewFilterInput().type("Bab");
    graphViewSidePanel.selectEntityDropdown();
    //Verify the side panel content for selected entity
    graphViewSidePanel.getSelectedEntityHeading("BabyRegistry").should("be.visible");
    graphViewSidePanel.getPropertiesTab().should("be.visible");
    graphViewSidePanel.getEntityTypeTab().should("be.visible");
    graphViewSidePanel.getDeleteIcon("BabyRegistry").should("be.visible");
  });
});
