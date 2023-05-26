import {advancedSettings, createEditStepDialog} from "../../../support/components/merging/index";
import {mappingStepDetail} from "../../../support/components/mapping/index";
import {confirmYesNo} from "../../../support/components/common/index";
import curatePage from "../../../support/pages/curate";

import "cypress-wait-until";

const stepName = "mapping-step";
const userRoles = [
  "hub-central-flow-writer",
  "hub-central-match-merge-writer",
  "hub-central-mapping-writer",
  "hub-central-load-writer",
  "hub-central-custom-writer"
];

describe("Custom step settings", () => {
  before(() => {
    cy.loginAsTestUserWithRoles(...userRoles).withRequest();
    curatePage.navigate();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
  });

  it("Validate step name is disabled, changes are discarded on cancel", () => {
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectCustomTab("Customer");
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

  it("Changes are kept on save and verify counter", () => {
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
    mappingStepDetail.verifyCountOfCards("Customer", "fa-cog", "-tab-custom", "Custom");
  });

  it("Verify Additional Settings saves correctly", () => {
    cy.log("**Open Customer entity**");
    curatePage.navigate();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.selectCustomTab("Customer");

    cy.log("**Enter custom properties**");
    curatePage.editStep(stepName).click();
    curatePage.switchEditAdvanced().click();
    advancedSettings.additionalSettingsInput().clear().type(`{{}"prop":"value", "foo":"bar"{}}`, {timeout: 2000});
    advancedSettings.saveSettingsButton(stepName).click();

    cy.log("**Verify step names are visible**");
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(stepName);

    curatePage.editStep(stepName).click();
    curatePage.switchEditAdvanced().click();
    advancedSettings.additionalSettingsInput().should("contain.value", `"prop": "value"`);
    advancedSettings.additionalSettingsInput().should("contain.value", `"foo": "bar"`);

    cy.log("One Prop deleted. Other prop should remain");
    advancedSettings.additionalSettingsInput().clear().type(`{{}"prop":"value"{}}`, {timeout: 2000});
    advancedSettings.saveSettingsButton(stepName).click();
    cy.waitForAsyncRequest();

    curatePage.verifyStepNameIsVisible(stepName);

    curatePage.editStep(stepName).click();
    curatePage.switchEditAdvanced().click();
    advancedSettings.additionalSettingsInput().should("contain.value", `"prop": "value"`);
    advancedSettings.additionalSettingsInput().should("not.contain.value", `"foo": "bar"`);

    cy.log("Clear all props");
    advancedSettings.additionalSettingsInput().clear();
    advancedSettings.saveSettingsButton(stepName).click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(stepName);
  });
});
