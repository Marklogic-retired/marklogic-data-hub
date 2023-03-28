import {Application} from "../../../support/application.config";
import {toolbar} from "../../../support/components/common";
import runPage from "../../../support/pages/run";
import loadPage from "../../../support/pages/load";
import browsePage from "../../../support/pages/browse";
import LoginPage from "../../../support/pages/login";
import explorePage from "../../../support/pages/explore";
import {generateUniqueName} from "../../../support/helper";

let flowName = "testPersonXML";

describe("Run Tile tests", () => {

  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });
  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });
  after(() => {
    // Skipped since it tests functionality on DHFPROD-7187 (run selected flows)
    // cy.deleteRecordsInFinal("master-xml-person", "mapPersonXML");
    cy.deleteFlows(flowName);
    cy.resetTestUser();
  });

  it("runs flow following the order of the cards displayed", () => {

    const flowName2 = generateUniqueName("personTestingXML");
    // create a flow with 3 steps, add load step first
    toolbar.getRunToolbarIcon().should("be.visible").click();
    cy.waitForAsyncRequest();

    runPage.createFlowButton().should("exist").click({force: true});
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName(flowName2);
    loadPage.confirmationOptions("Save").click();
    runPage.addStep(flowName2);
    runPage.addStepToFlow("loadPersonXML");
    runPage.verifyStepInFlow("Loading", "loadPersonXML", flowName2);
    runPage.openStepsSelectDropdown(flowName2);
    runPage.controlCheckedStep("#loadPersonXML");

    cy.log("**Run flow**");
    cy.intercept("GET", "/api/jobs/**").as("runResponse");
    runPage.runFlow(flowName2);
    cy.uploadFile("input/person.xml");
    cy.wait("@runResponse");
    cy.wait(3000);
    runPage.verifyFlowModalCompleted(flowName2);
    runPage.closeFlowStatusModal(flowName2);

    // add mapping step
    runPage.addStep(flowName2);
    runPage.addStepToFlow("mapPersonXML");
    runPage.verifyStepInFlow("Mapping", "mapPersonXML", flowName2);
    runPage.openStepsSelectDropdown(flowName2);
    runPage.controlCheckedStep("#mapPersonXML");

    cy.log("**Run flow**");
    cy.intercept("GET", "/api/jobs/**").as("runResponse");
    runPage.runFlow(flowName2);
    cy.uploadFile("input/person.xml");
    cy.wait("@runResponse");
    cy.wait(3000);
    runPage.verifyFlowModalCompleted(flowName2);
    runPage.closeFlowStatusModal(flowName2);

    // add matching step
    runPage.addStep(flowName2);
    runPage.addStepToFlow("match-xml-person");
    runPage.verifyStepInFlow("Matching", "match-xml-person", flowName2);
    runPage.openStepsSelectDropdown(flowName2);
    runPage.controlCheckedStep("#match-xml-person");

    //rearrange the cards
    runPage.getRunStep("match-xml-person", flowName2).should("exist").then(() => {
      runPage.moveStepLeft("match-xml-person");
    });

    cy.log("**Run flow**");
    cy.intercept("GET", "/api/jobs/**").as("runResponse");
    runPage.runFlow(flowName2);
    cy.uploadFile("input/person.xml");
    cy.wait("@runResponse");
    cy.wait(3000);
    runPage.verifyFlowModalCompleted(flowName2);
    runPage.getModalCompletedCue(flowName2).then(() => {
      runPage.verifyStepCardOrder(["loadPersonXML", "match-xml-person", "mapPersonXML"]);
    });
    runPage.closeFlowStatusModal(flowName2);

    // select only load and matching steps
    runPage.openStepsSelectDropdown(flowName2);
    runPage.getSelectAll().parent().should("have.text", "Deselect All");
    runPage.getSelectAll().click();
    cy.get("#loadPersonXML").click();
    //cy.get("#mapPersonXML").click();
    cy.get("#match-xml-person").click();
    runPage.openStepsSelectDropdown(flowName2);
    runPage.controlCheckedStep("#loadPersonXML");
    runPage.controlCheckedStep("#match-xml-person");
    runPage.controlUncheckedStep("#mapPersonXML");

    cy.log("**Run flow**");
    cy.intercept("GET", "/api/jobs/**").as("runResponse");
    runPage.runFlow(flowName2);
    cy.uploadFile("input/person.xml");
    cy.wait("@runResponse");
    cy.wait(3000);
    runPage.verifyFlowModalCompleted(flowName2);
    runPage.closeFlowStatusModal(flowName2);

    //rearrange the cards
    runPage.getRunStep("match-xml-person", flowName2).should("exist").then(() => {
      runPage.moveStepRight("match-xml-person");
    });
    runPage.openStepsSelectDropdown(flowName2);
    cy.get("#mapPersonXML").click();
    runPage.openStepsSelectDropdown(flowName2);
    runPage.controlCheckedStep("#loadPersonXML");
    runPage.controlCheckedStep("#mapPersonXML");
    runPage.controlCheckedStep("#match-xml-person");

    cy.log("**Run flow**");
    cy.intercept("GET", "/api/jobs/**").as("runResponse");
    runPage.runFlow(flowName2);
    cy.uploadFile("input/person.xml");
    cy.wait("@runResponse");
    cy.wait(3000);
    runPage.verifyFlowModalCompleted(flowName2);
    runPage.getModalCompletedCue(flowName2).then(() => {
      runPage.verifyStepCardOrder(["loadPersonXML", "mapPersonXML", "match-xml-person"]);
    });
    runPage.closeFlowStatusModal(flowName2);

    cy.deleteFlows(flowName2);

  });
  it("can create flow and add steps to flow, should load xml merged document and display content", {defaultCommandTimeout: 120000}, () => {
    //Verify create flow and add all user-defined steps to flow via Run tile
    runPage.getFlowName("personJSON").should("be.visible");
    runPage.getSpinner().should("not.exist");
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
    runPage.addStepToFlow("generate-dictionary");
    runPage.addStep(flowName);
    runPage.verifyStepInFlow("Custom", "generate-dictionary", flowName);
    runPage.addStepToFlow("match-xml-person");
    runPage.verifyStepInFlow("Matching", "match-xml-person", flowName);
    runPage.addStep(flowName);
    runPage.addStepToFlow("merge-xml-person");
    runPage.verifyStepInFlow("Merging", "merge-xml-person", flowName);
    runPage.addStep(flowName);
    runPage.addStepToFlow("ingest-orders");
    runPage.verifyStepInFlow("Loading", "ingest-orders", flowName, true);
    runPage.addStep(flowName);

    cy.log("**Verify all steps are selected (just one Load step selected)**");
    runPage.openStepsSelectDropdown("testPersonXML");
    runPage.controlCheckedStep("#loadPersonXML");
    runPage.controlCheckedStep("#mapPersonXML");
    runPage.controlCheckedStep("#generate-dictionary");
    runPage.controlCheckedStep("#match-xml-person");
    runPage.controlCheckedStep("#merge-xml-person");
    runPage.controlCheckedStep("#generate-dictionary");
    runPage.controlUncheckedStep("#ingest-orders");

    cy.log("**Deselect all**");
    runPage.getSelectAll().parent().should("have.text", "Deselect All");
    runPage.getSelectAll().click();
    runPage.controlUncheckedStep("#loadPersonXML");
    runPage.controlUncheckedStep("#mapPersonXML");
    runPage.controlUncheckedStep("#match-xml-person");
    runPage.controlUncheckedStep("#merge-xml-person");
    runPage.controlUncheckedStep("#generate-dictionary");
    runPage.controlUncheckedStep("#ingest-orders");

    cy.log("**Select all (just one Load step should be selected)**");
    runPage.getSelectAll().parent().should("have.text", "Select All");
    runPage.getSelectAll().click();
    runPage.controlCheckedStep("#loadPersonXML");
    runPage.controlCheckedStep("#mapPersonXML");
    runPage.controlCheckedStep("#generate-dictionary");
    runPage.controlCheckedStep("#match-xml-person");
    runPage.controlCheckedStep("#merge-xml-person");
    runPage.controlUncheckedStep("#ingest-orders");

    //Verify scrolling, last step should still be visible in the flow panel
    runPage.verifyStepInFlow("Merging", "merge-xml-person", flowName);
    //confirm the first load step is no longer visible because panel scrolled to the end
    cy.get("#testPersonXML").within(() => {
      cy.get("#testPersonXML-loadPersonXML-card").should("not.be.visible");
    });
  });

  it("Verify selected steps in run flow dropdown are executed successfully ", {defaultCommandTimeout: 120000}, () => {
    cy.log("**Verify selected steps executed successfully**");
    cy.log("**Unclick All Steps**");
    // cy.get("#checkAll").click();

    //manually uncheck all instead of hitting checkall
    cy.get("#generate-dictionary").click();
    cy.get("#loadPersonXML").click();
    cy.get("#mapPersonXML").click();
    cy.get("#match-xml-person").click();
    cy.get("#merge-xml-person").click();
    cy.get("#errorMessageEmptySteps").contains("Select at least one step to run a flow.");

    cy.log("**Click Necessary Steps and Run**");
    cy.get("#loadPersonXML").click();
    cy.get("#mapPersonXML").click();
    cy.get("#generate-dictionary").click();
    cy.get("#match-xml-person").click();
    cy.get("#merge-xml-person").click();
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
    runPage.getModalCompletedCue(flowName).then(() => {
      runPage.verifyStepCardOrder(["loadPersonXML", "mapPersonXML", "generate-dictionary", "match-xml-person", "merge-xml-person"]);
    });
    runPage.closeFlowStatusModal(flowName);

    cy.log("**Adding new step to delete**");
    runPage.addStep(flowName);
    runPage.addStepToFlow("map-orders");
    runPage.verifyStepInFlow("Mapping", "map-orders", flowName, true);
    //confirm the first load step is no longer visible because panel scrolled to the end
    cy.get("#testPersonXML").within(() => {
      cy.get("#testPersonXML-loadPersonXML-card").should("not.be.visible");
    });

    cy.log("**Run flow**");
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

    cy.log("**Deleting last step added**");
    runPage.deleteStep("map-orders", flowName).click();
    runPage.deleteStepConfirmationMessage("map-orders", flowName);
    cy.findByLabelText("Yes").click();

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

  it("Verify if no step is selected in run flow dropdown; all steps are executed ", {defaultCommandTimeout: 120000}, () => {
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

  it("Run map,match and merge steps for Person entity individually using xml documents ", {defaultCommandTimeout: 120000}, () => {
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer").withRequest();
    LoginPage.postLogin();
    toolbar.getRunToolbarIcon().should("be.visible").click();


    cy.intercept("GET", "/api/jobs/**").as("runResponse");
    if (cy.get(`[data-testid="accordion-testPersonXML"].collapsed`)) {
      runPage.toggleExpandFlow("testPersonXML");
    }
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
    browsePage.getTotalDocuments().should("eq", 2, {timeout: 5000});
    browsePage.getSelectedFacet("sm-Person-merged").should("exist");
    browsePage.getSourceViewIcon().first().click();
    cy.waitForAsyncRequest();
    browsePage.waitForSpinnerToDisappear();

    cy.contains("URI: /com.marklogic.smart-mastering/merged/").should("be.visible");
    cy.contains("123 Wilson St").scrollIntoView().should("be.visible");
    cy.contains("123 Wilson Rd").should("be.visible");
  });

  it("Execute certain steps in a flow and control that it is being saved to local storage for a user ", {defaultCommandTimeout: 120000}, () => {
    cy.logout();
    cy.loginAsTestUserWithRoles("hub-central-flow-writer").withRequest();

    cy.log("**loginAsTestUserWithRoles**");
    LoginPage.postLogin();

    cy.log("**postLogin**");
    toolbar.getRunToolbarIcon().click();
    runPage.openStepsSelectDropdown("testPersonXML");

    cy.log("**Change selected steps**");
    runPage.clickStepInsidePopover("#loadPersonXML");
    runPage.clickStepInsidePopover("#mapPersonXML");
    runPage.clickStepInsidePopover("#match-xml-person");
    runPage.clickStepInsidePopover("#generate-dictionary");
    runPage.clickStepInsidePopover("#merge-xml-person");

    runPage.clickStepInsidePopover("#mapPersonXML");
    runPage.clickStepInsidePopover("#match-xml-person");

    cy.log("**Run Flow with selected steps**");
    cy.intercept("GET", "/api/jobs/**").as("runResponse");
    runPage.runFlow(flowName);
    cy.wait("@runResponse");
    cy.wait(3000);
    cy.waitForAsyncRequest();

    cy.log("**Checking the modal**");
    runPage.getStepFailureSummary("loadPersonXML").should("not.exist");
    runPage.getStepFailureSummary("ingest-orders").should("not.exist");

    runPage.verifyStepRunResult("mapPersonXML", "success");
    runPage.verifyStepRunResult("match-xml-person", "success");
    runPage.closeFlowStatusModal(flowName);

    cy.log("**Change page and return to check the same steps previously selected**");
    toolbar.getCurateToolbarIcon().click();
    toolbar.getRunToolbarIcon().click({force: true});
    runPage.openStepsSelectDropdown("testPersonXML");
    runPage.controlUncheckedStep("#loadPersonXML");
    runPage.controlUncheckedStep("#ingest-orders");
    runPage.controlUncheckedStep("#merge-xml-person");
    runPage.openStepsSelectDropdown("testPersonXML");

    cy.log("**Reload page and check the same steps previously selected**");
    cy.reload();
    // TODO - BUG: DHFPROD-9049 - There's a re-rendering happening right after clicking on the dropdown.
    //Waiting for an element/request will not work until this is fixed.
    cy.wait(3000);
    runPage.openStepsSelectDropdown("testPersonXML");
    runPage.controlUncheckedStep("#loadPersonXML");
    runPage.controlUncheckedStep("#ingest-orders");
    runPage.controlUncheckedStep("#merge-xml-person");
  });

  it("Login with other user and check other step options are checked in a flow", {defaultCommandTimeout: 120000}, () => {
    cy.logout();
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer").withRequest();
    LoginPage.postLogin();

    cy.log("**Go to Run Page**");
    toolbar.getRunToolbarIcon().click();

    cy.log("**Check others steps for this user are selected**");
    runPage.openStepsSelectDropdown("testPersonXML");
    runPage.controlCheckedStep("#loadPersonXML");
    runPage.controlCheckedStep("#mapPersonXML");
    runPage.controlCheckedStep("#match-xml-person");
  });

  it("show all entity instances in Explorer after running mapping with related entities", {defaultCommandTimeout: 120000}, () => {

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

  it("Explore results after run two map steps being the second one with related entities", {defaultCommandTimeout: 120000}, () => {
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

  it("persist open flows", {defaultCommandTimeout: 120000}, () => {
    const firstFlowName = "personJSON";
    const firstStepName = "mapPersonJSON";

    cy.log("**Navigate to run tile and check visibility of the personJSON flow**");
    toolbar.getRunToolbarIcon().click();
    runPage.getFlowName("personJSON").should("be.visible");
    cy.intercept("/api/jobs/**").as("runResponse");

    cy.log(`**Expand flow: ${firstFlowName}**`);
    runPage.expandFlow(firstFlowName);

    cy.log("**Navigate to explorer tile using the explorer link**");
    toolbar.getExploreToolbarIcon().click();
    cy.waitForAsyncRequest();

    cy.log("**Navigate to run tile and check visibility of the personJSON flow**");
    toolbar.getRunToolbarIcon().click();
    runPage.getFlowName("personJSON").should("be.visible");
    cy.intercept("/api/jobs/**").as("runResponse");
    runPage.getRunStep(firstStepName, firstFlowName).should("be.visible");

  });

});
