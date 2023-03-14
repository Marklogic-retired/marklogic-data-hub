/// <reference types="cypress"/>

import modelPage from "../../support/pages/model";
import {
  entityTypeModal,
  entityTypeTable,
  propertyModal,
  graphViewSidePanel,
  propertyTable,
} from "../../support/components/model/index";
import {confirmationModal, toolbar, tiles} from "../../support/components/common/index";
import {Application} from "../../support/application.config";
import {ConfirmationType} from "../../support/types/modeling-types";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";

describe("Entity Modeling Senario 1: Writer Role", () => {
  //Scenarios: create, edit, and save a new entity, edit entity description, duplicate entity name check, identifier modal check, can save an entity while another entity is edited, can navigate and see persisted edits, can see navigation warning when logging out with edits, can add new properties to existing Entity, can revert an entity twice, and delete shows step warning
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
    cy.deleteEntities("Buyer");
    cy.resetTestUser();
  });
  it("Create a new entity", {defaultCommandTimeout: 120000}, () => {
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    cy.waitUntil(() => modelPage.getAddButton()).click();
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});
    entityTypeModal.newEntityName("Person");
    entityTypeModal.getAddButton().click();
    cy.waitUntil(() => entityTypeModal.entityNameError().should("exist"));
    entityTypeModal.getAddButton().should("not.be.disabled");
    entityTypeModal.clearEntityName();
    entityTypeModal.newEntityName("Buyer");
    entityTypeModal.newEntityDescription("An entity for buyers");
    // commenting out for entity version rollback DHFPROD-9943
    // entityTypeModal.newEntityVersion("3.0.0");
    modelPage.openIconSelector("Buyer");
    modelPage.selectIcon("Buyer", "FaAccessibleIcon");
    modelPage.toggleColorSelector("Buyer");
    modelPage.selectColorFromPicker("#D5D3DD").click();
    modelPage.toggleColorSelector("Buyer");
    if (Cypress.isBrowser("!firefox")) {
      graphViewSidePanel.getEntityTypeColor("Buyer").should("have.css", "background", "rgb(213, 211, 221) none repeat scroll 0% 0% / auto padding-box border-box");
    }
    if (Cypress.isBrowser("firefox")) {
      graphViewSidePanel.getEntityTypeColor("Buyer").should("have.css", "background-color", "rgb(213, 211, 221)");
    }

    modelPage.getIconSelected("Buyer", "FaAccessibleIcon").should("exist");
    entityTypeModal.getAddButton().click();
    propertyTable.getAddPropertyButton("Buyer").should("be.visible").click();

    //verify color and icon is reflected in the table
    modelPage.getColorSelected("Buyer", "#d5d3dd").should("exist");
    modelPage.getIconSelected("Buyer", "FaAccessibleIcon").should("exist");
  });
  it("Add a Multiple Value property", () => {
    propertyModal.newPropertyName("user");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity");
    propertyModal.getCascadedTypeFromDropdown("Person");
    propertyModal.openForeignKeyDropdown();
    propertyModal.getForeignKey("id").click();
    propertyModal.getYesRadio("multiple").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getMultipleIcon("user").should("exist");
  });
  it("Add a property related to Person but no foreign key", () => {
    propertyTable.getAddPropertyButton("Buyer").should("be.visible").click();
    propertyModal.newPropertyName("personNoKey");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity");
    propertyModal.getCascadedTypeFromDropdown("Person");
    propertyModal.getSubmitButton().click();
    propertyTable.verifyRelationshipIcon("personNoKey").should("exist");
  });
  it("edit entity description then edit property name with Related Entity type", () => {
    entityTypeTable.getEntity("Buyer").click();
    entityTypeModal.clearEntityDescription();
    entityTypeModal.newEntityDescription("Description has changed");
    // commenting out for entity version rollback DHFPROD-9943
    // entityTypeModal.newEntityVersion("3.0.1");
    entityTypeModal.getAddButton().click();
    entityTypeModal.getAddButton().should("not.exist");
    propertyTable.editProperty("user");
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName("username");
    propertyModal.getSubmitButton().click();
    propertyTable.getProperty("user").should("not.exist");
    propertyTable.getProperty("username").should("exist");
    propertyTable.getMultipleIcon("username").should("exist");
    // check edited entity description
    entityTypeTable.getEntity("Buyer").click();
    entityTypeModal.getEntityDescription().should("have.value", "Description has changed");
    // commenting out for entity version rollback DHFPROD-9943
    // entityTypeModal.getEntityVersion().should("have.value", "3.0.1");
    entityTypeModal.getCancelButton().click();
  });
  it("Add cascaded type with identifier", () => {
    propertyTable.getAddPropertyButton("Buyer").click();
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName("newId");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("More string types");
    propertyModal.getCascadedTypeFromDropdown("iri");
    propertyModal.getYesRadio("identifier").click();
    propertyModal.getYesRadio("multiple").click();
    propertyModal.getNoRadio("pii").click();
    //propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();
    propertyTable.getIdentifierIcon("newId").should("exist");
    propertyTable.getMultipleIcon("newId").should("exist");
    //propertyTable.getWildcardIcon('newId').should('exist');
  });
  it("Add basic type with identifier, show confirmation modal", () => {
    propertyTable.getAddPropertyButton("Buyer").click();
    propertyModal.newPropertyName("buyer-id");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string");
    propertyModal.getYesRadio("identifier").click();
    confirmationModal.getIdentifierText().should("be.visible");
    confirmationModal.getYesButton(ConfirmationType.Identifer);
    propertyModal.getSubmitButton().click();
    propertyTable.getIdentifierIcon("newId").should("not.exist");
    propertyTable.getIdentifierIcon("buyer-id").should("exist");
  });
  it("Edit property and change type to relationship", () => {
    propertyTable.editProperty("buyer-id");
    //check default value for properties PII and multiple
    propertyModal.getNoRadio("pii").should("be.checked");
    propertyModal.getNoRadio("multiple").should("be.checked");
    propertyModal.getToggleStepsButton().should("not.exist");
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName("user-id");
    propertyModal.clearPropertyDropdown();
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity");
    propertyModal.getCascadedTypeFromDropdown("Customer");
    propertyModal.openForeignKeyDropdown();
    propertyModal.getForeignKey("customerId").click();
    propertyModal.getYesRadio("idenifier").should("not.exist");
    propertyModal.getYesRadio("multiple").click();
    propertyModal.getNoRadio("pii").should("not.exist");
    propertyModal.getSubmitButton().click();
    propertyTable.getMultipleIcon("user-id").should("exist");
    propertyTable.getIdentifierIcon("user-id").should("not.exist");
    propertyTable.getPiiIcon("user-id").should("not.exist");
    //propertyTable.getWildcardIcon('user-id').should('not.exist');
  });
  it("edit property name with Related Entity type", () => {
    propertyTable.editProperty("user-id");
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName("buyer-id");
    propertyModal.getSubmitButton().click();
    cy.wait(1000);
    propertyTable.getProperty("buyer-id").should("exist");
    propertyTable.getMultipleIcon("buyer-id").should("exist");
    // check edited entity version description
    entityTypeTable.getEntity("Buyer").scrollIntoView().click();
    // commenting out for entity version rollback DHFPROD-9943
    // entityTypeModal.getEntityVersion().should("have.value", "3.0.1");
    entityTypeModal.getEntityDescription().should("have.value", "Description has changed");
    entityTypeModal.getCancelButton().click();
  });
  it("Edit property name and delete the property", () => {
    propertyTable.editProperty("newId");
    propertyModal.getDeleteIcon("newId").click();
    confirmationModal.getDeletePropertyWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn);
    propertyTable.getProperty("newId").should("not.exist");
  });
  it("Edit a different entity", () => {
    entityTypeTable.getExpandEntityIcon("Customer");
    propertyTable.editProperty("nicknames");
    propertyModal.clickCheckbox("facetable");
    propertyModal.clickCheckbox("sortable");
    propertyModal.getSubmitButton().click();
    propertyTable.getFacetIcon("nicknames").should("exist");
    propertyTable.getSortIcon("nicknames").should("exist");
    modelPage.getEntityModifiedAlert().should("exist");
  });
  it("Save new and updated entities", {defaultCommandTimeout: 120000}, () => {
    cy.publishDataModel();
    modelPage.getEntityModifiedAlert().should("not.exist");
  });
  it("Validate the entity in explore page", () => {
    toolbar.getExploreToolbarIcon().click();
    cy.waitUntil(() => tiles.getExploreTile());
    cy.url().should("include", "/tiles/explore");
    toolbar.getModelToolbarIcon().click();
    tiles.getModelTile().should("exist");
    modelPage.selectView("table");
    entityTypeTable.getExpandEntityIcon("Customer");
    propertyTable.getFacetIcon("nicknames").should("exist");
    propertyTable.getSortIcon("nicknames").should("exist");
    cy.get("#user-dropdown").click();
    cy.waitUntil(() => cy.get("#logOut").should("be.visible")).click();
    cy.location("pathname").should("eq", "/");
  });
  it("Add new property to Order entity", () => {
    cy.log("**Re-login**");
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
    LoginPage.postLogin();
    //Setup hubCentral config for testing
    cy.setupHubCentralConfig();

    toolbar.getModelToolbarIcon().click();
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    entityTypeTable.getExpandEntityIcon("Order");
    propertyTable.getAddPropertyButton("Order").click();
    propertyModal.newPropertyName("orderID");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string");
    propertyModal.getNoRadio("identifier").click();
    propertyModal.getYesRadio("pii").click();
    //propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();
    modelPage.getEntityModifiedAlert().should("exist");
    propertyTable.getPiiIcon("orderID").should("exist");
    //propertyTable.getWildcardIcon('orderID').should('exist');
  });
  it("Add related property to Buyer, check Join Property menu, cancel the addition", () => {
    cy.log("**Re-login**");
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
    LoginPage.postLogin();
    //Setup hubCentral config for testing
    cy.setupHubCentralConfig();

    toolbar.getModelToolbarIcon().click();
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    entityTypeTable.getExpandEntityIcon("Buyer");
    propertyTable.getAddPropertyButton("Buyer").click();
    propertyModal.newPropertyName("relProp");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity");
    propertyModal.getCascadedTypeFromDropdown("Order");
    propertyModal.openForeignKeyDropdown();
    propertyModal.checkForeignKeyDropdownLength(7); // Check for -None- (1), saved (5), unsaved (1) Order properties
    propertyModal.openForeignKeyDropdown();
    propertyModal.getCancelButton();
  });

  it("Adding property to Person entity", () => {
    entityTypeTable.getExpandEntityIcon("Person");
    propertyTable.getAddPropertyButton("Person").click();
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName("newID");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string");
    propertyModal.getNoRadio("identifier").click();
    propertyModal.getYesRadio("multiple").click();
    propertyModal.getYesRadio("pii").click();
    //propertyModal.clickCheckbox('wildcard');
    propertyModal.clickCheckbox("facetable");
    propertyModal.clickCheckbox("sortable");
    propertyModal.getSubmitButton().click();
    propertyTable.getMultipleIcon("newID").should("exist");
    propertyTable.getPiiIcon("newID").should("exist");
    //propertyTable.getWildcardIcon('newID').should('exist');
    propertyTable.getFacetIcon("newID").should("exist");
    propertyTable.getSortIcon("newID").should("exist");
  });
  it("Show identifier confirm modal, and then show delete property confirm modal", () => {
    propertyTable.editProperty("lname");
    propertyModal.getYesRadio("identifier").click();
    confirmationModal.getIdentifierText().should("be.visible");
    confirmationModal.getYesButton(ConfirmationType.Identifer);
    propertyModal.getYesRadio("identifier").should("be.checked");

    propertyModal.getDeleteIcon("lname").click();
    confirmationModal.getDeletePropertyStepWarnText().should("exist");
    confirmationModal.getNoButton(ConfirmationType.DeletePropertyStepWarn).click();
    propertyModal.getCancelButton();
    propertyTable.getProperty("lname").should("exist");
  });
  it("Validate Show Steps and Hide Steps", () => {
    propertyTable.editProperty("fname");
    cy.waitUntil(() => propertyModal.getToggleStepsButton().should("exist")).click();
    cy.contains("mapPersonJSON").should("be.visible");
    cy.contains("match-person").should("be.visible");
    cy.contains("merge-person").should("be.visible");
    cy.contains("master-person").should("be.visible");
    cy.contains("Hide Steps...").should("be.visible");
    cy.contains("Show Steps...").should("not.exist");
    propertyModal.getToggleStepsButton().click();
    cy.contains("Show Steps...").should("be.visible");
    cy.contains("mapPersonJSON").should("not.exist");
    cy.contains("match-person").should("not.exist");
    cy.contains("merge-person").should("not.exist");
    cy.contains("master-person").should("not.exist");
    cy.contains("Hide Steps...").should("not.exist");
    propertyModal.getCancelButton();
  });
  it("Delete Entity that is used in other steps", () => {
    entityTypeTable.getDeleteEntityIcon("Person").click();
    cy.contains("Entity type is used in one or more steps.").should("be.visible");
    cy.contains("Show Steps...").should("be.visible");
    cy.contains("Hide Steps...").should("not.exist");
    confirmationModal.getToggleStepsButton().click();
    cy.contains("mapPersonJSON").should("be.visible");
    cy.contains("Hide Steps...").should("be.visible");
    cy.contains("Show Steps...").should("not.exist");
    confirmationModal.getDeleteEntityStepText().should("be.visible");
    confirmationModal.getCloseButton(ConfirmationType.DeleteEntityStepWarn).click();
    entityTypeTable.getEntity("Person").should("exist");
    //Revert All changes
    // modelPage.getRevertAllButton().click();
    // confirmationModal.getYesButton(ConfirmationType.RevertAll);
    // confirmationModal.getRevertAllEntityText().should("not.exist");
  });
});
