/// <reference types="cypress"/>

import modelPage from "../../support/pages/model";
import {
  entityTypeModal,
  entityTypeTable,
  propertyModal,
  propertyTable,
  structuredTypeModal,
} from "../../support/components/model/index";
import {confirmationModal, toolbar} from "../../support/components/common/index";
import {Application} from "../../support/application.config";
import {ConfirmationType} from "../../support/types/modeling-types";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";
import graphVis from "../../support/components/model/graph-vis";

describe("Entity Modeling: Writer Role", () => {
  //Scenarios: can create entity, can create a structured type, duplicate structured type name check, add properties to structure type, add structure type as property, delete structured type, and delete entity, can add new properties to existing Entities, revert all entities, add multiple entities, add properties, delete properties, save all entities, delete an entity with relationship warning
  //login with valid account
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-mapping-writer", "hub-central-saved-query-user").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
    cy.setupHubCentralConfig();
    cy.waitForAsyncRequest();
  });
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-mapping-writer", "hub-central-saved-query-user").withRequest();
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
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click({force: true});
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
    propertyModal.verifyPropertyNameError();
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName("address");
    propertyModal.getSubmitButton().click();
    propertyTable.getMultipleIcon("address").should("exist");
  });
  it("Add basic property to structured type", () => {
    propertyTable.getAddPropertyToStructureType("Address").should("be.visible").click();
    propertyModal.getStructuredTypeName().should("have.text", "Address");
    propertyModal.clearPropertyName();
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
    cy.waitUntil(() => propertyTable.getExpandIcon("address").click());
    propertyTable.getMultipleIcon("zip").should("exist");
    propertyTable.getPiiIcon("zip").should("not.exist");
    //propertyTable.getWildcardIcon('zip').should('not.exist');
  });
  it("Add related property to structured type and test foreign key selection", () => {
    propertyTable.getAddPropertyToStructureType("Address").click();
    propertyModal.newPropertyName("OrderedBy");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity").click();
    propertyModal.getCascadedTypeFromDropdown("Customer").click();
    propertyModal.openForeignKeyDropdown();
    propertyModal.getForeignKey("nicknames").should("not.be.enabled");
    propertyModal.getForeignKey("customerId").click();
    propertyModal.getSubmitButton().click();
    cy.waitUntil(() => propertyTable.getExpandIcon("address").click());
    propertyTable.verifyRelationshipIcon("OrderedBy").should("exist");
    propertyTable.verifyForeignKeyIcon("OrderedBy").should("exist");

    //verify removing foreign key from relationship is possible
    propertyTable.editProperty("address-OrderedBy");
    cy.waitUntil(() => cy.findByLabelText("foreignKey-select").should("be.visible"));
    propertyModal.openForeignKeyDropdown();
    propertyModal.getForeignKey("None").click();
    propertyModal.getSubmitButton().click();
    propertyTable.verifyRelationshipIcon("OrderedBy").should("exist");
    //foreign key no longer exists
    propertyTable.verifyForeignKeyIcon("OrderedBy").should("not.exist");
  });
  it("Add properties to nested structured type", () => {
    propertyTable.getAddPropertyToStructureType("Zip").click();
    propertyModal.getStructuredTypeName().should("have.text", "Address.Zip");
    propertyModal.newPropertyName("fiveDigit");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("More number types").click();
    propertyModal.getCascadedTypeFromDropdown("int").click();
    propertyModal.getSubmitButton().click();
    cy.waitUntil(() => propertyTable.getExpandIcon("address").click());
    propertyTable.getMultipleIcon("code").should("not.exist");
    propertyTable.getPiiIcon("code").should("not.exist");
    //propertyTable.getWildcardIcon('code').should('not.exist');
  });
  it("Test for additional nesting of structured types", () => {
    cy.get(".mosaic-window > :nth-child(2)").scrollTo("bottom");
    propertyTable.getAddPropertyToStructureType("Zip").click({force: true});
    propertyModal.newPropertyName("extra");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Structured").click();
    propertyModal.getCascadedTypeFromDropdown("New Property Type").click();
    structuredTypeModal.newName("Extra");
    structuredTypeModal.getAddButton().click();
    propertyModal.getSubmitButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => propertyTable.getExpandIcon("address").click());
    cy.get(".mosaic-window > :nth-child(2)").scrollTo("bottom");
    cy.waitUntil(() => propertyTable.getExpandIcon("zip,02").click({force: true}));
    propertyTable.getAddPropertyToStructureType("Extra").scrollIntoView().click();
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
    cy.waitUntil(() => propertyTable.getExpandIcon("address").click());
    propertyTable.editProperty("address-street");
    propertyModal.getToggleStepsButton().should("not.exist");
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName("Zip");
    propertyModal.getSubmitButton().click();
    propertyModal.verifyPropertyNameError().should("be.visible");
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
    cy.waitUntil(() => propertyTable.getExpandIcon("address").click());
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
    propertyModal.openForeignKeyDropdown();
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
    propertyModal.openForeignKeyDropdown();
    propertyModal.getForeignKey("nicknames").should("not.be.enabled");
    propertyModal.getForeignKey("customerId").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getProperty("OrderedBy").should("exist");
  });
  it("Delete a property, a structured property and then the entity", {defaultCommandTimeout: 120000}, () => {
    //Structured Property
    //cy.get("[data-row-key*=\"address\"] [aria-label=\"Expand row\"]").click();
    /*propertyTable.getDeleteStructuredPropertyIcon("User3", "Address", "alt_address-streetAlt").click();
    confirmationModal.getDeletePropertyWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn);
    cy.waitForAsyncRequest();
    propertyTable.getProperty("streetAlt").should("not.exist");*/
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
    cy.publishEntityModel();
    // TODO These break since we do not delete entity until publishing now. To fix with UI changes.
    // confirmationModal.getDeleteEntityText().should("exist");
    // confirmationModal.getDeleteEntityText().should("not.exist");
    // entityTypeTable.getEntity("User3").should("not.exist");

    // "Delete entity", {defaultCommandTimeout: 120000}, () => {
    modelPage.selectView("table");
    entityTypeTable.getDeleteEntityIcon("User3").click();
    confirmationModal.getDeleteEntityText().should("be.visible");
    confirmationModal.getYesButton(ConfirmationType.DeleteEntity);
    cy.waitForAsyncRequest();
    // TODO These break since we do not delete entity until publishing now. To fix with UI changes.
    // confirmationModal.getDeleteEntityText().should("exist");
    // confirmationModal.getDeleteEntityText().should("not.exist");
    // entityTypeTable.getEntity("User3").should("not.exist");

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

    // "Create Concept entity and add a property"
    modelPage.getAddEntityButton().should("exist").click();
    entityTypeModal.newEntityName("Concept");
    entityTypeModal.newEntityDescription("A concept entity");
    entityTypeModal.getAddButton().click();
    propertyTable.getAddPropertyButton("Concept").click();
    propertyModal.newPropertyName("order");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity").click();
    propertyModal.getCascadedTypeFromDropdown("Order").click();
    propertyModal.openForeignKeyDropdown();
    propertyModal.getForeignKey("orderId").click();
    propertyModal.getYesRadio("multiple").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getMultipleIcon("order").should("exist");

    // "Add another property to Concept Entity and delete it"
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
});