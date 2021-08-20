/// <reference types="cypress"/>

import modelPage from "../../support/pages/model";
import {
  entityTypeModal,
  entityTypeTable,
  graphViewSidePanel,
  propertyModal,
  propertyTable,
  structuredTypeModal,
  graphView,
  relationshipModal
} from "../../support/components/model/index";
import {confirmationModal, tiles, toolbar} from "../../support/components/common/index";
import {Application} from "../../support/application.config";
import {ConfirmationType} from "../../support/types/modeling-types";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";
import graphVis from "../../support/components/model/graph-vis";
import browsePage from "../../support/pages/browse";

describe("Entity Modeling: Writer Role", () => {
  //Scenarios: can create entity, can create a structured type, duplicate structured type name check, add properties to structure type, add structure type as property, delete structured type, and delete entity, can add new properties to existing Entities, revert all entities, add multiple entities, add properties, delete properties, save all entities, delete an entity with relationship warning
  //login with valid account
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
    cy.setupHubCentralConfig();
    cy.waitForAsyncRequest();
  });
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
    cy.waitForAsyncRequest();
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Create an entity with property that already exists", {defaultCommandTimeout: 120000}, () => {
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    cy.waitUntil(() => modelPage.getAddEntityButton()).click();
    entityTypeModal.newEntityName("User3");
    entityTypeModal.newEntityDescription("An entity for User");
    entityTypeModal.getAddButton().click();
    propertyTable.getAddPropertyButton("User3").click();
    propertyModal.newPropertyName("Address");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Structured").click();
    propertyModal.getCascadedTypeFromDropdown("New Property Type").click();
    structuredTypeModal.newName("Address");
    structuredTypeModal.getAddButton().click();
    propertyModal.getYesRadio("multiple").click();
    propertyModal.getSubmitButton().click();
    propertyModal.verifyPropertyNameError("A property or structured type are already using the name Address. A property cannot use the same name as an existing property or structured type.");
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName("address");
    propertyModal.getSubmitButton().click();
    propertyTable.getMultipleIcon("address").should("exist");
  });
  it("Add basic property to structured type", () => {
    propertyTable.getAddPropertyToStructureType("Address").should("be.visible").click();
    propertyModal.getStructuredTypeName().should("have.text", "Address");
    propertyModal.newPropertyName("street");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("More date types").click();
    propertyModal.getCascadedTypeFromDropdown("gDay").click();
    propertyModal.getNoRadio("multiple").click();
    propertyModal.getYesRadio("pii").click();
    //propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();
    propertyTable.getMultipleIcon("street").should("not.exist");
    propertyTable.getPiiIcon("street").should("exist");
    //propertyTable.getWildcardIcon('street').should('exist');
  });
  it("Add structured property to structured type", () => {
    propertyTable.getAddPropertyToStructureType("Address").click();
    propertyModal.newPropertyName("zip");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Structured").click();
    propertyModal.getCascadedTypeFromDropdown("New Property Type").click();
    structuredTypeModal.newName("street");
    structuredTypeModal.getAddButton().click();
    propertyModal.verifySameNamePropertyError("A property is already using the name street. A structured type cannot use the same name as an existing property.");
    structuredTypeModal.clearName();
    structuredTypeModal.newName("Zip");
    structuredTypeModal.getAddButton().click();
    propertyModal.getYesRadio("multiple").click();
    propertyModal.getNoRadio("pii").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getMultipleIcon("zip").should("exist");
    propertyTable.getPiiIcon("zip").should("not.exist");
    //propertyTable.getWildcardIcon('zip').should('not.exist');
  });
  it("Add related property to structured type", () => {
    propertyTable.getAddPropertyToStructureType("Address").click();
    propertyModal.newPropertyName("OrderedBy");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity").click();
    propertyModal.getCascadedTypeFromDropdown("Customer").click();
    propertyModal.toggleForeignKeyDropdown();
    propertyModal.getForeignKey("nicknames").should("not.be.enabled");
    propertyModal.getForeignKey("customerId").click();
    propertyModal.getSubmitButton().click();
  });
  it("Add properties to nested structured type", () => {
    propertyTable.getAddPropertyToStructureType("Zip").click();
    propertyModal.getStructuredTypeName().should("have.text", "Address.Zip");
    propertyModal.newPropertyName("fiveDigit");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("More number types").click();
    propertyModal.getCascadedTypeFromDropdown("int").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getMultipleIcon("code").should("not.exist");
    propertyTable.getPiiIcon("code").should("not.exist");
    //propertyTable.getWildcardIcon('code').should('not.exist');
  });
  it("Test for additional nesting of structured types", () => {
    propertyTable.getAddPropertyToStructureType("Zip").click();
    propertyModal.newPropertyName("extra");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Structured").click();
    propertyModal.getCascadedTypeFromDropdown("New Property Type").click();
    structuredTypeModal.newName("Extra");
    structuredTypeModal.getAddButton().click();
    propertyModal.getSubmitButton().click();
    propertyTable.getAddPropertyToStructureType("Extra").click();
    propertyModal.newPropertyName("fourDigit");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("integer").click();
    propertyModal.getYesRadio("pii").click();
    //propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();

    //TODO: Re-test child expansion without using ml-table selector

    // propertyTable.expandExtraStructuredTypeIcon().click();
    // propertyTable.getMultipleIcon("fourDigit").should("not.exist");
    // propertyTable.getPiiIcon("fourDigit").should("exist");
    //propertyTable.getWildcardIcon('fourDigit').should('exist');
  });
  it("Edit Property Structured Property", () => {
    propertyTable.editProperty("address-street");
    propertyModal.getToggleStepsButton().should("not.exist");
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName("Zip");
    propertyModal.getSubmitButton().click();
    propertyModal.verifyPropertyNameError("A property or structured type are already using the name Zip. A property cannot use the same name as an existing property or structured type.").should("be.visible");
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName("streetAlt");
    propertyModal.clearPropertyDropdown();
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("More number types").click();
    propertyModal.getCascadedTypeFromDropdown("unsignedByte").click();
    propertyModal.getYesRadio("idenifier").should("not.exist");
    propertyModal.getYesRadio("multiple").click();
    propertyModal.getNoRadio("pii").click();
    //propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();
    propertyTable.getMultipleIcon("streetAlt").should("exist");
    propertyTable.getPiiIcon("streetAlt").should("not.exist");
    //propertyTable.getWildcardIcon('streetAlt').should('exist');
  });
  it("Rename property and change type from structured to relationship", () => {
    propertyTable.editProperty("address-address");
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName("alt_address");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity").click();
    propertyModal.getCascadedTypeFromDropdown("Person").click();
    propertyModal.toggleForeignKeyDropdown();
    propertyModal.getForeignKey("Address").click();
    propertyModal.getYesRadio("multiple").click();
    propertyModal.getYesRadio("idenifier").should("not.exist");
    propertyModal.getYesRadio("pii").should("not.exist");
    //propertyModal.getCheckbox('wildcard').should('not.exist');
    propertyModal.getSubmitButton().click();
    propertyTable.getMultipleIcon("alt_address").should("exist");
    propertyTable.getIdentifierIcon("alt_address").should("not.exist");
    propertyTable.getPiiIcon("alt_address").should("not.exist");
  });
  it("Change relationship property to structured", () => {
    propertyTable.editProperty("alt_address");
    propertyModal.getToggleStepsButton().should("not.exist");
    propertyModal.clearPropertyDropdown();
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Structured").click();
    propertyModal.getCascadedTypeFromDropdown("Address").click();
    propertyModal.getSubmitButton().click();
    // TODO DHFPROD-7711 skip since fails for Ant Design Table component
    //propertyTable.expandStructuredTypeIcon("alt_address").click();
    //propertyTable.getProperty("alt_address-streetAlt").should("exist");
  });
  it("Add foreign key with type as Related Entity", () => {
    propertyTable.getAddPropertyButton("User3").click();
    propertyModal.newPropertyName("OrderedBy");
    propertyModal.getForeignKeyDropdown().should("not.exist");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity").click();
    propertyModal.getCascadedTypeFromDropdown("Customer").click();
    propertyModal.toggleForeignKeyDropdown();
    propertyModal.getForeignKey("nicknames").should("not.be.enabled");
    propertyModal.getForeignKey("customerId").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getProperty("OrderedBy").should("exist");
  });
  it("Delete a property, a structured property and then the entity", {defaultCommandTimeout: 120000}, () => {
    //Structured Property
    propertyTable.getDeleteStructuredPropertyIcon("User3", "Address", "alt_address-streetAlt").click();
    confirmationModal.getDeletePropertyWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn);
    cy.waitForAsyncRequest();
    propertyTable.getProperty("streetAlt").should("not.exist");
    //Property
    propertyTable.getDeletePropertyIcon("User3", "alt_address");
    confirmationModal.getDeletePropertyWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn);
    cy.waitForAsyncRequest();
    propertyTable.getProperty("alt_address").should("not.exist");
    propertyTable.getDeletePropertyIcon("User3", "OrderedBy");
    confirmationModal.getDeletePropertyWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn);
    cy.waitForAsyncRequest();
    propertyTable.getProperty("OrderedBy").should("not.exist");
    entityTypeTable.viewEntityInGraphView("User3");
    //To verify tooltip over particular node
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let customerCoordinates: any = nodePositions["User3"];
      graphVis.getGraphVisCanvas().click(customerCoordinates.x, customerCoordinates.y);
      cy.findByText("An entity for User").should("exist");
    });
    //Save Changes
    // TODO Make shortcut for publishing current model
    modelPage.getPublishButton().click();
    confirmationModal.getYesButton(ConfirmationType.PublishAll);
    cy.waitForAsyncRequest();
    confirmationModal.getSaveAllEntityText().should("exist");
    confirmationModal.getSaveAllEntityText().should("not.exist");
    // TODO These break since we do not delete entity until publishing now. To fix with UI changes.
    // confirmationModal.getDeleteEntityText().should("exist");
    // confirmationModal.getDeleteEntityText().should("not.exist");
    // entityTypeTable.getEntity("User3").should("not.exist");
  });
  it("Delete entity", {defaultCommandTimeout: 120000}, () => {
    modelPage.selectView("table");
    entityTypeTable.getDeleteEntityIcon("User3").click();
    confirmationModal.getDeleteEntityText().should("be.visible");
    confirmationModal.getYesButton(ConfirmationType.DeleteEntity);
    cy.waitForAsyncRequest();
    // TODO These break since we do not delete entity until publishing now. To fix with UI changes.
    // confirmationModal.getDeleteEntityText().should("exist");
    // confirmationModal.getDeleteEntityText().should("not.exist");
    // entityTypeTable.getEntity("User3").should("not.exist");
  });
  // it("Adding property to Order entity", () => {
  //   entityTypeTable.getExpandEntityIcon("Order");
  //   propertyTable.getAddPropertyButton("Order").click();
  //   propertyModal.newPropertyName("orderID");
  //   propertyModal.openPropertyDropdown();
  //   propertyModal.getTypeFromDropdown("string").click();
  //   propertyModal.getNoRadio("identifier").click();
  //   propertyModal.getYesRadio("multiple").click();
  //   propertyModal.getYesRadio("pii").click();
  //   //propertyModal.clickCheckbox('wildcard');
  //   propertyModal.getSubmitButton().click();
  //   propertyTable.getMultipleIcon("orderID").should("exist");
  //   propertyTable.getPiiIcon("orderID").should("exist");
  //   //propertyTable.getWildcardIcon('orderID').should('exist');
  //   modelPage.getEntityModifiedAlert().should("exist");
  // });
  // it("Adding property to Person entity", () => {
  //   entityTypeTable.getExpandEntityIcon("Person");
  //   propertyTable.getAddPropertyButton("Person").click();
  //   propertyModal.newPropertyName("personID");
  //   propertyModal.openPropertyDropdown();
  //   propertyModal.getTypeFromDropdown("string").click();
  //   propertyModal.getNoRadio("identifier").click();
  //   propertyModal.getYesRadio("multiple").click();
  //   propertyModal.getYesRadio("pii").click();
  //   //propertyModal.clickCheckbox('wildcard');
  //   propertyModal.getSubmitButton().click();
  //   propertyTable.getMultipleIcon("personID").should("exist");
  //   propertyTable.getPiiIcon("personID").should("exist");
  //   //propertyTable.getWildcardIcon('personID').should('exist');
  // });
  it("Create Concept entity and add a property", {defaultCommandTimeout: 120000}, () => {
    modelPage.getAddEntityButton().should("exist").click();
    entityTypeModal.newEntityName("Concept");
    entityTypeModal.newEntityDescription("A concept entity");
    entityTypeModal.getAddButton().click();
    propertyTable.getAddPropertyButton("Concept").click();
    propertyModal.newPropertyName("order");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity").click();
    propertyModal.getCascadedTypeFromDropdown("Order").click();
    propertyModal.toggleForeignKeyDropdown();
    propertyModal.getForeignKey("orderId").click();
    propertyModal.getYesRadio("multiple").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getMultipleIcon("order").should("exist");
  });
  it("Add another property to Concept Entity and delete it", () => {
    propertyTable.getAddPropertyButton("Concept").click();
    propertyModal.newPropertyName("testing");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("More date types").click();
    propertyModal.getCascadedTypeFromDropdown("yearMonthDuration").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getDeletePropertyIcon("Concept", "testing");
    confirmationModal.getDeletePropertyWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn);
    propertyTable.getProperty("testing").should("not.exist");
    modelPage.getEntityModifiedAlert().should("exist");
  });
  it("Create another entity Patients and add a property", {defaultCommandTimeout: 120000}, () => {
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
    propertyModal.toggleForeignKeyDropdown();
    propertyModal.getForeignKey("id").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getProperty("personType").should("exist");
  });
  it("Add second property to Patients Entity and delete it", () => {
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
  });
  it("Add third property to Patients Entity, publish the changes", {defaultCommandTimeout: 120000}, () => {
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
    modelPage.getPublishButton().click();
    confirmationModal.getYesButton(ConfirmationType.PublishAll);
    cy.waitForAsyncRequest();
    confirmationModal.getSaveAllEntityText().should("exist");
    confirmationModal.getSaveAllEntityText().should("not.exist");
    modelPage.getEntityModifiedAlert().should("not.exist");
    propertyTable.getProperty("patientId").should("not.exist");
    propertyTable.getProperty("health").should("exist");
    propertyTable.getFacetIcon("health").should("exist");
    propertyTable.getSortIcon("health").should("exist");
  });
  it("Delete Concept Entity", {defaultCommandTimeout: 120000}, () => {
    entityTypeTable.getDeleteEntityIcon("Concept").click();
    confirmationModal.getYesButton(ConfirmationType.DeleteEntity);
    confirmationModal.getDeleteEntityRelationshipText().should("not.exist");
    cy.waitForAsyncRequest();
    entityTypeTable.getEntity("Concept").should("not.exist");
  });
  it("Delete an entity from graph view and publish the changes", {defaultCommandTimeout: 120000}, () => {
    entityTypeTable.viewEntityInGraphView("Patients");
    cy.waitForAsyncRequest();

    graphViewSidePanel.getDeleteIcon("Patients").click();
    confirmationModal.getYesButton(ConfirmationType.DeleteEntity);
    confirmationModal.getDeleteEntityText().should("not.exist");
    cy.waitForAsyncRequest();
    graphViewSidePanel.getSelectedEntityHeading("Patients").should("not.exist");
    //Publish the changes
    modelPage.getPublishButton().click();
    confirmationModal.getYesButton(ConfirmationType.PublishAll);
    cy.waitForAsyncRequest();
    confirmationModal.getSaveAllEntityText().should("exist");
    confirmationModal.getSaveAllEntityText().should("not.exist");
    modelPage.getEntityModifiedAlert().should("not.exist");
  });

  it("Edit a relationship from graph view", {defaultCommandTimeout: 120000}, () => {
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
    cy.wait(2000);
    cy.waitForAsyncRequest();
    relationshipModal.getModalHeader().should("not.exist");
  });
  it("Reopen modal to verify changes were saved and persisted", {defaultCommandTimeout: 120000}, () => {
    graphVis.getPositionOfEdgeBetween("Customer,BabyRegistry").then((edgePosition: any) => {
      graphVis.getGraphVisCanvas().dblclick(edgePosition.x, edgePosition.y, {force: true});
    });

    relationshipModal.verifyRelationshipValue("usedBy");
    relationshipModal.verifyForeignKeyValue("email");
    relationshipModal.verifyCardinality("oneToManyIcon").should("be.visible");

    relationshipModal.cancelModal();
  });
  it("can enter graph edit mode and add edge relationships (no foreign key scenario) via single node click", () => {

    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    cy.waitForAsyncRequest();

    graphView.getAddButton().click();
    graphView.addNewRelationship().click();
    graphView.verifyEditInfoMessage().should("be.visible");

    //verify create relationship via clicking a node in edit mode
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let personCoordinates: any = nodePositions["Person"];
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
    relationshipModal.verifyForeignKeyPlaceholder();
    relationshipModal.editRelationshipName("purchased");
    relationshipModal.toggleCardinality();

    relationshipModal.addRelationshipSubmit();
    relationshipModal.getModalHeader().should("not.exist");

    //verify relationship was created and properties are present
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    entityTypeTable.getExpandEntityIcon("Person");
    propertyTable.editProperty("purchased");
    propertyModal.getYesRadio("multiple").should("be.checked");
    propertyModal.verifyPropertyType("Order");
    propertyModal.verifyForeignKeyPlaceholder();
    propertyModal.getCancelButton();

    //verify helpful icon present on the property, should show relationship icon but no foreign key
    propertyTable.verifyRelationshipIcon("purchased").should("exist");
    propertyTable.verifyForeignKeyIcon("purchased").should("not.exist");
  });

  it("can edit graph edit mode and add edge relationships (with foreign key scenario) via drag/drop", () => {

    entityTypeTable.viewEntityInGraphView("Person");

    //add first relationship
    graphView.getAddButton().click();
    graphView.addNewRelationship().click();
    graphView.verifyEditInfoMessage().should("be.visible");

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
    relationshipModal.editForeignKey("firstname");
    relationshipModal.toggleCardinality();
    relationshipModal.addRelationshipSubmit();
    cy.waitForAsyncRequest();
    relationshipModal.getModalHeader().should("not.exist");

    //add second relationship
    graphView.getAddButton().click();
    graphView.addNewRelationship().click();
    graphView.verifyEditInfoMessage().should("be.visible");

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
    relationshipModal.editRelationshipName("recommendedBy");

    //open Optional line to edit foreign key field
    relationshipModal.toggleOptional();
    relationshipModal.editForeignKey("lastname");
    relationshipModal.toggleCardinality();
    relationshipModal.addRelationshipSubmit();
    cy.waitForAsyncRequest();
    relationshipModal.getModalHeader().should("not.exist");

    //Both the relationship names must be available
    cy.contains("referredBy");
    cy.contains("recommendedBy");

    //verify relationship was created and properties are present
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    propertyTable.editProperty("referredBy");
    propertyModal.getYesRadio("multiple").should("be.checked");
    propertyModal.verifyPropertyType("Client");
    propertyModal.verifyForeignKey("firstname");
    propertyModal.getCancelButton();

    //verify helpful icon present on the property, should show BOTH relationship icon and foreign key
    propertyTable.verifyRelationshipIcon("referredBy").should("exist");
    propertyTable.verifyForeignKeyIcon("referredBy").should("exist");

    entityTypeTable.viewEntityInGraphView("Person");
    //re-enter graph edit mode, verify can exit with {esc}
    graphView.getAddButton().click();
    graphView.addNewRelationship().click();
    graphView.verifyEditInfoMessage().should("be.visible");
    graphVis.getGraphVisCanvas().type("{esc}");
    graphView.verifyEditInfoMessage().should("not.exist");
  });

  it("Delete relationships from graph view", {defaultCommandTimeout: 120000}, () => {
    // To delete a relation
    graphVis.getPositionOfEdgeBetween("Person,Client").then((edgePosition: any) => {
      cy.waitUntil(() => graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y));
    });
    confirmationModal.deleteRelationship();
    cy.waitUntil(() => cy.findByLabelText("confirm-deletePropertyStepWarn-yes").click());
    // To verify that property is not visible
    graphVis.getPositionsOfNodes("Person").then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions["Person"];
      cy.waitUntil(() => graphVis.getGraphVisCanvas().click(orderCoordinates.x, orderCoordinates.y));
    });
    graphViewSidePanel.getPropertyName("referredBy").should("not.exist");

    // To delete another relation
    graphVis.getPositionOfEdgeBetween("Person,Client").then((edgePosition: any) => {
      cy.waitUntil(() => graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y));
    });
    confirmationModal.deleteRelationship();
    cy.waitUntil(() => cy.findByLabelText("confirm-deletePropertyStepWarn-yes").click());
    // To verify that property is not visible
    graphVis.getPositionsOfNodes("Person").then((nodePositions: any) => {
      let personCoordinates: any = nodePositions["Person"];
      cy.waitUntil(() => graphVis.getGraphVisCanvas().click(personCoordinates.x, personCoordinates.y));
    });
    graphViewSidePanel.getPropertyName("recommendedBy").should("not.exist");
  });

  it("Verify the navigation warning on moving away to other tiles, when unpublished changes are available", {defaultCommandTimeout: 120000}, () => {
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    modelPage.getEntityModifiedAlert().should("exist");
    modelPage.selectView("table");

    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    confirmationModal.getNavigationWarnText().should("be.visible");
    confirmationModal.getYesButton(ConfirmationType.NavigationWarn);
    cy.waitUntil(() => browsePage.getExploreButton()).should("be.visible");

    //Come back to Model tile
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    tiles.getModelTile().should("exist");
  });
});
