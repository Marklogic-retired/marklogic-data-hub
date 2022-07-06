import {Application} from "../../../support/application.config";
import {toolbar} from "../../../support/components/common";
import runPage from "../../../support/pages/run";
import loadPage from "../../../support/pages/load";
import browsePage from "../../../support/pages/browse";
import LoginPage from "../../../support/pages/login";
import explorePage from "../../../support/pages/explore";

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
  });
  after(() => {
    // Skipped since it tests functionality on DHFPROD-7187 (run selected flows)
    // cy.deleteRecordsInFinal("master-xml-person", "mapPersonXML");
    // cy.deleteFlows(flowName);
    cy.resetTestUser();
  });
  it("can create flow and add steps to flow, should load xml merged document and display content", {defaultCommandTimeout: 120000}, () => {
    //Verify create flow and add all user-defined steps to flow via Run tile
    toolbar.getRunToolbarIcon().should("be.visible").click();
    runPage.getFlowName("personJSON").should("be.visible");
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
  });

  it("Verify selected steps in run flow dropdown are executed successfully ", () => {
    cy.log("**Verify selected steps executed successfully**");
    runPage.openStepsSelectDropdown(flowName);

    cy.log("**Unclick All Steps**");
    cy.get("#ingest-orders").click();
    cy.get("#ingest-orders").should("be.disabled");
    cy.get("#loadPersonXML").click();
    cy.get("#mapPersonXML").click();
    cy.get("#match-xml-person").click();
    cy.get("#merge-xml-person").click();
    cy.get("#master-person").click();
    cy.get("#generate-dictionary").click();
    cy.get("#checkAll").click();
    cy.get("#errorMessageEmptySteps").contains("Select at least one step to run a flow.");

    cy.log("**Click Necessary Steps and Run**");
    cy.get("#loadPersonXML").click();
    cy.get("#mapPersonXML").click();
    cy.get("#match-xml-person").click();
    cy.get("#merge-xml-person").click();
    cy.get("#master-person").click();
    cy.get("#generate-dictionary").click();
    cy.contains("Select at least one step to run a flow.").should("not.exist");
    cy.intercept("GET", "/api/jobs/**").as("runResponse");
    runPage.runFlow(flowName);
    cy.uploadFile("input/person.xml");
    cy.wait("@runResponse");
    cy.wait(3000);

    cy.log("**Checking the modal**");
    runPage.verifyStepRunResult("mapPersonXML", "success");
    runPage.verifyStepRunResult("match-xml-person", "success");
    runPage.verifyStepRunResult("merge-xml-person", "success");
    runPage.verifyFlowModalCompleted(flowName);
    runPage.closeFlowStatusModal(flowName);
  });

  it("Verify if no step is selected in run flow dropdown; all steps are executed ", () => {
    cy.intercept("GET", "/api/jobs/**").as("runResponse");
    runPage.expandFlow("testCustomFlow");
    runPage.runFlow("testCustomFlow");
    cy.uploadFile("input/test-1.zip");
    cy.wait("@runResponse");
    cy.wait(3000);
    runPage.verifyStepRunResult("mapping-step", "success");
    runPage.verifyFlowModalCompleted("testCustomFlow");
    runPage.closeFlowStatusModal("testCustomFlow");
  });

  it("Run map,match and merge steps for Person entity individually using xml documents ", () => {
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer").withRequest();
    LoginPage.postLogin();
    cy.visit("/");


    cy.intercept("GET", "/api/jobs/**").as("runResponse");
    runPage.runStep("mapPersonXML", flowName);
    cy.wait("@runResponse");
    runPage.verifyStepRunResult("mapPersonXML", "success");
    runPage.closeFlowStatusModal(flowName);
    cy.waitForAsyncRequest();
    runPage.runStep("match-xml-person", flowName);
    cy.wait("@runResponse");
    runPage.verifyStepRunResult("match-xml-person", "success");
    runPage.closeFlowStatusModal(flowName);
    cy.waitForAsyncRequest();
    runPage.runStep("merge-xml-person", flowName);
    cy.wait("@runResponse");
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

  it("Execute certain steps in a flow and control that it is being saved to local storage for a user ", () => {
    cy.logout();
    cy.loginAsTestUserWithRoles("hub-central-flow-writer").withRequest();

    cy.log("**loginAsTestUserWithRoles**");
    LoginPage.postLogin();
    cy.saveLocalStorage();

    cy.log("**postLogin**");
    toolbar.getRunToolbarIcon().click();
    runPage.openStepsSelectDropdown("testPersonXML");

    cy.log("**Change selected steps**");
    runPage.clickStepInsidePopover("#loadPersonXML");
    runPage.clickStepInsidePopover("#mapPersonXML");
    runPage.clickStepInsidePopover("#match-xml-person");

    cy.log("**Run Flow with selected steps**");
    cy.intercept("GET", "/api/jobs/**").as("runResponse");
    runPage.runFlow(flowName);
    cy.wait("@runResponse");
    cy.wait(3000);
    cy.waitForAsyncRequest();

    cy.log("**Checking the modal**");
    runPage.closeFlowStatusModal(flowName);

    cy.log("**Change page and return to check the same steps previously selected**");
    toolbar.getCurateToolbarIcon().click();
    toolbar.getRunToolbarIcon().click({force: true});
    runPage.openStepsSelectDropdown("testPersonXML");
    runPage.controlUncheckedStep("#loadPersonXML");
    runPage.controlUncheckedStep("#mapPersonXML");
    runPage.controlUncheckedStep("#match-xml-person");
    runPage.openStepsSelectDropdown("testPersonXML");

    cy.log("**Reload page and check the same steps previously selected**");
    cy.reload();
    // TODO - BUG: DHFPROD-9049 - There's a re-rendering happening right after clicking on the dropdown.
    //Waiting for an element/request will not work until this is fixed.
    cy.wait(3000);
    runPage.openStepsSelectDropdown("testPersonXML");
    runPage.controlUncheckedStep("#loadPersonXML");
    runPage.controlUncheckedStep("#mapPersonXML");
    runPage.controlUncheckedStep("#match-xml-person");
  });

  it("Login with other user and check other step options are checked in a flow", () => {
    cy.logout();
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer").withRequest();
    LoginPage.postLogin();
    cy.saveLocalStorage();

    cy.log("**Go to Run Page**");
    toolbar.getRunToolbarIcon().click();

    cy.log("**Check others steps for this user are selected**");
    runPage.openStepsSelectDropdown("testPersonXML");
    runPage.controlCheckedStep("#loadPersonXML");
    runPage.controlCheckedStep("#mapPersonXML");
    runPage.controlCheckedStep("#match-xml-person");
  });

  it("show all entity instances in Explorer after running mapping with related entities", () => {

    const flowName = "CurateCustomerWithRelatedEntitiesJSON";
    const stepName = "mapCustomersWithRelatedEntitiesJSON";

    cy.log("**Navigate to run tile and check visibility of the personJSON flow**");
    toolbar.getRunToolbarIcon().click();
    runPage.getFlowName("personJSON").should("be.visible");
    cy.intercept("/api/jobs/**").as("runResponse");

    cy.log(`**Expand flow: ${flowName}**`);
    runPage.expandFlow(flowName);

    cy.log(`**Run mapping step (${stepName}) and verify results dialog**`);
    runPage.runStep(stepName, flowName);
    cy.wait("@runResponse");
    runPage.verifyStepRunResult(stepName, "success");
    cy.waitForAsyncRequest();

    cy.log("**Navigate to explorer tile using the explorer link**");
    runPage.explorerLink(stepName).click();
    browsePage.waitForSpinnerToDisappear();
    explorePage.getTitleExplore().scrollIntoView().should("be.visible");
    cy.waitForAsyncRequest();
    browsePage.getTableView().click();
    browsePage.waitForHCTableToLoad();

    //Revalidate below with DHFPROD-8455
    // browsePage.getSelectedEntity().should("contain", "All Entities");
    cy.log("**Verify the totals results and the createdByJob facet**");
    browsePage.getTotalDocuments().should("eq", 6);
    browsePage.getSelectedFacet("createdByJob").should("exist");
  });

  it("Explore results after run two map steps being the second one with related entities", () => {
    const firstFlowName = "personJSON";
    const firstStepName = "mapPersonJSON";
    const secondFlowName = "CurateCustomerWithRelatedEntitiesJSON";
    const secondStepName = "mapCustomersWithRelatedEntitiesJSON";

    cy.log("**Navigate to run tile and check visibility of the personJSON flow**");
    toolbar.getRunToolbarIcon().click();
    runPage.getFlowName("personJSON").should("be.visible");
    cy.intercept("/api/jobs/**").as("runResponse");

    cy.log(`**Expand flow: ${firstFlowName}**`);
    runPage.expandFlow(firstFlowName);

    cy.log(`**Run mapping step (${firstStepName}) and verify results dialog**`);
    runPage.runStep(firstStepName, firstFlowName);
    cy.wait("@runResponse");
    runPage.verifyStepRunResult(firstStepName, "success");
    cy.waitForAsyncRequest();

    cy.log("**Navigate to explorer tile using the explorer link**");
    runPage.explorerLink(firstStepName).click();
    browsePage.waitForSpinnerToDisappear();
    explorePage.getTitleExplore().scrollIntoView().should("be.visible");
    cy.waitForAsyncRequest();
    browsePage.getTableView().click();
    browsePage.waitForHCTableToLoad();

    cy.log("**Verify the totals results and the createdByJob facet**");
    browsePage.getTotalDocuments().should("eq", 14);
    browsePage.getSelectedFacet("createdByJob").should("exist");

    cy.log("**Navigate to run tile and check visibility of the personJSON flow**");
    toolbar.getRunToolbarIcon().click();
    runPage.getFlowName("personJSON").should("be.visible");
    cy.intercept("/api/jobs/**").as("runResponse");

    cy.log(`**Expand flow: ${secondFlowName}**`);
    runPage.expandFlow(secondFlowName);

    cy.log(`**Run mapping step (${secondStepName}) and verify results dialog**`);
    runPage.runStep(secondStepName, secondFlowName);
    cy.wait("@runResponse");
    runPage.verifyStepRunResult(secondStepName, "success");
    cy.waitForAsyncRequest();

    cy.log("**Navigate to explorer tile using the explorer link**");
    runPage.explorerLink(secondStepName).click();
    browsePage.waitForSpinnerToDisappear();
    explorePage.getTitleExplore().scrollIntoView().should("be.visible");
    cy.waitForAsyncRequest();
    browsePage.getTableView().click();
    browsePage.waitForHCTableToLoad();

    cy.log("**Verify the totals results and the createdByJob facet**");
    browsePage.getTotalDocuments().should("eq", 6);
    browsePage.getSelectedFacet("createdByJob").should("exist");
  });
});
