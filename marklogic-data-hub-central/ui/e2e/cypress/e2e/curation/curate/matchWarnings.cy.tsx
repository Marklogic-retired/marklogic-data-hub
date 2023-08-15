import {createEditStepDialog} from "../../../support/components/common";
import curatePage from "../../../support/pages/curate";
import "cypress-wait-until";

const matchStep = "match-test";

describe("Validate Match warnings", () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
    curatePage.navigate();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("matching", "match-test");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Navigate to curate tab and Open Customer entity", () => {
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMatchTab("Person");
    curatePage.addNewStep("Person");
  });

  it("Creating a new match step", () => {
    curatePage.addNewStep("Person").should("be.visible").click();
    createEditStepDialog.stepNameInput().type(matchStep);
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['mapPersonJSON'])`);
    createEditStepDialog.saveButton("matching").click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(matchStep);
  });

  it("Navigate to match step and validate warning messages", () => {
    curatePage.editStep(matchStep).click({force: true});
    curatePage.switchEditAdvanced().click();
    curatePage.targetCollection("mapPersonJSON");
    cy.findByText("Create \"mapPersonJSON\"").click();
    curatePage.saveSettings(matchStep).click();
    curatePage.alertContent().eq(0).contains("Warning: Target Collections includes the source collection mapPersonJSON");
    curatePage.alertContent().eq(0).contains("Please remove source collection from target collections");
    curatePage.targetCollection("Person");
    cy.findByText("Create \"Person\"").click();
    curatePage.saveSettings(matchStep).click();
    curatePage.alertContent().eq(0).contains("Warning: Target Collections includes the target entity type Person");
    curatePage.alertContent().eq(0).contains("Please remove target entity type from target collections");
    curatePage.alertContent().eq(1).contains("Warning: Target Collections includes the source collection mapPersonJSON");
    curatePage.alertContent().eq(1).contains("Please remove source collection from target collections");
  });

  it("Click on cancel and reopen the match step ", () => {
    curatePage.saveSettings(matchStep).click();
    curatePage.cancelSettings(matchStep).click();
    cy.wait(1000);
    curatePage.editStep(matchStep).click({force: true});
    curatePage.alertContent().should("not.exist");
    curatePage.switchEditAdvanced().click();
    curatePage.matchTargetCollection("mapPersonJSON").should("be.visible");
    curatePage.matchTargetCollection("Person").should("be.visible");
    curatePage.alertContent().should("not.exist");
    curatePage.saveSettings(matchStep).click();
    curatePage.alertContent().eq(0).contains("Warning: Target Collections includes the target entity type Person");
    curatePage.alertContent().eq(0).contains("Please remove target entity type from target collections");
    curatePage.alertContent().eq(1).contains("Warning: Target Collections includes the source collection mapPersonJSON");
    curatePage.alertContent().eq(1).contains("Please remove source collection from target collections");
  });

  it("Remove the warnings one by one", () => {
    cy.intercept("PUT", " /api/steps/matching/match-test").as("saveStep");
    cy.intercept("GET", " /api/steps/custom").as("loadSteps");
    curatePage.removeTargetCollection("Person");
    curatePage.switchEditBasic().click();
    curatePage.switchEditAdvanced().click();
    curatePage.saveSettings(matchStep).click();
    cy.wait("@saveStep");
    cy.wait("@loadSteps");
    curatePage.alertContent().eq(0).contains("Warning: Target Collections includes the source collection mapPersonJSON");
    curatePage.alertContent().eq(0).contains("Please remove source collection from target collections");
    curatePage.removeTargetCollection("mapPersonJSON");
    curatePage.switchEditBasic().click();
    curatePage.switchEditAdvanced().click();
    curatePage.saveSettings(matchStep).click();
    cy.wait("@saveStep");
    cy.wait("@loadSteps");
    curatePage.addNewStep("Person");
    curatePage.editStep(matchStep).click({force: true});
    curatePage.alertContent().should("not.exist");
    curatePage.switchEditAdvanced().click();
    curatePage.alertContent().should("not.exist");
    curatePage.getAdditionalCollSelectWrapper().findByText("mapPersonJSON").should("not.exist");
    curatePage.getAdditionalCollSelectWrapper().findByText("Person").should("not.exist");
  });
});