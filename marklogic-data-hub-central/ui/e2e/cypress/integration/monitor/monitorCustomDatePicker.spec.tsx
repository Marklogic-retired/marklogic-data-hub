import monitorPage from "../../support/pages/monitor";
import runPage from "../../support/pages/run";
import loadPage from "../../support/pages/load";
import monitorSidebar from "../../support/components/monitor/monitor-sidebar";
import {Application} from "../../support/application.config";
import "cypress-wait-until";
import {toolbar} from "../../support/components/common";
import LoginPage from "../../support/pages/login";

let flowName= "testPersonJSON";

describe("Monitor Tile", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.log("**Logging into the app as a developer**");
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer", "hub-central-job-monitor").withRequest();
    LoginPage.postLogin();
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    Cypress.Cookies.preserveOnce("HubCentralSession");
    cy.restoreLocalStorage();
  });
  after(() => {
    cy.deleteRecordsInFinal("mapPersonJSON");
    cy.deleteFlows(flowName);
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Create a flow, add steps to flow and run it", {defaultCommandTimeout: 120000}, () => {
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.waitUntil(() => runPage.getFlowName("personJSON").should("be.visible"));
    runPage.createFlowButton().click();
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName(flowName);
    loadPage.confirmationOptions("Save").click();
    runPage.addStep(flowName);
    runPage.addStepToFlow("mapPersonJSON");
    runPage.verifyStepInFlow("Map", "mapPersonJSON", flowName);
    runPage.runStep("mapPersonJSON", flowName);
    runPage.verifyStepRunResult("mapPersonJSON", "success");
    runPage.closeFlowStatusModal(flowName);
    cy.waitForAsyncRequest();
  });

  it("Navigate to Monitor Tile and verify that the custom time picker works", () => {
    cy.log("**Click on the select time, select custom option and check that the input appears**");
    cy.waitUntil(() => toolbar.getMonitorToolbarIcon()).click();
    monitorPage.waitForMonitorTableToLoad();
    monitorSidebar.getStartTimeSelect().click();
    monitorSidebar.getStartTimeSelectOption("Custom").click();
    monitorSidebar.getDateRangePicker().should("be.visible").click();
    monitorSidebar.getTodayItemInDateRangePicker().click();
    monitorSidebar.getAllAvailableDaysInDateRangePicker().then($listOfTd => {
      let found: boolean = false;
      cy.wrap($listOfTd).each($td => {
        if (found) {
          cy.wrap($td).click();
          found = false;
        }
        if ($td.hasClass("today")) {
          found = true;
        }
      });
    });
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
});