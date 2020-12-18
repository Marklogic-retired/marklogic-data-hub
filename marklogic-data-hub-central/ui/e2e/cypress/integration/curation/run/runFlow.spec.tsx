import {Application} from "../../../support/application.config";
import {tiles, toolbar} from "../../../support/components/common";
import runPage from "../../../support/pages/run";
import loadPage from "../../../support/pages/load";
import browsePage from "../../../support/pages/browse";

describe("Run Tile tests", () => {

  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer").withRequest();
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.waitUntil(() => runPage.getFlowName("personJSON").should("be.visible"));
  });

  after(() => {
    cy.deleteRecordsInFinal("master-xml-person", "mapPersonXML");
    cy.resetTestUser();
  });

  it("can create flow and add steps to flow, should load xml merged document and display content", () => {

    const flowName = "testPersonXML";
    //Verify create flow and add all user-defined steps to flow via Run tile
    runPage.createFlowButton().click();
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName(flowName);
    loadPage.confirmationOptions("Save").click();
    runPage.addStep(flowName).click();
    runPage.addStepToFlow("loadPersonXML");
    runPage.verifyStepInFlow("Load", "loadPersonXML");
    runPage.addStep(flowName).click();
    runPage.addStepToFlow("mapPersonXML");
    runPage.verifyStepInFlow("Map", "mapPersonXML");
    runPage.addStep(flowName).click();
    runPage.addStepToFlow("match-xml-person");
    runPage.verifyStepInFlow("Match", "match-xml-person");
    runPage.addStep(flowName).click();
    runPage.addStepToFlow("merge-xml-person");
    runPage.verifyStepInFlow("Merge", "merge-xml-person");
    runPage.addStep(flowName).click();
    runPage.addStepToFlow("master-person");
    runPage.verifyStepInFlow("Master", "master-person");
    runPage.addStep(flowName).click();
    runPage.addStepToFlow("generate-dictionary");
    //Verify scrolling, last step should still be visible in the flow panel
    runPage.verifyStepInFlow("Custom", "generate-dictionary");
    //confirm the first load step is no longer visible because panel scrolled to the end
    cy.findByText("loadPersonXML").should("not.be.visible");

    //Run map,match and merge step for Person entity using xml documents
    runPage.runStep("mapPersonXML").click();
    cy.verifyStepRunResult("success", "Mapping", "mapPersonXML");
    tiles.closeRunMessage();
    runPage.runStep("match-xml-person").click();
    cy.verifyStepRunResult("success", "Matching", "match-xml-person");
    tiles.closeRunMessage();
    runPage.runStep("merge-xml-person").click();
    cy.verifyStepRunResult("success", "Merging", "merge-xml-person");
    tiles.closeRunMessage();

    //Verify detail page renders with expected content
    toolbar.getExploreToolbarIcon().click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.selectEntity("Person");
    browsePage.getSelectedEntity().should("contain", "Person");
    browsePage.getTotalDocuments().should("be.greaterThan", 14);
    browsePage.getHubPropertiesExpanded();
    browsePage.clickMoreLink("collection");
    browsePage.getFacetItemCheckbox("collection", "sm-Person-merged").click();
    browsePage.getGreySelectedFacets("sm-Person-merged").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getTotalDocuments().should("be", 2);	 
    browsePage.getSourceViewIcon().first().click();
    cy.waitForAsyncRequest();
    browsePage.waitForSpinnerToDisappear();
    cy.contains("uri: /com.marklogic.smart-mastering/merged/").should("be.visible");
    cy.contains("123 Bates St").scrollIntoView().should("be.visible");
    cy.contains("456 Bates St").should("be.visible");
  });

});
