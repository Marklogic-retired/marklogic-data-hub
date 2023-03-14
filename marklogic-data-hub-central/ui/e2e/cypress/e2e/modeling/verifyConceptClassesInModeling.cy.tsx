/// <reference types="cypress"/>

import modelPage from "../../support/pages/model";
import {
  graphViewSidePanel,
  graphView,
  conceptClassModal,
  relationshipModal,
  entityTypeTable
} from "../../support/components/model/index";
import {confirmationModal, toolbar} from "../../support/components/common/index";
import {Application} from "../../support/application.config";
import {ConfirmationType} from "../../support/types/modeling-types";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";
import graphVis from "../../support/components/model/graph-vis";

describe("Concept classes in Modeling screen", () => {
  //Scenarios: create, edit, and save a new concept class, edit concept class description, duplicate concept class name check
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
    LoginPage.postLogin();

    //Setup hubCentral config for testing
    cy.setupHubCentralConfig();
  });
  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.resetTestUser();
  });
  it("Create and verify new concept class", {defaultCommandTimeout: 120000}, () => {
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    cy.wait(5000);
    graphView.getAddButton().click();
    graphView.getAddConceptClassOption().should("be.visible").click({force: true});
    // Changed the name of the Concept in the whole class so it have _ and - to check DHFPROD-9665
    conceptClassModal.newConceptClassName("test_Shoe-Style");
    conceptClassModal.newConceptClassDescription("Different categories of shoe styles.");
    cy.waitUntil(() => conceptClassModal.getAddButton().click());
    conceptClassModal.getAddButton().should("not.exist");

    cy.wait(5000);
    cy.log("**View and edit concept class in the side panel**");
    graphViewSidePanel.getSelectedConceptClassHeading("test_Shoe-Style").should("exist");
    graphViewSidePanel.getSelectedConceptClassHeadingInfo("test_Shoe-Style").should("exist");
    graphViewSidePanel.getConceptClassDescription().should("be.visible");
    graphViewSidePanel.getConceptClassDescription().should("have.value", "Different categories of shoe styles.");

    modelPage.toggleColorSelector("test_Shoe-Style");
    modelPage.selectColorFromPicker("#D5D3DD").click();
    if (Cypress.isBrowser("!firefox")) {
      graphViewSidePanel.getConceptClassColor("test_Shoe-Style").should("have.css", "background", "rgb(213, 211, 221) none repeat scroll 0% 0% / auto padding-box border-box");
    }
    if (Cypress.isBrowser("firefox")) {
      graphViewSidePanel.getConceptClassColor("test_Shoe-Style").should("have.css", "background-color", "rgb(213, 211, 221)");
    }

    modelPage.openIconSelector("test_Shoe-Style");
    modelPage.selectIcon("test_Shoe-Style", "FaAccessibleIcon");
    modelPage.getIconSelected("test_Shoe-Style", "FaAccessibleIcon").should("exist");
    graphViewSidePanel.closeSidePanel();
    graphViewSidePanel.getSelectedConceptClassHeading("test_Shoe-Style").should("not.exist");

    cy.log("**Verify duplicate concept name error**");
    graphView.getAddButton().click();
    graphView.getAddConceptClassOption().should("be.visible").click({force: true});
    conceptClassModal.newConceptClassName("test_Shoe-Style");
    cy.waitUntil(() => conceptClassModal.getAddButton().click());
    cy.waitUntil(() => conceptClassModal.conceptClassNameError().should("exist"));
    conceptClassModal.getCancelButton().click();
    cy.wait(1000);
  });

  it("can edit graph edit mode and add edge relationship between entity type and concept class via drag/drop", () => {
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    modelPage.scrollPageBottom();
    cy.wait(6000);
    graphView.getAddButton().click();
    graphView.addNewRelationship().should("be.visible").click({force: true});
    graphView.verifyEditInfoMessage().should("exist");

    // the graph needs to stabilize before we interact with it
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let ProductCoordinates: any = nodePositions["Product"];
      let testShoeStyleCoordinates: any = nodePositions["test_Shoe-Style"];
      cy.wait(150);
      graphVis.getGraphVisCanvas().trigger("pointerdown", ProductCoordinates.x, ProductCoordinates.y, {button: 0, scrollBehavior: "bottom"});
      graphVis.getGraphVisCanvas().trigger("pointermove", testShoeStyleCoordinates.x, testShoeStyleCoordinates.y, {button: 0, force: true, scrollBehavior: "bottom"});
      graphVis.getGraphVisCanvas().trigger("pointerup", testShoeStyleCoordinates.x, testShoeStyleCoordinates.y, {button: 0, scrollBehavior: "bottom"});
    });

    //relationship modal should open with proper source and target nodes in place
    relationshipModal.verifySourceEntity("Product").should("be.visible");
    relationshipModal.verifyTargetNode("test_Shoe-Style").should("be.visible");

    //add relationship properties and save
    relationshipModal.editRelationshipName("quarter");

    //open Optional line to edit foreign key field
    relationshipModal.toggleOptional();
    relationshipModal.verifyVisibleOptionalBlock();
    cy.log("**None property should not be visible anymore**");
    relationshipModal.getSourcePropertySelectWrapper().click();
    relationshipModal.sourceProperty("None").should("not.exist");
    relationshipModal.sourceProperty(".").should("be.visible");

    relationshipModal.sourceProperty("category").click();
    relationshipModal.addRelationshipSubmit();

    cy.waitForAsyncRequest();
    modelPage.selectView("project-diagram");

    modelPage.scrollPageBottom();

    //Publish the changes (DHFPROD-9333)
    cy.log("**Publish the Data Model**");
    cy.publishDataModel();

    //reopen modal to verify previous updates
    graphVis.getPositionOfEdgeBetween("Product,test_Shoe-Style").then((edgePosition: any) => {
      cy.wait(150);
      graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y, {force: true});
    });

    relationshipModal.verifyRelationshipValue("quarter");
    relationshipModal.verifySourcePropertyValue("category");

    cy.log("Verify that the relationship type toggle is disabled in the Edit mode");
    relationshipModal.getEntityToEntityViewOption().trigger("mouseover", {force: true});
    relationshipModal.getDisabledRelationshipTypeTooltip().should("be.visible");

    relationshipModal.cancelModal();
  });

  it("can enter graph edit mode and add edge relationships via single node click", {defaultCommandTimeout: 120000}, () => {
    modelPage.selectView("project-diagram");

    modelPage.scrollPageBottom();
    cy.wait(6000);

    graphView.getAddButton().scrollIntoView().click();
    graphView.addNewRelationship().click();
    graphView.verifyEditInfoMessage().should("exist");
    cy.wait(1000);

    cy.log("Verify the Invalid source error when choosing Concept class as Source type");
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let testShoeStyleCoordinates: any = nodePositions["test_Shoe-Style"];
      graphVis.getGraphVisCanvas().trigger("mouseover", testShoeStyleCoordinates.x, testShoeStyleCoordinates.y);
      cy.wait(150);
      graphVis.getGraphVisCanvas().click(testShoeStyleCoordinates.x, testShoeStyleCoordinates.y, {force: true});
    });
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let testShoeStyleCoordinates: any = nodePositions["test_Shoe-Style"];
      cy.wait(150);
      graphVis.getGraphVisCanvas().click(testShoeStyleCoordinates.x, testShoeStyleCoordinates.y, {force: true});
    });
    graphVis.getInvalidSourceTypeError().should("be.visible");
    graphVis.closeInvalidSourceTypeErrorModal();
    graphView.verifyEditInfoMessage().should("not.exist");

    cy.wait(2000);

    graphView.getAddButton().scrollIntoView().click();
    graphView.addNewRelationship().click();
    graphView.verifyEditInfoMessage().should("exist");
    cy.wait(1000);

    //verify create relationship via clicking a node in edit mode
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let personCoordinates: any = nodePositions["Person"];
      graphVis.getGraphVisCanvas().trigger("mouseover", personCoordinates.x, personCoordinates.y);
      cy.wait(150);
      graphVis.getGraphVisCanvas().click(personCoordinates.x, personCoordinates.y, {force: true});
    });

    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let personCoordinates: any = nodePositions["Person"];
      cy.wait(150);
      graphVis.getGraphVisCanvas().click(personCoordinates.x, personCoordinates.y, {force: true});
    });

    relationshipModal.getModalHeader().should("be.visible");
    relationshipModal.verifySourceEntity("Person").should("be.visible");

    //target entity node should be placeholder and user can set relationship options
    relationshipModal.verifyTargetNode("Select target entity type*").should("be.visible");
    relationshipModal.getEntityToConceptClassViewOption().should("not.be.checked");
    relationshipModal.getEntityToEntityViewOption().should("be.checked");

    cy.log("Change view type to entity to concept class");
    relationshipModal.getEntityToConceptClassViewOption().click();
    relationshipModal.verifyTargetNode("Select a concept class*").should("be.visible");

    relationshipModal.targetEntityDropdown().click();
    relationshipModal.verifyEntityOption("test_Shoe-Style").should("be.visible");
    relationshipModal.selectTargetEntityOption("test_Shoe-Style");
    relationshipModal.editRelationshipName("hasStyle");
    relationshipModal.editSourceProperty("id");
    relationshipModal.toggleOptional();
    relationshipModal.verifyVisibleOptionalBlock();
    relationshipModal.verifyExpressionPlaceholder().should("be.visible");

    relationshipModal.addRelationshipSubmit();
    cy.waitForAsyncRequest();
    relationshipModal.getModalHeader().should("not.exist");

    modelPage.selectView("project-diagram");

    modelPage.scrollPageBottom();
    cy.wait(6000);

    //reopen modal to verify previous updates
    graphVis.getPositionOfEdgeBetween("Person,test_Shoe-Style").then((edgePosition: any) => {
      cy.wait(150);
      graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y, {force: true});
    });

    relationshipModal.verifyRelationshipValue("hasStyle");
    relationshipModal.verifySourcePropertyValue("id");

    cy.log("Verify that the relationship type toggle is disabled in the Edit mode");
    relationshipModal.getEntityToEntityViewOption().trigger("mouseover", {force: true});
    relationshipModal.getDisabledRelationshipTypeTooltip().should("be.visible");

    relationshipModal.cancelModal();

  });

  it("Delete a concept class from graph view and publish the changes", {defaultCommandTimeout: 120000}, () => {
    // the graph needs to stabilize before we interact with it
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    modelPage.scrollPageBottom();
    cy.wait(6000);

    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let testShoeStyleCoordinates: any = nodePositions["test_Shoe-Style"];
      cy.wait(150);
      cy.waitUntil(() => graphVis.getGraphVisCanvas().click(testShoeStyleCoordinates.x, testShoeStyleCoordinates.y, {force: true}));
    });
    cy.wait(1500);

    graphViewSidePanel.getDeleteIcon("test_Shoe-Style").scrollIntoView().click({force: true});
    confirmationModal.getDeleteConceptClassWithRelationshipsText().should("exist");
    confirmationModal.getCloseButton(ConfirmationType.DeleteConceptClassWithRelatedEntityTypes).click();
    graphViewSidePanel.getSelectedConceptClassHeading("test_Shoe-Style").should("exist");

    graphViewSidePanel.closeSidePanel();
    graphViewSidePanel.getSelectedConceptClassHeading("test_Shoe-Style").should("not.exist");

    modelPage.scrollPageBottom();
    cy.wait(6000);

    //reopen modal to verify previous updates
    graphVis.getPositionOfEdgeBetween("Product,test_Shoe-Style").then((edgePosition: any) => {
      cy.wait(150);
      graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y, {force: true});
    });

    cy.log("Deleting relationship between Product and testShoeStyle");
    relationshipModal.getDeleteRelationshipIcon().click();
    confirmationModal.getDeletePropertyWarnText().should("exist");
    relationshipModal.confirmDeleteRel();
    confirmationModal.getDeletePropertyWarnText().should("not.exist");

    cy.wait(3000);

    cy.log("Deleting relationship between Person and testShoeStyle");
    //reopen modal to verify previous updates
    graphVis.getPositionOfEdgeBetween("Person,test_Shoe-Style").then((edgePosition: any) => {
      cy.wait(150);
      graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y, {force: true});
    });

    relationshipModal.getDeleteRelationshipIcon().click();
    confirmationModal.getDeletePropertyWarnText().should("exist");
    relationshipModal.confirmDeleteRel();
    confirmationModal.getDeletePropertyWarnText().should("not.exist");

    cy.waitForAsyncRequest();

    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let testShoeStyleCoordinates: any = nodePositions["test_Shoe-Style"];
      cy.wait(150);
      cy.waitUntil(() => graphVis.getGraphVisCanvas().click(testShoeStyleCoordinates.x, testShoeStyleCoordinates.y, {force: true}));
    });
    cy.wait(1500);

    graphViewSidePanel.getDeleteIcon("test_Shoe-Style").scrollIntoView().click({force: true});
    confirmationModal.getYesButton(ConfirmationType.DeleteConceptClass);
    confirmationModal.getDeleteConceptClassText().should("not.exist");

    cy.waitForAsyncRequest();
    graphViewSidePanel.getSelectedConceptClassHeading("test_Shoe-Style").should("not.exist");
    cy.wait(150);
    //Publish the changes
    cy.publishDataModel();
  });

  it("Create/Edit and verify new concept class from Table view", {defaultCommandTimeout: 120000}, () => {
    cy.log("Add new concept class from table view");
    toolbar.getModelToolbarIcon().should("be.visible").click();
    cy.waitForAsyncRequest();
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    modelPage.getAddButton().should("be.visible").click({force: true});
    modelPage.getAddConceptClassOption().should("be.visible").click({force: true});
    conceptClassModal.newConceptClassName("TestConcept");
    conceptClassModal.newConceptClassDescription("Test description.");

    modelPage.openIconSelector("TestConcept");
    modelPage.selectIcon("TestConcept", "FaAccessibleIcon");
    modelPage.toggleColorSelector("TestConcept");
    modelPage.selectColorFromPicker("#D5D3DD").click();
    modelPage.toggleColorSelector("TestConcept");
    if (Cypress.isBrowser("!firefox")) {
      graphViewSidePanel.getConceptClassColor("TestConcept").should("have.css", "background", "rgb(213, 211, 221) none repeat scroll 0% 0% / auto padding-box border-box");
    }
    if (Cypress.isBrowser("firefox")) {
      graphViewSidePanel.getConceptClassColor("TestConcept").should("have.css", "background-color", "rgb(213, 211, 221)");
    }

    modelPage.getIconSelected("TestConcept", "FaAccessibleIcon").should("exist");
    conceptClassModal.getAddButton().click();
    cy.waitForAsyncRequest();
    conceptClassModal.getAddButton().should("not.exist");
    entityTypeTable.sortByNodeTypeConcept();
    entityTypeTable.getConceptClass("TestConcept").should("exist").scrollIntoView();

    //verify color and icon is reflected in the table
    modelPage.getColorSelected("TestConcept", "#d5d3dd").scrollIntoView().should("exist");
    modelPage.getIconSelected("TestConcept", "FaAccessibleIcon").should("exist");
  });

  it("Edit concept class and verify that its updated", {defaultCommandTimeout: 120000}, () => {
    entityTypeTable.getConceptClass("TestConcept").scrollIntoView().click({force: true});
    conceptClassModal.clearConceptClassDescription();
    conceptClassModal.newConceptClassDescription("Description has changed");
    conceptClassModal.getAddButton().click();
    conceptClassModal.getAddButton().should("not.exist");
    // check edited concept class description
    entityTypeTable.getConceptClass("TestConcept").scrollIntoView().click();
    conceptClassModal.getConceptClassDescription().should("have.value", "Description has changed");
    conceptClassModal.getCancelButton().click();

    cy.log("**Verify that navigate to graph view link works for concept class in the table view**");
    entityTypeTable.viewEntityInGraphView("TestConcept");
    graphViewSidePanel.getDeleteIcon("TestConcept").should("exist");
    graphViewSidePanel.getSelectedEntityHeading("TestConcept").should("exist");

    cy.log("**Delete concept class from Table view and verify that it is not available anymore**");
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    cy.get(`[data-testid="nodeType"]`).scrollIntoView().should("be.visible").click({force: true});
    entityTypeTable.getDeleteConceptClassIcon("TestConcept").scrollIntoView().should("be.visible").click({force: true});
    confirmationModal.getDeleteConceptClassText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.DeleteConceptClass);
    confirmationModal.getDeleteConceptClassText().should("not.exist");
    cy.waitForAsyncRequest();
    entityTypeTable.getConceptClass("TestConcept").should("not.exist");
  });
});