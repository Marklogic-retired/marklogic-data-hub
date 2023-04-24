import {toolbar} from "../../../support/components/common";
import browsePage from "../../../support/pages/browse";
import LoginPage from "../../../support/pages/login";
import loadPage from "../../../support/pages/load";
import runPage from "../../../support/pages/run";

describe("Verify ingestion for all filetypes", () => {
  before(() => {
    cy.loginAsTestUserWithRoles("hub-central-load-writer", "hub-central-flow-writer").withRequest();
    LoginPage.navigateToMainPage();
  });

  beforeEach(() => {
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => loadPage.stepName("ingestion-step").should("be.visible"));
    cy.waitForAsyncRequest();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("ingestion", "cyZIPTest", "cyCSVTest", "cyXMTest");
    cy.deleteFlows("zipE2eFlow", "csvE2eFlow", "xmlE2eFlow");
    cy.resetTestUser();
  });

  it("Verify ingestion for csv filetype", {defaultCommandTimeout: 120000}, () => {
    let stepName = "cyCSVTest";
    let flowName = "csvE2eFlow";
    loadPage.loadView("th-large").click();
    loadPage.addNewButton("card").click();
    loadPage.stepNameInput().type(stepName);
    loadPage.stepDescriptionInput().type("cyTestDesc");
    loadPage.selectSourceFormat("Delimited Text (CSV, TSV, etc.)");
    loadPage.selectTargetFormat("XML");
    loadPage.uriPrefixInput().type("/e2eCSV/");
    loadPage.saveButton().click();
    cy.waitForAsyncRequest();
    cy.findByText(stepName).should("be.visible");
    loadPage.addStepToNewFlow(stepName);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Loading", stepName, flowName);
    cy.waitForAsyncRequest();
    runPage.runStep(stepName, flowName);
    cy.uploadFile("input/test-1.csv");
    cy.waitForAsyncRequest();

    runPage.verifyStepRunResult(stepName, "success");
    runPage.closeFlowStatusModal(flowName);
  });

  it("Verify ingestion for zip filetype", {defaultCommandTimeout: 120000}, () => {
    let stepName = "cyZIPTest";
    let flowName = "zipE2eFlow";
    loadPage.loadView("th-large").click();
    loadPage.addNewButton("card").click();
    loadPage.stepNameInput().type(stepName);
    loadPage.stepDescriptionInput().type("cyTestDesc");
    loadPage.selectSourceFormat("BINARY (.gif, .jpg, .pdf, .doc, .docx, etc.)");
    loadPage.selectTargetFormat("BINARY (.gif, .jpg, .pdf, .doc, .docx, etc.)");
    loadPage.uriPrefixInput().type("/e2eBinary/");
    loadPage.saveButton().click();
    cy.waitForAsyncRequest();
    cy.findByText(stepName).should("be.visible");
    loadPage.addStepToNewFlow(stepName);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Loading", stepName, flowName);
    cy.waitForAsyncRequest();
    runPage.runStep(stepName, flowName);
    cy.uploadFile("input/test-1.zip");
    cy.waitForAsyncRequest();

    runPage.verifyStepRunResult(stepName, "success");
    runPage.closeFlowStatusModal(flowName);
  });

  it("Verify ingestion for xml filetype", {defaultCommandTimeout: 120000}, () => {
    let stepName = "cyXMTest";
    let flowName = "xmlE2eFlow";
    loadPage.loadView("th-large").click();
    loadPage.addNewButton("card").click();
    loadPage.stepNameInput().type(stepName);
    loadPage.stepDescriptionInput().type("cyTestDesc");
    loadPage.selectSourceFormat("XML");
    loadPage.selectTargetFormat("XML");
    loadPage.uriPrefixInput().type("/e2eXml/");
    loadPage.saveButton().click();
    cy.waitForAsyncRequest();
    cy.findByText(stepName).should("be.visible");
    loadPage.addStepToNewFlow(stepName);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    cy.wait(500);
    loadPage.confirmationOptions("Save").click();
    cy.wait(500);
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Loading", stepName, flowName);
    cy.waitForAsyncRequest();
    runPage.runStep(stepName, flowName);
    cy.uploadFile("input/test-1.xml");
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    runPage.verifyStepRunResult(stepName, "success");
    cy.wait(1000);
    // Commented until DHFPROD-7477 is done
    //Verify step name appears as a collection facet in explorer
    runPage.explorerLink(stepName).should("be.visible").click({multiple: true, force: true});
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForCardToLoad();
    browsePage.getTotalDocuments().should("not.be.lessThan", 1);
    browsePage.getFacet("collection").should("exist");
    browsePage.showMoreCollection();
    browsePage.getFacetItemCheckbox("collection", stepName).should("to.exist");
  });
});
