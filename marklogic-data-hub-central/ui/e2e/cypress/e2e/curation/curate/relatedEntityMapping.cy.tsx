import entitiesSidebar from "../../../support/pages/entitiesSidebar";
import curatePage from "../../../support/pages/curate";
import browsePage from "../../../support/pages/browse";
import modelPage from "../../../support/pages/model";
import loadPage from "../../../support/pages/load";
import runPage from "../../../support/pages/run";
import "cypress-wait-until";

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

const userRoles = [
  "hub-central-flow-writer",
  "hub-central-mapping-writer",
  "hub-central-load-writer",
  "hub-central-entity-model-writer",
  "hub-central-saved-query-user"
];

describe("Mapping", () => {
  before(() => {
    cy.loginAsTestUserWithRoles(...userRoles).withRequest();
    modelPage.navigate();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("mapping", "mapRelation");
    cy.deleteEntities("Relation");
    cy.deleteEntities("TestEntity");
    cy.deleteFlows("relationFlow");
    cy.deleteRecordsInFinal("mapRelation");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Define new entity, add relationship property", {defaultCommandTimeout: 120000}, () => {
    modelPage.switchTableView();
    entityTypeTable.waitForTableToLoad();
    modelPage.getAddButton().should("be.visible").click({force: true});
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});
    entityTypeModal.newEntityName("Relation");
    entityTypeModal.getAddButton().click();
    propertyTable.getAddPropertyButton("Relation").scrollIntoView().should("be.visible").click();
    propertyModal.newPropertyName("relatedTo");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity");
    propertyModal.getCascadedTypeFromDropdown("Person");
    propertyModal.openForeignKeyDropdown();
    propertyModal.getForeignKey("id").click({force: true});
    propertyModal.getSubmitButton().click();
    cy.waitForAsyncRequest();
    cy.wait(1000);
    cy.publishDataModel();
    propertyTable.getForeignIcon("relatedTo").should("exist");
  });

  it("Create new entity and check if there is no message in curate tile", {defaultCommandTimeout: 120000}, () => {
    modelPage.navigate();
    modelPage.switchTableView();
    entityTypeTable.waitForTableToLoad();
    cy.waitUntil(() => modelPage.getAddButton()).click({force: true});
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});
    entityTypeModal.newEntityName("TestEntity");
    entityTypeModal.getAddButton().click();
    cy.waitForAsyncRequest();
    cy.wait(1000);

    cy.publishDataModel();
    curatePage.navigate();
    cy.waitUntil(() => curatePage.getEntityTypePanel("TestEntity")).should("be.visible");
    curatePage.getEntityTypePanel("TestEntity").should("exist");
    curatePage.toggleEntityTypeId("TestEntity");
    cy.contains("This functionality is not implemented yet.").should("not.exist");
  });

  it("Create new mapping in Curate", {defaultCommandTimeout: 120000}, () => {
    curatePage.navigate();
    curatePage.getEntityTypePanel("Person").should("be.visible");
    curatePage.toggleEntityTypeId("Person");
    curatePage.addNewStep("Person").should("be.visible").click();
    createEditMappingDialog.setMappingName("mapRelation");
    createEditMappingDialog.setSourceRadio("Query");
    createEditMappingDialog.setQueryInput(`cts.collectionQuery(['loadPersonJSON'])`);
    createEditMappingDialog.saveButton().click({force: true});
    curatePage.verifyStepDetailsOpen("mapRelation");
    browsePage.waitForSpinnerToDisappear();
    mappingStepDetail.dataAvailable().should("be.visible");
    mappingStepDetail.entityTitle("Person").should("exist");
  });

  it("Verify related entities in mapping details with defaults", {defaultCommandTimeout: 120000}, () => {
    mappingStepDetail.XPathInfoIcon();
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("not.exist");
    mappingStepDetail.relatedFilterMenu("Person");
    mappingStepDetail.getRelatedEntityFromList("Relation (relatedTo Person)");
    mappingStepDetail.relatedInfoIcon();
    mappingStepDetail.entityTitle("Person").click();
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("exist");
    mappingStepDetail.validateContextInput("Relation (relatedTo Person)", "/");
    mappingStepDetail.validateURIInput("Person", "$URI");
    mappingStepDetail.validateURIInput("Relation (relatedTo Person)", "hubURI('Relation')");

    mappingStepDetail.verifySourceFieldTooltip("Person");
    mappingStepDetail.verifyFunctionTooltip("URI");
    mappingStepDetail.verifyReferenceTooltip("Person");
  });

  it("Add and test mapping expressions with related entities", {defaultCommandTimeout: 120000}, () => {
    mappingStepDetail.setXpathExpressionInput("id", "SSN");
    mappingStepDetail.entityTitle("Person").click();
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
    cy.log("**Test expressions**");
    mappingStepDetail.testMap().should("be.enabled");
    mappingStepDetail.testMap().click({force: true});
    cy.waitForAsyncRequest();
    mappingStepDetail.validateMapValue("Person", "id", "444-44-4440");
    mappingStepDetail.validateMapValueString("Relation (relatedTo Person)", "relatedTo", "444-44-4440");
    mappingStepDetail.validateMapURIValue("Relation (relatedTo Person)", "/Relation/444-44-4440.j...");
  });

  it("Reload page and navigate to mapping details, verify persistence of expressions", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();

    cy.log("**Open Person mapping step details**");
    curatePage.getEntityTypePanel("Person").then(($ele) => {
      if ($ele.hasClass("accordion-button collapsed")) {
        cy.log("**Toggling Entity because it was closed.**");
        curatePage.toggleEntityTypeId("Person");
      }
    });
    curatePage.openMappingStepDetail("Person", "mapRelation");
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
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();

    cy.log("**Go to another page, back and check elements**");
    loadPage.navigate();
    curatePage.navigate();

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
    loadPage.navigate();
    curatePage.navigate();
    mappingStepDetail.expandFilterMainTable("Person");
    mappingStepDetail.verifyValueFilter("cust");
    mappingStepDetail.resetEntitySearch().click();
  });

  it("Create new flow, add mapping to flow, run mapping, verify results", () => {
    runPage.navigate();
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

    runPage.explorerLink("mapRelation").click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.clickTableView();
    browsePage.waitForHCTableToLoad();

    browsePage.removeBaseEntity("Person");
    entitiesSidebar.getSelectedEntityText().should("contain", "All Entities");
    browsePage.getTotalDocuments().should("be.greaterThan", 13);
    entitiesSidebar.showMoreEntities().click({force: true});
    entitiesSidebar.openBaseEntityFacets("Relation");
    browsePage.getTotalDocuments().should("be.greaterThan", 7);
  });

  it("Edit advanced settings for each entity", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();

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
    mappingStepDetail.getSaveSettings("Person").should("be.visible").click({force: true});

    mappingStepDetail.getEntitySettings("Relation").scrollIntoView().click();
    mappingStepDetail.editTargetPermissions("Relation", "data-hub-common,read,data-hub-common");
    mappingStepDetail.getSaveSettings("Relation").should("be.visible").click({force: true});
    mappingStepDetail.getValidationError("Relation").should("exist");
    mappingStepDetail.editTargetPermissions("Relation", "data-hub-common,read");
    mappingStepDetail.getSaveSettings("Relation").should("be.visible").click({force: true});
    mappingStepDetail.getValidationError("Relation").should("not.have.text");
    mappingStepDetail.editTargetPermissions("Relation", "data-hub-common,read,data-hub-common,update");
    mappingStepDetail.getSaveSettings("Relation").should("be.visible").click({force: true});
    browsePage.waitForSpinnerToDisappear();
  });

  it("Delete related entity from mapping via filter", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();

    curatePage.getEntityTypePanel("Person").should("be.visible").click({force: true});
    curatePage.openMappingStepDetail("Person", "mapRelation");
    curatePage.verifyStepDetailsOpen("mapRelation");
    browsePage.waitForSpinnerToDisappear();
    mappingStepDetail.relatedFilterSelection("Person", "Relation (relatedTo Person)").should("exist");

    cy.log("**Validate related entity exists before deletion**");
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("exist");
    mappingStepDetail.relatedFilterSelectionDeleteIcon("Person", "Relation (relatedTo Person)").click({force: true});
    mappingStepDetail.deleteConfirmationButtonYes().click({force: true});

    cy.log("**Validate Related entity does not exist after deletion**");
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("not.exist");
  });

  it("Delete related entity from mapping via close icon", () => {
    mappingStepDetail.mapRelatedEntities("Person").invoke("attr", "aria-expanded").then(($ele) => {
      if ($ele === "false") {
        mappingStepDetail.relatedFilterMenu("Person");
      }
    });
    mappingStepDetail.getRelatedEntityFromList("Relation (relatedTo Person)");
    mappingStepDetail.entityTitle("Person").click();
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("exist");
    mappingStepDetail.relatedDeleteIcon("Relation (relatedTo Person)").scrollIntoView().click();
    mappingStepDetail.deleteConfirmationButtonYes().click({force: true});
    mappingStepDetail.entityTitle("Relation (relatedTo Person)").should("not.exist");
  });

  it("Reopen step and verify the deleted related entity is no longer there", () => {
    mappingStepDetail.goBackToCurateHomePage();
    curatePage.getEntityTypePanel("Person").should("be.visible");
    curatePage.openMappingStepDetail("Person", "mapRelation");
    curatePage.verifyStepDetailsOpen("mapRelation");
    browsePage.waitForSpinnerToDisappear();
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
