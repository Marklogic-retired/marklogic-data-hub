import mergeStrategyModal from "../../../support/components/merging/merge-strategy-modal";
import mergeRuleModal from "../../../support/components/merging/merge-rule-modal";
import {createEditStepDialog} from "../../../support/components/common";
import {advancedSettings} from "../../../support/components/merging/index";
import curatePage from "../../../support/pages/curate";
import "cypress-wait-until";

const mergeStep = "merge-test";
const mergeStep1 = "merge-person";

describe("Validate Merge warnings", () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
    curatePage.navigate();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("merging", "merge-test");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Navigate to curate tab and Open Person entity", () => {
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMergeTab("Person");
    curatePage.addNewStep("Person");
  });

  it("Creating a new merge step ", () => {
    curatePage.addNewStep("Person").should("be.visible").click();
    createEditStepDialog.stepNameInput().type(mergeStep, {timeout: 2000});
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['match-person'])`);
    createEditStepDialog.saveButton("merging").click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(mergeStep);
  });

  it("Navigate to merge step and validate warning messages", () => {
    curatePage.editStep(mergeStep).click({force: true});
    cy.waitForAsyncRequest();
    curatePage.switchEditAdvanced().click();
    advancedSettings.setTargetCollection("onMerge", "match-person", "edit", "additional");
    advancedSettings.keepTargetCollection("onMerge");
    curatePage.saveSettings(mergeStep).click();
    cy.waitForAsyncRequest();
    curatePage.alertContentAriaLabel("Warning: Target Collections includes the source collection match-person").should("exist");
    curatePage.alertContentAriaLabel("Warning: Target Collections includes the source collection match-person").should("contain", "Please remove source collection from target collections");
    cy.wait(1000);
    advancedSettings.setTargetCollection("onMerge", "Person", "edit", "additional");
    advancedSettings.keepTargetCollection("onMerge");
    cy.wait(500);
    curatePage.switchEditAdvanced().click();
    curatePage.saveSettings(mergeStep).click();
    cy.waitForAsyncRequest();
    curatePage.alertContentAriaLabel("Warning: Target Collections includes the target entity type Person").should("exist");
    curatePage.alertContentAriaLabel("Warning: Target Collections includes the target entity type Person").should("contain", "Please remove target entity type from target collections");
    curatePage.alertContentAriaLabel("Warning: Target Collections includes the source collection match-person").should("exist");
    curatePage.alertContentAriaLabel("Warning: Target Collections includes the source collection match-person").should("contain", "Please remove source collection from target collections");
  });

  it("Click on cancel and reopen the merge step", () => {
    curatePage.cancelSettings(mergeStep).click();
    cy.wait(1000);
    curatePage.editStep(mergeStep).click({force: true});
    curatePage.alertContent().should("not.exist");
    curatePage.switchEditAdvanced().click();
    curatePage.mergeTargetCollection("onMerge").eq(1).should("have.text", "match-person\nPerson");
    curatePage.alertContent().should("not.exist");
    curatePage.saveSettings(mergeStep).click();
    cy.waitForAsyncRequest();
    curatePage.alertContentAriaLabel("Warning: Target Collections includes the target entity type Person").should("exist");
    curatePage.alertContentAriaLabel("Warning: Target Collections includes the target entity type Person").should("contain", "Please remove target entity type from target collections");
    curatePage.alertContentAriaLabel("Warning: Target Collections includes the source collection match-person").should("exist");
    curatePage.alertContentAriaLabel("Warning: Target Collections includes the source collection match-person").should("contain", "Please remove source collection from target collections");
  });

  it("Remove the warnings one by one", () => {
    cy.findByTestId("onMerge-edit").click();
    curatePage.getExistingFlowFromDropdown_OldWay("Person");
    cy.wait(1000);
    advancedSettings.keepTargetCollection("onMerge");
    cy.wait(1000);
    curatePage.saveSettings(mergeStep).click();
    curatePage.editStep(mergeStep).click({force: true});
    curatePage.alertContentAriaLabel("Warning: Target Collections includes the source collection match-person").should("exist");
    curatePage.alertContentAriaLabel("Warning: Target Collections includes the source collection match-person").should("contain", "Please remove source collection from target collections");
    cy.findByTestId("onMerge-edit").click();
    // the next line also finds the remove button
    curatePage.getExistingFlowFromDropdown_OldWay("match-person");
    advancedSettings.keepTargetCollection("onMerge");
    curatePage.saveSettings(mergeStep).click().then(() => {
      cy.waitForAsyncRequest();
      curatePage.alertContentAriaLabel("Warning: Target Collections includes the source collection match-person").should("not.exist");
    });
  });

  it("Reopen the merge settings", () => {
    curatePage.navigate();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.getEntityTypePanel("Person").then(($ele) => {
      if ($ele.hasClass("accordion-button collapsed")) {
        cy.log("**Toggling Entity because it was closed.**");
        curatePage.toggleEntityTypeId("Person");
      }
    });
    curatePage.selectMergeTab("Person");
    curatePage.addNewStep("Person");
    curatePage.editStep(mergeStep).should("be.visible").click({force: true});
    curatePage.alertContent().should("not.exist");
    curatePage.switchEditAdvanced().click();
    curatePage.alertContent().should("not.exist");
    curatePage.mergeTargetCollection("onMerge").eq(1).should("have.text", "");
    curatePage.cancelSettings(mergeStep).click();
  });

  it("Open merging step details", () => {
    curatePage.openStepDetails(mergeStep1);
    cy.contains(mergeStep1);
  });

  it("Click on merge rule Address and validate warnings", () => {
    mergeRuleModal.mergeRuleClick("Address");
    cy.get("[name=\"maxValues\"]").first().check();
    mergeRuleModal.ruleMaxValuesInput("0");
    mergeRuleModal.ruleMaxScoreInput("1");
    mergeRuleModal.saveButton();
    curatePage.alertContent().should("not.exist");
    mergeRuleModal.mergeRuleClick("Address");
    cy.get("[name=\"maxValues\"]").first().check();
    mergeRuleModal.ruleMaxScoreInput("0");
    mergeRuleModal.saveButton();
    mergeRuleModal.alertContent().contains("Warning: The current merge settings might produce merged documents that are inconsistent with the entity type In the entity type Person, the property or properties Address allows only a single value. In every merge rule for the property Address set Max Values or Max Sources to 1.");
    mergeRuleModal.alertContent().contains("Please set max values for property to 1 on merge to avoid an invalid entity instance.");
    mergeRuleModal.ruleMaxValuesInput("1");
    mergeRuleModal.ruleMaxScoreInput("2");
    mergeRuleModal.saveButton();
    curatePage.alertContent().should("not.exist");
    mergeRuleModal.mergeRuleClick("Address");
    cy.get("[name=\"maxValues\"]").first().check();
    mergeRuleModal.ruleMaxValuesInput("2");
    mergeRuleModal.ruleMaxScoreInput("2");
    mergeRuleModal.saveButton();
    mergeRuleModal.alertContent().contains("Warning: The current merge settings might produce merged documents that are inconsistent with the entity type In the entity type Person, the property or properties Address allows only a single value. In every merge rule for the property Address set Max Values or Max Sources to 1.");
    mergeRuleModal.alertContent().contains("Please set max values for property to 1 on merge to avoid an invalid entity instance.");
    mergeRuleModal.cancelButton().click();
  });

  it("Click on merge Strategy and validate warnings", () => {
    cy.findAllByText("retain-single-value").eq(0).click();
    mergeStrategyModal.strategyMaxScoreInput("1");
    mergeStrategyModal.saveButton().click();
    mergeRuleModal.mergeRuleClick("Address");
    mergeRuleModal.alertContent().should("not.exist");
    mergeRuleModal.saveButton();
    mergeRuleModal.alertContent().contains("Warning: The current merge settings might produce merged documents that are inconsistent with the entity type In the entity type Person, the property or properties Address allows only a single value. In every merge rule for the property Address set Max Values or Max Sources to 1.");
    mergeRuleModal.alertContent().contains("Please set max values for property to 1 on merge to avoid an invalid entity instance.");
    mergeRuleModal.cancelButton().click();
    cy.findAllByText("retain-single-value").eq(0).click();
    mergeStrategyModal.maxValue("2");
    mergeStrategyModal.strategyMaxScoreInput("2");
    mergeStrategyModal.saveButton().click();
    cy.wait(1000);
    mergeRuleModal.mergeRuleClick("Address");
    mergeRuleModal.saveButton();
    mergeRuleModal.alertContent().contains("Warning: The current merge settings might produce merged documents that are inconsistent with the entity type In the entity type Person, the property or properties Address allows only a single value. In every merge rule for the property Address set Max Values or Max Sources to 1.");
    mergeRuleModal.alertContent().contains("Please set max values for property to 1 on merge to avoid an invalid entity instance.");
    mergeRuleModal.cancelButton().click();
  });

  it("Reset values", () => {
    cy.findAllByText("retain-single-value").eq(0).click();
    mergeStrategyModal.maxValue("1");
    mergeStrategyModal.strategyMaxScoreInput("0");
    mergeStrategyModal.saveButton().click();
    mergeRuleModal.mergeRuleClick("Address");
    mergeRuleModal.selectMergeTypeDropdown("Property-specific");
    mergeRuleModal.ruleMaxValuesInput("1");
    mergeRuleModal.ruleMaxScoreInput("0");
    mergeRuleModal.saveButton();
  });
});
