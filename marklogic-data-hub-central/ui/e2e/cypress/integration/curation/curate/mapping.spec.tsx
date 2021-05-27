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
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Define new entity, add relationship property", () => {
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
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
    entityTypeTable.getSaveEntityIcon("Relation").click();
    confirmationModal.getSaveEntityText().should("be.visible");
    confirmationModal.getYesButton(ConfirmationType.SaveEntity).click();
    confirmationModal.getSaveEntityText().should("exist");
    confirmationModal.getSaveEntityText().should("not.exist");
    propertyTable.getForeignIcon("relatedTo").should("exist");
  });
  it("Create new mapping in Curate", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Person").should("be.visible"));
    curatePage.getEntityTypePanel("Person").should("exist");
    curatePage.toggleEntityTypeId("Person");
    cy.waitUntil(() => curatePage.addNewStep().click());
    createEditMappingDialog.setMappingName("mapRelation");
    createEditMappingDialog.setSourceRadio("Query");
    createEditMappingDialog.setQueryInput(`cts.collectionQuery(['loadPersonJSON'])`);
    createEditMappingDialog.saveButton().click({force: true});
    curatePage.verifyStepDetailsOpen("mapRelation");
    cy.waitUntil(() => mappingStepDetail.dataAvailable().should("be.visible"));
    mappingStepDetail.entityTitle("Person").should("exist");
  });
  it("Verify related entities in mapping details with defaults", () => {
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("not.exist");
    cy.waitUntil(() => mappingStepDetail.relatedFilterMenu("Person")).click();
    cy.waitUntil(() => mappingStepDetail.getRelatedEntityFromList("Relation (relatedTo Person)")).click();
    mappingStepDetail.entityTitle("Person").click(); // click outside menu to close it
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("exist");
    mappingStepDetail.validateContextInput("Relation (relatedTo Person)", "/");
    mappingStepDetail.validateURIInput("Person", "$URI");
    mappingStepDetail.validateURIInput("Relation (relatedTo Person)", "hubURI('Relation')");
  });
  it("Add and test mapping expressions to related entities", () => {
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

    // Test expresssions
    cy.waitUntil(() => mappingStepDetail.testMap().should("be.enabled"));
    mappingStepDetail.testMap().click();
    mappingStepDetail.validateMapValue("Person", "id", "444-44-4440");
    mappingStepDetail.validateMapValue("Relation (relatedTo Person)", "relatedTo", "444-44-4440");
    mappingStepDetail.getURIValue("Relation (relatedTo Person)").trigger("mouseover");
    cy.contains("/Relation/444-44-4440.json");
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
});