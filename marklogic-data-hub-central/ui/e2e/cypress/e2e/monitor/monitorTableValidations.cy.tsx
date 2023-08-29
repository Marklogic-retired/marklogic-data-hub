import monitorSidebar from "../../support/components/monitor/monitor-sidebar";
import {mappingStepDetail} from "../../support/components/mapping/index";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import {toolbar} from "../../support/components/common";
import monitorPage from "../../support/pages/monitor";
import browsePage from "../../support/pages/browse";
import loadPage from "../../support/pages/load";
import runPage from "../../support/pages/run";


let jobIdCellsCompressed: string[][];
let jobIdCellsExtended: string[][];
let firstPageTableCellsStepName: string[][];
let firstPageTableCellsStepType: string[][];
let firstPageTableCellsEntityType: string[][];
let firstPageTableCellsDateTime: string[][];
let firstPageTableCellsStepName1: string[][];
let firstPageTableCellsStepType1: string[][];
let firstPageTableCellsEntityType1: string[][];
let firstPageTableCellsDateTime1: string[][];
let firstPageTableCellsStatus: string[];
let firstPageTableCellsStatus1: string[];
let orginalDateTimeArr: string[][];
const flowName = "testMonitor";

describe("Monitor Tile", {retries: 1}, () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
    cy.createFlowWithApi(flowName);
    cy.addStepToFlowWithApi(flowName, "loadPersonJSON", "ingestion");
    cy.addStepToFlowWithApi(flowName, "mapPersonJSON", "mapping");
    cy.addStepToFlowWithApi(flowName, "match-person", "matching");
    cy.addStepToFlowWithApi(flowName, "merge-person", "merging");
    cy.addStepToFlowWithApi(flowName, "master-person", "mastering");
    cy.addStepToFlowWithApi(flowName, "mapCustomersJSON", "mapping");
    cy.addStepToFlowWithApi(flowName, "mapClientJSON", "mapping");
    cy.addStepToFlowWithApi(flowName, "loadPersonJSON", "ingestion");
    cy.addStepToFlowWithApi(flowName, "mapOfficeStep", "mapping");
    runPage.navigate();
    runPage.runFlow(flowName);
    cy.uploadFile("patients/first-name-double-metaphone1.json");
    cy.uploadFile("patients/first-name-double-metaphone2.json");
    runPage.verifyFlowModalCompleted(flowName);
    runPage.closeFlowStatusModal(flowName);
    monitorPage.navigate();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteRecordsInFinal("mapCustomersJSON", "mapClientJSON", "mapOfficeStep");
    cy.deleteRecordsInStaging("loadValuesToIgnore");
    cy.deleteRecordsInFinal("loadPersonJSON", "mapPersonJSON", "master-person", "sm-Person-auditing", "match-person", "merge-person", "sm-Person-merged", "sm-Person-mastered", "sm-Person-notification", "mdm-content", "no-match", "datahubMasteringMatchSummary-Person");
    cy.deleteFlows("testMonitor");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  it("Ascending order validations Validate column order for Step Name,	Step Type,	StatusEntity, Type Start, Date and Time", () => {
    monitorPage.reloadOnRetry();

    jobIdCellsCompressed = [];
    jobIdCellsExtended = [];
    firstPageTableCellsStepName = [];
    firstPageTableCellsStepType = [];
    firstPageTableCellsEntityType = [];
    firstPageTableCellsDateTime = [];
    firstPageTableCellsStepName1 = [];
    firstPageTableCellsStepType1 = [];
    firstPageTableCellsEntityType1 = [];
    firstPageTableCellsDateTime1 = [];
    firstPageTableCellsStatus = [];
    firstPageTableCellsStatus1 = [];
    orginalDateTimeArr = [];

    monitorPage.getTableRows().then(($els) => {
      Cypress.$.makeArray($els).map((el) => jobIdCellsCompressed.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
    });

    monitorPage.getOrderColumnMonitorTable("Step Name").scrollIntoView().should("be.visible").click({force: true}).then(() => {
      monitorPage.getTableRows().then(($els) => {
        Cypress.$.makeArray($els).map((el) => jobIdCellsExtended.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
      });
    });

    cy.log("**compare order job id and check expanded table**");
    let jobIdCellsCompressedVar = jobIdCellsCompressed.toString().replace(/\n/g, "");
    let jobIdCellsExtendedVar = jobIdCellsExtended.toString().replace(/\n/g, "");
    cy.wrap(jobIdCellsCompressedVar).should("deep.equal", jobIdCellsExtendedVar);


    cy.log("**check step name order ASC**");
    monitorPage.getRowData(jobIdCellsCompressed, "stepNameDiv").then(($row) => {
      Cypress.$.makeArray($row).map((el) => firstPageTableCellsStepName.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
      let firstStepName = firstPageTableCellsStepName[0];
      let lastStepName = firstPageTableCellsStepName[firstPageTableCellsStepName.length - 1];
      let compareStepName = firstStepName.toString().localeCompare(lastStepName.toString());
      cy.wrap(compareStepName).should("not.be.gt", 0);
    });

    cy.log("**check step type order ASC**");
    monitorPage.getOrderColumnMonitorTable("Step Type").scrollIntoView().should("be.visible").click({force: true}).then(() => {
      monitorPage.getRowData(jobIdCellsCompressed, "stepType").then(($row) => {
        Cypress.$.makeArray($row).map((el) => firstPageTableCellsStepType.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
        let firstStepType = firstPageTableCellsStepType[0];
        let lastStepType = firstPageTableCellsStepType[firstPageTableCellsStepType.length - 1];
        let compareStepType = firstStepType.toString().localeCompare(lastStepType.toString());
        cy.wrap(compareStepType).should("not.be.gt", 0);
      });
    });

    cy.log("**check step status order ASC**");
    monitorPage.getOrderColumnMonitorTable("Status").scrollIntoView().should("be.visible").click().then(() => {
      monitorPage.getRowData(jobIdCellsCompressed, "stepStatus").then(($row) => {
        Cypress.$.makeArray($row).map((el) => {
          let dataTestId = el.getAttribute("data-testid") || "";
          firstPageTableCellsStatus.push(dataTestId);
        });
        firstPageTableCellsStatus.forEach(element => cy.log(element));
        let firstStatus = firstPageTableCellsStatus[0];
        let lastStatus = firstPageTableCellsStatus[firstPageTableCellsStatus.length - 1];
        let compareStatus = firstStatus.toString().localeCompare(lastStatus.toString());
        cy.wrap(compareStatus).should("not.be.gt", 0);
      });
    });

    cy.log("**check step entity type order ASC**");
    monitorPage.getOrderColumnMonitorTable("Entity Type").scrollIntoView().should("be.visible").click().then(() => {
      monitorPage.getRowData(jobIdCellsCompressed, "stepEntityType").then(($row) => {
        Cypress.$.makeArray($row).map((el) => firstPageTableCellsEntityType.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
        let firstEntityType = firstPageTableCellsEntityType[0];
        let lastEntityType = firstPageTableCellsEntityType[firstPageTableCellsEntityType.length - 1];
        let compareEntityType = firstEntityType.toString().localeCompare(lastEntityType.toString());
        cy.wrap(compareEntityType).should("not.be.gt", 0);
      });
    });
    monitorPage.getTableNestedRows().should("be.visible");

    cy.log("**check step datetime order DESC by default**");
    monitorPage.getRowData(jobIdCellsCompressed, "stepStartDate").then(($row) => {
      Cypress.$.makeArray($row)
        .map((el) => orginalDateTimeArr.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
      let firstDateTime = orginalDateTimeArr[0];
      let lastDateTime = orginalDateTimeArr[orginalDateTimeArr.length - 1];
      let compareDateTime = firstDateTime.toString().localeCompare(lastDateTime.toString());
      expect(compareDateTime).not.to.be.lt(0);
    });

    cy.log("**click fifth column to get ASC order and get start date and time**");
    monitorPage.getOrderColumnMonitorTable("Start Date and Time").scrollIntoView().should("be.visible").click().then(() => {
      monitorPage.getRowData(jobIdCellsCompressed, "stepStartDate").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => firstPageTableCellsDateTime.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
      });
    });
    monitorPage.getTableNestedRows().should("be.visible");
  });

  it("Descending order validations for column order for Step Name,	Step Type,	StatusEntity, Type Start, Date and Time ", () => {
    monitorPage.reloadOnRetry();

    cy.log("**check step name order DESC**");
    monitorPage.getOrderColumnMonitorTable("Step Name").scrollIntoView().should("be.visible").click({force: true}).click({force: true}).then(() => {
      monitorPage.getTableNestedRows().should("be.visible");
      monitorPage.getRowData(jobIdCellsCompressed, "stepNameDiv").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => firstPageTableCellsStepName1.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
        let firstStepName = firstPageTableCellsStepName1[0];
        let lastStepName = firstPageTableCellsStepName1[firstPageTableCellsStepName1.length - 1];
        let compareStepName = firstStepName.toString().localeCompare(lastStepName.toString());
        expect(compareStepName).not.to.be.lt(0);
      });
    });

    cy.log("**check step type order DESC**");
    monitorPage.getOrderColumnMonitorTable("Step Type").scrollIntoView().should("be.visible").click({force: true}).click({force: true}).then(() => {
      monitorPage.getTableNestedRows().should("be.visible");
      monitorPage.getRowData(jobIdCellsCompressed, "stepType").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => firstPageTableCellsStepType1.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
        let firstStepType = firstPageTableCellsStepType1[0];
        let lastStepType = firstPageTableCellsStepType1[firstPageTableCellsStepType1.length - 1];
        let compareStepType = firstStepType.toString().localeCompare(lastStepType.toString());
        expect(compareStepType).not.to.be.lt(0);
      });
    });

    cy.log("**check step status order DESC**");
    monitorPage.getOrderColumnMonitorTable("Status").scrollIntoView().should("be.visible").click({force: true}).click({force: true}).then(() => {
      monitorPage.getTableNestedRows().should("be.visible");
      monitorPage.getRowData(jobIdCellsCompressed, "stepStatus").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => {
            let dataTestId = el.getAttribute("data-testid") || "";
            firstPageTableCellsStatus1.push(dataTestId);
          });
        let firstStatus = firstPageTableCellsStatus1[0];
        let lastStatus = firstPageTableCellsStatus1[firstPageTableCellsStatus1.length - 1];
        let compareStatus = firstStatus.toString().localeCompare(lastStatus.toString());
        expect(compareStatus).not.to.be.lt(0);
      });
    });

    cy.log("**check Entity Type order DESC**");
    monitorPage.getOrderColumnMonitorTable("Entity Type").scrollIntoView().should("be.visible").click({force: true}).click({force: true}).then(() => {
      monitorPage.getTableNestedRows().should("be.visible");
      monitorPage.getRowData(jobIdCellsCompressed, "stepEntityType").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => firstPageTableCellsEntityType1.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
        let firstStatus = firstPageTableCellsEntityType1[0];
        let lastStatus = firstPageTableCellsEntityType1[firstPageTableCellsEntityType1.length - 1];
        let compareStatus = firstStatus.toString().localeCompare(lastStatus.toString());
        expect(compareStatus).not.to.be.lt(0);
      });
    });

    cy.log("**check step datetime order DESC**");
    monitorPage.getOrderColumnMonitorTable("Start Date and Time").scrollIntoView().should("be.visible").click({force: true}).click({force: true}).then(() => {
      monitorPage.getTableNestedRows().should("be.visible");
      monitorPage.getRowData(jobIdCellsCompressed, "stepStartDate").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => firstPageTableCellsDateTime1.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
        let firstDateTime = firstPageTableCellsDateTime1[0];
        let lastDateTime = firstPageTableCellsDateTime1[firstPageTableCellsDateTime1.length - 1];
        let compareDateTime = firstDateTime.toString().localeCompare(lastDateTime.toString());
        expect(compareDateTime).not.to.be.lt(0);
      });
    });
  });

  it("Save table settings to session storage and get it back part 1", () => {
    monitorPage.reloadOnRetry();

    monitorPage.getCollapseAllTableRows().scrollIntoView().click({force: true});
    monitorPage.getRowByIndex(1).click({force: true});
    monitorPage.checkExpandedRow();
    monitorPage.getPaginationPageSizeOptions().first().scrollIntoView().should("be.visible").select("10 / page");
    mappingStepDetail.selectCustomPageSourceTable("2");

    cy.log("**Go to another page and back**");
    loadPage.navigate();
    monitorPage.navigate();

    cy.log("**Checking and setting in session new data**");
    mappingStepDetail.verifyContent("10 / page");
    monitorPage.checkCurrentPage(2);
    mappingStepDetail.selectCustomPageSourceTable("1");
    monitorPage.checkExpandedRow();
    monitorPage.getColumnSelectorIcon().click();
    mappingStepDetail.selectColumnPopoverById("column-user-id").click();
    mappingStepDetail.selectColumnPopoverById("column-flowName-id").click();
    monitorPage.getColumnSelectorApplyButton().should("be.visible").click();

    cy.log("**click second column to get ASC order and get step type data**");
    monitorPage.getOrderColumnMonitorTable("Step Type").scrollIntoView().should("be.visible").click().then(() => {
      monitorPage.getRowData(jobIdCellsCompressed, "stepType").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => firstPageTableCellsStepType.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
      });
    });

    cy.log("**Go to another page and back to verify data from session storage**");
    loadPage.navigate();
    monitorPage.navigate();
    monitorPage.verifyVisibilityTableHeader("Load", false);
    monitorPage.verifyVisibilityTableHeader("Flow Name", false);
    monitorPage.getColumnSelectorIcon().click();
    mappingStepDetail.selectColumnPopoverById("column-user-id").should("not.be.checked");
    mappingStepDetail.selectColumnPopoverById("column-flowName-id").should("not.be.checked");

    cy.log("**Reset visible columns options**");
    mappingStepDetail.selectColumnPopoverById("column-user-id").click();
    mappingStepDetail.selectColumnPopoverById("column-flowName-id").click();
    monitorPage.getColumnSelectorApplyButton().should("be.visible").click();

    cy.log("**Checking sorting from session storage**");
    let firstStepType = firstPageTableCellsStepType[0];
    let lastStepType = firstPageTableCellsStepType[firstPageTableCellsStepType.length - 1];
    let compareStepType = firstStepType.toString().localeCompare(lastStepType.toString());
    expect(compareStepType).not.to.be.gt(0);

    cy.log("**Applying facet search and controlling the expanded row after coming back**");
    monitorPage.selectAndApplyFacet("step-type", 1);
    monitorPage.getExpandAllTableRows().scrollIntoView().click({force: true});
    toolbar.getLoadToolbarIcon().click();
    toolbar.getMonitorToolbarIcon().click();
    monitorPage.clearFacets();
  });

  it("Apply facet search and verify docs", () => {
    monitorPage.reloadOnRetry();

    browsePage.getShowMoreLink("step-type").click();
    monitorPage.validateAppliedFacetTableRows("step-type", 2, "mapping");
  });

  it("Apply facet search and clear individual grey facet", () => {
    monitorPage.reloadOnRetry();

    monitorPage.getExpandAllTableRows().scrollIntoView().click({force: true});
    cy.wait(1500);
    monitorPage.validateClearGreyFacet("step-type", 0);
  });

  it("Apply facet search and clear all grey facets", () => {
    monitorPage.reloadOnRetry();

    cy.wait(1000);
    monitorPage.validateGreyFacet("step-type", 0);
    monitorPage.validateGreyFacet("flow", 0);
    browsePage.getClearGreyFacets().click();
  });

  it("Verify functionality of clear and apply facet buttons", () => {
    monitorPage.reloadOnRetry();

    entitiesSidebar.clearAllFacetsButton.should("be.disabled");
    entitiesSidebar.applyFacetsButton.should("be.disabled");
    cy.wait(1000);

    monitorPage.validateGreyFacet("step-type", 0);
    entitiesSidebar.clearAllFacetsButton.should("not.be.disabled");
    entitiesSidebar.applyFacetsButton.should("not.be.disabled");

    entitiesSidebar.applyFacets();
    entitiesSidebar.clearAllFacetsButton.should("not.be.disabled");
    entitiesSidebar.applyFacetsButton.should("be.disabled");

    monitorPage.validateGreyFacet("step", 0);
    entitiesSidebar.clearAllFacetsButton.should("not.be.disabled");
    entitiesSidebar.applyFacetsButton.should("not.be.disabled");
    entitiesSidebar.clearAllFacetsApplied();
    cy.waitForAsyncRequest();
    entitiesSidebar.clearAllFacetsButton.should("be.disabled");
    entitiesSidebar.applyFacetsButton.should("be.disabled");
  });

  it("Verify step status faceting", () => {
    monitorPage.reloadOnRetry();

    cy.scrollTo("top", {ensureScrollable: false});
    cy.wait(1000);
    monitorSidebar.verifyFacetCategory("status");

    cy.log("**verify status faceting**");
    monitorPage.selectAndApplyFacet("status", 0);
    cy.waitForAsyncRequest();

    monitorPage.getExpandAllTableRows().scrollIntoView().click({force: true});
    cy.scrollTo("left", {ensureScrollable: false});
    monitorPage.getTableNestedRows().then(($row) => {
      for (let i = 0; i < $row.length; i++) {
        cy.get(".rowExpandedDetail > .stepStatus").eq(i).invoke("attr", "data-testid").then((id) => {
          expect(id).to.equal("completed");
        });
      }
    });
    cy.log("**failed status is removed**");
    monitorPage.verifyTableRow("cyCardView").should("not.exist");
    entitiesSidebar.clearAllFacetsApplied();
  });

  it("Verify job ID link opens status modal", () => {
    monitorPage.reloadOnRetry();

    cy.log("*** open status modal via jobs link ***");
    cy.wait(1000);
    monitorPage.getAllJobIdLink().first().should("be.visible").click();
    runPage.getFlowStatusModal().should("be.visible");

    cy.log("*** verify step result content inside status modal ***");
    runPage.getStepSuccess("mapPersonJSON").should("be.visible");
    runPage.verifyFlowModalCompleted(flowName);
    cy.log("*** modal can be closed ***");
    runPage.closeFlowStatusModal(flowName);
    runPage.getFlowStatusModal().should("not.exist");
    entitiesSidebar.clearAllFacetsApplied();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
  });

  it("Verify facets can be selected, applied and cleared using clear text", () => {
    monitorPage.reloadOnRetry();

    browsePage.clickShowMoreLink("step-type");
    monitorPage.clickFacetCheckbox("step-type", "ingestion");
    browsePage.getFacetSearchSelectionCount("step-type").should("contain", "1");
    browsePage.getClearFacetSelection("step-type").should("be.visible").click({force: true});
    browsePage.waitForSpinnerToDisappear();
  });

  it("Apply facets, unchecking them should not recheck original facets", () => {
    monitorPage.reloadOnRetry();

    browsePage.clearAllFacets();
    browsePage.clickShowMoreLink("step");

    monitorPage.clickFacetCheckbox("step", "mapPersonJSON");
    monitorPage.clickFacetCheckbox("step", "loadPersonJSON");

    browsePage.getFacetItemCheckbox("step", "mapPersonJSON").should("be.checked");
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").should("be.checked");
    browsePage.getGreySelectedFacets("mapPersonJSON").should("exist");
    browsePage.getGreySelectedFacets("loadPersonJSON").should("exist");

    cy.intercept("POST", "/api/jobs/stepResponses").as("stepResponses");
    browsePage.applyFacet();
    cy.wait("@stepResponses");

    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").should("be.checked");
    browsePage.getFacetItemCheckbox("step", "mapPersonJSON").should("be.checked");

    browsePage.clickFacetCheckbox("status", "completed");
    browsePage.clickFacetCheckbox("step", "loadPersonJSON");
    cy.wait("@stepResponses");

    browsePage.clickFacetCheckbox("step", "mapPersonJSON");
    cy.wait("@stepResponses");

    browsePage.clickFacetCheckbox("status", "completed");

    cy.log("Verify that neither loadPersonJSON nor mapPersonJSON are checked");
    browsePage.clearStepFacetsButton.should(($button) => {
      expect($button.attr("class")).to.contain("facet_clearInactive");
    });
    browsePage.stepSelectedCount.should("not.exist");

    browsePage.getFacetItemCheckbox("status", "completed").should("not.be.checked");
    browsePage.statusSelectedCount.should("not.exist");
  });

  it("Verify select, apply, remove grey and applied startTime facet", () => {
    monitorPage.reloadOnRetry();

    cy.log("Select multiple facets and remove startTime grey facet");
    browsePage.clearAllFacets();
    monitorPage.validateGreyFacet("step-type", 0);
    monitorPage.validateGreyFacet("step-type", 1);
    monitorPage.selectStartTimeFromDropDown("Today");
    monitorPage.getSelectedTime("Today").should("contain", "Today");
    browsePage.getGreySelectedFacets("Today").should("exist");
    monitorPage.getSelectedTime("Today").should("contain", "Today");

    cy.log("Select multiple facets and apply all facets");
    monitorPage.selectStartTimeFromDropDown("Today");
    monitorPage.getSelectedTime("Today").should("contain", "Today");
    entitiesSidebar.applyFacets();
    browsePage.getAppliedFacets("Today").should("exist");
    monitorPage.getSelectedTime("Today").should("contain", "Today");

    cy.log("Remove applied startTime facet");
    monitorPage.clearFacetSearchSelection("Today");
    browsePage.getSelectedFacet("Today").should("not.exist");
    browsePage.clearAllFacets();
  });
});