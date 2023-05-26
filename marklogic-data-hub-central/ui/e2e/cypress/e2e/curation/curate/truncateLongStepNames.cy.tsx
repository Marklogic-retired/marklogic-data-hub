import {createEditStepDialog} from "../../../support/components/common";
import {generateUniqueName} from "../../../support/helper";
import curatePage from "../../../support/pages/curate";
import loadPage from "../../../support/pages/load";

const matchStep = generateUniqueName("StepWithALongNameStepWithALongNameStepWithALongNameStepWithALongNameStepWithALongNameStepWithALongNameStepWithALongNameStepWithALongNameStepWithALongName");
const short = generateUniqueName("short");

describe("truncate long Names", () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
    curatePage.navigate();
  });

  it("Check default collection with a long name, text should be trimmed and with tooltip", () => {
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
    createEditStepDialog.cancelButton("matching").click({force: true});
  });

  it("Check default collection with a short name, not trimmed and with out  tooltip", () => {
    curatePage.getEntityTypePanel("Office").should("be.visible");
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