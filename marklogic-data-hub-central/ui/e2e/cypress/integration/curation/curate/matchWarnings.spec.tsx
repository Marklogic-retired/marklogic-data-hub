import {Application} from "../../../support/application.config";
import {toolbar, createEditStepDialog} from "../../../support/components/common";
import curatePage from "../../../support/pages/curate";
import LoginPage from "../../../support/pages/login";
import "cypress-wait-until";

const matchStep = "match-test";

describe("Validate Match warnings", () => {
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
    cy.deleteSteps("matching", "match-test");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Navigate to curate tab and Open Customer entity", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMatchTab("Person");
    cy.waitUntil(() => curatePage.addNewStep());
  });
  it("Creating a new match step", () => {
    curatePage.addNewStep().should("be.visible").click();
    createEditStepDialog.stepNameInput().type(matchStep);
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['mapPersonJSON'])`);
    createEditStepDialog.saveButton("matching").click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(matchStep);
  });
  it("Navigate to match step and validate warning messages", () => {
    cy.waitUntil(() => curatePage.editStep(matchStep).click({force: true}));
    curatePage.switchEditAdvanced().click();
    curatePage.targetCollection("mapPersonJSON");
    curatePage.targetCollectionDropdown();
    curatePage.saveSettings(matchStep).click();
    curatePage.alertContent().eq(0).contains("Warning: Target Collections includes the source collection mapPersonJSON");
    curatePage.alertContent().eq(0).contains("Please remove source collection from target collections");
    curatePage.targetCollection("Person");
    cy.wait(1000);
    cy.get("div[id=\"additionalColl\"]").type("{enter}");
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
    cy.waitUntil(() => curatePage.editStep(matchStep).click({force: true}));
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
    curatePage.removeTargetCollection("Person");
    curatePage.saveSettings(matchStep).click();
    curatePage.alertContent().eq(0).contains("Warning: Target Collections includes the source collection mapPersonJSON");
    curatePage.alertContent().eq(0).contains("Please remove source collection from target collections");
    curatePage.removeTargetCollection("mapPersonJSON");
    curatePage.saveSettings(matchStep).click();
    cy.wait(1000);
    cy.waitUntil(() => curatePage.addNewStep());
    cy.waitUntil(() => curatePage.editStep(matchStep).click({force: true}));
    curatePage.alertContent().should("not.exist");
    curatePage.switchEditAdvanced().click();
    curatePage.alertContent().should("not.exist");
    curatePage.matchTargetCollection("mapPersonJSON").should("not.exist");
    curatePage.matchTargetCollection("Person").should("not.exist");
  });
});