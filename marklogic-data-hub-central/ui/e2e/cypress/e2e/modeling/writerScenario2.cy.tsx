import {confirmationModal, toolbar} from "../../support/components/common/index";
import {ConfirmationType} from "../../support/types/modeling-types";
import graphVis from "../../support/components/model/graph-vis";
import LoginPage from "../../support/pages/login";
import modelPage from "../../support/pages/model";
import "cypress-wait-until";

import {
  entityTypeModal,
  entityTypeTable,
  graphViewSidePanel,
  propertyModal,
  propertyTable,
  relationshipModal,
  structuredTypeModal,
} from "../../support/components/model/index";

const userRoles = [
  "hub-central-entity-model-reader",
  "hub-central-entity-model-writer",
  "hub-central-mapping-writer",
  "hub-central-saved-query-user"
];

/* Scenarios: can create entity, can create a structured type, duplicate structured type name check, add properties to structure type, add structure type as property,
  delete structured type, and delete entity, can add new properties to existing Entities, revert all entities, add multiple entities, add properties, delete properties,
  save all entities, delete an entity with relationship warning. */
describe("Entity Modeling: Writer Role", () => {
  before(() => {
    cy.loginAsTestUserWithRoles(...userRoles).withRequest();
    LoginPage.navigateToMainPage();
    cy.waitForAsyncRequest();
    cy.setupHubCentralConfig();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.resetTestUser();
  });

  it("Create an entity with property that already exists", {defaultCommandTimeout: 120000}, () => {
    toolbar.getModelToolbarIcon().click({force: true});
    cy.waitForAsyncRequest();
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    modelPage.getAddButton().should("be.visible").click({force: true});
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});
    entityTypeModal.newEntityName("AddEntity");
    entityTypeModal.newEntityDescription("An entity for User");
    entityTypeModal.getAddButton().should("be.visible").click({force: true});
    propertyTable.getAddPropertyButton("AddEntity").scrollIntoView().click();
    propertyModal.newPropertyName("Address");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Structured");
    propertyModal.getCascadedTypeFromDropdown("New Property Type");
    structuredTypeModal.newName("Address");
    structuredTypeModal.getAddButton().should("be.visible").click({force: true});
    propertyModal.getYesRadio("multiple").click();
    propertyModal.getSubmitButton().click();
    propertyModal.verifyPropertyNameError();
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName("address");
    propertyModal.getSubmitButton().click();
    propertyTable.getMultipleIcon("address").should("exist");
    propertyTable.editProperty("address-address");
    cy.get("[title=\"Structured: Address\"]").should("exist");
    propertyModal.getCancelButton();
  });

  it("Add basic property to structured type", () => {
    propertyTable.getAddPropertyToStructureType("address").should("be.visible").click();
    propertyModal.getStructuredTypeName().should("have.text", "Address");
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName("street");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("More date types");
    propertyModal.getCascadedTypeFromDropdown("gDay");
    propertyModal.getNoRadio("multiple").click();
    propertyModal.getYesRadio("pii").click();
    propertyModal.getSubmitButton().click();
    cy.waitForAsyncRequest();
    propertyTable.getProperty("address-street"); // DHFPROD-8325: added check for expanded structured property
    propertyTable.getMultipleIcon("street").should("not.exist");
    propertyTable.getPiiIcon("street").should("exist");
    propertyTable.getPropertyName("street").should("exist");
    entityTypeTable.viewEntityInGraphView("AddEntity");
    graphViewSidePanel.getPropertiesTab().click();
    propertyTable.getExpandIcon("address").should("exist").click();
    propertyTable.getPropertyName("street").should("exist");
    modelPage.selectView("table");
  });

  it("Create a property with name 'rowId' and get confirmation modal", () => {
    propertyTable.getAddPropertyButton("AddEntity").should("be.visible").click({force: true});
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName("rowId");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string");

    propertyModal.getSubmitButton().click();
    confirmationModal.getPropertyNameText().should("exist");

    cy.log("Check confirmation modal reappears wen trying to submit and clicked 'no'");
    confirmationModal.getNoButton(ConfirmationType.PropertyName).click();
    propertyModal.getSubmitButton().click();
    confirmationModal.getPropertyNameText().should("exist");

    cy.log("Click yes and re-submit");
    confirmationModal.getYesButton(ConfirmationType.PropertyName);
    propertyModal.getSubmitButton().click();
    propertyTable.getProperty("rowId").should("exist");
  });

  it("Add structured property to structured type", () => {
    propertyTable.getAddPropertyToStructureType("address").click();
    propertyModal.newPropertyName("zip");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Structured");
    propertyModal.getCascadedTypeFromDropdown("New Property Type");
    structuredTypeModal.newName("street");
    structuredTypeModal.getAddButton().click();
    propertyModal.verifySameNamePropertyError("A property is already using the name street. A structured type cannot use the same name as an existing property.");
    structuredTypeModal.clearName();
    structuredTypeModal.newName("Zip");
    // test namespace validation
    structuredTypeModal.newNamespace("http://example.org/test");
    structuredTypeModal.getAddButton().click();
    structuredTypeModal.verifyPrefixNameError();
    structuredTypeModal.newPrefix("xml");
    structuredTypeModal.getAddButton().click();
    structuredTypeModal.verifyPrefixNameError();
    structuredTypeModal.clearNamespace();
    structuredTypeModal.clearPrefix();
    structuredTypeModal.newPrefix("test");
    structuredTypeModal.getAddButton().click();
    structuredTypeModal.verifyNamespaceError();
    // reset namespace information
    structuredTypeModal.clearNamespace();
    structuredTypeModal.clearPrefix();
    structuredTypeModal.getAddButton().click();
    propertyModal.getYesRadio("multiple").click();
    propertyModal.getNoRadio("pii").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getProperty("zip-zip"); // DHFPROD-8325: added check for expanded structured property
    propertyTable.getMultipleIcon("zip").should("exist");
    propertyTable.getPiiIcon("zip").should("not.exist");
    //propertyTable.getWildcardIcon('zip').should('not.exist');
  });

  it("Add a Structured sub-property inside one of the same type (the option is disabled)", () => {
    propertyTable.getAddPropertyToStructureType("address").click();
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Structured");
    propertyModal.getDisabledTypeFromDropdown().should("exist");
    propertyModal.getCancelButton();
  });

  it("Add related property to structured type and test foreign key selection", () => {
    propertyTable.getAddPropertyToStructureType("address").click();
    propertyModal.newPropertyName("OrderedBy");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity");
    propertyModal.getCascadedTypeFromDropdown("Customer");
    propertyModal.openForeignKeyDropdown();
    propertyModal.getForeignKey("nicknames").should("not.be.enabled");
    propertyModal.getForeignKey("customerId").click();
    propertyModal.getSubmitButton().click();
    propertyTable.verifyRelationshipIcon("OrderedBy").should("exist");
    propertyTable.verifyForeignKeyIcon("OrderedBy").should("exist");

    //verify removing foreign key from relationship is possible
    propertyTable.editProperty("address-OrderedBy");
    cy.waitUntil(() => cy.get("#foreignKey-select-wrapper").should("be.visible"));
    propertyModal.openForeignKeyDropdown();
    propertyModal.getForeignKey("None").click();
    propertyModal.getSubmitButton().click();
    propertyTable.verifyRelationshipIcon("OrderedBy").should("exist");
    //foreign key no longer exists
    propertyTable.verifyForeignKeyIcon("OrderedBy").should("not.exist");
    modelPage.selectView("project-diagram");
    graphVis.getPositionOfEdgeBetween("AddEntity,Customer").then((edgePosition: any) => {
      // Wait extended because of the delay of the animations
      cy.wait(150);
      modelPage.scrollPageBottom();
      cy.waitUntil(() => graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y, {force: true}));
    });
    relationshipModal.getModalHeader().should("be.visible");
    relationshipModal.verifyRelationshipValue("OrderedBy");
    relationshipModal.cancelModal();
    modelPage.selectView("table");
  });

  it("Add properties to nested structured type", () => {
    propertyTable.getAddPropertyToStructureType("zip").click();
    propertyModal.getStructuredTypeName().should("have.text", "Address.Zip");
    propertyModal.newPropertyName("fiveDigit");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("More number types");
    propertyModal.getCascadedTypeFromDropdown("int");
    propertyModal.getSubmitButton().click();
    cy.waitUntil(() => propertyTable.getExpandIcon("zip").click({force: true}));
    propertyTable.getProperty("zip-fiveDigit");  // DHFPROD-8325: added check for expanded structured property
    propertyTable.getMultipleIcon("code").should("not.exist");
    propertyTable.getPiiIcon("code").should("not.exist");
  });

  it("Test for additional nesting of structured types", () => {
    cy.get(".mosaic-window > :nth-child(2)").scrollTo("bottom");
    propertyTable.getAddPropertyToStructureType("zip").click({force: true});
    propertyModal.newPropertyName("extra");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Structured");
    propertyModal.getCascadedTypeFromDropdown("New Property Type");
    structuredTypeModal.newName("Extra");
    structuredTypeModal.getAddButton().click();
    propertyModal.getSubmitButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.get(".mosaic-window > :nth-child(2)").scrollTo("bottom"));
    propertyTable.getProperty("extra-extra");
    propertyTable.getAddPropertyToStructureType("extra").scrollIntoView().click();
    propertyModal.newPropertyName("fourDigit");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdownCascaderRC("integer");
    propertyModal.getYesRadio("pii").click();
    propertyModal.getSubmitButton().click();

    //TODO: Re-test child expansion without using ml-table selector

    // propertyTable.expandExtraStructuredTypeIcon().click();
    // propertyTable.getMultipleIcon("fourDigit").should("not.exist");
    // propertyTable.getPiiIcon("fourDigit").should("exist");
    //propertyTable.getWildcardIcon('fourDigit').should('exist');
  });

  it("Reuse Structured type, add property to structured type and confirm it gets updated", () => {
    cy.log("**Create a new property using an existing Structured type**");
    propertyTable.getAddPropertyButton("AddEntity").scrollIntoView().click();
    propertyModal.newPropertyName("extra2");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Structured");

    propertyModal.getCascadedTypeFromDropdown("Extra");
    propertyModal.getSubmitButton().click();

    cy.log("**Add property to 'Extra' Structured type**");
    //validate the structure name is correct
    propertyTable.getExpandIcon("extra2").scrollIntoView().click();
    propertyTable.getSubProperty("extra2", "fourDigit").scrollIntoView().should("be.visible");

    cy.log("**Open address sub-properties**");
    //propertyTable.getExpandIcon("address").scrollIntoView().click();
    // propertyTable.getExpandIcon("zip").scrollIntoView().click();
    propertyTable.getExpandIcon("extra").scrollIntoView().click();

    cy.log("**Close 'extra2' property**");
    propertyTable.getExpandIcon("extra2").scrollIntoView().click();

    cy.log("**Add property to 'Extra'**");
    propertyTable.getSubProperty("extra", "fourDigit").scrollIntoView().should("be.visible");
    propertyTable.getAddPropertyToStructureType("extra").click({force: true});
    propertyModal.newPropertyName("newExtra");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdownCascaderRC("string");
    propertyModal.getSubmitButton().click();

    cy.log("**Close 'address' property**");
    propertyTable.getExpandIcon("address").scrollIntoView().click({force: true});

    cy.log("**Open 'extra2' and confirm it got updated with the new property**");
    propertyTable.getExpandIcon("extra2").scrollIntoView().click();
    propertyTable.getSubProperty("extra2", "newExtra").scrollIntoView().should("be.visible");

    cy.log("**Delete 'extra2' property**");
    propertyTable.getDeletePropertyIcon("AddEntity", "extra2").click({force: true});
    confirmationModal.getDeletePropertyWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn);
    cy.waitForAsyncRequest();
    propertyTable.getProperty("extra2").should("not.exist");

    cy.log("**Delete 'newExtra' property**");
    propertyTable.getExpandIcon("address").scrollIntoView().click({force: true});
    propertyTable.getDeletePropertyIcon("AddEntity", "Extra-extra-newExtra").click({force: true});
    confirmationModal.getDeletePropertyWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn);
    cy.waitForAsyncRequest();
    propertyTable.getProperty("newExtra").should("not.exist");
  });

  it("Edit Property Structured Property", () => {
    cy.log("**Reloading the page so the change appears");
    cy.reload();
    cy.waitForAsyncRequest();
    // TODO: graph re-renders after reloading the page. Bug: DHFPROD-9174
    cy.wait(1000);
    modelPage.selectView("table");
    propertyTable.getExpandIcon("AddEntity-Entity Type").scrollIntoView().click();
    propertyTable.getExpandIcon("address").scrollIntoView().click();
    propertyTable.getExpandIcon("address").scrollTo("top", {ensureScrollable: false}).scrollIntoView().click({force: true});
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
    propertyModal.getTypeFromDropdown("More number types");
    propertyModal.getCascadedTypeFromDropdown("unsignedByte");
    propertyModal.getYesRadio("idenifier").should("not.exist");
    propertyModal.getYesRadio("multiple").click();
    propertyModal.getNoRadio("pii").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getMultipleIcon("streetAlt").should("exist");
    propertyTable.getPiiIcon("streetAlt").should("not.exist");
  });

  it("Rename property and change type from structured to relationship", () => {
    propertyTable.editProperty("address-address");
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName("alt_address");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity");
    propertyModal.getCascadedTypeFromDropdown("Person");
    propertyModal.openForeignKeyDropdown();
    propertyModal.getForeignKey("Address").click();
    propertyModal.getYesRadio("multiple").click();
    propertyModal.getYesRadio("idenifier").should("not.exist");
    propertyModal.getYesRadio("pii").should("not.exist");
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
    propertyModal.getTypeFromDropdown("Structured");
    propertyModal.getCascadedTypeFromDropdown("Address");
    propertyModal.getSubmitButton().click();
    // TODO DHFPROD-7711 skip since fails for Ant Design Table component
    //propertyTable.expandStructuredTypeIcon("alt_address").click();
    //propertyTable.getProperty("alt_address-streetAlt").should("exist");
  });

  it("Add foreign key with type as Related Entity", () => {
    propertyTable.getAddPropertyButton("AddEntity").scrollIntoView().click();
    propertyModal.newPropertyName("OrderedBy");
    propertyModal.getForeignKeyDropdown().should("not.exist");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity");
    propertyModal.getCascadedTypeFromDropdown("Customer");
    propertyModal.openForeignKeyDropdown();
    propertyModal.getForeignKey("nicknames").should("not.be.enabled");
    propertyModal.getForeignKey("customerId").click();
    propertyModal.getSubmitButton().click();
    cy.waitForAsyncRequest();
    propertyTable.getProperty("OrderedBy").should("exist");
  });

  it("Delete a property, a structured property and then the entity", {defaultCommandTimeout: 120000}, () => {
    //Structured Property
    //cy.get("[data-row-key*=\"address\"] [aria-label=\"Expand row\"]").click();
    /*propertyTable.getDeleteStructuredPropertyIcon("AddEntity", "Address", "alt_address-streetAlt").click();
    confirmationModal.getDeletePropertyWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn);
    cy.waitForAsyncRequest();
    propertyTable.getProperty("streetAlt").should("not.exist");*/
    //Property
    propertyTable.getDeletePropertyIcon("AddEntity", "alt_address").should("be.visible").click({force: true});
    confirmationModal.getDeletePropertyWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn);
    cy.waitForAsyncRequest();
    propertyTable.getProperty("alt_address").should("not.exist");
    propertyTable.getDeletePropertyIcon("AddEntity", "OrderedBy").should("be.visible").click({force: true});
    confirmationModal.getDeletePropertyWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn);
    cy.waitForAsyncRequest();
    propertyTable.getProperty("OrderedBy").should("not.exist");

    //Save Changes
    // TODO These break since we do not delete entity until publishing now. To fix with UI changes.
    // confirmationModal.getDeleteEntityText().should("exist");
    // confirmationModal.getDeleteEntityText().should("not.exist");
    // entityTypeTable.getEntity("AddEntity").should("not.exist");

    // "Delete entity", {defaultCommandTimeout: 120000}, () => {
    entityTypeTable.getDeleteEntityIcon("AddEntity").click({force: true});
    confirmationModal.getDeleteEntityText().should("be.visible");
    confirmationModal.getYesButton(ConfirmationType.DeleteEntity);
    cy.waitForAsyncRequest();
    // TODO These break since we do not delete entity until publishing now. To fix with UI changes.
    // confirmationModal.getDeleteEntityText().should("exist");
    // confirmationModal.getDeleteEntityText().should("not.exist");
    // entityTypeTable.getEntity("AddEntity").should("not.exist");

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
    modelPage.getAddButton().should("be.visible").click();
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});
    entityTypeModal.newEntityName("Concept");
    entityTypeModal.newEntityDescription("A concept entity");
    entityTypeModal.getAddButton().click();
    propertyTable.getAddPropertyButton("Concept").click();
    propertyModal.newPropertyName("order");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity");
    propertyModal.getCascadedTypeFromDropdown("Order");
    propertyModal.openForeignKeyDropdown();
    propertyModal.getForeignKey("orderId").click();
    propertyModal.getYesRadio("multiple").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getMultipleIcon("order").should("exist");

    // "Add another property to Concept Entity and delete it"
    propertyTable.getAddPropertyButton("Concept").click();
    propertyModal.newPropertyName("testing");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("More date types");
    propertyModal.getCascadedTypeFromDropdown("yearMonthDuration");
    propertyModal.getSubmitButton().click();
    propertyTable.getDeletePropertyIcon("Concept", "testing").click({force: true});
    confirmationModal.getDeletePropertyWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn);
    cy.waitForAsyncRequest();
    propertyTable.getProperty("testing").should("not.exist");
    modelPage.getEntityModifiedAlert().should("exist");
  });
});
