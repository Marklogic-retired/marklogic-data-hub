import {Application} from "../../../support/application.config";
import {multiSlider, toolbar} from "../../../support/components/common";
import {createEditStepDialog, advancedSettings} from "../../../support/components/merging/index";
import curatePage from "../../../support/pages/curate";
import {confirmYesNo} from "../../../support/components/common/index";
import "cypress-wait-until";
import mergingStepDetail from "../../../support/components/merging/merging-step-detail";
import mergeStrategyModal from "../../../support/components/merging/merge-strategy-modal";
import mergeRuleModal from "../../../support/components/merging/merge-rule-modal";
import LoginPage from "../../../support/pages/login";

const mergeStep = "mergeOrderTestStep";

describe("Merging", () => {

  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer").withRequest();
    cy.waitForAsyncRequest();
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("merging", "mergeOrderTestStep");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Navigate to curate tab and Open Order entity", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    curatePage.selectMergeTab("Order");
    cy.waitUntil(() => curatePage.addNewStep("Order"));
  });
  it("Creating a new merge step ", () => {
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
  });
  it("Validate step name is disabled, description, timestamp path and validate discard confirmation modal is displayed on click of cancel  ", () => {
    curatePage.editStep(mergeStep).click();
    createEditStepDialog.stepNameInput().should("be.disabled");
    createEditStepDialog.stepDescriptionInput().should("have.value", "merge order step example");
    createEditStepDialog.setTimestampInput().should("have.value", "/envelop/headers/createdOn");
    createEditStepDialog.stepDescriptionInput().clear().type("UPDATED - merge order step example", {timeout: 2000});
    createEditStepDialog.cancelButton("merging").click();
    confirmYesNo.getDiscardText().should("be.visible");
    confirmYesNo.getYesButton().click();
  });
  it("Check if the changes are reverted back when discarded all changes ", () => {
    curatePage.editStep(mergeStep).click();
    createEditStepDialog.stepDescriptionInput().should("not.have.value", "UPDATED - merge order step example");
  });
  it("Set Target Collection in advanced settings and click cancel ", () => {
    curatePage.switchEditAdvanced().click();
    advancedSettings.setTargetCollection("onMerge", "discardedMerged");
    advancedSettings.discardTargetCollection("onMerge");
    cy.waitUntil(() => cy.findAllByText("discardedMerged").should("have.length", 0));
    cy.findAllByText("discardedMerged").should("not.exist");
    advancedSettings.cancelSettingsButton(mergeStep).click();
    confirmYesNo.getDiscardText().should("not.exist");
  });
  it("Save Target Collection in advanced settings ", () => {
    curatePage.editStep(mergeStep).click();
    curatePage.switchEditAdvanced().click();
    advancedSettings.setTargetCollection("onMerge", "keptMerged");
    advancedSettings.keepTargetCollection("onMerge");
    cy.waitUntil(() => cy.findAllByText("keptMerged").should("have.length.gt", 0));
    cy.findAllByText("keptMerged").should("exist");
  });
  it("Validate when canceling with Target Collection changes should not display confirmation modal (DHFPROD-6660)", () => {
    advancedSettings.cancelSettingsButton(mergeStep).click();
    confirmYesNo.getDiscardText().should("not.exist");
    cy.waitForAsyncRequest();
  });
  it("Validate when clicking on cancel without changes should not display confirmation modal ", () => {
    curatePage.editStep(mergeStep).click();
    curatePage.switchEditAdvanced().click();
    //cy.findAllByText('keptMerged').should('exist');
    advancedSettings.cancelSettingsButton(mergeStep).trigger("mouseover").dblclick();
    confirmYesNo.getDiscardText().should("not.exist");
  });
  it("Open matching step details ", () => {
    curatePage.openStepDetails(mergeStep);
    cy.contains("mergeOrderTestStep");
  });
  it("Add strategy", () => {
    mergingStepDetail.addStrategyButton().click();
    mergeStrategyModal.setStrategyName("myFavourite");
    mergeStrategyModal.addSliderOptionsButton().click();
    multiSlider.getHandleName("Length").should("be.visible");
    mergeStrategyModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("myFavourite").should("have.length.gt", 0));
    cy.findByText("myFavourite").should("exist");
  });
  it("Edit strategy", () => {
    cy.findByText("myFavourite").click();
    mergeStrategyModal.setStrategyName("myFavouriteEdited");
    mergeStrategyModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("myFavouriteEdited").should("have.length.gt", 0));
    cy.findByText("myFavouriteEdited").should("exist");
  });
  it("Cancel the strategy deletion ", () => {
    mergingStepDetail.getDeleteMergeStrategyButton("myFavouriteEdited").click();
    mergingStepDetail.getDeleteStrategyText().should("be.visible");
    mergingStepDetail.cancelMergeDeleteModalButton().click();
    cy.waitUntil(() => cy.findAllByText("myFavouriteEdited").should("have.length.gt", 0));
    cy.findByText("myFavouriteEdited").should("exist");
  });
  it("Delete Strategy", () => {
    mergingStepDetail.getDeleteMergeStrategyButton("myFavouriteEdited").click();
    mergingStepDetail.confirmMergeDeleteModalButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("myFavouriteEdited").should("have.length", 0));
    cy.findByText("myFavouriteEdited").should("not.exist");
  });
  it("add merge rule of type custom ", () => {
    mergingStepDetail.addMergeRuleButton().click();
    cy.contains("Add Merge Rule");
    mergeRuleModal.selectPropertyToMerge("orderId");
    mergeRuleModal.selectMergeTypeDropdown("Custom");
    mergeRuleModal.setUriText("/custom/merge/strategy.sjs");
    mergeRuleModal.setFunctionText("customMergeFunction");
    mergeRuleModal.saveButton();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("orderId").should("have.length.gt", 0));
    cy.findByText("orderId").should("exist");
    cy.findByText("orderId").click();
  });
  it("Edit merge rule of type custom ", () => {
    mergeRuleModal.setFunctionText("customMergeFunctionEdited");
    mergeRuleModal.saveButton();
    cy.wait(3000);
    cy.waitForAsyncRequest();
    mergeRuleModal.cancelButton().click();
    cy.waitForAsyncRequest();
    //cy.wait(1000);
    //cy.findByLabelText("Yes").click();
  });
  it("Cancel merge rule deletion ", () => {
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
  it("add another strategy ", () => {
    mergingStepDetail.addStrategyButton().click();
    mergeStrategyModal.setStrategyName("myFavouriteStrategy");
    mergeStrategyModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("myFavouriteStrategy").should("have.length.gt", 0));
    cy.findByText("myFavouriteStrategy").should("exist");
  });
  it("add merge rule of type strategy ", () => {
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
  it("Edit merge rule of type strategy ", () => {
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
  it("Delete merge rule ", () => {
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
  it("add merge rule of type property-specific ", () => {
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
  it("Edit merge rule of type property-specific ", () => {
    cy.findByText("shippedDate").click();
    mergeRuleModal.selectPropertyToMerge("shipRegion");
    mergeRuleModal.saveButton();
    cy.wait(3000);
    cy.waitForAsyncRequest();
    //mergeRuleModal.cancelButton().click();
    //cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("shipRegion").should("have.length.gt", 0));
    cy.findByText("shipRegion").should("exist");
  });
  it("Cancel deletion of merge rule of type property-specific ", () => {
    mergingStepDetail.getDeleteMergeRuleButton("shipRegion").click();
    mergingStepDetail.getDeleteMergeRuleText().should("be.visible");
    mergingStepDetail.cancelMergeDeleteModalButton().click();
    cy.waitUntil(() => cy.findAllByText("shipRegion").should("have.length.gt", 0));
    cy.findByText("shipRegion").should("exist");
  });
  it("Delete merge rule of type property-specific ", () => {
    mergingStepDetail.getDeleteMergeRuleButton("shipRegion").click();
    mergingStepDetail.confirmMergeDeleteModalButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("shipRegion").should("have.length", 0));
    cy.findByText("shipRegion").should("not.exist");
  });
});
