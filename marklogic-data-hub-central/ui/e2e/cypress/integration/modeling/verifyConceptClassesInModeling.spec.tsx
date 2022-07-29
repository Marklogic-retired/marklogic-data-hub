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

    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage();
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
    conceptClassModal.newConceptClassName("ShoeStyle");
    conceptClassModal.newConceptClassDescription("Different categories of shoe styles.");
    cy.waitUntil(() => conceptClassModal.getAddButton().click());
    conceptClassModal.getAddButton().should("not.exist");

    cy.wait(5000);
    cy.log("**View and edit concept class in the side panel**");
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let shoeStyleCoordinates: any = nodePositions["ShoeStyle"];
      cy.wait(150);
      graphVis.getGraphVisCanvas().trigger("mouseover", shoeStyleCoordinates.x, shoeStyleCoordinates.y, {force: true}).click(shoeStyleCoordinates.x, shoeStyleCoordinates.y, {force: true});
      // side panel heading shows concept name and info
    });
    graphViewSidePanel.getSelectedConceptClassHeading("ShoeStyle").should("exist");
    graphViewSidePanel.getSelectedConceptClassHeadingInfo("ShoeStyle").should("exist");
    graphViewSidePanel.getConceptClassDescription().should("be.visible");
    graphViewSidePanel.getConceptClassDescription().should("have.value", "Different categories of shoe styles.");

    modelPage.toggleColorSelector("ShoeStyle");
    modelPage.selectColorFromPicker("#D5D3DD").click();
    if (Cypress.isBrowser("!firefox")) {
      graphViewSidePanel.getConceptClassColor("ShoeStyle").should("have.css", "background", "rgb(213, 211, 221) none repeat scroll 0% 0% / auto padding-box border-box");
    }
    if (Cypress.isBrowser("firefox")) {
      graphViewSidePanel.getConceptClassColor("ShoeStyle").should("have.css", "background-color", "rgb(213, 211, 221)");
    }

    modelPage.openIconSelector("ShoeStyle");
    modelPage.selectIcon("ShoeStyle", "FaAccessibleIcon");
    modelPage.getIconSelected("ShoeStyle", "FaAccessibleIcon").should("exist");
    graphViewSidePanel.closeSidePanel();
    graphViewSidePanel.getSelectedConceptClassHeading("ShoeStyle").should("not.exist");

    cy.log("**Verify duplicate concept name error**");
    graphView.getAddButton().click();
    graphView.getAddConceptClassOption().should("be.visible").click({force: true});
    conceptClassModal.newConceptClassName("ShoeStyle");
    cy.waitUntil(() => conceptClassModal.getAddButton().click());
    cy.waitUntil(() => conceptClassModal.conceptClassNameError().should("exist"));
    conceptClassModal.getCancelButton().click();
  });

  it("can edit graph edit mode and add edge relationship between entity type and concept class via drag/drop", () => {
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    modelPage.scrollPageBottom();
    cy.wait(6000);
    graphView.getAddButton().click();
    graphView.addNewRelationship().should("be.visible").click({force: true});
    graphView.verifyEditInfoMessage().should("exist");

    modelPage.scrollPageBottom();

    // the graph needs to stabilize before we interact with it
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let ProductCoordinates: any = nodePositions["Product"];
      let ShoeStyleCoordinates: any = nodePositions["ShoeStyle"];
      cy.wait(150);
      graphVis.getGraphVisCanvas().trigger("pointerdown", ProductCoordinates.x, ProductCoordinates.y, {button: 0, scrollBehavior: "bottom"});
      graphVis.getGraphVisCanvas().trigger("pointermove", ShoeStyleCoordinates.x, ShoeStyleCoordinates.y, {button: 0, force: true, scrollBehavior: "bottom"});
      graphVis.getGraphVisCanvas().trigger("pointerup", ShoeStyleCoordinates.x, ShoeStyleCoordinates.y, {button: 0, scrollBehavior: "bottom"});
    });

    //relationship modal should open with proper source and target nodes in place
    relationshipModal.verifySourceEntity("Product").should("be.visible");
    relationshipModal.verifyTargetNode("ShoeStyle").should("be.visible");

    //add relationship properties and save
    relationshipModal.editRelationshipName("isCategory");

    //open Optional line to edit foreign key field
    relationshipModal.toggleOptional();
    relationshipModal.verifyVisibleOptionalBlock();
    relationshipModal.editSourceProperty("category");
    relationshipModal.addRelationshipSubmit();

    cy.waitForAsyncRequest();
    modelPage.selectView("project-diagram");

    modelPage.scrollPageBottom();
    cy.wait(6000);

    //reopen modal to verify previous updates
    graphVis.getPositionOfEdgeBetween("Product,ShoeStyle").then((edgePosition: any) => {
      cy.wait(150);
      graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y, {force: true});
    });

    relationshipModal.verifyRelationshipValue("isCategory");
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
      let shoeStyleCoordinates: any = nodePositions["ShoeStyle"];
      graphVis.getGraphVisCanvas().trigger("mouseover", shoeStyleCoordinates.x, shoeStyleCoordinates.y);
      cy.wait(150);
      graphVis.getGraphVisCanvas().click(shoeStyleCoordinates.x, shoeStyleCoordinates.y, {force: true});
    });
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let shoeStyleCoordinates: any = nodePositions["ShoeStyle"];
      cy.wait(150);
      graphVis.getGraphVisCanvas().click(shoeStyleCoordinates.x, shoeStyleCoordinates.y, {force: true});
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
    relationshipModal.verifyEntityOption("ShoeStyle").should("be.visible");
    relationshipModal.selectTargetEntityOption("ShoeStyle");
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
    graphVis.getPositionOfEdgeBetween("Person,ShoeStyle").then((edgePosition: any) => {
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
      let shoeStyleCoordinates: any = nodePositions["ShoeStyle"];
      cy.wait(150);
      cy.waitUntil(() => graphVis.getGraphVisCanvas().click(shoeStyleCoordinates.x, shoeStyleCoordinates.y, {force: true}));
    });
    cy.wait(1500);

    graphViewSidePanel.getDeleteIcon("ShoeStyle").scrollIntoView().click({force: true});
    confirmationModal.getDeleteConceptClassWithRelationshipsText().should("exist");
    confirmationModal.getCloseButton(ConfirmationType.DeleteConceptClassWithRelatedEntityTypes).click();
    graphViewSidePanel.getSelectedConceptClassHeading("ShoeStyle").should("exist");

    graphViewSidePanel.closeSidePanel();
    graphViewSidePanel.getSelectedConceptClassHeading("ShoeStyle").should("not.exist");

    modelPage.scrollPageBottom();
    cy.wait(6000);

    //reopen modal to verify previous updates
    graphVis.getPositionOfEdgeBetween("Product,ShoeStyle").then((edgePosition: any) => {
      cy.wait(150);
      graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y, {force: true});
    });

    cy.log("Deleting relationship between Product and ShoeStyle");
    relationshipModal.getDeleteRelationshipIcon().click();
    confirmationModal.getDeletePropertyStepWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyStepWarn);
    confirmationModal.getDeletePropertyStepWarnText().should("not.exist");

    cy.wait(3000);

    cy.log("Deleting relationship between Person and ShoeStyle");
    //reopen modal to verify previous updates
    graphVis.getPositionOfEdgeBetween("Person,ShoeStyle").then((edgePosition: any) => {
      cy.wait(150);
      graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y, {force: true});
    });

    relationshipModal.getDeleteRelationshipIcon().click();
    confirmationModal.getDeletePropertyStepWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyStepWarn);
    confirmationModal.getDeletePropertyStepWarnText().should("not.exist");

    cy.waitForAsyncRequest();

    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let shoeStyleCoordinates: any = nodePositions["ShoeStyle"];
      cy.wait(150);
      cy.waitUntil(() => graphVis.getGraphVisCanvas().click(shoeStyleCoordinates.x, shoeStyleCoordinates.y, {force: true}));
    });
    cy.wait(1500);

    graphViewSidePanel.getDeleteIcon("ShoeStyle").scrollIntoView().click({force: true});
    confirmationModal.getYesButton(ConfirmationType.DeleteConceptClass);
    confirmationModal.getDeleteConceptClassText().should("not.exist");

    cy.waitForAsyncRequest();
    graphViewSidePanel.getSelectedConceptClassHeading("ShoeStyle").should("not.exist");
    cy.wait(150);
    //Publish the changes
    cy.publishDataModel();
  });

  it("Create/Edit and verify new concept class from Table view", {defaultCommandTimeout: 120000}, () => {
    cy.log("Add new concept class from table view");
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    cy.waitUntil(() => modelPage.getAddButton()).click();
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
    cy.waitUntil(() => conceptClassModal.getAddButton().click());
    conceptClassModal.getAddButton().should("not.exist");

    //verify color and icon is reflected in the table
    modelPage.getColorSelected("TestConcept", "#d5d3dd").should("exist");
    modelPage.getIconSelected("TestConcept", "FaAccessibleIcon").should("exist");

    cy.log("**Edit concept class and verify that its updated**");
    entityTypeTable.getConceptClass("TestConcept").click();
    conceptClassModal.clearConceptClassDescription();
    conceptClassModal.newConceptClassDescription("Description has changed");
    cy.waitUntil(() => conceptClassModal.getAddButton().click());
    conceptClassModal.getAddButton().should("not.exist");
    // check edited concept class description
    entityTypeTable.getConceptClass("TestConcept").click();
    conceptClassModal.getConceptClassDescription().should("have.value", "Description has changed");
    conceptClassModal.getCancelButton().click();

    cy.log("Verify that navigate to graph view link works for concept class in the table view");
    entityTypeTable.viewEntityInGraphView("TestConcept");
    graphViewSidePanel.getDeleteIcon("TestConcept").should("exist");
    graphViewSidePanel.getSelectedEntityHeading("TestConcept").should("exist");

    cy.log("Delete concept class from Table view and verify that it is not available anymore");
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    entityTypeTable.getDeleteConceptClassIcon("TestConcept").should("be.visible").click({force: true});
    confirmationModal.getDeleteConceptClassText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.DeleteConceptClass);
    confirmationModal.getDeleteConceptClassText().should("not.exist");
    cy.waitForAsyncRequest();
    entityTypeTable.getConceptClass("TestConcept").should("not.exist");
  });

});