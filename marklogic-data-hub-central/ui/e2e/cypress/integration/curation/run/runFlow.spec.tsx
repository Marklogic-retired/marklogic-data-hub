import {Application} from "../../../support/application.config";
import {toolbar} from "../../../support/components/common";
import runPage from "../../../support/pages/run";
import loadPage from "../../../support/pages/load";
import browsePage from "../../../support/pages/browse";
import LoginPage from "../../../support/pages/login";

let flowName = "testPersonXML";

describe("Run Tile tests", () => {

  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer").withRequest();
    LoginPage.postLogin();
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage();

    cy.visit("/");
    cy.wait(1000);
    toolbar.getRunToolbarIcon().should("be.visible").click();
    cy.waitUntil(() => runPage.getFlowName("personJSON").should("be.visible"));
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage();
  });
  after(() => {
  // Skipped since it tests functionality on DHFPROD-7187 (run selected flows)
    // cy.deleteRecordsInFinal("master-xml-person", "mapPersonXML");
    // cy.deleteFlows(flowName);
    cy.resetTestUser();
  });
  it("can create flow and add steps to flow, should load xml merged document and display content", {defaultCommandTimeout: 120000}, () => {
    //Verify create flow and add all user-defined steps to flow via Run tile
    // Wait for the request to finish so the test doesn't fail. Tried with a smaller wait and had the same issue.
    cy.wait(5000);
    runPage.createFlowButton().should("exist").click({force: true});
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName(flowName);
    loadPage.confirmationOptions("Save").click();
    runPage.addStep(flowName);
    runPage.addStepToFlow("loadPersonXML");
    runPage.verifyStepInFlow("Loading", "loadPersonXML", flowName);
    runPage.addStep(flowName);
    runPage.addStepToFlow("mapPersonXML");
    runPage.verifyStepInFlow("Mapping", "mapPersonXML", flowName);
    runPage.addStep(flowName);
    runPage.addStepToFlow("match-xml-person");
    runPage.verifyStepInFlow("Matching", "match-xml-person", flowName);
    runPage.addStep(flowName);
    runPage.addStepToFlow("merge-xml-person");
    runPage.verifyStepInFlow("Merging", "merge-xml-person", flowName);
    runPage.addStep(flowName);
    runPage.addStepToFlow("ingest-orders");
    runPage.verifyStepInFlow("Loading", "ingest-orders", flowName);
    runPage.addStep(flowName);

    cy.log("**Add Master Step**");
    runPage.addStepToFlow("master-person");
    runPage.verifyStepInFlow("Mastering", "master-person", flowName);
    runPage.addStep(flowName);
    runPage.addStepToFlow("generate-dictionary");
    //Verify scrolling, last step should still be visible in the flow panel
    runPage.verifyStepInFlow("Custom", "generate-dictionary", flowName);
    //confirm the first load step is no longer visible because panel scrolled to the end
    cy.get("#testPersonXML").within(() => {
      cy.findByText("loadPersonXML").should("not.be.visible");
    });

    //Verify selected steps in run flow dropdown are executed successfully
    cy.log("**Verify selected steps executed successfully**");
    runPage.openStepsSelectDropdown(flowName);

    cy.log("**Unclick All Steps**");
    cy.get("#ingest-orders").should("be.disabled");
    cy.get("#loadPersonXML").click();
    cy.get("#mapPersonXML").click();
    cy.get("#match-xml-person").click();
    cy.get("#merge-xml-person").click();
    cy.get("#master-person").click();
    cy.get("#generate-dictionary").click();
    cy.get("#errorMessageEmptySteps").contains("Select at least one step to run a flow.");
    cy.get("#ingest-orders").click();
    cy.get("#loadPersonXML").should("be.disabled");
    cy.get("#ingest-orders").click();
    cy.get("#errorMessageEmptySteps").contains("Select at least one step to run a flow.");
    runPage.verifyDisabledRunButton(flowName);

    cy.log("**Click Necessary Steps and Run**");
    cy.get("#loadPersonXML").click();
    cy.get("#mapPersonXML").click();
    cy.get("#match-xml-person").click();
    cy.get("#merge-xml-person").click();
    cy.get("#master-person").click();
    cy.get("#generate-dictionary").click();
    cy.contains("Select at least one step to run a flow.").should("not.exist");

    runPage.runFlow(flowName);
    cy.uploadFile("input/person.xml");
    cy.wait(3000);

    cy.log("**Checking the modal**");
    runPage.verifyStepRunResult("mapPersonXML", "success");
    runPage.verifyStepRunResult("match-xml-person", "success");
    runPage.verifyStepRunResult("merge-xml-person", "success");
    runPage.verifyFlowModalCompleted(flowName);
    runPage.closeFlowStatusModal(flowName);

    //Verify if no step is selected in run flow dropdown; all steps are executed
    runPage.expandFlow("testCustomFlow");
    runPage.runFlow("testCustomFlow");
    cy.uploadFile("input/test-1.zip");
    cy.wait(3000);
    runPage.verifyStepRunResult("mapping-step", "success");
    runPage.verifyFlowModalCompleted("testCustomFlow");
    runPage.closeFlowStatusModal("testCustomFlow");

    //Run map,match and merge steps for Person entity individually using xml documents
    runPage.runStep("mapPersonXML", flowName);
    runPage.verifyStepRunResult("mapPersonXML", "success");
    runPage.closeFlowStatusModal(flowName);
    cy.waitForAsyncRequest();
    runPage.runStep("match-xml-person", flowName);
    runPage.verifyStepRunResult("match-xml-person", "success");
    runPage.closeFlowStatusModal(flowName);
    cy.waitForAsyncRequest();
    runPage.runStep("merge-xml-person", flowName);
    runPage.verifyStepRunResult("merge-xml-person", "success");
    //Navigate to explorer tile using the explorer link
    runPage.explorerLink("merge-xml-person").click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getTableView().click();
    browsePage.waitForHCTableToLoad();
    cy.wait(3000);
    //Verify detail page renders with expected content
    //Revalidate below with DHFPROD-8455
    // browsePage.getSelectedEntity().should("contain", "Person");
    browsePage.getTotalDocuments().should("eq", 1, {timeout: 5000});
    browsePage.getSelectedFacet("sm-Person-merged").should("exist");
    browsePage.getSourceViewIcon().first().click();
    cy.waitForAsyncRequest();
    browsePage.waitForSpinnerToDisappear();

    cy.contains("URI: /com.marklogic.smart-mastering/merged/").should("be.visible");
    cy.contains("123 Wilson St").scrollIntoView().should("be.visible");
    cy.contains("123 Wilson Rd").should("be.visible");
  });
  it("show all entity instances in Explorer after running mapping with related entities", () => {
    const flowName = "CurateCustomerWithRelatedEntitiesJSON";
    const stepName = "mapCustomersWithRelatedEntitiesJSON";

    cy.log("**Navigate to run tile and check visibility of the personJSON flow**");
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.waitUntil(() => runPage.getFlowName("personJSON").should("be.visible"));
    cy.intercept("/api/jobs/**").as("getJobs");

    cy.log(`**Expand flow: ${flowName}**`);
    runPage.expandFlow(flowName);

    cy.log(`**Run mapping step (${stepName}) and verify results dialog**`);
    runPage.runStep(stepName, flowName);
    runPage.verifyStepRunResult(stepName, "success");
    cy.waitForAsyncRequest();

    cy.log("**Navigate to explorer tile using the explorer link**");
    runPage.explorerLink(stepName).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTitleExplore().should("be.visible");
    cy.waitForAsyncRequest();
    browsePage.getTableView().click();
    browsePage.waitForHCTableToLoad();

    //Revalidate below with DHFPROD-8455
    // browsePage.getSelectedEntity().should("contain", "All Entities");
    cy.log("**Verify the totals results and the createdByJob facet**");
    browsePage.getTotalDocuments().should("eq", 2);
    browsePage.getSelectedFacet("createdByJob").should("exist");
  });
  it("Explore results after run two map steps being the second one with related entities", () => {
    const firstFlowName = "personJSON";
    const firstStepName = "mapPersonJSON";
    const secondFlowName = "CurateCustomerWithRelatedEntitiesJSON";
    const secondStepName = "mapCustomersWithRelatedEntitiesJSON";

    cy.log("**Navigate to run tile and check visibility of the personJSON flow**");
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.waitUntil(() => runPage.getFlowName("personJSON").should("be.visible"));
    cy.intercept("/api/jobs/**").as("getJobs");

    cy.log(`**Expand flow: ${firstFlowName}**`);
    runPage.expandFlow(firstFlowName);

    cy.log(`**Run mapping step (${firstStepName}) and verify results dialog**`);
    runPage.runStep(firstStepName, firstFlowName);
    runPage.verifyStepRunResult(firstStepName, "success");
    cy.waitForAsyncRequest();

    cy.log("**Navigate to explorer tile using the explorer link**");
    runPage.explorerLink(firstStepName).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTitleExplore().should("be.visible");
    cy.waitForAsyncRequest();
    browsePage.getTableView().click();
    browsePage.waitForHCTableToLoad();

    cy.log("**Verify the totals results and the createdByJob facet**");
    browsePage.getTotalDocuments().should("eq", 14);
    browsePage.getSelectedFacet("createdByJob").should("exist");

    cy.log("**Navigate to run tile and check visibility of the personJSON flow**");
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.waitUntil(() => runPage.getFlowName("personJSON").should("be.visible"));
    cy.intercept("/api/jobs/**").as("getJobs");

    cy.log(`**Expand flow: ${secondFlowName}**`);
    runPage.expandFlow(secondFlowName);

    cy.log(`**Run mapping step (${secondStepName}) and verify results dialog**`);
    runPage.runStep(secondStepName, secondFlowName);
    runPage.verifyStepRunResult(secondStepName, "success");
    cy.waitForAsyncRequest();

    cy.log("**Navigate to explorer tile using the explorer link**");
    runPage.explorerLink(secondStepName).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTitleExplore().should("be.visible");
    cy.waitForAsyncRequest();
    browsePage.getTableView().click();
    browsePage.waitForHCTableToLoad();

    cy.log("**Verify the totals results and the createdByJob facet**");
    browsePage.getTotalDocuments().should("eq", 2);
    browsePage.getSelectedFacet("createdByJob").should("exist");
  });
});
