/// <reference types="cypress"/>

import {Application} from "../../../support/application.config";
import {toolbar} from "../../../support/components/common";
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
import entitiesSidebar from "../../../support/pages/entitiesSidebar";

describe("Mapping", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer", "hub-central-load-writer", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
    LoginPage.postLogin();
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage();
  });
  afterEach(() => {
    // update local storage
    cy.saveLocalStorage();
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
    cy.waitUntil(() => modelPage.getAddButton()).click({force: true});
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});
    entityTypeModal.newEntityName("Relation");
    entityTypeModal.getAddButton().click();
    propertyTable.getAddPropertyButton("Relation").scrollIntoView().should("be.visible").click();
    propertyModal.newPropertyName("relatedTo");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity").click();
    propertyModal.getCascadedTypeFromDropdown("Person").click();
    propertyModal.openForeignKeyDropdown();
    propertyModal.getForeignKey("id").click({force: true});
    propertyModal.getSubmitButton().click();
    cy.waitForAsyncRequest();
    cy.wait(1000);
    //Save Changes
    cy.publishDataModel();
    propertyTable.getForeignIcon("relatedTo").should("exist");
  });
  it("Create new mapping in Curate", {defaultCommandTimeout: 120000}, () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Person")).should("be.visible");
    curatePage.getEntityTypePanel("Person").should("exist");
    curatePage.toggleEntityTypeId("Person");
    cy.waitUntil(() => curatePage.addNewStep("Person")).click();
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
    cy.log("**URI field**");
    mappingStepDetail.getURIInput("Relation (relatedTo Person)").clear().type("concat('/Relation/', SSN)");
    mappingStepDetail.entityTitle("Person").click();
    mappingStepDetail.successMessage().should("exist");
    mappingStepDetail.successMessage().should("not.exist");
    cy.log("**Test expresssions**");
    cy.waitUntil(() => mappingStepDetail.testMap()).should("be.enabled");
    mappingStepDetail.testMap().click({force: true});
    cy.waitForAsyncRequest();
    mappingStepDetail.validateMapValue("Person", "id", "444-44-4440");
    mappingStepDetail.validateMapValueString("Relation (relatedTo Person)", "relatedTo", "444-44-4440");
    mappingStepDetail.validateMapURIValue("Relation (relatedTo Person)", "/Relation/444-44-4440.j...");
  });

  it("Switch views and return to mapping details, verify persistence of expressions", () => {
    cy.log("**Go back to curate page**");
    // Visiting instead of clicking on curate button, to make sure Person step details are always closed.
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();
    curatePage.getEntityTypePanel("Person").should("be.visible");

    cy.log("**Go to Model page and select table view**");
    toolbar.getModelToolbarIcon().should("be.visible").click({force: true});

    // TODO: Table view button does not work until the animation stops.
    cy.wait(5000);

    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();

    cy.log("**Go back to curate page and open Person**");
    cy.visit("/tiles/curate");
    curatePage.getEntityTypePanel("Person").should("exist");
    //There is a re-render happening sometimes at this point,
    //so waiting for a request will not work.
    //A hard wait of 1 sec may be needed here.

    cy.log("**Open Person mapping step details**");
    curatePage.getEntityTypePanel("Person").should("be.visible").click();
    curatePage.openMappingStepDetail("Person", "mapRelation");//
    curatePage.verifyStepDetailsOpen("mapRelation");
    browsePage.waitForSpinnerToDisappear();

    cy.log("**Validate data**");
    mappingStepDetail.validateURIInput("Person", "$URI");
    mappingStepDetail.validateMapInput("id", "SSN");
    mappingStepDetail.validateContextInput("Relation (relatedTo Person)", "/");
    mappingStepDetail.validateURIInput("Relation (relatedTo Person)", "concat('/Relation/', SSN)");
    mappingStepDetail.validateMapInput("relatedTo", "SSN");
    mappingStepDetail.getForeignIcon("relatedTo").should("exist");
    mappingStepDetail.goBackToCurateHomePage();
  });

  it("Validate session storage is working for main table", () => {

    curatePage.openMappingStepDetail("Person", "mapRelation");
    curatePage.verifyStepDetailsOpen("mapRelation");
    browsePage.waitForSpinnerToDisappear();

    cy.log("**Set values to store in session**");
    mappingStepDetail.expandPopoverColumns();
    mappingStepDetail.selectColumnPopoverById("type-checkbox-id").click();
    mappingStepDetail.relatedFilterMenu("Person");
    mappingStepDetail.selectMapRelatedEntity("Relation (relatedTo Person)-option");
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("exist");

    mappingStepDetail.expandSpecificDropdownPagination(1);
    mappingStepDetail.selectPagination("5 / page");

    cy.log("**Go to another page, back and check elements**");
    toolbar.getLoadToolbarIcon().click();
    toolbar.getCurateToolbarIcon().click();

    cy.log("**Verify and reset columns, delete relation**");
    mappingStepDetail.expandPopoverColumns();
    mappingStepDetail.verifyCheckboxPopoverState(false);
    mappingStepDetail.selectColumnPopoverById("type-checkbox-id").click();

    cy.log("**reset pagination and delete relation**");
    mappingStepDetail.verifyPaginationByIndex(1, "5 / page");
    mappingStepDetail.getPaginationByIndex(1).click();
    mappingStepDetail.selectPagination("20 / page");
    mappingStepDetail.relatedFilterSelectionDeleteIconByTitle("Relation (relatedTo Person)").click({force: true});
    mappingStepDetail.deleteConfirmationButtonYes().click();

    cy.log("**Go to another page, back and check filter**");
    mappingStepDetail.addFilterMainTable("cust", "Person");
    toolbar.getLoadToolbarIcon().click();
    toolbar.getCurateToolbarIcon().click();
    mappingStepDetail.expandFilterMainTable("Person");
    mappingStepDetail.verifyValueFilter("cust");
    mappingStepDetail.resetEntitySearch().click();

  });

  it("Create new flow, add mapping to flow, run mapping, verify results", () => {
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    runPage.createFlowButton().click();
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName("relationFlow");
    loadPage.confirmationOptions("Save").click();
    runPage.addStep("relationFlow");
    runPage.addStepToFlow("mapRelation");
    runPage.verifyStepInFlow("Mapping", "mapRelation", "relationFlow");
    runPage.runStep("mapRelation", "relationFlow");
    runPage.verifyStepRunResult("mapRelation", "success");
    cy.waitForAsyncRequest();
    // Navigate to Explore
    runPage.explorerLink("mapRelation").click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.clickSwitchToTableView();
    browsePage.waitForHCTableToLoad();

    // Verify Explore results
    browsePage.removeBaseEntity("Person");
    entitiesSidebar.getSelectedEntityText().should("contain", "All Entities");
    browsePage.getTotalDocuments().should("be.greaterThan", 13);
    entitiesSidebar.showMoreEntities().click({force: true});
    entitiesSidebar.openBaseEntityFacets("Relation");
    browsePage.getTotalDocuments().should("be.greaterThan", 7);

  });
  it("Edit advanced settings for each entity", () => {
    cy.log("**Navigate to curate page**");
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();
    curatePage.getEntityTypePanel("Person").should("exist");
    //There is a re-render happening sometimes at this point,
    //so waiting for a request will not work.
    //A hard wait of 1 sec may be needed here.

    cy.log("**Open step details for Person**");
    curatePage.getEntityTypePanel("Person").should("be.visible").click({force: true});
    curatePage.openMappingStepDetail("Person", "mapRelation");
    curatePage.verifyStepDetailsOpen("mapRelation");
    browsePage.waitForSpinnerToDisappear();
    mappingStepDetail.relatedFilterMenu("Person");
    mappingStepDetail.selectMapRelatedEntity("Relation (relatedTo Person)-option");
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("exist");
    mappingStepDetail.getEntitySettings("Person").scrollIntoView().click();
    mappingStepDetail.targetCollection().should("exist");
    mappingStepDetail.editTargetPermissions("Person", "data-hub-common,read");
    mappingStepDetail.getValidationError("Person").should("exist");
    mappingStepDetail.editTargetPermissions("Person", "data-hub-common,read,data-hub-common,update");
    mappingStepDetail.getValidationError("Person").should("not.have.text");
    cy.waitUntil(() => mappingStepDetail.getSaveSettings("Person")).click({force: true});

    mappingStepDetail.getEntitySettings("Relation").scrollIntoView().click();
    mappingStepDetail.editTargetPermissions("Relation", "data-hub-common,read,data-hub-common");
    cy.waitUntil(() => mappingStepDetail.getSaveSettings("Relation")).click({force: true});
    mappingStepDetail.getValidationError("Relation").should("exist");
    mappingStepDetail.editTargetPermissions("Relation", "data-hub-common,read");
    cy.waitUntil(() => mappingStepDetail.getSaveSettings("Relation")).click({force: true});
    mappingStepDetail.getValidationError("Relation").should("not.have.text");
    mappingStepDetail.editTargetPermissions("Relation", "data-hub-common,read,data-hub-common,update");
    cy.waitUntil(() => mappingStepDetail.getSaveSettings("Relation")).click({force: true});
    browsePage.waitForSpinnerToDisappear();
  });
  it("Delete related entity from mapping via filter", () => {
    cy.log("**Navigate to curate page**");
    cy.visit("/tiles/curate");
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    curatePage.getEntityTypePanel("Person").should("exist");
    //There is a re-render happening sometimes at this point,
    //so waiting for a request will not work.
    //A hard wait of 1 sec may be needed here.

    cy.log("**Open mapping steps for Person entity**");
    curatePage.getEntityTypePanel("Person").should("be.visible").click({force: true});
    curatePage.openMappingStepDetail("Person", "mapRelation");
    curatePage.verifyStepDetailsOpen("mapRelation");
    browsePage.waitForSpinnerToDisappear();
    cy.waitUntil(() => mappingStepDetail.relatedFilterSelection("Person", "Relation (relatedTo Person)")).should("exist");

    // Related entity exists before deletion
    cy.log("**Validate related entity exists before deletion**");
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("exist");
    mappingStepDetail.relatedFilterSelectionDeleteIcon("Person", "Relation (relatedTo Person)").click({force: true});
    mappingStepDetail.deleteConfirmationButtonYes().click({force: true});

    // Related does not exist after the deletion
    cy.log("**Validate Related entity does not exist after deletion**");
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("not.exist");
  });
  it("Delete related entity from mapping via close icon", () => {
    // Reselect deleted related entity
    mappingStepDetail.relatedFilterMenu("Person");
    mappingStepDetail.getRelatedEntityFromList("Relation (relatedTo Person)");
    mappingStepDetail.entityTitle("Person").click(); // click outside menu to close it
    // Related entity exists before deletion
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("exist");
    mappingStepDetail.relatedDeleteIcon("Relation (relatedTo Person)").scrollIntoView().click();
    mappingStepDetail.deleteConfirmationButtonYes().click({force: true});
    // Related entity does not exist after deletion
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("not.exist");
  });
  it("Reopen step and verify the deleted related entity is no longer there", () => {
    mappingStepDetail.goBackToCurateHomePage();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Person")).should("be.visible");
    //curatePage.toggleEntityTypeId("Person");
    curatePage.openMappingStepDetail("Person", "mapRelation");
    curatePage.verifyStepDetailsOpen("mapRelation");
    browsePage.waitForSpinnerToDisappear();
    //Related entity does not exist after reopening step
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("not.exist");
  });

  it("Verify page automically scrolls to top of table after pagination", () => {
    mappingStepDetail.relatedFilterMenu("Person");
    mappingStepDetail.getRelatedEntityFromList("Relation (relatedTo Person)");
    cy.get("#entityContainer").scrollTo("bottom", {ensureScrollable: false});
    mappingStepDetail.entityTitle("Person").should("not.be.visible");
    mappingStepDetail.getPaginationPageSizeOptions("person").click();
    curatePage.getPageSizeOption("10 / page").click({force: true});
    mappingStepDetail.entityTitle("Person").scrollIntoView().should("be.visible");
  });
});
