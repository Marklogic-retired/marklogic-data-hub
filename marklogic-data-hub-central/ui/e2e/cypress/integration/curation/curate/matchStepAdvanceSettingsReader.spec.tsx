import "cypress-wait-until";
import {Application} from "../../../support/application.config";
import {
  toolbar
} from "../../../support/components/common/index";
import curatePage from "../../../support/pages/curate";
import LoginPage from "../../../support/pages/login";
import loadPage from "../../../support/pages/load";
import {
  advancedSettingsDialog
} from "../../../support/components/mapping/index";

const matchStep = "match-person";

describe("Validate Advance Settings for hub-central-match-merge-reader role", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-match-merge-reader").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-match-merge-reader").withRequest();
    cy.waitForAsyncRequest();
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Navigate to curate tab and Open Customer entity", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Person").should("be.visible"));
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMatchTab("Person");
    cy.waitUntil(() => curatePage.addNewStep("Person"));
  });
  it("Validate the default Advanced settings are disabled", () => {
    loadPage.editStepInCardView(matchStep).click({force: true});
    loadPage.switchEditAdvanced().click();
    cy.get("#sourceDatabase").invoke("attr", "class").should("contain", "ant-select-disabled");
    cy.get("#targetDatabase").invoke("attr", "class").should("contain", "ant-select-disabled");
    cy.get("div[id=\"additionalColl\"]").invoke("attr", "class").should("contain", "ant-select-disabled");
    cy.get("#targetPermissions").should("be.disabled");
    cy.get("#provGranularity").invoke("attr", "class").should("contain", "ant-select-disabled");
    cy.get("#batchSize").should("be.disabled");
    advancedSettingsDialog.toggleInterceptors();
    cy.get("#interceptors").should("be.disabled");
    advancedSettingsDialog.toggleCustomHook();
    cy.get("#customHook").should("be.disabled");
  });
  it("Validate the Advanced settings options are not displayed", () => {
    cy.get("#sourceDatabase").click();
    cy.findByTestId("sourceDbOptions-data-hub-STAGING").should("not.exist");
    cy.findByTestId("sourceDbOptions-data-hub-FINAL").should("not.exist");
    cy.get("#targetDatabase").click();
    cy.findByTestId("targetDbOptions-data-hub-STAGING").should("not.exist");
    cy.findByTestId("targetDbOptions-data-hub-FINAL").should("not.exist");
    cy.get("#provGranularity").click();
    cy.findByTestId("provOptions-Coarse-grained").should("not.exist");
    cy.findByTestId("provOptions-Fine-grained").should("not.exist");
    cy.findByTestId("provOptions-Off").should("not.exist");
  });
});
