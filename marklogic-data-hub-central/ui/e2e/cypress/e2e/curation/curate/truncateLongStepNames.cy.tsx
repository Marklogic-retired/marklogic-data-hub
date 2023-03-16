import {Application} from "../../../support/application.config";
import {createEditStepDialog, toolbar} from "../../../support/components/common";
import {generateUniqueName} from "../../../support/helper";
import curatePage from "../../../support/pages/curate";
import loadPage from "../../../support/pages/load";
import loginPage from "../../../support/pages/login";

const matchStep = generateUniqueName("StepWithALongNameStepWithALongNameStepWithALongNameStepWithALongNameStepWithALongNameStepWithALongNameStepWithALongNameStepWithALongNameStepWithALongName");
const short = generateUniqueName("short");

describe("truncate long Names", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    loginPage.postLogin();
  });

  it("Check default collection with a long name, text should be trimmed and with tooltip", () => {
    toolbar.getCurateToolbarIcon().should("be.visible").click();
    curatePage.getEntityTypePanel("Office").should("be.visible");
    curatePage.toggleEntityTypeId("Office");
    curatePage.selectMatchTab("Office");
    curatePage.addNewStep("Office").should("be.visible").click();
    createEditStepDialog.stepNameInput().type(matchStep, {timeout: 2000});
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['${matchStep}'])`);
    createEditStepDialog.saveButton("matching").click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(matchStep);
    loadPage.editStepInCardView(matchStep).click({force: true});
    loadPage.switchEditAdvanced().click();

    cy.findAllByText(matchStep)
      .then((result) => result[1]).should("have.css", "text-overflow", "ellipsis")
      .then(($textElement) => {
        expect($textElement[0].scrollWidth).to.be.greaterThan($textElement[0].offsetWidth);
      });
    cy.findAllByText(matchStep)
      .then((result) => result[1]).trigger("mouseover");
    cy.findByRole("tooltip");
    cy.get(`[text="${matchStep}"]`);

  });

  it("Check default collection with a short name, not trimmed and with out  tooltip", () => {
    toolbar.getCurateToolbarIcon().should("be.visible").click();
    curatePage.getEntityTypePanel("Office").should("be.visible");
    curatePage.toggleEntityTypeId("Office");
    curatePage.selectMatchTab("Office");
    curatePage.addNewStep("Office").should("be.visible").click();
    createEditStepDialog.stepNameInput().type(short, {timeout: 2000});
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['${short}'])`);
    createEditStepDialog.saveButton("matching").click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(short);
    loadPage.editStepInCardView(short).click({force: true});
    loadPage.switchEditAdvanced().click();

    cy.findAllByText(short)
      .then((result) => result[1]).should("have.css", "text-overflow", "ellipsis")
      .then(($textElement) => {
        expect($textElement[0].scrollWidth).to.be.equal($textElement[0].offsetWidth);
      });
    cy.findAllByText(short)
      .then((result) => result[1]).trigger("mouseover");
    cy.findByRole("tooltip").should("not.exist");
    cy.get(`[text="${short}"]`).should("not.exist");
  });
});