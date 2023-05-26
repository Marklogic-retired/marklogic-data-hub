import {advancedSettings} from "../../../support/components/common/index";
import curatePage from "../../../support/pages/curate";
import loadPage from "../../../support/pages/load";
import "cypress-wait-until";
const matchStep = "match-person";

describe("Validate Advance Settings for hub-central-match-merge-reader role", () => {
  before(() => {
    cy.loginAsTestUserWithRoles("hub-central-match-merge-reader").withRequest();
    curatePage.navigate();
  });

  it("Navigate to curate tab and Open Customer entity", () => {
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
