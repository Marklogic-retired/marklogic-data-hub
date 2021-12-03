import "cypress-wait-until";
import {Application} from "../../../support/application.config";
import {
  toolbar
} from "../../../support/components/common/index";
import curatePage from "../../../support/pages/curate";
import LoginPage from "../../../support/pages/login";
import loadPage from "../../../support/pages/load";
import {advancedSettings} from "../../../support/components/common/index";

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
    advancedSettings.getSourceDatabaseSelectInput().should("be.disabled");
    advancedSettings.getTargetDatabaseSelectInput().should("be.disabled");
    advancedSettings.getAdditionalCollSelectInput().should("be.disabled");
    advancedSettings.getTargetPermissions().should("be.disabled");
    advancedSettings.getProvGranularitySelectInput().should("be.disabled");
    advancedSettings.getBatchSize().should("be.disabled");
    advancedSettings.toggleInterceptors();
    advancedSettings.getInterceptors().should("be.disabled");
    advancedSettings.toggleCustomHook();
    advancedSettings.getCustomHook().should("be.disabled");
  });
  it("Validate the Advanced settings options are not displayed", () => {
    advancedSettings.getSourceDatabaseSelectWrapper().click({force: true});
    advancedSettings.getAdditionalCollSelectMenuList().should("not.exist");
    advancedSettings.getTargetDatabaseSelectWrapper().click({force: true});
    advancedSettings.getTargetDatabaseSelectMenuList().should("not.exist");
    advancedSettings.getProvGranularitySelectWrapper().click({force: true});
    advancedSettings.getProvGranularitySelectMenuList().should("not.exist");
  });
});
