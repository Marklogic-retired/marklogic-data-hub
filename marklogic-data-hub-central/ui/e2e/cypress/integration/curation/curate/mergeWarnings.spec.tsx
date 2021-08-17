import {Application} from "../../../support/application.config";
import {toolbar, createEditStepDialog} from "../../../support/components/common";
import curatePage from "../../../support/pages/curate";
import LoginPage from "../../../support/pages/login";
import {advancedSettings} from "../../../support/components/merging/index";
import mergeRuleModal from "../../../support/components/merging/merge-rule-modal";
import mergeStrategyModal from "../../../support/components/merging/merge-strategy-modal";
import "cypress-wait-until";

const mergeStep = "merge-test";
const mergeStep1 = "merge-person";

describe("Validate Merge warnings", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });
  beforeEach(() => {
    cy.loginAsDeveloper().withRequest();
    cy.waitForAsyncRequest();
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("merging", "merge-test");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Navigate to curate tab and Open Person entity", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMergeTab("Person");
    cy.waitUntil(() => curatePage.addNewStep());
  });
  it("Creating a new merge step ", () => {
    curatePage.addNewStep().should("be.visible").click();
    createEditStepDialog.stepNameInput().type(mergeStep, {timeout: 2000});
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['match-person'])`);
    createEditStepDialog.saveButton("merging").click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(mergeStep);
  });
  it("Navigate to merge step and validate warning messages", () => {
    cy.waitUntil(() => curatePage.editStep(mergeStep).click({force: true}));
    curatePage.switchEditAdvanced().click();
    advancedSettings.setTargetCollection("onMerge", "match-person");
    advancedSettings.keepTargetCollection("onMerge");
    curatePage.saveSettings(mergeStep).click();
    curatePage.alertContent().eq(0).contains("Warning: Target Collections includes the source collection match-person");
    curatePage.alertContent().eq(0).contains("Please remove source collection from target collections");
    cy.wait(1000);
    advancedSettings.setTargetCollection("onMerge", "Person");
    advancedSettings.keepTargetCollection("onMerge");
    curatePage.switchEditAdvanced().click();
    curatePage.saveSettings(mergeStep).click();
    curatePage.alertContent().eq(0).contains("Warning: Target Collections includes the target entity type Person");
    curatePage.alertContent().eq(0).contains("Please remove target entity type from target collections");
    curatePage.alertContent().eq(1).contains("Warning: Target Collections includes the source collection match-person");
    curatePage.alertContent().eq(1).contains("Please remove source collection from target collections");
  });
  it("Click on cancel and reopen the merge step ", () => {
    curatePage.cancelSettings(mergeStep).click();
    cy.wait(1000);
    cy.waitUntil(() => curatePage.editStep(mergeStep).click({force: true}));
    curatePage.alertContent().should("not.exist");
    curatePage.switchEditAdvanced().click();
    curatePage.mergeTargetCollection("onMerge").eq(1).should("have.text", "match-person\nPerson");
    curatePage.alertContent().should("not.exist");
    curatePage.saveSettings(mergeStep).click();
    curatePage.alertContent().eq(0).contains("Warning: Target Collections includes the target entity type Person");
    curatePage.alertContent().eq(0).contains("Please remove target entity type from target collections");
    curatePage.alertContent().eq(1).contains("Warning: Target Collections includes the source collection match-person");
    curatePage.alertContent().eq(1).contains("Please remove source collection from target collections");
  });
  it("Remove the warnings one by one", () => {
    cy.findByTestId("onMerge-edit").click();
    curatePage.removeTargetCollection("Person");
    advancedSettings.keepTargetCollection("onMerge");
    curatePage.saveSettings(mergeStep).click();
    curatePage.alertContent().eq(0).contains("Warning: Target Collections includes the source collection match-person");
    curatePage.alertContent().eq(0).contains("Please remove source collection from target collections");
    cy.findByTestId("onMerge-edit").click();
    curatePage.removeTargetCollection("match-person");
    advancedSettings.keepTargetCollection("onMerge");
    curatePage.saveSettings(mergeStep).click();
    cy.wait(1000);
  });
  it("Reopen the merge settings", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMergeTab("Person");
    cy.waitUntil(() => curatePage.addNewStep());
    cy.waitUntil(() => curatePage.editStep(mergeStep).should("be.visible")).click({force: true});
    curatePage.alertContent().should("not.exist");
    curatePage.switchEditAdvanced().click();
    curatePage.alertContent().should("not.exist");
    curatePage.mergeTargetCollection("onMerge").eq(1).should("have.text", "");
    curatePage.cancelSettings(mergeStep).click();
  });
  it("Open merging step details ", () => {
    curatePage.openStepDetails(mergeStep1);
    cy.contains(mergeStep1);
  });
  it("Click on merge rule Address and validate warnings", () => {
    cy.findAllByText("Address").first().click();
    cy.get("[name=\"maxValues\"]").first().check();
    mergeRuleModal.ruleMaxValuesInput("0");
    mergeRuleModal.ruleMaxScoreInput("1");
    mergeRuleModal.saveButton();
    curatePage.alertContent().should("not.exist");
    cy.findAllByText("Address").first().click();
    cy.get("[name=\"maxValues\"]").first().check();
    mergeRuleModal.ruleMaxScoreInput("0");
    mergeRuleModal.saveButton();
    mergeRuleModal.alertContent().contains("Warning: The current merge settings might produce merged documents that are inconsistent with the entity type In the entity type Person, the property or properties Address allows only a single value. In every merge rule for the property Address set Max Values or Max Sources to 1.");
    mergeRuleModal.alertContent().contains("Please set max values for property to 1 on merge to avoid an invalid entity instance.");
    mergeRuleModal.ruleMaxValuesInput("1");
    mergeRuleModal.ruleMaxScoreInput("2");
    mergeRuleModal.saveButton();
    curatePage.alertContent().should("not.exist");
    cy.findAllByText("Address").first().click();
    cy.get("[name=\"maxValues\"]").first().check();
    mergeRuleModal.ruleMaxValuesInput("2");
    mergeRuleModal.ruleMaxScoreInput("2");
    mergeRuleModal.saveButton();
    mergeRuleModal.alertContent().contains("Warning: The current merge settings might produce merged documents that are inconsistent with the entity type In the entity type Person, the property or properties Address allows only a single value. In every merge rule for the property Address set Max Values or Max Sources to 1.");
    mergeRuleModal.alertContent().contains("Please set max values for property to 1 on merge to avoid an invalid entity instance.");
    //Will uncomment once DHFPROD-7452 is fixed
    /* mergeRuleModal.selectMergeTypeDropdown("Strategy");
    mergeRuleModal.selectStrategyName("retain-single-value");
    mergeRuleModal.saveButton();
    mergeRuleModal.alertMessage().should("have.text", "Warning: The current merge settings might produce merged documents that are inconsistent with the entity type\nIn the entity type Person, the property or properties DateOfBirth, ZipCode, id, SSN, lname, desc, fname allows only a single value.\nIn every merge rule for the property DateOfBirth, ZipCode, id, SSN, lname, desc, fname set Max Values or Max Sources to 1.");
    mergeRuleModal.alertDescription().should("have.text", "Please set max values for property to 1 on merge to avoid an invalid entity instance.");*/
    mergeRuleModal.cancelButton().click();
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMergeTab("Person");
    curatePage.openStepDetails(mergeStep1);
    cy.contains(mergeStep1);
  });
  it("Click on merge Strategy and validate warnings", () => {
    cy.findAllByText("retain-single-value").eq(0).click();
    mergeStrategyModal.strategyMaxScoreInput("1");
    mergeStrategyModal.saveButton().click();
    cy.findByText("Address").click();
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
    cy.findByText("Address").click();
    mergeRuleModal.saveButton();
    mergeRuleModal.alertContent().contains("Warning: The current merge settings might produce merged documents that are inconsistent with the entity type In the entity type Person, the property or properties Address allows only a single value. In every merge rule for the property Address set Max Values or Max Sources to 1.");
    mergeRuleModal.alertContent().contains("Please set max values for property to 1 on merge to avoid an invalid entity instance.");
    mergeRuleModal.cancelButton().click();
  });
  it("Reset values ", () => {
    cy.findAllByText("retain-single-value").eq(0).click();
    mergeStrategyModal.maxValue("1");
    mergeStrategyModal.strategyMaxScoreInput("0");
    mergeStrategyModal.saveButton().click();
    cy.findByText("Address").click();
    mergeRuleModal.selectMergeTypeDropdown("Property-specific");
    mergeRuleModal.ruleMaxValuesInput("1");
    mergeRuleModal.ruleMaxScoreInput("0");
    mergeRuleModal.saveButton();
  });
});