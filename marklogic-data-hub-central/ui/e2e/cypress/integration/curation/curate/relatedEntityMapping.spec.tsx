/// <reference types="cypress"/>

import {Application} from "../../../support/application.config";
import {confirmationModal, toolbar} from "../../../support/components/common";
import {
  entityTypeModal,
  entityTypeTable,
  propertyModal,
  propertyTable
} from "../../../support/components/model/index";
import {
  createEditMappingDialog,
  mappingStepDetail
} from "../../../support/components/mapping/index";
import curatePage from "../../../support/pages/curate";
import runPage from "../../../support/pages/run";
import loadPage from "../../../support/pages/load";
import browsePage from "../../../support/pages/browse";
import LoginPage from "../../../support/pages/login";
import "cypress-wait-until";
import modelPage from "../../../support/pages/model";
import {ConfirmationType} from "../../../support/types/modeling-types";


describe("Mapping", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer", "hub-central-load-writer", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer", "hub-central-load-writer", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
    cy.waitForAsyncRequest();
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("mapping", "mapRelation");
    cy.deleteEntities("Relation");
    cy.deleteFlows("relationFlow");
    cy.deleteRecordsInFinal("mapRelation");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Define new entity, add relationship property", {defaultCommandTimeout: 120000}, () => {
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    cy.waitUntil(() => modelPage.getAddEntityButton()).click();
    entityTypeModal.newEntityName("Relation");
    entityTypeModal.getAddButton().click();
    propertyTable.getAddPropertyButton("Relation").should("be.visible").click();
    propertyModal.newPropertyName("relatedTo");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity").click();
    propertyModal.getCascadedTypeFromDropdown("Person").click();
    propertyModal.toggleJoinPropertyDropdown();
    propertyModal.getJoinProperty("id").click();
    propertyModal.getSubmitButton().click();
    //Save Changes
    modelPage.getPublishButton().click();
    confirmationModal.getYesButton(ConfirmationType.PublishAll);
    cy.waitForAsyncRequest();
    confirmationModal.getSaveAllEntityText().should("exist");
    confirmationModal.getSaveAllEntityText().should("not.exist");
    modelPage.getEntityModifiedAlert().should("not.exist");
    propertyTable.getForeignIcon("relatedTo").should("exist");
  });
  it("Create new mapping in Curate", {defaultCommandTimeout: 120000}, () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Person")).should("be.visible");
    curatePage.getEntityTypePanel("Person").should("exist");
    curatePage.toggleEntityTypeId("Person");
    cy.waitUntil(() => curatePage.addNewStep()).click();
    createEditMappingDialog.setMappingName("mapRelation");
    createEditMappingDialog.setSourceRadio("Query");
    createEditMappingDialog.setQueryInput(`cts.collectionQuery(['loadPersonJSON'])`);
    createEditMappingDialog.saveButton().click({force: true});
    curatePage.verifyStepDetailsOpen("mapRelation");
    browsePage.waitForSpinnerToDisappear();
    cy.waitUntil(() => mappingStepDetail.dataAvailable()).should("be.visible");
    mappingStepDetail.entityTitle("Person").should("exist");
  });
  it("Verify related entities in mapping details with defaults", {defaultCommandTimeout: 120000}, () => {
    mappingStepDetail.XPathInfoIcon();
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("not.exist");
    mappingStepDetail.relatedFilterMenu("Person");
    mappingStepDetail.getRelatedEntityFromList("Relation (relatedTo Person)");
    mappingStepDetail.relatedInfoIcon();
    mappingStepDetail.entityTitle("Person").click(); // click outside menu to close it
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("exist");
    mappingStepDetail.validateContextInput("Relation (relatedTo Person)", "/");
    mappingStepDetail.validateURIInput("Person", "$URI");
    mappingStepDetail.validateURIInput("Relation (relatedTo Person)", "hubURI('Relation')");

    // To verify tooltips for mapping property related icons
    mappingStepDetail.verifySourceFieldTooltip("Person");
    mappingStepDetail.verifyFunctionTooltip("URI");
    mappingStepDetail.verifyReferenceTooltip("Person");
  });
  it("Add and test mapping expressions with related entities", {defaultCommandTimeout: 120000}, () => {
    mappingStepDetail.setXpathExpressionInput("id", "SSN");
    mappingStepDetail.entityTitle("Person").click(); // click outside field to auto-save
    mappingStepDetail.successMessage().should("exist");
    mappingStepDetail.successMessage().should("not.exist");
    mappingStepDetail.setXpathExpressionInput("relatedTo", "SSN");
    mappingStepDetail.entityTitle("Person").click();
    mappingStepDetail.successMessage().should("exist");
    mappingStepDetail.successMessage().should("not.exist");
    // URI field
    mappingStepDetail.getURIInput("Relation (relatedTo Person)").clear().type("concat('/Relation/', SSN)");
    mappingStepDetail.entityTitle("Person").click();
    mappingStepDetail.successMessage().should("exist");
    mappingStepDetail.successMessage().should("not.exist");
    cy.waitForAsyncRequest();
    //Test expresssions
    cy.waitUntil(() => mappingStepDetail.testMap()).should("be.enabled");
    mappingStepDetail.testMap().click();
    cy.waitForAsyncRequest();
    mappingStepDetail.validateMapValue("Person", "id", "444-44-4440");
    mappingStepDetail.validateMapValueString("Relation (relatedTo Person)", "relatedTo", "444-44-4440");
    mappingStepDetail.validateMapURIValue("Relation (relatedTo Person)", "/Relation/444-44-4440.j...");

    //Will be validated in unit test
    //mappingStepDetail.getURIValue("Relation (relatedTo Person)", "/Relation/444-44-4440.json");

    // Search by name for non structured property
    mappingStepDetail.searchIcon().click();
    mappingStepDetail.searchName().type("URI");
    mappingStepDetail.searchButton().click();
    cy.findAllByText("URI").should("have.length.gt", 1);
  });

  it("Verify more/less functionality on filtering by name for structured properties", () => {
    mappingStepDetail.goBackToCurateHomePage();
    mappingStepDetail.customerEntity().click();
    curatePage.openMappingStepDetail("Customer", "mapCustomersJSON");
    browsePage.waitForSpinnerToDisappear();
    mappingStepDetail.searchIcon().click();
    mappingStepDetail.searchName().type("street");
    mappingStepDetail.searchButton().click();
    cy.findAllByText("more").should("have.length.gt", 1);
    cy.findAllByText("more").first().click();
    cy.findByText("less").should("be.visible");
  });
  it("Switch views and return to mapping details, verify persistence of expressions", () => {
    mappingStepDetail.goBackToCurateHomePage();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Person")).should("be.visible");
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Person")).should("be.visible");
    curatePage.toggleEntityTypeId("Person");
    curatePage.openMappingStepDetail("Person", "mapRelation");
    curatePage.verifyStepDetailsOpen("mapRelation");
    browsePage.waitForSpinnerToDisappear();

    mappingStepDetail.validateURIInput("Person", "$URI");
    mappingStepDetail.validateMapInput("id", "SSN");
    mappingStepDetail.validateContextInput("Relation (relatedTo Person)", "/");
    mappingStepDetail.validateURIInput("Relation (relatedTo Person)", "concat('/Relation/', SSN)");
    mappingStepDetail.validateMapInput("relatedTo", "SSN");
    mappingStepDetail.getForeignIcon("relatedTo").should("exist");
    mappingStepDetail.goBackToCurateHomePage();
  });
  it("Create new flow, add mapping to flow, run mapping, verify results", () => {
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    runPage.createFlowButton().click();
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName("relationFlow");
    loadPage.confirmationOptions("Save").click();
    runPage.addStep("relationFlow");
    runPage.addStepToFlow("mapRelation");
    runPage.verifyStepInFlow("Map", "mapRelation");

    runPage.runStep("mapRelation");
    cy.verifyStepRunResult("success", "Mapping", "mapRelation");
    cy.waitForAsyncRequest();

    // Navigate to Explore
    runPage.explorerLink().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForTableToLoad();

    // Verify Explore results
    browsePage.getSelectedEntity().should("contain", "All Entities");
    browsePage.getTotalDocuments().should("be.greaterThan", 21);
    browsePage.selectEntity("Relation");
    browsePage.getTotalDocuments().should("be.greaterThan", 7);
  });
  it("Edit advanced settings for each entity", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Person")).should("be.visible");
    curatePage.toggleEntityTypeId("Person");
    curatePage.openMappingStepDetail("Person", "mapRelation");
    curatePage.verifyStepDetailsOpen("mapRelation");
    browsePage.waitForSpinnerToDisappear();
    mappingStepDetail.getEntitySettings("Person").click();
    mappingStepDetail.targetCollection().should("exist");
    cy.waitUntil(() => mappingStepDetail.getTargetPermissions("Person")).focus().clear();
    cy.waitUntil(() => mappingStepDetail.getTargetPermissions("Person")).type("data-hub-common,read");
    mappingStepDetail.getValidationError("Person").should("exist");
    cy.waitUntil(() => mappingStepDetail.getTargetPermissions("Person")).focus().clear();
    cy.waitUntil(() => mappingStepDetail.getTargetPermissions("Person")).type("data-hub-common,read,data-hub-common,update");
    mappingStepDetail.getValidationError("Person").should("not.be.visible");
    cy.waitUntil(() => mappingStepDetail.getSaveSettings("Person")).click({force: true});

    mappingStepDetail.getEntitySettings("Relation").click();
    cy.waitUntil(() => mappingStepDetail.getTargetPermissions("Relation")).focus().clear();
    cy.waitUntil(() => mappingStepDetail.getTargetPermissions("Relation")).type("data-hub-common,read,data-hub-common");
    cy.waitUntil(() => mappingStepDetail.getSaveSettings("Relation")).click({force: true});
    mappingStepDetail.getValidationError("Relation").should("exist");
    cy.waitUntil(() => mappingStepDetail.getTargetPermissions("Relation")).focus().clear();
    cy.waitUntil(() => mappingStepDetail.getTargetPermissions("Relation")).type("data-hub-common,read");
    cy.waitUntil(() => mappingStepDetail.getSaveSettings("Relation")).click({force: true});
    mappingStepDetail.getValidationError("Relation").should("not.be.visible");
    cy.waitUntil(() => mappingStepDetail.getTargetPermissions("Relation")).focus().clear();
    cy.waitUntil(() => mappingStepDetail.getTargetPermissions("Relation")).type("data-hub-common,read,data-hub-common,update");
    cy.waitUntil(() => mappingStepDetail.getSaveSettings("Relation")).click({force: true});
    browsePage.waitForSpinnerToDisappear();
  });
  it("Delete related entity from mapping via filter", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Person")).should("be.visible");
    curatePage.toggleEntityTypeId("Person");
    curatePage.openMappingStepDetail("Person", "mapRelation");
    curatePage.verifyStepDetailsOpen("mapRelation");
    browsePage.waitForSpinnerToDisappear();
    cy.waitUntil(() => mappingStepDetail.relatedFilterSelection("Person", "Relation (relatedTo Person)")).should("exist");
    // Related entity exists before deletion
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("exist");
    mappingStepDetail.relatedFilterSelectionDeleteIcon("Person", "Relation (relatedTo Person)").click();
    mappingStepDetail.deleteConfirmationButtonYes().click({force: true});
    // Related entity does not exist after deletion
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("not.exist");
  });
  it("Delete related entity from mapping via close icon", () => {
    // Reselect deleted related entity
    mappingStepDetail.relatedFilterMenu("Person");
    mappingStepDetail.getRelatedEntityFromList("Relation (relatedTo Person)");
    mappingStepDetail.entityTitle("Person").click(); // click outside menu to close it
    // Related entity exists before deletion
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("exist");
    mappingStepDetail.relatedDeleteIcon("Relation (relatedTo Person)").click();
    mappingStepDetail.deleteConfirmationButtonYes().click({force: true});
    // Related entity does not exist after deletion
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("not.exist");
  });
  it("Reopen step and verify the deleted related entity is no longer there", () => {
    mappingStepDetail.goBackToCurateHomePage();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Person")).should("be.visible");
    curatePage.toggleEntityTypeId("Person");
    curatePage.openMappingStepDetail("Person", "mapRelation");
    curatePage.verifyStepDetailsOpen("mapRelation");
    browsePage.waitForSpinnerToDisappear();
    //Related entity does not exist after reopening step
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("not.exist");
  });

  it("Verify page automically scrolls to top of table after pagination", () => {
    mappingStepDetail.relatedFilterMenu("Person");
    mappingStepDetail.getRelatedEntityFromList("Relation (relatedTo Person)");
    cy.get("#entityContainer").scrollTo("bottom",  {ensureScrollable: false});
    mappingStepDetail.entityTitle("Person").should("not.be.visible");
    browsePage.getPaginationPageSizeOptions().then(attr => {
      attr[1].click();
    });
    browsePage.getPageSizeOption("10 / page").click();
    mappingStepDetail.entityTitle("Person").should("be.visible");
  });
});
