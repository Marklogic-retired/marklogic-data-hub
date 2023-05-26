import monitorSidebar from "../../support/components/monitor/monitor-sidebar";
import monitorPage from "../../support/pages/monitor";
import loadPage from "../../support/pages/load";
import runPage from "../../support/pages/run";
import "cypress-wait-until";

let flowName = "testPersonJSON";
let stepName = "mapPersonJSON";

const userRoles = [
  "hub-central-flow-writer",
  "hub-central-mapping-writer",
  "hub-central-job-monitor"
];

describe("Monitor Tile", () => {
  before(() => {
    cy.loginAsTestUserWithRoles(...userRoles).withRequest();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  after(() => {
    cy.deleteRecordsInFinal(stepName);
    cy.deleteFlows(flowName);
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  let jobId: any;
  let stepType: any;
  let stepTypeAux: any;
  let stepNameAux = "";
  let stepStatus = "completed";

  it("Create a flow, add steps to flow and run it", {defaultCommandTimeout: 120000}, () => {
    runPage.navigate();

    cy.waitUntil(() => runPage.getFlowName("personJSON").should("be.visible"));
    runPage.createFlowButton().click();
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName(flowName);
    loadPage.confirmationOptions("Save").click();
    runPage.addStep(flowName);
    runPage.addStepToFlow(stepName);
    runPage.verifyStepInFlow("Mapping", stepName, flowName);
    runPage.runStep(stepName, flowName);
    runPage.verifyStepRunResult(stepName, "success");

    cy.log("**Getting Data From Modal**");
    monitorPage.getJobIdValueModal("jobIdValueModal").then($element => {
      jobId = $element.text();
    });

    monitorPage.getStepTypeValueModal().then($element => {
      stepType = $element.text();
    });

    runPage.closeFlowStatusModal(flowName);
    cy.waitForAsyncRequest();
  });

  it("Navigate to Monitor Tile and verify that the custom time picker works", () => {
    monitorPage.navigate();

    cy.log("***Expand related row by JobId and get the data***");
    monitorPage.getExpandoRowIconByJobId(jobId).click();

    monitorPage.getElementByClass(`.stepNameDiv`).then($element => {
      stepNameAux = $element.text();
      expect(stepName).equal(stepNameAux);
    });

    monitorPage.getElementByClass(`.stepType`).then($element => {
      stepTypeAux = $element.text();
      expect(stepType).equal(stepTypeAux.toLowerCase());
    });

    cy.log("***Compare modal values and row***");
    monitorPage.getElementByClass(`.stepStatus`).invoke("data", "testid").then(dataId => expect(stepStatus).equal(dataId));

    cy.log("**Click on the select time, select custom option and check that the input appears**");
    monitorSidebar.getStartTimeSelect().click();
    monitorSidebar.getStartTimeSelectOption("Custom").click();
    monitorSidebar.getDateRangePicker().should("be.visible").click();
    monitorSidebar.getTodayItemInDateRangePicker().click();
    monitorSidebar.getDateRangePicker().invoke("val").then((value) => {
      if (value) {
        const dateArray = value.toString().split(" ~ ").map(d => d.split("-"));
        const initDate = new Date(Number(dateArray[0][0]), Number(dateArray[0][1]) - 1, Number(dateArray[0][2]));
        const finalDate = new Date(Number(dateArray[1][0]), Number(dateArray[1][1]) - 1, Number(dateArray[1][2]));
        cy.get(`[data-testid="clear-grey-${value}"]`).should("exist");
        cy.get(`[data-testid="facet-apply-button"]`).click();
        cy.get(`[data-testid="clear-${value}"]`).should("have.class", "btn-outline-blue").then(() => {
          monitorPage.getTableElement("Start Time", ($cell: any) => {
            const cellText = $cell.text().split(" ")[0].split("-");
            const cellDate = new Date(Number(cellText[0]), Number(cellText[1]) - 1, Number(cellText[2]));
            expect(cellDate.getTime()).to.be.gte(initDate.getTime());
            expect(cellDate.getTime()).to.be.lte(finalDate.getTime());
          });
        });
        cy.get(`[data-testid="clear-${value}"]`).click();
        monitorSidebar.getDateRangePicker().should("not.exist");
      }
    });
  });

  it("Verify job ID link opens status modal", () => {
    cy.log("*** open status modal via jobs link ***");
    // There's a re-render.
    cy.wait(1000);
    monitorPage.getAllJobIdLink().first().should("be.visible").click();
    runPage.getFlowStatusModal().should("be.visible");

    cy.log("*** verify step result content inside status modal ***");
    runPage.getStepSuccess("mapPersonJSON").should("be.visible");
    runPage.verifyFlowModalCompleted("testPersonJSON");
    cy.log("*** modal can be closed ***");
    runPage.closeFlowStatusModal("testPersonJSON");
    runPage.getFlowStatusModal().should("not.exist");
  });
});