import {Application} from "../../../support/application.config";
import {toolbar} from "../../../support/components/common";
import {advancedSettings, createEditStepDialog} from "../../../support/components/merging/index";
import curatePage from "../../../support/pages/curate";
import {confirmYesNo} from "../../../support/components/common/index";
import "cypress-wait-until";
import LoginPage from "../../../support/pages/login";

const stepName = "mapping-step";

describe("Custom step settings: ", () => {

  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer", "hub-central-custom-writer").withRequest();
    LoginPage.postLogin();
  });
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer", "hub-central-custom-writer").withRequest();
  });
  afterEach(() => {
    cy.resetTestUser();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.resetTestUser();
  });

  it("Navigate to Curate tile -> Customer entity -> custom tab", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectCustomTab("Customer");
  });

  it("Validate step name is disabled, changes are discarded on cancel", () => {
    curatePage.editStep(stepName).click();
    createEditStepDialog.stepNameInput().should("be.disabled");
    createEditStepDialog.stepDescriptionInput().should("be.enabled");
    createEditStepDialog.stepDescriptionInput().should("have.value", "This is the default mapping step");
    createEditStepDialog.stepDescriptionInput().clear().type("Test description", {timeout: 2000});
    createEditStepDialog.cancelButton("custom").click();
    confirmYesNo.getDiscardText().should("be.visible");
    confirmYesNo.getYesButton().click();

    curatePage.editStep(stepName).click();
    createEditStepDialog.stepDescriptionInput().should("have.value", "This is the default mapping step");
    createEditStepDialog.cancelButton("custom").click();
    curatePage.verifyStepNameIsVisible(stepName);
  });

  it("Changes are kept on save", () => {
    curatePage.editStep(stepName).click();
    createEditStepDialog.stepNameInput().should("be.disabled");
    createEditStepDialog.stepDescriptionInput().should("be.enabled");
    createEditStepDialog.stepDescriptionInput().should("have.value", "This is the default mapping step");
    createEditStepDialog.stepDescriptionInput().clear().type("New test description", {timeout: 2000});
    createEditStepDialog.saveButton("custom").click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(stepName);

    curatePage.editStep(stepName).click();
    createEditStepDialog.stepDescriptionInput().should("have.value", "New test description");
    createEditStepDialog.stepDescriptionInput().clear().type("This is the default mapping step", {timeout: 2000});
    createEditStepDialog.saveButton("custom").click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(stepName);
  });

  it("Verify Additional Settings saves correctly", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectCustomTab("Customer");

    // enter custom props
    curatePage.editStep(stepName).click();
    curatePage.switchEditAdvanced().click();
    advancedSettings.additionalSettingsInput().clear().type(`{{}"prop":"value", "foo":"bar"{}}`, {timeout: 2000});
    advancedSettings.saveSettingsButton(stepName).click();

    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(stepName);

    curatePage.editStep(stepName).click();
    curatePage.switchEditAdvanced().click();
    advancedSettings.additionalSettingsInput().should("contain.value", `"prop": "value"`);
    advancedSettings.additionalSettingsInput().should("contain.value", `"foo": "bar"`);

    // delete one prop.  other prop should remain
    advancedSettings.additionalSettingsInput().clear().type(`{{}"prop":"value"{}}`, {timeout: 2000});
    advancedSettings.saveSettingsButton(stepName).click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(stepName);

    curatePage.editStep(stepName).click();
    curatePage.switchEditAdvanced().click();
    advancedSettings.additionalSettingsInput().should("contain.value", `"prop": "value"`);
    advancedSettings.additionalSettingsInput().should("not.contain.value", `"foo": "bar"`);

    // clear all props
    advancedSettings.additionalSettingsInput().clear();
    advancedSettings.saveSettingsButton(stepName).click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(stepName);
  });

});
