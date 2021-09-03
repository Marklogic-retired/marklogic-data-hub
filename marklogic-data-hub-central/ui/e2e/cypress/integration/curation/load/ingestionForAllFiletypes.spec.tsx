import {Application} from "../../../support/application.config";
import {tiles, toolbar} from "../../../support/components/common";
import loadPage from "../../../support/pages/load";
import runPage from "../../../support/pages/run";
import browsePage from "../../../support/pages/browse";
import LoginPage from "../../../support/pages/login";

describe("Verify ingestion for all filetypes", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-load-writer", "hub-central-flow-writer").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-load-writer", "hub-central-flow-writer").withRequest();
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => loadPage.stepName("ingestion-step").should("be.visible"));
    cy.waitForAsyncRequest();
    cy.intercept("/api/jobs/**").as("getJobs");
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("ingestion", "cyZIPTest", "cyCSVTest", "cyXMTest");//'cyCSVTest', 'cyXMTest',
    cy.deleteFlows("zipE2eFlow", "csvE2eFlow", "xmlE2eFlow");//'csvE2eFlow', 'xmlE2eFlow',
    cy.resetTestUser();
  });
  it("Verify ingestion for csv filetype", {defaultCommandTimeout: 120000}, () => {
    let stepName = "cyCSVTest";
    let flowName= "csvE2eFlow";
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
    cy.verifyStepAddedToFlow("Load", stepName, flowName);
    cy.waitForAsyncRequest();
    runPage.runStep(stepName, flowName);
    cy.uploadFile("input/test-1.csv");
    cy.waitForAsyncRequest();
    cy.verifyStepRunResult("success", "Ingestion", stepName);
    tiles.closeRunMessage();
  });
  it("Verify ingestion for zip filetype", {defaultCommandTimeout: 120000}, () => {
    let stepName = "cyZIPTest";
    let flowName= "zipE2eFlow";
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
    cy.verifyStepAddedToFlow("Load", stepName, flowName);
    cy.waitForAsyncRequest();
    runPage.runStep(stepName, flowName);
    cy.uploadFile("input/test-1.zip");
    cy.waitForAsyncRequest();
    cy.verifyStepRunResult("success", "Ingestion", stepName);
    tiles.closeRunMessage();
  });
  it("Verify ingestion for xml filetype", {defaultCommandTimeout: 120000}, () => {
    let stepName = "cyXMTest";
    let flowName= "xmlE2eFlow";
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
    cy.verifyStepAddedToFlow("Load", stepName, flowName);
    cy.waitForAsyncRequest();
    runPage.runStep(stepName, flowName);
    cy.uploadFile("input/test-1.xml");
    cy.waitForAsyncRequest();
    cy.verifyStepRunResult("success", "Ingestion", stepName);
    //Verify step name appears as a collection facet in explorer
    runPage.explorerLink().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForCardToLoad();
    browsePage.getTotalDocuments().should("eq", 1);
    browsePage.getFacet("collection").should("exist");
    browsePage.getFacetItemCheckbox("collection", stepName).should("to.exist");
  });
});
