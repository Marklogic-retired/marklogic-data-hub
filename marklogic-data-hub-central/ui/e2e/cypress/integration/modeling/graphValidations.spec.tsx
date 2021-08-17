/// <reference types="cypress"/>

import modelPage from "../../support/pages/model";
import {
  entityTypeTable,
  graphViewSidePanel,
  relationshipModal
} from "../../support/components/model/index";
import {toolbar} from "../../support/components/common/index";
import {Application} from "../../support/application.config";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";
import graphVis from "../../support/components/model/graph-vis";

describe("Graph Validations", () => {
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
    relationshipModal.verifyJoinPropertyValue("customerId");
    relationshipModal.verifyCardinality("oneToOneIcon").should("be.visible");

    //modify properties and save
    relationshipModal.editRelationshipName("usedBy");
    relationshipModal.toggleCardinality();
    relationshipModal.verifyCardinality("oneToManyIcon").should("be.visible");
    relationshipModal.editJoinProperty("email");

    relationshipModal.confirmationOptions("Save").click({force: true});
    cy.waitForAsyncRequest();
    relationshipModal.getModalHeader().should("not.exist");

    //reopen modal to verify changes were saved and persisted
    graphVis.getPositionOfEdgeBetween("Customer,BabyRegistry").then((edgePosition: any) => {
      cy.waitUntil(() => graphVis.getGraphVisCanvas().dblclick(edgePosition.x, edgePosition.y));
    });

    relationshipModal.verifyRelationshipValue("usedBy");
    relationshipModal.verifyJoinPropertyValue("email");
    relationshipModal.verifyCardinality("oneToManyIcon").should("be.visible");

    relationshipModal.confirmationOptions("Cancel").click({force: true});

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
    relationshipModal.editJoinProperty("customerId");
    relationshipModal.toggleCardinality();

    relationshipModal.confirmationOptions("Save").click({force: true});
    cy.waitForAsyncRequest();
    relationshipModal.getModalHeader().should("not.exist");
  });
});
