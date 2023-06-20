import {confirmationModal} from "../../support/components/common/index";
import {ConfirmationType} from "../../support/types/modeling-types";
import graphVis from "../../support/components/model/graph-vis";
import modelPage from "../../support/pages/model";
import "cypress-wait-until";

import {
  graphViewSidePanel,
  graphView,
  conceptClassModal,
  relationshipModal,
  entityTypeTable
} from "../../support/components/model/index";

const userRoles = [
  "hub-central-entity-model-reader",
  "hub-central-entity-model-writer",
  "hub-central-saved-query-user"
];

describe("Concept classes in Modeling screen", () => {
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
  });

  it("Create and verify new concept class", {defaultCommandTimeout: 120000}, () => {
    graphView.getAddButton().click();
    graphView.getAddConceptClassOption().should("be.visible").click({force: true});

    conceptClassModal.newConceptClassName("test_Shoe-Style");
    conceptClassModal.newConceptClassDescription("Different categories of shoe styles.");
    conceptClassModal.getAddButton().click();
    conceptClassModal.getAddButton().should("not.exist");

    cy.wait(5000);
    cy.log("**View and edit concept class in the side panel**");
    graphViewSidePanel.getSelectedConceptClassHeading("test_Shoe-Style").should("exist");
    graphViewSidePanel.getSelectedConceptClassHeadingInfo("test_Shoe-Style").should("exist");
    graphViewSidePanel.getConceptClassDescription().should("be.visible");
    graphViewSidePanel.getConceptClassDescription().should("have.value", "Different categories of shoe styles.");
    cy.intercept("GET", "/api/models").as("colorUpdated");
    modelPage.toggleColorSelector("test_Shoe-Style");
    modelPage.selectColorFromPicker("#D5D3DD").click();
    if (Cypress.isBrowser("!firefox")) {
      graphViewSidePanel.getConceptClassColor("test_Shoe-Style").should("have.css", "background", "rgb(213, 211, 221) none repeat scroll 0% 0% / auto padding-box border-box");
    }
    if (Cypress.isBrowser("firefox")) {
      graphViewSidePanel.getConceptClassColor("test_Shoe-Style").should("have.css", "background-color", "rgb(213, 211, 221)");
    }
    cy.wait("@colorUpdated");
    modelPage.openIconSelector("test_Shoe-Style");
    modelPage.selectIcon("test_Shoe-Style", "FaAccessibleIcon");
    modelPage.getIconSelected("test_Shoe-Style", "FaAccessibleIcon").should("exist");
    graphViewSidePanel.closeSidePanel();
    graphViewSidePanel.getSelectedConceptClassHeading("test_Shoe-Style").should("not.exist");

    cy.log("**Verify duplicate concept name error**");
    graphView.getAddButton().click();
    graphView.getAddConceptClassOption().should("be.visible").click({force: true});
    conceptClassModal.newConceptClassName("test_Shoe-Style");
    conceptClassModal.getAddButton().click();
    conceptClassModal.conceptClassNameError().should("exist");
    conceptClassModal.getCancelButton().click();
    cy.wait(1000);

    cy.log("**Verify it can't start with number**");
    graphView.getAddButton().click();
    graphView.getAddConceptClassOption().should("be.visible").click({force: true});
    conceptClassModal.newConceptClassName("1TestConcept");
    conceptClassModal.getAddButton().click();
    conceptClassModal.conceptModalValidationError().should("exist");
    conceptClassModal.getCancelButton().click();
    cy.wait(1000);

    cy.log("**Verify it can't start with underscore '_'**");
    graphView.getAddButton().click();
    graphView.getAddConceptClassOption().should("be.visible").click({force: true});
    conceptClassModal.newConceptClassName("_TestConcept");
    conceptClassModal.getAddButton().click();
    conceptClassModal.conceptModalValidationError().should("exist");
    conceptClassModal.getCancelButton().click();
    cy.wait(1000);

    cy.log("**Verify it can't start with hypen '-'**");
    graphView.getAddButton().click();
    graphView.getAddConceptClassOption().should("be.visible").click({force: true});
    conceptClassModal.newConceptClassName("-TestConcept");
    conceptClassModal.getAddButton().click();
    conceptClassModal.conceptModalValidationError().should("exist");
    conceptClassModal.getCancelButton().click();
    cy.wait(1000);

    cy.log("**Verify it can't start/contain special chars [!@#$%^&*()<>]**");
    graphView.getAddButton().click();
    graphView.getAddConceptClassOption().should("be.visible").click({force: true});
    conceptClassModal.newConceptClassName("[!@#$%^&*()<>]");
    conceptClassModal.getAddButton().click();
    conceptClassModal.conceptModalValidationError().should("exist");
    conceptClassModal.getCancelButton().click();
    cy.wait(1000);
  });

  it("Can edit graph edit mode and add edge relationship between entity type and concept class via drag/drop", () => {
    modelPage.navigate();
    modelPage.scrollPageBottom();
    cy.wait(6000);
    graphView.getAddButton().click();
    graphView.addNewRelationship().should("be.visible").click({force: true});
    graphView.verifyEditInfoMessage().should("exist");

    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let ProductCoordinates: any = nodePositions["Product"];
      let testShoeStyleCoordinates: any = nodePositions["test_Shoe-Style"];
      cy.wait(150);
      graphVis.getGraphVisCanvas().trigger("pointerdown", ProductCoordinates.x, ProductCoordinates.y, {button: 0, scrollBehavior: "bottom"});
      graphVis.getGraphVisCanvas().trigger("pointermove", testShoeStyleCoordinates.x, testShoeStyleCoordinates.y, {button: 0, force: true, scrollBehavior: "bottom"});
      graphVis.getGraphVisCanvas().trigger("pointerup", testShoeStyleCoordinates.x, testShoeStyleCoordinates.y, {button: 0, scrollBehavior: "bottom"});
    });

    relationshipModal.verifySourceEntity("Product").should("be.visible");
    relationshipModal.verifyTargetNode("test_Shoe-Style").should("be.visible");

    relationshipModal.editRelationshipName("quarter");

    relationshipModal.toggleOptional();
    relationshipModal.verifyVisibleOptionalBlock();
    cy.log("**None property should not be visible anymore**");
    relationshipModal.getSourcePropertySelectWrapper().click();
    relationshipModal.sourceProperty("None").should("not.exist");
    relationshipModal.sourceProperty(".").should("be.visible");

    relationshipModal.sourceProperty("category").click();
    relationshipModal.addRelationshipSubmit();

    cy.waitForAsyncRequest();
    modelPage.scrollPageTop();
    modelPage.switchGraphView();

    modelPage.scrollPageBottom();

    cy.log("**Publish the Data Model**");
    cy.publishDataModel();

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

  it("Can enter graph edit mode and add edge relationships via single node click", {defaultCommandTimeout: 120000}, () => {
    modelPage.scrollPageTop();
    modelPage.switchGraphView();

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

    cy.log("**verify create relationship via clicking a node in edit mode**");
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

    modelPage.scrollPageTop();
    modelPage.switchGraphView();

    modelPage.scrollPageBottom();
    cy.wait(6000);

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
    modelPage.navigate();
    modelPage.scrollPageBottom();
    cy.wait(6000);

    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let testShoeStyleCoordinates: any = nodePositions["test_Shoe-Style"];
      cy.wait(150);
      cy.waitUntil(() => graphVis.getGraphVisCanvas().click(
        testShoeStyleCoordinates.x, testShoeStyleCoordinates.y, {force: true}));
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
      cy.waitUntil(() => graphVis.getGraphVisCanvas().click(
        testShoeStyleCoordinates.x, testShoeStyleCoordinates.y, {force: true}));
    });
    cy.wait(1500);

    graphViewSidePanel.getDeleteIcon("test_Shoe-Style").scrollIntoView().click({force: true});
    confirmationModal.getYesButton(ConfirmationType.DeleteConceptClass);
    confirmationModal.getDeleteConceptClassText().should("not.exist");

    cy.waitForAsyncRequest();
    graphViewSidePanel.getSelectedConceptClassHeading("test_Shoe-Style").should("not.exist");
    cy.wait(150);
    cy.publishDataModel();
  });

  it("Create/Edit and verify new concept class from Table view", {defaultCommandTimeout: 120000}, () => {
    cy.log("Add new concept class from table view");
    modelPage.navigate();
    modelPage.switchTableView();
    cy.waitForAsyncRequest();
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

    modelPage.getColorSelected("TestConcept", "#d5d3dd").scrollIntoView().should("exist");
    modelPage.getIconSelected("TestConcept", "FaAccessibleIcon").should("exist");
  });

  it("Edit concept class and verify that its updated", {defaultCommandTimeout: 120000}, () => {
    entityTypeTable.getConceptClass("TestConcept").scrollIntoView().click({force: true});
    conceptClassModal.clearConceptClassDescription();
    conceptClassModal.newConceptClassDescription("Description has changed");
    conceptClassModal.getAddButton().click();
    conceptClassModal.getAddButton().should("not.exist");

    entityTypeTable.getConceptClass("TestConcept").scrollIntoView().click();
    conceptClassModal.getConceptClassDescription().should("have.value", "Description has changed");
    conceptClassModal.getCancelButton().click();

    cy.log("**Verify that navigate to graph view link works for concept class in the table view**");
    entityTypeTable.viewEntityInGraphView("TestConcept");
    graphViewSidePanel.getDeleteIcon("TestConcept").should("exist");
    graphViewSidePanel.getSelectedEntityHeading("TestConcept").should("exist");

    cy.log("**Delete concept class from Table view and verify that it is not available anymore**");
    modelPage.switchTableView();
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
