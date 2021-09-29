/// <reference types="cypress"/>

import modelPage from "../../support/pages/model";
import {
  entityTypeTable,
  graphViewSidePanel,
  relationshipModal
} from "../../support/components/model/index";
import {confirmationModal, toolbar} from "../../support/components/common/index";
import {Application} from "../../support/application.config";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";
import graphVis from "../../support/components/model/graph-vis";
import {ConfirmationType} from "../../support/types/modeling-types";

describe("Graph Validations", () => {
  //Setup hubCentral config for testing
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
    cy.setupHubCentralConfig();
    cy.waitForAsyncRequest();
  });
  //login with valid account
  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => toolbar.getModelToolbarIcon().should("have.length.gt", 0)).click({force: true});
    cy.waitForAsyncRequest();
    modelPage.selectView("table");
    cy.wait(1000);
    entityTypeTable.waitForTableToLoad();
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("can view and edit Entity Type tab in side panel", () => {
    entityTypeTable.viewEntityInGraphView("Person");
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
    graphViewSidePanel.getEditEntityTypeColor().click();
    graphViewSidePanel.selectColorFromPicker("#D5D3DD").click();
    if (Cypress.isBrowser("!firefox")) {
      graphViewSidePanel.getEntityTypeColor("Person").should("have.css", "background", "rgb(213, 211, 221) none repeat scroll 0% 0% / auto padding-box border-box");
    }
    if (Cypress.isBrowser("firefox")) {
      graphViewSidePanel.getEntityTypeColor("Person").should("have.css", "background-color", "rgb(213, 211, 221)");
    }
  });

  //Below is just an example test to showcase how to use the graph library functional library in cypress
  it("can select required entity nodes and edges, within the graph view", () => {
    cy.loginAsDeveloper().withRequest();
    entityTypeTable.viewEntityInGraphView("Person");
    cy.wait(3000);

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


    //Verifying relationship modal

    //Fetching the edge coordinates between two nodes and later performing some action on it like hover or click
    graphVis.getPositionOfEdgeBetween("Customer,BabyRegistry").then((edgePosition: any) => {
      cy.waitUntil(() => graphVis.getGraphVisCanvas().dblclick(edgePosition.x, edgePosition.y));
    });

    relationshipModal.getModalHeader().should("be.visible");

    //edit properties should be populated
    relationshipModal.verifyRelationshipValue("ownedBy");
    relationshipModal.verifyForeignKeyValue("customerId");
    relationshipModal.verifyCardinality("oneToOneIcon").should("be.visible");

    //modify properties and save
    relationshipModal.editRelationshipName("usedBy");
    relationshipModal.toggleCardinality();
    relationshipModal.verifyCardinality("oneToManyIcon").should("be.visible");
    relationshipModal.editForeignKey("email");

    relationshipModal.confirmationOptions("Save");
    cy.waitForAsyncRequest();
    relationshipModal.getModalHeader().should("not.exist");

    //reopen modal to verify changes were saved and persisted
    graphVis.getPositionOfEdgeBetween("Customer,BabyRegistry").then((edgePosition: any) => {
      cy.waitUntil(() => graphVis.getGraphVisCanvas().dblclick(edgePosition.x, edgePosition.y));
    });

    relationshipModal.verifyRelationshipValue("usedBy");
    relationshipModal.verifyForeignKeyValue("email");
    relationshipModal.verifyCardinality("oneToManyIcon").should("be.visible");

    relationshipModal.confirmationOptions("Cancel");

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

  it("reset entity values", () => {
    entityTypeTable.viewEntityInGraphView("Person");
    graphVis.getPositionOfEdgeBetween("Customer,BabyRegistry").then((edgePosition: any) => {
      cy.waitUntil(() => graphVis.getGraphVisCanvas().dblclick(edgePosition.x, edgePosition.y));
    });

    relationshipModal.getModalHeader().should("be.visible");

    relationshipModal.editRelationshipName("ownedBy");
    relationshipModal.editForeignKey("customerId");
    relationshipModal.toggleCardinality();

    relationshipModal.confirmationOptions("Save");
    cy.waitForAsyncRequest();
    relationshipModal.getModalHeader().should("not.exist");
  });

  it("can center on entity type in graph view", () => {
    modelPage.selectView("project-diagram");
    graphVis.getPositionsOfNodes("Person").then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions["Person"];
      graphVis.getGraphVisCanvas().rightclick(orderCoordinates.x, orderCoordinates.y);
      graphVis.getCenterOnEntityTypeOption("Person").trigger("mouseover").click();

      //Clicking on center of the canvas, should click on Person entity node.
      graphVis.getGraphVisCanvas().click();

      //Verify the side panel content for selected entity
      graphViewSidePanel.getSelectedEntityHeading("Person").should("be.visible");
      graphViewSidePanel.getPropertiesTab().should("be.visible");
      graphViewSidePanel.getEntityTypeTab().should("be.visible");
      graphViewSidePanel.getDeleteIcon("Person").should("be.visible");
    });
  });

  it("can select all available nodes in graph view, locations persist", () => {
    let ids = ["BabyRegistry", "Client", "Customer", "Order", "Person"];
    let savedCoords: any = {};
    modelPage.selectView("project-diagram");

    // Select each entity node using retrieved coords
    ids.forEach(id => {
      graphVis.getPositionsOfNodes(id).then((nodePositions: any) => {
        let coords: any = nodePositions[id];
        savedCoords[id] = {x: coords.x, y: coords.y};
        graphVis.getGraphVisCanvas().click(coords.x, coords.y);
      });
      // Verify entity is shown in side panel and close
      graphViewSidePanel.getSelectedEntityHeading(id).should("be.visible");
      graphViewSidePanel.closeSidePanel();
    });

    // Exit graph view and return
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    confirmationModal.getNavigationWarnText().should("be.visible");
    confirmationModal.getYesButton(ConfirmationType.NavigationWarn);

    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    modelPage.selectView("project-diagram");

    // Select entity nodes using previously saved coords
    ids.forEach(id => {
      // TODO getPositionsOfNodes not necessary here for positions, but necessary for async behavior in tests
      graphVis.getPositionsOfNodes(id).then(() => {
        graphVis.getGraphVisCanvas().click(savedCoords[id].x, savedCoords[id].y);
      });
      // Verify entity is shown in side panel and close
      graphViewSidePanel.getSelectedEntityHeading(id).should("be.visible");
      graphViewSidePanel.closeSidePanel();
    });

    // TODO rearrange nodes in graph view, test selection and persistence of changed positions

    // NOTE The following does not work, the node is selected but no dragging occurs
    // graphVis.getPositionsOfNodes().then((nodePositions: any) => {
    //   let clientCoords: any = nodePositions["Client"];
    //   graphVis.getGraphVisCanvas().trigger("pointerdown", clientCoords.x, clientCoords.y, {button: 0});
    //   graphVis.getGraphVisCanvas().trigger("pointermove", clientCoords.x+10, clientCoords.y+10, {button: 0});
    //   graphVis.getGraphVisCanvas().trigger("pointerup", clientCoords.x+20, clientCoords.y+20, {button: 0});
    // });

  });

});
