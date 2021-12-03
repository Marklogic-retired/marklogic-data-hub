/// <reference types="cypress"/>

import modelPage from "../../support/pages/model";
import {
  entityTypeModal,
  entityTypeTable,
  graphView,
  propertyModal,
  propertyTable,
  graphViewSidePanel,
  relationshipModal
} from "../../support/components/model/index";
import {mappingStepDetail} from "../../support/components/mapping";
import graphVis from "../../support/components/model/graph-vis";
import curatePage from "../../support/pages/curate";
import {confirmationModal, toolbar} from "../../support/components/common/index";
import {ConfirmationType} from "../../support/types/modeling-types";
import {Application} from "../../support/application.config";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";

describe("Entity Modeling: Graph View", () => {
  //Setup hubCentral config for testing
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-mapping-writer", "hub-central-saved-query-user").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
    cy.setupHubCentralConfig();
    cy.waitForAsyncRequest();
  });
  //login with valid account
  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-mapping-writer", "hub-central-saved-query-user").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    cy.waitForAsyncRequest();
    modelPage.selectView("table");
    cy.wait(1000);
    entityTypeTable.waitForTableToLoad();
  });
  afterEach(() => {});
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Create an entity with name having more than 20 chars", () => {
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click({force: true});
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    modelPage.getAddEntityButton().should("exist").click();
    entityTypeModal.newEntityName("ThisIsVeryLongNameHavingMoreThan20Characters");
    entityTypeModal.newEntityDescription("entity description");
    cy.waitUntil(() => entityTypeModal.getAddButton().click());
    entityTypeTable.viewEntityInGraphView("ThisIsVeryLongNameHavingMoreThan20Characters");
    cy.wait(5000);
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let longNameCoordinates: any = nodePositions["ThisIsVeryLongNameHavingMoreThan20Characters"];
      cy.wait(150);
      graphVis.getGraphVisCanvas().trigger("mouseover", longNameCoordinates.x, longNameCoordinates.y, {force: true});
      // Node shows full name on hover
      cy.contains("ThisIsVeryLongNameHavingMoreThan20Characters");
    });

    graphViewSidePanel.getDeleteIcon("ThisIsVeryLongNameHavingMoreThan20Characters").click();
    confirmationModal.getYesButton(ConfirmationType.DeleteEntity);
    confirmationModal.getDeleteEntityText().should("not.exist");
    cy.waitForAsyncRequest();
    graphViewSidePanel.getSelectedEntityHeading("ThisIsVeryLongNameHavingMoreThan20Characters").should("not.exist");
    cy.publishEntityModel();
  });
  it("Create another entity Patients and add a properties", {defaultCommandTimeout: 120000}, () => {
    modelPage.selectView("table");
    modelPage.getAddEntityButton().should("exist").click();
    entityTypeModal.newEntityName("Patients");
    entityTypeModal.newEntityDescription("An entity for patients");
    entityTypeModal.getAddButton().click();
    propertyTable.getAddPropertyButton("Patients").should("be.visible").click();
    propertyModal.newPropertyName("patientID");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("More number types").click();
    propertyModal.getCascadedTypeFromDropdown("byte").click();
    propertyModal.getYesRadio("identifier").click();
    //propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();
    propertyTable.getIdentifierIcon("patientID").should("exist");
    //propertyTable.getWildcardIcon('patientID').should('exist');
    propertyTable.getAddPropertyButton("Patients").should("exist");
    propertyTable.getAddPropertyButton("Patients").click();
    propertyModal.newPropertyName("personType");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity").click();
    propertyModal.getCascadedTypeFromDropdown("Person").click();
    propertyModal.openForeignKeyDropdown();
    propertyModal.getForeignKey("id").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getProperty("personType").should("exist");

    //Add second property to Patients Entity and delete it
    propertyTable.getAddPropertyButton("Patients").click();
    propertyModal.newPropertyName("patientId");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("More number types").click();
    propertyModal.getCascadedTypeFromDropdown("byte").click();
    propertyModal.getSubmitButton().click();
    propertyTable.editProperty("patientId");
    propertyModal.getDeleteIcon("patientId").click();
    confirmationModal.getDeletePropertyWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn);
    propertyTable.getProperty("patientId").should("not.exist");

    //Add third property to Patients Entity, publish the changes
    propertyTable.getAddPropertyButton("Patients").click();
    propertyModal.newPropertyName("health");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("More number types").click();
    propertyModal.getCascadedTypeFromDropdown("negativeInteger").click();
    propertyModal.clickCheckbox("facetable");
    propertyModal.clickCheckbox("sortable");
    propertyModal.getSubmitButton().click();
    propertyTable.getProperty("health").should("exist");
    propertyTable.getFacetIcon("health").should("exist");
    propertyTable.getSortIcon("health").should("exist");
    //Save Changes
    cy.publishEntityModel();

    propertyTable.getProperty("patientId").should("not.exist");
    propertyTable.getProperty("health").should("exist");
    propertyTable.getFacetIcon("health").should("exist");
    propertyTable.getSortIcon("health").should("exist");
  });
  it("Delete an entity from graph view and publish the changes", {defaultCommandTimeout: 120000}, () => {
    entityTypeTable.viewEntityInGraphView("Patients");
    cy.waitForAsyncRequest();
    cy.wait(1500);

    graphViewSidePanel.getDeleteIcon("Patients").click();
    confirmationModal.getYesButton(ConfirmationType.DeleteEntity);
    confirmationModal.getDeleteEntityText().should("not.exist");
    cy.waitForAsyncRequest();
    graphViewSidePanel.getSelectedEntityHeading("Patients").should("not.exist");
    cy.wait(150);
    //Publish the changes
    cy.publishEntityModel();
  });

  it("Edit a relationship from graph view", {defaultCommandTimeout: 120000}, () => {
    modelPage.selectView("project-diagram");

    modelPage.scrollPageBottom();
    //Fetching the edge coordinates between two nodes and later performing some action on it like hover or click
    graphVis.getPositionOfEdgeBetween("Customer,BabyRegistry").then((edgePosition: any) => {
      cy.wait(1000);
      cy.waitUntil(() => graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y, {force: true}));
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
    cy.wait(2000);
    cy.waitForAsyncRequest();
    relationshipModal.getModalHeader().should("not.exist");
  });

  it("can enter graph edit mode and add edge relationships via single node click", {defaultCommandTimeout: 120000}, () => {
    modelPage.selectView("project-diagram");

    modelPage.scrollPageBottom();
    //reopen modal to verify previous updates
    graphVis.getPositionOfEdgeBetween("Customer,BabyRegistry").then((edgePosition: any) => {
      cy.wait(150);
      graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y, {force: true});
    });


    relationshipModal.verifyRelationshipValue("usedBy");
    relationshipModal.verifyForeignKeyValue("email");
    relationshipModal.verifyCardinality("oneToManyIcon").should("be.visible");

    //reset the values
    relationshipModal.editRelationshipName("ownedBy");
    relationshipModal.editForeignKey("customerId");
    relationshipModal.toggleCardinality();
    relationshipModal.confirmationOptions("Save");
    cy.wait(2000);
    cy.waitForAsyncRequest();
    relationshipModal.getModalHeader().should("not.exist");

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
    relationshipModal.verifyCardinality("oneToOneIcon").should("be.visible");

    //target entity node should be placeholder and user can set relationship options
    relationshipModal.verifyTargetEntity("Select target entity type*").should("be.visible");

    relationshipModal.targetEntityDropdown().click();
    //verify dropdown options can be searched
    relationshipModal.verifyEntityOption("Customer").should("be.visible");
    relationshipModal.verifyEntityOption("Order").should("be.visible");
    relationshipModal.verifyEntityOption("Client").should("be.visible");

    relationshipModal.searchEntityDropdown("ord");
    relationshipModal.verifyEntityOption("Customer").should("not.exist");
    relationshipModal.verifyEntityOption("Client").should("not.exist");
    relationshipModal.verifyEntityOption("Order").should("be.visible");
    relationshipModal.selectTargetEntityOption("Order");
    relationshipModal.toggleOptional();
    relationshipModal.verifyVisibleOptionalBlock();
    relationshipModal.verifyForeignKeyPlaceholder();
    relationshipModal.editRelationshipName("purchased");
    relationshipModal.toggleCardinality();

    relationshipModal.addRelationshipSubmit();
    cy.waitForAsyncRequest();
    relationshipModal.getModalHeader().should("not.exist");

    //verify relationship was created and properties are present
    modelPage.scrollPageTop();
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    entityTypeTable.getExpandEntityIcon("Person");
    propertyTable.editProperty("purchased");
    propertyModal.getYesRadio("multiple").should("be.checked");
    propertyModal.verifyPropertyType("Relationship: Order");
    propertyModal.verifyForeignKeyPlaceholder();
    propertyModal.getCancelButton();

    //verify helpful icon present on the property, should show relationship icon but no foreign key
    propertyTable.verifyRelationshipIcon("purchased").should("exist");
    propertyTable.verifyForeignKeyIcon("purchased").should("not.exist");
    // });

    // it("can edit graph edit mode and add edge relationships (with foreign key scenario) via drag/drop", () => {

    entityTypeTable.viewEntityInGraphView("Person");
    modelPage.closeSidePanel();
    cy.wait(2000);
    cy.waitForAsyncRequest();
    graphView.getAddButton().click();
    cy.waitUntil(() => graphView.addNewRelationship().should("be.visible"));
    graphView.addNewRelationship().click({force: true});
    cy.waitUntil(() => graphView.verifyEditInfoMessage().should("exist"));

    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let PersonCoordinates: any = nodePositions["Person"];
      let ClientCoordinates: any = nodePositions["Client"];
      graphVis.getGraphVisCanvas().trigger("pointerdown", PersonCoordinates.x, PersonCoordinates.y, {button: 0});
      graphVis.getGraphVisCanvas().trigger("pointermove", ClientCoordinates.x, ClientCoordinates.y, {button: 0});
      graphVis.getGraphVisCanvas().trigger("pointerup", ClientCoordinates.x, ClientCoordinates.y, {button: 0});
    });

    //relationship modal should open with proper source and target nodes in place
    relationshipModal.verifySourceEntity("Person").should("be.visible");
    relationshipModal.verifyTargetEntity("Client").should("be.visible");

    //add relationship properties and save
    relationshipModal.editRelationshipName("referredBy");

    //open Optional line to edit foreign key field
    relationshipModal.toggleOptional();
    relationshipModal.verifyVisibleOptionalBlock();
    relationshipModal.editForeignKey("firstname");
    relationshipModal.toggleCardinality();
    relationshipModal.addRelationshipSubmit();

    cy.waitForAsyncRequest();
    cy.wait(2000);
    graphView.getAddButton().click();
    cy.waitUntil(() => graphView.addNewRelationship().should("be.visible"));
    graphView.addNewRelationship().click({force: true});
    cy.waitUntil(() => graphView.verifyEditInfoMessage().should("exist"));

    //add second relationship
    graphView.getAddButton().click();
    graphView.addNewRelationship().click();
    graphView.verifyEditInfoMessage().should("exist");

    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let PersonCoordinates: any = nodePositions["Person"];
      let ClientCoordinates: any = nodePositions["Client"];
      cy.wait(150);
      graphVis.getGraphVisCanvas().trigger("pointerdown", PersonCoordinates.x, PersonCoordinates.y, {button: 0});
      graphVis.getGraphVisCanvas().trigger("pointermove", ClientCoordinates.x, ClientCoordinates.y, {button: 0});
      graphVis.getGraphVisCanvas().trigger("pointerup", ClientCoordinates.x, ClientCoordinates.y, {button: 0});
    });

    //relationship modal should open with proper source and target nodes in place
    relationshipModal.verifySourceEntity("Person").should("be.visible");
    relationshipModal.verifyTargetEntity("Client").should("be.visible");

    //add relationship properties and save
    relationshipModal.editRelationshipName("recommendedByUserHavingVeryLongName");

    //open Optional line to edit foreign key field
    relationshipModal.toggleOptional();
    relationshipModal.verifyVisibleOptionalBlock();
    relationshipModal.editForeignKey("lastname");
    relationshipModal.toggleCardinality();
    relationshipModal.addRelationshipSubmit();
    cy.waitForAsyncRequest();
    relationshipModal.getModalHeader().should("not.exist");

    // TODO: this line causes failures, fix this assertion
    //Both the relationship names must be available
    // cy.contains("referredBy");
    // cy.contains("recommendedByUserHav...");

    //verify relationship was created and properties are present
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    propertyTable.editProperty("referredBy");
    propertyModal.getYesRadio("multiple").should("be.checked");
    propertyModal.verifyPropertyType("Relationship: Client");
    propertyModal.verifyForeignKey("firstname");
    propertyModal.getCancelButton();

    //verify helpful icon present on the property, should show BOTH relationship icon and foreign key
    propertyTable.verifyRelationshipIcon("referredBy").should("exist");
    propertyTable.verifyForeignKeyIcon("referredBy").should("exist");

    entityTypeTable.viewEntityInGraphView("Person");
  });

  it("relationships are not present in mapping until published", () => {
    toolbar.getCurateToolbarIcon().click();
    confirmationModal.getNavigationWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.NavigationWarn);
    cy.waitUntil(() => curatePage.getEntityTypePanel("Person").should("be.visible"));
    curatePage.toggleEntityTypeId("Person");
    curatePage.openStepDetails("mapPersonJSON");
    cy.waitUntil(() => curatePage.dataPresent().should("be.visible"));
    //unpublished relationship should not show up in mapping
    mappingStepDetail.getMapPropertyName("Person", "purchased").should("not.exist");
    mappingStepDetail.getMapPropertyName("Person", "referredBy").should("not.exist");

    //return to Model tile and publish
    toolbar.getModelToolbarIcon().click();
    cy.publishEntityModel();

    //verify relationship is visible in mapping
    toolbar.getCurateToolbarIcon().click();
    confirmationModal.getNavigationWarnText().should("not.exist");
    cy.waitUntil(() => curatePage.getEntityTypePanel("Person").should("be.visible"));
    curatePage.toggleEntityTypeId("Person");
    curatePage.openStepDetails("mapPersonJSON");
    cy.waitUntil(() => curatePage.dataPresent().should("be.visible"));

    //published relationship should show up in mapping
    mappingStepDetail.getMapPropertyName("Person", "purchased").should("exist");
    mappingStepDetail.getMapPropertyName("Person", "referredBy").should("exist");

    //both icons present in complete relationship
    propertyTable.verifyRelationshipIcon("referredBy").should("exist");
    propertyTable.verifyForeignKeyIcon("referredBy").should("exist");

    //only relationship icon present in incomplete relationship and XPATH field is disabled
    propertyTable.verifyRelationshipIcon("purchased").should("exist");
    propertyTable.verifyForeignKeyIcon("purchased").should("not.exist");

    mappingStepDetail.getXpathExpressionInput("purchased").should("not.exist");

  });


  it("Delete a relationship from graph view", {defaultCommandTimeout: 120000}, () => {
    toolbar.getModelToolbarIcon().click();
    modelPage.selectView("project-diagram");

    modelPage.scrollPageBottom();
    // To delete a relation
    cy.wait(1000);
    graphVis.getPositionOfEdgeBetween("Person,Order").then((edgePosition: any) => {
      graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y);
    });


    cy.wait(150);
    graphVis.getPositionOfEdgeBetween("Person,Order").then((edgePosition: any) => {
      graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y, {force: true});
    });

    cy.wait(1000);

    graphVis.getPositionOfEdgeBetween("Person,Order").then((edgePosition: any) => {
      graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y, {force: true});
    });


    confirmationModal.deleteRelationship();
    cy.waitUntil(() => cy.findByLabelText("confirm-deletePropertyStepWarn-yes").click());
    // To verify that property is not visible
    cy.wait(150);
    graphVis.getPositionsOfNodes("Person").then((nodePositions: any) => {
      let personCoordinates: any = nodePositions["Person"];
      cy.waitUntil(() => graphVis.getGraphVisCanvas().click(personCoordinates.x, personCoordinates.y));
    });
    graphViewSidePanel.getPropertyName("purchased").should("not.exist");
  });
});