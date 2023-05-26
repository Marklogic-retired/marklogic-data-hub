import {createEditStepDialog, advancedSettings} from "../../../support/components/merging/index";
import mergeStrategyModal from "../../../support/components/merging/merge-strategy-modal";
import mergingStepDetail from "../../../support/components/merging/merging-step-detail";
import mergeRuleModal from "../../../support/components/merging/merge-rule-modal";
import {advancedSettingsDialog, mappingStepDetail} from "../../../support/components/mapping/index";
import {multiSlider} from "../../../support/components/common";
import {confirmYesNo} from "../../../support/components/common/index";
import curatePage from "../../../support/pages/curate";
import "cypress-wait-until";

const mergeStep = "mergeOrderTestStep";
const mergeStepCollection = "mergeOrderTestStepColl";
const userRoles = [
  "hub-central-flow-writer",
  "hub-central-match-merge-writer",
  "hub-central-mapping-writer",
  "hub-central-load-writer",
];

describe("Merging", () => {
  before(() => {
    cy.loginAsTestUserWithRoles(...userRoles).withRequest();
    curatePage.navigate();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("merging", "mergeOrderTestStep");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Navigate to curate tab and Open Order entity", () => {
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    curatePage.selectMergeTab("Order");
    cy.waitUntil(() => curatePage.addNewStep("Order"));
  });

  it("Creating a new merge step and verify the counter", () => {
    curatePage.addNewStep("Order").should("be.visible").click();
    createEditStepDialog.stepNameInput().type(mergeStep, {timeout: 2000});
    createEditStepDialog.stepDescriptionInput().type("merge order step example", {timeout: 2000});
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['${mergeStep}'])`);
    createEditStepDialog.setTimestampInput().type("/envelop/headers/createdOn", {timeout: 2000});
    createEditStepDialog.saveButton("merging").click();
    cy.waitForAsyncRequest();
    createEditStepDialog.cancelButton("merging").click();
    curatePage.verifyStepNameIsVisible(mergeStep);
    mappingStepDetail.verifyCountOfCards("Order", "fa-pencil-alt", "-tab-merge", "Merging");
  });

  it("Create a new match step with a collection and review the preloaded value", () => {
    curatePage.addNewStep("Order").should("be.visible").click();
    createEditStepDialog.stepNameInput().type(mergeStepCollection, {timeout: 2000});
    createEditStepDialog.stepDescriptionInput().type("merge order step example for collection", {timeout: 2000});
    createEditStepDialog.setSourceRadio("Collection");
    cy.log("**Selecting value in select component**");
    mappingStepDetail.getCollectionInputValue().click({force: true});

    cy.intercept("POST", "/api/entitySearch/facet-values?database=final").as("loadMergeSelect");
    mappingStepDetail.getCollectionInputValue().type("json");
    cy.wait("@loadMergeSelect").its("response.statusCode").should("eq", 200).then(() => {
      createEditStepDialog.getElementById("collList").should("exist").then(() => {
        createEditStepDialog.reviewSelectContent("mapCustomersWithRelatedEntitiesJSON").click();
      });
    });
    createEditStepDialog.saveButton("merging").click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible("mergeOrderTestStepColl");
    cy.log("**Reviewing preloaded value**");
    curatePage.editStep("mergeOrderTestStepColl").click();
    mappingStepDetail.getCollectionInputValue().should("have.value", "mapCustomersWithRelatedEntitiesJSON");
    createEditStepDialog.cancelButton("merging").click();
  });

  it("Validate step name is disabled, description, timestamp path and validate discard confirmation modal is displayed on click of cancel", () => {
    curatePage.editStep(mergeStep).click();
    createEditStepDialog.stepNameInput().should("be.disabled");
    createEditStepDialog.stepDescriptionInput().should("have.value", "merge order step example");
    createEditStepDialog.setTimestampInput().should("have.value", "/envelop/headers/createdOn");
    createEditStepDialog.stepDescriptionInput().clear().type("UPDATED - merge order step example", {timeout: 2000});
    createEditStepDialog.cancelButton("merging").click();
    confirmYesNo.getDiscardText().should("be.visible");
    confirmYesNo.getYesButton().click();
  });

  it("Check if the changes are reverted back when discarded all changes", () => {
    curatePage.editStep(mergeStep).click();
    createEditStepDialog.stepDescriptionInput().should("not.have.value", "UPDATED - merge order step example");
  });

  it("Set Target Collection in advanced settings and click cancel", () => {
    curatePage.switchEditAdvanced().click();
    advancedSettings.setTargetCollection("onMerge", "discardedMerged", "edit", "additional");
    advancedSettings.discardTargetCollection("onMerge");
    advancedSettings.setTargetCollection("onMerge", "discardedMerged", "remove", "remove");
    advancedSettings.discardRemovedCollections("onMerge");
    cy.waitUntil(() => cy.findAllByText("discardedMerged").should("have.length", 0));
    cy.findAllByText("discardedMerged").should("not.exist");
    advancedSettings.cancelSettingsButton(mergeStep).click();
    confirmYesNo.getDiscardText().should("not.exist");
  });

  it("Save Target Collection in advanced settings", () => {
    curatePage.editStep(mergeStep).click();
    curatePage.switchEditAdvanced().click();
    advancedSettings.setTargetCollection("onMerge", "keptMerged", "edit", "additional");
    advancedSettings.keepTargetCollection("onMerge");
    advancedSettings.setTargetCollection("onMerge", "keptMerged1", "remove", "remove");
    advancedSettings.keepRemovedCollections("onMerge");
    cy.waitUntil(() => cy.findAllByText("keptMerged").should("have.length.gt", 0));
    cy.findAllByText("keptMerged").should("exist");
  });

  it("Validate when canceling with Target Collection changes should not display confirmation modal (DHFPROD-6660)", () => {
    advancedSettings.cancelSettingsButton(mergeStep).click();
    confirmYesNo.getDiscardText().should("not.exist");
    cy.waitForAsyncRequest();
  });

  it("Validate when clicking on cancel without changes should not display confirmation modal", () => {
    curatePage.editStep(mergeStep).click();
    curatePage.switchEditAdvanced().click();
    advancedSettings.cancelSettingsButton(mergeStep).trigger("mouseover").dblclick();
    confirmYesNo.getDiscardText().should("not.exist");
  });

  it("Open matching step details", () => {
    curatePage.openStepDetails(mergeStep);
    cy.contains("mergeOrderTestStep");
  });

  it("Add strategy", () => {
    mergingStepDetail.addStrategyButton().click();
    mergeStrategyModal.setStrategyName("myFavourite");
    mergeStrategyModal.addSliderOptionsButton().click();
    mergeStrategyModal.defaultStrategyYes().click();
    multiSlider.getHandleName("Length").should("have.length.gt", 1);
    mergeStrategyModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("myFavourite").should("have.length.gt", 0));
    cy.findByText("myFavourite").should("exist");
    mergeStrategyModal.defaultStrategyIcon("myFavourite").should("exist");
  });

  it("Edit strategy", () => {
    cy.findByText("myFavourite").click();
    mergeStrategyModal.setStrategyName("myFavouriteEdited");
    mergeStrategyModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("myFavouriteEdited").should("have.length.gt", 0));
    cy.findByText("myFavouriteEdited").should("exist");

    cy.log("**To test discard changes works consistently in merge strategy dialog**");
    cy.findByText("myFavouriteEdited").click();
    mergeStrategyModal.setStrategyName("myFavouriteEditedAgain");
    mergeStrategyModal.cancelButton().click();
    cy.waitUntil(() => confirmYesNo.getDiscardText().should("be.visible"));
    cy.findByLabelText("DiscardChangesNoButton").click();

    mergeStrategyModal.maxValueOtherRadio().click();
    mergeStrategyModal.cancelButton().click();
    cy.waitUntil(() => confirmYesNo.getDiscardText().should("be.visible"));
    cy.findByLabelText("DiscardChangesNoButton").click();

    mergeStrategyModal.maxSourcesOtherRadio().click();
    cy.findByLabelText("maxSourcesOtherRadio").click();
    mergeStrategyModal.cancelButton().click();
    cy.waitUntil(() =>  confirmYesNo.getDiscardText().should("be.visible"));
    cy.findByLabelText("DiscardChangesNoButton").click();
    mergeStrategyModal.defaultStrategyNo().click();
    mergeStrategyModal.cancelButton().click();
    confirmYesNo.getDiscardText().should("be.visible");
    cy.findByLabelText("DiscardChangesYesButton").click();
  });

  it("Cancel the strategy deletion", () => {
    mergingStepDetail.getDeleteMergeStrategyButton("myFavouriteEdited").click();
    mergingStepDetail.getDeleteStrategyText().should("be.visible");
    mergingStepDetail.cancelMergeDeleteModalButton().click();
    cy.waitUntil(() => cy.findAllByText("myFavouriteEdited").should("have.length.gt", 0));
    cy.findByText("myFavouriteEdited").should("exist");
  });

  it("add merge rule of type custom", () => {
    mergingStepDetail.addMergeRuleButton().click();
    cy.contains("Add Merge Rule");
    mergeRuleModal.selectPropertyToMerge("orderId");
    cy.log("**Dropdown should be populated with Default strategy**");
    mergeRuleModal.selectMergeTypeDropdown("Strategy");
    mergeRuleModal.getStrategySelect().should("contain", "myFavouriteEdited");

    mergeRuleModal.selectMergeTypeDropdown("Custom");
    mergeRuleModal.setUriText("/custom/merge/strategy.sjs");
    mergeRuleModal.setFunctionText("customMergeFunction");
    mergeRuleModal.saveButton();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("orderId").should("have.length.gt", 0));
    cy.findByText("orderId").should("exist");
    cy.findByText("orderId").click();
  });

  it("Edit merge rule of type custom", () => {
    mergeRuleModal.setFunctionText("customMergeFunctionEdited");
    mergeRuleModal.saveButton();
    cy.wait(3000);
    cy.waitForAsyncRequest();
    mergeRuleModal.cancelButton().click();
    cy.waitForAsyncRequest();
  });

  it("Cancel merge rule deletion", () => {
    mergingStepDetail.getDeleteMergeRuleButton("orderId").click();
    mergingStepDetail.getDeleteMergeRuleText().should("be.visible");
    mergingStepDetail.cancelMergeDeleteModalButton().click();
    cy.waitUntil(() => cy.findAllByText("orderId").should("have.length.gt", 0));
    cy.findByText("orderId").should("exist");
  });

  it("Delete Rule", () => {
    mergingStepDetail.getDeleteMergeRuleButton("orderId").click();
    mergingStepDetail.confirmMergeDeleteModalButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("orderId").should("have.length", 0));
    cy.findByText("orderId").should("not.exist");
  });

  it("Delete Strategy", () => {
    mergingStepDetail.getDeleteMergeStrategyButton("myFavouriteEdited").click();
    mergingStepDetail.confirmMergeDeleteModalButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("myFavouriteEdited").should("have.length", 0));
    cy.findByText("myFavouriteEdited").should("not.exist");
  });

  it("Add another strategy", () => {
    mergingStepDetail.addStrategyButton().click();
    mergeStrategyModal.setStrategyName("myFavouriteStrategy");
    mergeStrategyModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("myFavouriteStrategy").should("have.length.gt", 0));
    cy.findByText("myFavouriteStrategy").should("exist");
  });

  it("Add merge rule of type strategy", () => {
    mergingStepDetail.addMergeRuleButton().click();
    cy.contains("Add Merge Rule");
    mergeRuleModal.selectPropertyToMerge("shipRegion");
    mergeRuleModal.selectMergeTypeDropdown("Strategy");
    mergeRuleModal.selectStrategyName("myFavouriteStrategy");
    mergeRuleModal.saveButton();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("shipRegion").should("have.length.gt", 0));
    cy.findByText("shipRegion").should("exist");
  });

  it("Edit merge rule of type strategy", () => {
    cy.findByText("shipRegion").click();
    mergeRuleModal.selectPropertyToMerge("orderId");
    mergeRuleModal.saveButton();
    cy.wait(3000);
    cy.waitForAsyncRequest();
    mergeRuleModal.cancelButton().click();
    cy.waitUntil(() => cy.findAllByText("orderId").should("have.length.gt", 0));
    cy.findByText("orderId").should("exist");
  });

  it("Cancel deletion of merge rule ", () => {
    mergingStepDetail.getDeleteMergeRuleButton("orderId").click();
    mergingStepDetail.getDeleteMergeRuleText().should("be.visible");
    mergingStepDetail.cancelMergeDeleteModalButton().click();
    cy.waitUntil(() => cy.findAllByText("orderId").should("have.length.gt", 0));
    cy.findByText("orderId").should("exist");
  });

  it("Delete merge rule", () => {
    mergingStepDetail.getDeleteMergeRuleButton("orderId").click();
    mergingStepDetail.confirmMergeDeleteModalButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("orderId").should("have.length", 0));
    cy.findByText("orderId").should("not.exist");
  });

  it("add merge rule on structured property", () => {
    mergingStepDetail.addMergeRuleButton().click();
    cy.contains("Add Merge Rule");
    mergeRuleModal.selectStructuredPropertyToMerge("address", "address > city");
    mergeRuleModal.selectMergeTypeDropdown("Strategy");
    mergeRuleModal.selectStrategyName("myFavouriteStrategy");
    mergeRuleModal.saveButton();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("address > city").should("have.length.gt", 0));
    cy.findByText("address > city").should("exist");
  });

  it("Delete merge rule on structured property", () => {
    mergingStepDetail.getDeleteMergeRuleButton("address.city").click();
    mergingStepDetail.confirmMergeDeleteModalButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("address > city").should("have.length", 0));
    cy.findByText("address > city").should("not.exist");
  });

  it("Add merge rule of type property-specific", () => {
    mergingStepDetail.addMergeRuleButton().click();
    cy.contains("Add Merge Rule");
    mergeRuleModal.selectPropertyToMerge("shippedDate");
    mergeRuleModal.selectMergeTypeDropdown("Property-specific");
    mergeRuleModal.addSliderOptionsButton().click();
    multiSlider.getHandleName("Length").should("be.visible");
    mergeRuleModal.saveButton();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("shippedDate").should("have.length.gt", 0));
    cy.findByText("shippedDate").should("exist");
  });

  it("Edit merge rule of type property-specific", () => {
    cy.findByText("shippedDate").click();
    mergeRuleModal.selectPropertyToMerge("shipRegion");
    mergeRuleModal.saveButton();
    cy.wait(3000);
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("shipRegion").should("have.length.gt", 0));
    cy.findByText("shipRegion").should("exist");

    cy.log("**To test discard changes works consistently in merge rule dialog**");
    cy.findByText("shipRegion").click();
    mergeRuleModal.maxValueOtherRadio().click();
    mergeRuleModal.cancelButton().click();
    cy.waitUntil(() => confirmYesNo.getDiscardText().should("be.visible"));
    cy.findByLabelText("DiscardChangesNoButton").click();

    mergeRuleModal.maxSourcesOtherRadio().click();
    mergeRuleModal.cancelButton().click();
    cy.waitUntil(() =>  confirmYesNo.getDiscardText().should("be.visible"));
    cy.findByLabelText("DiscardChangesYesButton").click();
  });

  it("Cancel deletion of merge rule of type property-specific", () => {
    mergingStepDetail.getDeleteMergeRuleButton("shipRegion").click();
    mergingStepDetail.getDeleteMergeRuleText().should("be.visible");
    mergingStepDetail.cancelMergeDeleteModalButton().click();
    cy.waitUntil(() => cy.findAllByText("shipRegion").should("have.length.gt", 0));
    cy.findByText("shipRegion").should("exist");
  });

  it("Delete merge rule of type property-specific", () => {
    mergingStepDetail.getDeleteMergeRuleButton("shipRegion").click();
    mergingStepDetail.confirmMergeDeleteModalButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("shipRegion").should("have.length", 0));
    cy.findByText("shipRegion").should("not.exist");
  });

  it("Check collection Typeahead request when source  database is changed", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();
    curatePage.toggleEntityTypeId("Order");
    curatePage.selectMergeTab("Order");
    curatePage.addNewStep("Order").click();
    createEditStepDialog.stepNameInput().type("testName", {timeout: 2000});

    cy.log("**verify typehead is requesting to final db**");
    cy.intercept("POST", "api/entitySearch/facet-values?database=final").as("finalRequest1");
    createEditStepDialog.setCollectionInput("ABC");
    cy.wait("@finalRequest1");

    cy.log("**verify typehead is requesting to staging db when source DB is changed**");
    createEditStepDialog.getAdvancedTab().click();
    advancedSettingsDialog.setSourceDatabase("data-hub-STAGING");
    createEditStepDialog.getBasicTab().click();
    cy.intercept("POST", "api/entitySearch/facet-values?database=staging").as("stagingRequest1");
    createEditStepDialog.setCollectionInput("D");
    cy.wait("@stagingRequest1");
    createEditStepDialog.saveButton("merging").click();

    cy.log("**verify typehead request when the step is already created**");
    curatePage.editStep("testName").should("be.visible").click({force: true});
    cy.intercept("POST", "api/entitySearch/facet-values?database=staging").as("stagingRequest2");
    createEditStepDialog.setCollectionInput("E");
    cy.wait("@stagingRequest2");
    createEditStepDialog.getAdvancedTab().click();
    advancedSettingsDialog.setSourceDatabase("data-hub-FINAL");
    createEditStepDialog.getBasicTab().click();
    cy.intercept("POST", "api/entitySearch/facet-values?database=final").as("finalRequest2");
    createEditStepDialog.setCollectionInput("F");
    cy.wait("@finalRequest2");
    createEditStepDialog.saveButton("merging").click();
    createEditStepDialog.saveButton("merging").click();
    curatePage.deleteMappingStepButton("testName").click();
    curatePage.deleteConfirmation("Yes").click();
  });
});
