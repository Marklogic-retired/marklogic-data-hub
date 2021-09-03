import "cypress-wait-until";
import {Application} from "../../../support/application.config";
import {
  toolbar,
  createEditStepDialog
} from "../../../support/components/common/index";
import curatePage from "../../../support/pages/curate";
import LoginPage from "../../../support/pages/login";
import loadPage from "../../../support/pages/load";
import {
  advancedSettingsDialog
} from "../../../support/components/mapping/index";

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
    cy.get("[id=\"sourceDatabase\"] [class=\"ant-select-selection-selected-value\"]").should("have.text", "data-hub-FINAL");
    cy.get("[id=\"targetDatabase\"] [class=\"ant-select-selection-selected-value\"]").should("have.text", "data-hub-FINAL");
    cy.findByText("Please add target collections").should("exist");
    loadPage.defaultCollections(matchStep).should("be.visible");
    cy.get("#targetPermissions").should("have.value", "data-hub-common,read,data-hub-common,update");
    cy.get("[id=\"provGranularity\"] [class=\"ant-select-selection-selected-value\"]").should("have.text", "Off");
    cy.get("#batchSize").should("have.value", "100");
    advancedSettingsDialog.toggleInterceptors();
    cy.get("#interceptors").should("have.text", "[]");
    advancedSettingsDialog.toggleCustomHook();
    cy.get("#customHook").should("have.text", "{}");
  });
  it("Validate the default Advanced settings are enabled", () => {
    cy.get("#sourceDatabase").invoke("attr", "class").should("contain", "ant-select-enabled");
    cy.get("#targetDatabase").invoke("attr", "class").should("contain", "ant-select-enabled");
    cy.get("div[id=\"additionalColl\"]").invoke("attr", "class").should("contain", "ant-select-enabled");
    cy.get("#targetPermissions").should("be.enabled");
    cy.get("#provGranularity").invoke("attr", "class").should("contain", "ant-select-enabled");
    cy.get("#batchSize").should("be.enabled");
    cy.get("#interceptors").should("be.enabled");
    cy.get("#customHook").should("be.enabled");
  });
  it("Validate the Advanced settings options", () => {
    cy.get("#sourceDatabase").click();
    cy.findByTestId("sourceDbOptions-data-hub-STAGING").should("exist");
    cy.findByTestId("sourceDbOptions-data-hub-FINAL").should("exist");
    cy.get("#sourceDatabase").click();
    cy.get("#targetDatabase").click();
    cy.findByTestId("targetDbOptions-data-hub-STAGING").should("exist");
    cy.findByTestId("targetDbOptions-data-hub-FINAL").should("exist");
    cy.get("#provGranularity").click();
    cy.findByTestId("provOptions-Coarse-grained").should("exist");
    cy.findByTestId("provOptions-Fine-grained").should("exist");
    cy.findByTestId("provOptions-Off").should("exist");
  });
});
