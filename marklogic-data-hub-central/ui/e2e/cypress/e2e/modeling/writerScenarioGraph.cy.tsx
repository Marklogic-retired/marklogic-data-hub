import modelPage from "../../support/pages/model";
import {
  entityTypeModal,
  entityTypeTable,
  graphView,
  graphViewSidePanel,
  propertyModal,
  propertyTable,
  relationshipModal
} from "../../support/components/model/index";
import {mappingStepDetail} from "../../support/components/mapping";
import graphVis from "../../support/components/model/graph-vis";
import curatePage from "../../support/pages/curate";
import {confirmationModal, toolbar} from "../../support/components/common/index";
import {ConfirmationType} from "../../support/types/modeling-types";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";

const userRoles = [
  "hub-central-entity-model-reader",
  "hub-central-entity-model-writer",
  "hub-central-mapping-writer",
  "hub-central-saved-query-user"
];


describe("Entity Modeling: Graph View", () => {
  before(() => {
    cy.loginAsTestUserWithRoles(...userRoles).withRequest();
    LoginPage.navigateToMainPage();
  });

  beforeEach(() => {
    cy.setupHubCentralConfig();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.resetTestUser();
  });

  it("Create an entity with name having more than 20 chars", () => {
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click({force: true});
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    cy.waitUntil(() => modelPage.getAddButton()).click();
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});
    entityTypeModal.newEntityName("AThisIsVeryLongNameHavingMoreThan20Characters");
    entityTypeModal.newEntityDescription("entity description");
    cy.waitUntil(() => entityTypeModal.getAddButton().click());
    cy.waitForAsyncRequest();
    entityTypeModal.getAddButton().should("not.exist");
    cy.scrollTo("top");
    entityTypeTable.viewEntityInGraphView("AThisIsVeryLongNameHavingMoreThan20Characters");
    cy.wait(5000);
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let longNameCoordinates: any = nodePositions["AThisIsVeryLongNameHavingMoreThan20Characters"];
      cy.wait(150);
      graphVis.getGraphVisCanvas().trigger("mouseover", longNameCoordinates.x, longNameCoordinates.y, {force: true});

      cy.contains("AThisIsVeryLongNameHavingMoreThan20Characters");
    });

    graphViewSidePanel.getDeleteIcon("AThisIsVeryLongNameHavingMoreThan20Characters").click();
    confirmationModal.getYesButton(ConfirmationType.DeleteEntity);
    confirmationModal.getDeleteEntityText().should("not.exist");
    cy.waitForAsyncRequest();
    graphViewSidePanel.getSelectedEntityHeading("AThisIsVeryLongNameHavingMoreThan20Characters").should("not.exist");
    cy.publishDataModel();
  });

  it("Create another entity Patients and add a properties", {defaultCommandTimeout: 120000}, () => {
    modelPage.selectView("table");
    modelPage.getAddButton().should("be.visible").click({force: true});
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});
    entityTypeModal.newEntityName("Patients");
    entityTypeModal.newEntityDescription("An entity for patients");
    entityTypeModal.getAddButton().click();
    propertyTable.getAddPropertyButton("Patients").should("be.visible").click();
    propertyModal.newPropertyName("patientID");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("More number types");
    propertyModal.getCascadedTypeFromDropdown("byte");
    propertyModal.getYesRadio("identifier").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getIdentifierIcon("patientID").should("exist");
    propertyTable.getAddPropertyButton("Patients").should("exist");
    propertyTable.getAddPropertyButton("Patients").click();
    propertyModal.newPropertyName("personType");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity");
    propertyModal.getCascadedTypeFromDropdown("Person");
    cy.wait(3000);
    propertyModal.openForeignKeyDropdown();
    propertyModal.getForeignKey("id").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getProperty("personType").should("exist");

    propertyTable.getAddPropertyButton("Patients").click();
    propertyModal.newPropertyName("health");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("More number types");
    propertyModal.getCascadedTypeFromDropdown("negativeInteger");
    propertyModal.clickCheckbox("facetable");
    propertyModal.clickCheckbox("sortable");
    propertyModal.getSubmitButton().click();
    propertyTable.getProperty("health").should("exist");
    propertyTable.getFacetIcon("health").should("exist");
    propertyTable.getSortIcon("health").should("exist");
    cy.publishDataModel();

    propertyTable.getProperty("patientId").should("not.exist");
    propertyTable.getProperty("health").should("exist");
    propertyTable.getFacetIcon("health").should("exist");
    propertyTable.getSortIcon("health").should("exist");
  });

  it("Delete an entity from graph view and publish the changes", {defaultCommandTimeout: 120000}, () => {
    entityTypeTable.viewEntityInGraphView("Patients");
    modelPage.scrollPageBottom();

    cy.wait(6000);
    cy.log("**Verify description tooltip appears on hover**");
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let patientCoordinates: any = nodePositions["Patients"];
      graphVis.getGraphVisCanvas().click(patientCoordinates.x, patientCoordinates.y, {force: true});
      cy.contains("An entity for patients").should("exist");
    });
    cy.waitForAsyncRequest();
    cy.wait(1500);

    graphViewSidePanel.getDeleteIcon("Patients").scrollIntoView().click({force: true});
    confirmationModal.getYesButton(ConfirmationType.DeleteEntity);
    confirmationModal.getDeleteEntityText().should("not.exist");
    cy.waitForAsyncRequest();
    graphViewSidePanel.getSelectedEntityHeading("Patients").should("not.exist");
    cy.wait(150);
    cy.publishDataModel();
  });

  it("Edit a relationship from graph view", {defaultCommandTimeout: 120000}, () => {
    modelPage.selectView("project-diagram");

    modelPage.scrollPageBottom();
    cy.wait(6000);
    graphVis.getPositionOfEdgeBetween("Customer,BabyRegistry").then((edgePosition: any) => {
      cy.wait(150);
      cy.waitUntil(() => graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y, {force: true}));
    });

    relationshipModal.getModalHeader().should("be.visible");

    cy.log("**edit properties should be populated**");
    relationshipModal.verifyRelationshipValue("ownedBy");
    relationshipModal.verifyForeignKeyValue("customerId");
    relationshipModal.verifyCardinality("oneToOneIcon").should("be.visible");

    cy.log("**modify properties and save**");
    relationshipModal.editRelationshipName("usedBy");
    relationshipModal.toggleCardinality();
    relationshipModal.verifyCardinality("oneToManyIcon").should("be.visible");
    relationshipModal.editForeignKey("email");

    relationshipModal.confirmationOptions("Save");
    cy.wait(2000);
    cy.waitForAsyncRequest();
    relationshipModal.getModalHeader().should("not.exist");
  });

  it("Can enter graph edit mode and add edge relationships via single node click", {defaultCommandTimeout: 120000}, () => {
    modelPage.selectView("project-diagram");

    modelPage.scrollPageBottom();
    cy.wait(6000);
    graphVis.getPositionOfEdgeBetween("Customer,BabyRegistry").then((edgePosition: any) => {
      cy.wait(150);
      graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y, {force: true});
    });

    relationshipModal.verifyRelationshipValue("usedBy");
    relationshipModal.verifyForeignKeyValue("email");
    relationshipModal.verifyCardinality("oneToManyIcon").should("be.visible");

    cy.log("**reset the values**");
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
    relationshipModal.verifyCardinality("oneToOneIcon").should("be.visible");

    cy.log("**target entity node should be placeholder and user can set relationship options**");
    relationshipModal.verifyTargetNode("Select target entity type*").should("be.visible");

    relationshipModal.targetEntityDropdown().click();
    cy.log("**verify dropdown options can be searched**");
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

    cy.log("**verify relationship was created and properties are present**");
    modelPage.scrollPageTop();
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    entityTypeTable.getExpandEntityIcon("Person");
    propertyTable.editProperty("purchased");
    propertyModal.getYesRadio("multiple").should("be.checked");
    propertyModal.verifyPropertyType("Relationship: Order");
    propertyModal.verifyForeignKeyPlaceholder();
    propertyModal.getCancelButton();

    cy.log("**verify helpful icon present on the property, should show relationship icon but no foreign key**");
    propertyTable.verifyRelationshipIcon("purchased").should("exist");
    propertyTable.verifyForeignKeyIcon("purchased").should("not.exist");
  });

  it("Can edit graph edit mode and add edge relationships (with foreign key scenario) via drag/drop", () => {
    entityTypeTable.viewEntityInGraphView("Person");
    graphView.getAddButton().click();
    graphView.addNewRelationship().should("be.visible").click({force: true});

    cy.log("** ensure side panel can be closed in add edge mode **");
    modelPage.closeSidePanel();
    cy.wait(6000);
    graphView.getAddButton().click();
    graphView.addNewRelationship().should("be.visible").click({force: true});
    graphView.verifyEditInfoMessage().should("exist");

    modelPage.scrollPageBottom();

    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let PersonCoordinates: any = nodePositions["Person"];
      let ClientCoordinates: any = nodePositions["Client"];
      cy.wait(150);
      graphVis.getGraphVisCanvas().trigger("pointerdown", PersonCoordinates.x, PersonCoordinates.y, {button: 0, scrollBehavior: "bottom"});
      graphVis.getGraphVisCanvas().trigger("pointermove", ClientCoordinates.x, ClientCoordinates.y, {button: 0, force: true, scrollBehavior: "bottom"});
      graphVis.getGraphVisCanvas().trigger("pointerup", ClientCoordinates.x, ClientCoordinates.y, {button: 0, scrollBehavior: "bottom"});
    });

    cy.log("**relationship modal should open with proper source and target nodes in place**");
    relationshipModal.verifySourceEntity("Person").should("be.visible");
    relationshipModal.verifyTargetNode("Client").should("be.visible");

    cy.log("**add relationship properties and save**");
    relationshipModal.editRelationshipName("referredBy");

    cy.log("**open Optional line to edit foreign key field**");
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

    cy.log("**add second relationship**");
    graphView.getAddButton().click();
    graphView.addNewRelationship().click();
    graphView.verifyEditInfoMessage().should("exist");
    modelPage.scrollPageBottom();

    cy.wait(5000);
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let PersonCoordinates: any = nodePositions["Person"];
      let ClientCoordinates: any = nodePositions["Client"];
      cy.wait(150);
      graphVis.getGraphVisCanvas().trigger("pointerdown", PersonCoordinates.x, PersonCoordinates.y, {button: 0});
      graphVis.getGraphVisCanvas().trigger("pointermove", ClientCoordinates.x, ClientCoordinates.y, {button: 0});
      graphVis.getGraphVisCanvas().trigger("pointerup", ClientCoordinates.x, ClientCoordinates.y, {button: 0});
    });

    cy.log("**relationship modal should open with proper source and target nodes in place**");
    relationshipModal.verifySourceEntity("Person").should("be.visible");
    relationshipModal.verifyTargetNode("Client").should("be.visible");

    cy.log("**add relationship properties and save**");
    relationshipModal.editRelationshipName("recommendedByUserHavingVeryLongName");

    cy.log("**open Optional line to edit foreign key field**");
    relationshipModal.toggleOptional();
    relationshipModal.verifyVisibleOptionalBlock();
    relationshipModal.editForeignKey("lastname");
    relationshipModal.toggleCardinality();
    relationshipModal.addRelationshipSubmit();
    cy.waitForAsyncRequest();
    relationshipModal.getModalHeader().should("not.exist");

    modelPage.scrollPageTop();
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    entityTypeTable.getExpandEntityIcon("Person");
    propertyTable.editProperty("referredBy");
    propertyModal.getYesRadio("multiple").should("be.checked");
    propertyModal.verifyPropertyType("Relationship: Client");
    propertyModal.verifyForeignKey("firstname");
    propertyModal.getCancelButton();

    cy.log("**verify helpful icon present on the property, should show BOTH relationship icon and foreign key**");
    propertyTable.verifyRelationshipIcon("referredBy").should("exist");
    propertyTable.verifyForeignKeyIcon("referredBy").should("exist");

    entityTypeTable.viewEntityInGraphView("Person");
  });

  it("Relationships are not present in mapping until published", () => {
    toolbar.getCurateToolbarIcon().click();
    confirmationModal.getNavigationWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.NavigationWarn);

    cy.log("**Go to curate open mapping step detail**");
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Person").should("be.visible"));
    curatePage.toggleEntityTypeId("Person");
    curatePage.openStepDetails("mapPersonJSON");
    cy.waitUntil(() => curatePage.dataPresent().should("be.visible"));
    cy.log("**unpublished relationship should not show up in mapping**");
    mappingStepDetail.getMapPropertyName("Person", "purchased").should("not.exist");
    mappingStepDetail.getMapPropertyName("Person", "referredBy").should("not.exist");

    toolbar.getModelToolbarIcon().click();
    cy.wait(2500);
    cy.publishDataModel();

    cy.log("**Verify Person relationship is visible in mapping**");
    cy.log("**verify relationship is visible in mapping**");
    cy.log("**Go to curate and open Person**");
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();
    confirmationModal.getNavigationWarnText().should("not.exist");

    cy.wait(1000);
    curatePage.getEntityTypePanel("Person").should("be.visible", {timeout: 5000}).click({force: true});
    curatePage.openStepDetails("mapPersonJSON");
    cy.waitUntil(() => curatePage.dataPresent().should("be.visible"));

    cy.log("**published relationship should show up in mapping**");
    mappingStepDetail.getMapPropertyName("Person", "purchased").should("exist");
    mappingStepDetail.getMapPropertyName("Person", "referredBy").should("exist");

    cy.log("**both icons present in complete relationship**");
    propertyTable.verifyRelationshipIcon("referredBy").should("exist");
    propertyTable.verifyForeignKeyIcon("referredBy").should("exist");

    cy.log("**only relationship icon present in incomplete relationship and XPATH field is disabled**");
    propertyTable.verifyRelationshipIcon("purchased").should("exist");
    propertyTable.verifyForeignKeyIcon("purchased").should("not.exist");
    mappingStepDetail.getXpathExpressionInput("purchased").should("not.exist");

  });

  it("Delete a relationship from graph view, cancel deletion", {defaultCommandTimeout: 120000}, () => {
    toolbar.getModelToolbarIcon().click();
    modelPage.selectView("project-diagram");

    modelPage.scrollPageBottom();
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
    cy.waitUntil(() => cy.findByLabelText("confirm-deletePropertyWarn-no").click());
    relationshipModal.cancelModal();
    cy.wait(3000);
    graphVis.getPositionsOfNodes("Person").then((nodePositions: any) => {
      let personCoordinates: any = nodePositions["Person"];
      cy.waitUntil(() => graphVis.getGraphVisCanvas().click(personCoordinates.x, personCoordinates.y));
    });
    graphViewSidePanel.getPropertyName("purchased").should("exist");
  });

  it("Delete a relationship from graph view", {defaultCommandTimeout: 120000}, () => {
    toolbar.getModelToolbarIcon().click();
    modelPage.selectView("project-diagram");

    modelPage.scrollPageBottom();
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
    cy.waitUntil(() => cy.findByLabelText("confirm-deletePropertyWarn-yes").click());
    cy.log("** To verify that property is not visible**");
    cy.wait(3000);
    graphVis.getPositionsOfNodes("Person").then((nodePositions: any) => {
      let personCoordinates: any = nodePositions["Person"];
      cy.waitUntil(() => graphVis.getGraphVisCanvas().click(personCoordinates.x, personCoordinates.y));
    });
    graphViewSidePanel.getPropertyName("purchased").should("not.exist");
  });

  it("edit structured property relationship", () => {
    toolbar.getModelToolbarIcon().click();
    modelPage.selectView("table");

    cy.log("**Creates a structured property on Customer**");
    entityTypeTable.viewEntityInGraphView("Customer");
    graphViewSidePanel.getAddPropertyForStructuredProperties("shipping").click();
    propertyModal.newPropertyName("structuredPropertyTest");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity");
    propertyModal.getCascadedTypeFromDropdown("Person");
    propertyModal.getSubmitButton().click();
    cy.waitForAsyncRequest();

    cy.log("**Edits the relationship from the graph**");
    graphVis.getPositionOfEdgeBetween("Customer,Person").then((edgePosition: any) => {
      cy.wait(150);
      graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y, {force: true});
    });
    relationshipModal.editRelationshipName("new-Relationship-!Name");
    relationshipModal.confirmationOptions("Save");
    cy.get(`[data-icon="exclamation-circle"]`).should("exist").then(() => {
      relationshipModal.editRelationshipName("new-Relationship-1Name");
      relationshipModal.confirmationOptions("Save");
    });
    cy.wait(2000);
    cy.waitForAsyncRequest();

    cy.log("**Verifies the relationship name is updated**");
    modelPage.selectView("table");
    entityTypeTable.getExpandEntityIcon("Customer");
    propertyTable.getPropertyName("new-Relationship-1Name").should("exist");

    cy.log("** deletes the relationship**");
    cy.log("**Deletes the relationship**");
    propertyTable.getDeletePropertyIcon("Customer-Address-shipping", "new-Relationship-1Name").scrollIntoView().click();
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn);
  });
});
