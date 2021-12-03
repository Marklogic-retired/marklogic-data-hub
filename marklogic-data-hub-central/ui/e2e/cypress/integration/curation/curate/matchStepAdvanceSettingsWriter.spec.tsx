import "cypress-wait-until";
import {Application} from "../../../support/application.config";
import {
  toolbar,
  createEditStepDialog
} from "../../../support/components/common/index";
import curatePage from "../../../support/pages/curate";
import LoginPage from "../../../support/pages/login";
import loadPage from "../../../support/pages/load";
import {advancedSettings} from "../../../support/components/common/index";

const matchStep = "matchCustomerTesting";

describe("Validate Advance Settings for hub-central-match-merge-writer role", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-match-merge-writer").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-match-merge-writer").withRequest();
    cy.waitForAsyncRequest();
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("matching", "matchCustomerTesting");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Navigate to curate tab and Open Customer entity", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMatchTab("Customer");
    cy.waitUntil(() => curatePage.addNewStep("Customer"));
  });
  it("Creating a new match step", () => {
    curatePage.addNewStep("Customer").should("be.visible").click();
    createEditStepDialog.stepNameInput().type(matchStep);
    createEditStepDialog.stepDescriptionInput().type("match customer step example", {timeout: 2000});
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['${matchStep}'])`);
    createEditStepDialog.saveButton("matching").click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(matchStep);
  });
  it("Validate the default Advanced settings values", () => {
    loadPage.editStepInCardView(matchStep).click({force: true});
    loadPage.switchEditAdvanced().click();
    advancedSettings.getSourceDatabaseSelectWrapper().should("have.text", "data-hub-FINAL");
    advancedSettings.getTargetDatabaseSelectWrapper().should("have.text", "data-hub-FINAL");
    advancedSettings.getAdditionalCollSelectWrapper().should("have.text", "Please add target collections");
    loadPage.defaultCollections(matchStep).should("be.visible");
    advancedSettings.getTargetPermissions().should("have.value", "data-hub-common,read,data-hub-common,update");
    advancedSettings.getProvGranularitySelectWrapper().should("have.text", "Off");
    advancedSettings.getBatchSize().should("have.value", "100");
    advancedSettings.toggleInterceptors();
    advancedSettings.getInterceptors().should("have.text", "[]");
    advancedSettings.toggleCustomHook();
    advancedSettings.getCustomHook().should("have.text", "{}");
  });
  it("Validate the default Advanced settings are enabled", () => {
    advancedSettings.getSourceDatabaseSelectInput().should("not.have.attr", "disabled");
    advancedSettings.getTargetDatabaseSelectInput().should("not.have.attr", "disabled");
    advancedSettings.getAdditionalCollSelectInput().should("not.have.attr", "disabled");
    advancedSettings.getTargetPermissions().should("be.enabled");
    advancedSettings.getProvGranularitySelectInput().should("not.have.attr", "disabled");
    advancedSettings.getBatchSize().should("be.enabled");
    advancedSettings.getInterceptors().should("be.enabled");
    advancedSettings.getCustomHook().should("be.enabled");
  });
  it("Validate the Advanced settings options", () => {
    advancedSettings.getSourceDatabaseSelectWrapper().click();
    advancedSettings.getSourceDatabaseSelectMenuList().should("contain.text", "data-hub-STAGING");
    advancedSettings.getSourceDatabaseSelectMenuList().should("contain.text", "data-hub-FINAL");
    advancedSettings.getSourceDatabaseSelectWrapper().click();
    advancedSettings.getTargetDatabaseSelectWrapper().click();
    advancedSettings.getTargetDatabaseSelectMenuList().should("contain.text", "data-hub-STAGING");
    advancedSettings.getTargetDatabaseSelectMenuList().should("contain.text", "data-hub-FINAL");
    advancedSettings.getTargetDatabaseSelectWrapper().click();
    advancedSettings.getProvGranularitySelectWrapper().click();
    advancedSettings.getProvGranularitySelectMenuList().should("contain.text", "Coarse-grained");
    advancedSettings.getProvGranularitySelectMenuList().should("contain.text", "Fine-grained");
    advancedSettings.getProvGranularitySelectMenuList().should("contain.text", "Off");
    advancedSettings.getProvGranularitySelectWrapper().click();
  });
});
