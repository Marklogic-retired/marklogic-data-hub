import {toolbar} from "../../../support/components/common";
import LoginPage from "../../../support/pages/login";
import loadPage from "../../../support/pages/load";
import "cypress-wait-until";

describe("Load Page validations", () => {
  const stepName = "testCYLoadStep";

  before(() => {
    cy.loginAsDeveloper().withRequest();
    LoginPage.navigateToMainPage();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => loadPage.stepName("ingestion-step").should("be.visible"));
  });

  after(() => {
    cy.deleteSteps("ingestion", stepName);
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Creates a step and edits it", {defaultCommandTimeout: 120000}, () => {
    toolbar.getLoadToolbarIcon().click();
    loadPage.addNewButton("card").click();
    loadPage.stepNameInput().type(stepName);
    loadPage.stepDescriptionInput().type("cyTestDesc");
    loadPage.selectSourceFormat("Delimited Text (CSV, TSV, etc.)");
    loadPage.selectTargetFormat("XML");
    loadPage.uriPrefixInput().type("/e2eCSV/");
    loadPage.stepSourceNameInput().type("testing");
    loadPage.stepSourceNameType().type("custom");
    loadPage.saveButton().click();
    cy.waitForAsyncRequest();
    cy.findByText(stepName).should("be.visible");

    cy.waitUntil(() => loadPage.stepName(stepName).should("be.visible"));

    loadPage.editStepInCardView(stepName).click();
    loadPage.stepNameInput().should("have.value", stepName);
    loadPage.stepDescriptionInput().should("have.value", "cyTestDesc");
    loadPage.stepSourceNameInput().should("have.value", "testing");
    loadPage.stepSourceNameType().should("have.value", "custom");
    loadPage.stepSourceNameInput().clear().type("newValue");
    loadPage.stepSourceNameType().clear().type("otherNewValue");
    loadPage.saveButton().click();
    cy.waitForAsyncRequest();

    loadPage.editStepInCardView("ingestion-step").click();
    loadPage.stepNameInput().should("not.have.value", stepName);
    loadPage.stepDescriptionInput().should("not.have.value", "cyTestDesc");
    loadPage.stepSourceNameInput().should("not.have.value", "newValue");
    loadPage.stepSourceNameType().should("not.have.value", "otherNewValue");
    loadPage.cancelButton().click();
  });
});
