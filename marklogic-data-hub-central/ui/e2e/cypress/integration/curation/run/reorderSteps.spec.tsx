import {Application} from "../../../support/application.config";
import {tiles, toolbar} from "../../../support/components/common";
import runPage from "../../../support/pages/run";
import loadPage from "../../../support/pages/load";
import browsePage from "../../../support/pages/browse";
import LoginPage from "../../../support/pages/login";

describe("Run Tile tests", () => {

  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer").withRequest();
    LoginPage.postLogin();
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.waitUntil(() => runPage.getFlowName("personJSON").should("be.visible"));
    cy.intercept("/api/jobs/**").as("getJobs");
  });

  after(() => {
    cy.deleteRecordsInFinal("master-xml-person", "mapPersonXML");
    cy.deleteFlows("testPerson");
    cy.resetTestUser();
  });

  it("can create flow and add steps to flow, reorder flow, and should load xml merged document and display content", {defaultCommandTimeout: 120000}, () => {

    const flowName = "testPerson";
    //Verify create flow and add all user-defined steps to flow via Run tile
    runPage.createFlowButton().click();
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName(flowName);
    loadPage.confirmationOptions("Save").click();
    runPage.addStep(flowName);
    runPage.addStepToFlow("loadPersonXML");
    runPage.verifyStepInFlow("Load", "loadPersonXML", flowName);
    runPage.addStep(flowName);
    runPage.addStepToFlow("mapPersonXML");
    runPage.verifyStepInFlow("Map", "mapPersonXML", flowName);
    runPage.addStep(flowName);
    runPage.addStepToFlow("match-xml-person");
    runPage.verifyStepInFlow("Match", "match-xml-person", flowName);
    runPage.addStep(flowName);
    runPage.addStepToFlow("merge-xml-person");
    runPage.verifyStepInFlow("Merge", "merge-xml-person", flowName);
    runPage.addStep(flowName);
    runPage.addStepToFlow("master-person");
    runPage.verifyStepInFlow("Master", "master-person", flowName);
    runPage.addStep(flowName);

    // Reorder steps
    runPage.moveStepRight("mapPersonXML");
    runPage.moveStepRight("mapPersonXML");
    runPage.moveStepLeft("mapPersonXML");
    runPage.moveStepRight("match-xml-person");
    runPage.moveStepRight("loadPersonXML");
    runPage.moveStepLeft("loadPersonXML");
    runPage.moveStepLeft("master-person");
    runPage.moveStepLeft("merge-xml-person");

    //Run map,match and merge step for Person entity using xml documents
    runPage.runStep("mapPersonXML", flowName);
    cy.verifyStepRunResult("success", "Mapping", "mapPersonXML");
    tiles.closeRunMessage();
    cy.waitForAsyncRequest();
    runPage.runStep("match-xml-person", flowName);
    cy.verifyStepRunResult("success", "Matching", "match-xml-person");
    tiles.closeRunMessage();
    cy.waitForAsyncRequest();
    runPage.runStep("merge-xml-person", flowName);
    cy.verifyStepRunResult("success", "Merging", "merge-xml-person");

    //Navigate to explorer tile using the explorer link
    runPage.explorerLink().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForTableToLoad();

    //Verify detail page renders with expected content
    browsePage.getSelectedEntity().should("contain", "Person");
    browsePage.getTotalDocuments().should("eq", 1);
    browsePage.getSelectedFacet("sm-Person-merged").should("exist");
    browsePage.getSourceViewIcon().first().click();
    cy.waitForAsyncRequest();
    browsePage.waitForSpinnerToDisappear();

    cy.contains("URI: /com.marklogic.smart-mastering/merged/").should("be.visible");
    cy.contains("123 Wilson St").scrollIntoView().should("be.visible");
    cy.contains("123 Wilson Rd").should("be.visible");
  });

});
