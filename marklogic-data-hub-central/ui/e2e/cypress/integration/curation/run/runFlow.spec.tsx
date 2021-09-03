import {Application} from "../../../support/application.config";
import {tiles, toolbar} from "../../../support/components/common";
import runPage from "../../../support/pages/run";
import loadPage from "../../../support/pages/load";
import browsePage from "../../../support/pages/browse";
import LoginPage from "../../../support/pages/login";

let flowName= "testPersonXML";

describe("Run Tile tests", () => {

  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer").withRequest();
    LoginPage.postLogin();
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.waitUntil(() => runPage.getFlowName("personJSON").should("be.visible"));
    cy.intercept("/api/jobs/**").as("getJobs");
  });

  after(() => {
    cy.deleteRecordsInFinal("master-xml-person", "mapPersonXML");
    cy.deleteFlows(flowName);
    cy.resetTestUser();
  });

  it("can create flow and add steps to flow, should load xml merged document and display content", {defaultCommandTimeout: 120000}, () => {
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
    runPage.addStepToFlow("generate-dictionary");
    //Verify scrolling, last step should still be visible in the flow panel
    runPage.verifyStepInFlow("Custom", "generate-dictionary", flowName);
    //confirm the first load step is no longer visible because panel scrolled to the end
    cy.get("#testPersonXML").within(() => {
      cy.findByText("loadPersonXML").should("not.be.visible");
    });

    /* Commenting out for DHFPROD-7820, remove unfinished run flow epic stories from 5.6

    //Verify selected steps in run flow dropdown are executed successfully
    runPage.openStepsSelectDropdown("testPersonXML");
    cy.get("#mapPersonXML").click();
    cy.get("#match-xml-person").click();
    cy.get("#merge-xml-person").click();
    cy.get("#master-person").click();
    runPage.runFlow(flowName);
    runPage.verifyFlowModalRunning("testPersonXML");
    cy.waitForAsyncRequest();
    runPage.getFlowStatusModal().type("{esc}");
    runPage.clickSuccessCircleIcon("mapPersonXML", flowName);
    cy.verifyStepRunResult("success", "Mapping", "mapPersonXML");
    tiles.closeRunMessage();
    runPage.clickSuccessCircleIcon("match-xml-person", flowName);
    cy.verifyStepRunResult("success", "Matching", "match-xml-person");
    tiles.closeRunMessage();
    runPage.clickSuccessCircleIcon("merge-xml-person", flowName);
    cy.verifyStepRunResult("success", "Merging", "merge-xml-person");
    tiles.closeRunMessage();
    runPage.openFlowStatusModal("testPersonXML");
    runPage.verifyFlowModalCompleted("testPersonXML");
    runPage.getFlowStatusModal().type("{esc}");

    //Verify if no step is selected in run flow dropdown; all steps are executed
    runPage.expandFlow("testCustomFlow");
    runPage.runFlow("testCustomFlow");
    cy.uploadFile("input/test-1.zip");
    cy.waitForAsyncRequest();
    runPage.verifyFlowModalRunning("testCustomFlow");
    runPage.getFlowStatusModal().type("{esc}");
    runPage.expandFlow("testCustomFlow");
    runPage.clickSuccessCircleIcon("mapping-step", flowName);
    cy.verifyStepRunResult("success", "Custom", "mapping-step");
    tiles.closeRunMessage();
    runPage.openFlowStatusModal("testCustomFlow");
    runPage.verifyFlowModalCompleted("testCustomFlow");
    runPage.getFlowStatusModal().type("{esc}");

    */

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

  it("show all entity instances in Explorer after running mapping with related entities", {defaultCommandTimeout: 120000}, () => {
    const flowName = "CurateCustomerWithRelatedEntitiesJSON";
    //expand flow
    runPage.expandFlow(flowName);

    //run mapping step
    runPage.runStep("mapCustomersWithRelatedEntitiesJSON", flowName);

    cy.verifyStepRunResult("success", "Mapping", "mapCustomersWithRelatedEntitiesJSON");
    cy.waitForAsyncRequest();

    //navigate to explorer tile using the explorer link
    runPage.explorerLink().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForTableToLoad();

    browsePage.getSelectedEntity().should("contain", "All Entities");
    browsePage.getTotalDocuments().should("eq", 2);
    browsePage.getSelectedFacet("createdByJob").should("exist");
  });

});
