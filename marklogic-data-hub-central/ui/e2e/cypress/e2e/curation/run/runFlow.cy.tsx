import {generateUniqueName} from "../../../support/helper";
import {toolbar} from "../../../support/components/common";
import explorePage from "../../../support/pages/explore";
import browsePage from "../../../support/pages/browse";
import loadPage from "../../../support/pages/load";
import runPage from "../../../support/pages/run";
import curatePage from "../../../support/pages/curate";

let flowName = "testPersonXML";

describe("Run Tile tests", () => {
  before(() => {
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer").withRequest();
    runPage.navigate();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  after(() => {
    cy.deleteFlows("testFlowCheck");
    cy.deleteFlows(flowName);
    cy.resetTestUser();
  });

  // TODO: DHFPROD-10086
  it.skip("Runs flow following the order of the cards displayed", () => {
    const flowName2 = generateUniqueName("personTestingXML");
    runPage.navigate();

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

    runPage.addStep(flowName2);
    runPage.addStepToFlow("match-xml-person");
    runPage.verifyStepInFlow("Matching", "match-xml-person", flowName2);
    runPage.openStepsSelectDropdown(flowName2);
    runPage.controlCheckedStep("#match-xml-person");

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

    runPage.openStepsSelectDropdown(flowName2);
    runPage.getSelectAll().parent().should("have.text", "Deselect All");
    runPage.getSelectAll().click();
    cy.get("#loadPersonXML").click();
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

  it("Can create flow and add steps to flow, should load xml merged document and display content", {defaultCommandTimeout: 120000}, () => {
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

    runPage.verifyStepInFlow("Merging", "merge-xml-person", flowName);
    cy.get("#testPersonXML").within(() => {
      cy.get("#testPersonXML-loadPersonXML-card").should("not.be.visible");
    });
  });

  it("Verify selected steps in run flow dropdown are executed successfully ", {defaultCommandTimeout: 120000}, () => {
    cy.log("**Verify selected steps executed successfully**");
    cy.log("**Unclick All Steps**");

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
    cy.intercept("DELETE", "/api/flows/testPersonXML/steps/**").as("DeleteFlow");
    runPage.deleteStepConfirmationMessage("map-orders", flowName);
    cy.findByLabelText("Yes").click();

    cy.intercept("GET", "/api/jobs/**").as("runResponse");
    cy.wait("@DeleteFlow");
    cy.get(`#runFlow-${flowName}`).should("be.visible", {timeout: 8000}).click({force: true});
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
    runPage.navigate();

    cy.intercept("GET", "/api/jobs/**").as("runResponse");
    if (cy.get(`[data-testid="accordion-testPersonXML"].collapsed`)) {
      runPage.toggleFlowAccordion("testPersonXML");
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
    runPage.explorerLink("merge-xml-person").click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getTableView().click();
    browsePage.waitForHCTableToLoad();
    cy.wait(3000);

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
    cy.visit("/");
    runPage.navigate();
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
    curatePage.navigate();
    toolbar.getRunToolbarIcon().click({force: true});
    runPage.openStepsSelectDropdown("testPersonXML");
    runPage.controlUncheckedStep("#loadPersonXML");
    runPage.controlUncheckedStep("#ingest-orders");
    runPage.controlUncheckedStep("#merge-xml-person");
    runPage.openStepsSelectDropdown("testPersonXML");

    cy.log("**Reload page and check the same steps previously selected**");
    cy.reload();

    cy.wait(3000);
    runPage.openStepsSelectDropdown("testPersonXML");
    runPage.controlUncheckedStep("#loadPersonXML");
    runPage.controlUncheckedStep("#ingest-orders");
    runPage.controlUncheckedStep("#merge-xml-person");
  });

  it("Login with other user and check other step options are checked in a flow", {defaultCommandTimeout: 120000}, () => {
    cy.logout();
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer").withRequest();    cy.visit("/");
    runPage.navigate();

    cy.log("**Check others steps for this user are selected**");
    runPage.openStepsSelectDropdown("testPersonXML");
    runPage.controlCheckedStep("#loadPersonXML");
    runPage.controlCheckedStep("#mapPersonXML");
    runPage.controlCheckedStep("#match-xml-person");
  });

  it("Show all entity instances in Explorer after running mapping with related entities", {defaultCommandTimeout: 120000}, () => {
    const flowName = "CurateCustomerWithRelatedEntitiesJSON";
    const stepName = "mapCustomersWithRelatedEntitiesJSON";

    cy.log("**Navigate to run tile and check visibility of the personJSON flow**");
    runPage.navigate();
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
    runPage.navigate();
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
    runPage.navigate();
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

  it("Persist open flows", {defaultCommandTimeout: 120000}, () => {
    const firstFlowName = "personJSON";
    const firstStepName = "mapPersonJSON";

    cy.log("**Navigate to run tile and check visibility of the personJSON flow**");
    runPage.navigate();
    runPage.getFlowName("personJSON").should("be.visible");
    cy.intercept("/api/jobs/**").as("runResponse");

    cy.log(`**Expand flow: ${firstFlowName}**`);
    runPage.expandFlow(firstFlowName);

    cy.log("**Navigate to explorer tile using the explorer link**");
    explorePage.navigate();
    cy.waitForAsyncRequest();

    cy.log("**Navigate to run tile and check visibility of the personJSON flow**");
    runPage.navigate();
    runPage.getFlowName("personJSON").should("be.visible");
    cy.intercept("/api/jobs/**").as("runResponse");
    runPage.getRunStep(firstStepName, firstFlowName).should("be.visible");

  });

  it("Check functionality of steps to run in this flow", () => {
    const flowName = "testFlowCheck";
    runPage.createFlowButton().click();
    runPage.setFlowName(flowName);
    runPage.editSave().click();
    runPage.toggleFlowAccordion(flowName);

    runPage.addStep(flowName);
    runPage.addStepToFlow("ingest-orders");
    runPage.openStepsSelectDropdown(flowName);
    runPage.getStepToRunCheckBox("ingest-orders").should("be.checked");

    runPage.addStep(flowName);
    runPage.addStepToFlow("map-orders");
    runPage.openStepsSelectDropdown(flowName);
    runPage.getStepToRunCheckBox("ingest-orders").should("be.checked");
    runPage.getStepToRunCheckBox("map-orders").should("be.checked");

    runPage.addStep(flowName);
    runPage.addStepToFlow("match-person");
    runPage.openStepsSelectDropdown(flowName);
    runPage.getStepToRunCheckBox("ingest-orders").should("be.checked");
    runPage.getStepToRunCheckBox("map-orders").should("be.checked");
    runPage.getStepToRunCheckBox("match-person").should("be.checked");

    runPage.addStep(flowName);
    runPage.addStepToFlow("loadClientJSON");
    runPage.openStepsSelectDropdown(flowName);
    runPage.getStepToRunCheckBox("ingest-orders").should("be.checked");
    runPage.getStepToRunCheckBox("map-orders").should("be.checked");
    runPage.getStepToRunCheckBox("match-person").should("be.checked");
    runPage.getStepToRunCheckBox("loadClientJSON").should("not.be.checked");

    runPage.getStepToRunCheckBox("ingest-orders").click();
    runPage.addStep(flowName);
    runPage.addStepToFlow("loadOffice");
    runPage.openStepsSelectDropdown(flowName);
    runPage.getStepToRunCheckBox("ingest-orders").should("not.be.checked");
    runPage.getStepToRunCheckBox("map-orders").should("be.checked");
    runPage.getStepToRunCheckBox("match-person").should("be.checked");
    runPage.getStepToRunCheckBox("loadClientJSON").should("not.be.checked");
    runPage.getStepToRunCheckBox("loadOffice").should("be.checked");
  });
});
