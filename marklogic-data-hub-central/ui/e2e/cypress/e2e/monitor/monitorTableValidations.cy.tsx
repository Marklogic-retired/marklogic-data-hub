import monitorSidebar from "../../support/components/monitor/monitor-sidebar";
import {mappingStepDetail} from "../../support/components/mapping/index";
import {toolbar} from "../../support/components/common";
import monitorPage from "../../support/pages/monitor";
import browsePage from "../../support/pages/browse";
import runPage from "../../support/pages/run";
import loadPage from "../../support/pages/load";
import "cypress-wait-until";

describe("Monitor Tile", () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
    monitorPage.navigate();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
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

  let firstPageTableCellsJobId: any[] = [];
  let firstPageTableCellsJobIdAux: any[] = [];
  let firstPageTableCellsStepName: any[] = [];
  let firstPageTableCellsStepType: any[] = [];
  let firstPageTableCellsStatus: any[] = [];
  let firstPageTableCellsEntityType: any[] = [];
  let firstPageTableCellsDateTime: any[] = [];
  let firstPageTableCellsStepName1: any[] = [];
  let firstPageTableCellsStepType1: any[] = [];
  let firstPageTableCellsStatus1: any[] = [];
  let firstPageTableCellsDateTime1: any[] = [];
  let orginalDateTimeArr: any[] = [];
  const flowName = "testMonitor";

  it("Can create flow and add steps to flow and reorder flow", {defaultCommandTimeout: 120000}, () => {
    //Verify create flow and add all user-defined steps to flow via Run tile
    toolbar.getRunToolbarIcon().should("be.visible").click();
    cy.waitForAsyncRequest();
    runPage.createFlowButton().click({force: true});
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName(flowName);
    loadPage.confirmationOptions("Save").click();
    runPage.addStep(flowName);
    runPage.addStepToFlow("loadPersonJSON");
    runPage.addStep(flowName);
    runPage.addStepToFlow("mapPersonJSON");
    runPage.addStep(flowName);
    runPage.addStepToFlow("match-person");
    runPage.addStep(flowName);
    runPage.addStepToFlow("merge-person");
    runPage.addStep(flowName);
    runPage.addStepToFlow("master-person");
    runPage.addStep(flowName);
    runPage.addStepToFlow("mapCustomersJSON");
    runPage.addStep(flowName);
    runPage.addStepToFlow("mapClientJSON");
    runPage.addStep(flowName);
    runPage.addStepToFlow("mapOfficeStep");
    runPage.addStep(flowName);

    cy.intercept("GET", "/api/jobs/**").as("runResponse");
    runPage.runFlow(flowName);
    cy.uploadFile("patients/first-name-double-metaphone1.json");
    cy.uploadFile("patients/first-name-double-metaphone2.json");
    cy.wait("@runResponse");
    cy.waitForAsyncRequest();
    runPage.verifyFlowModalCompleted(flowName);
    runPage.closeFlowStatusModal(flowName);
  });

  it("Validate column order for Step Name,	Step Type,	StatusEntity, Type Start, Date and Time part 1", () => {
    monitorPage.navigate();
    cy.log("**expand table and get data column of JobId**");
    monitorPage.getTableRows().then(($els) => {
      return (
        Cypress.$.makeArray($els)
          .map((el) => firstPageTableCellsJobId.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")))
      );
    });

    cy.log("**click first column to get ASC order and get jod id data**");
    monitorPage.getOrderColumnMonitorTable("Step Name").should("exist").scrollIntoView().should("be.visible").click({force: true}).then(() => {
      monitorPage.getTableRows().then(($els) => {
        return (
          Cypress.$.makeArray($els)
            .map((el) => firstPageTableCellsJobIdAux.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")))
        );
      });
    });
    monitorPage.getTableNestedRows().should("be.visible");

    cy.log("**get ASC order and entiy step name**");
    monitorPage.getRowData(firstPageTableCellsJobId, "stepNameDiv").then(($row) => {
      Cypress.$.makeArray($row)
        .map((el) => firstPageTableCellsStepName.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
    });
    monitorPage.getTableNestedRows().should("be.visible");

    cy.log("**click second column to get ASC order and get step type data**");
    monitorPage.getOrderColumnMonitorTable("Step Type").should("exist").scrollIntoView().should("be.visible").click({force: true}).then(() => {
      monitorPage.getRowData(firstPageTableCellsJobId, "stepType").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => firstPageTableCellsStepType.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
      });
    });
    monitorPage.getTableNestedRows().should("be.visible");

    cy.log("**click third column to get ASC order and get status data**");
    monitorPage.getOrderColumnMonitorTable("Status").should("exist").scrollIntoView().should("be.visible").click().then(() => {
      monitorPage.getRowData(firstPageTableCellsJobId, "stepStatus").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => {
            if (el) { firstPageTableCellsStatus.push(el.getAttribute("data-testid")); } else { firstPageTableCellsStatus.push(""); }
          });
      });
    });
    monitorPage.getTableNestedRows().should("be.visible");

    cy.log("**click fourth column to get ASC order and get entiy type data**");
    monitorPage.getOrderColumnMonitorTable("Entity Type").should("exist").scrollIntoView().should("be.visible").click().then(() => {
      monitorPage.getRowData(firstPageTableCellsJobId, "stepEntityType").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => firstPageTableCellsEntityType.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
      });
    });
    monitorPage.getTableNestedRows().should("be.visible");

    cy.log("**check step datetime order DESC by default**");
    monitorPage.getRowData(firstPageTableCellsJobId, "stepStartDate").then(($row) => {
      Cypress.$.makeArray($row)
        .map((el) => orginalDateTimeArr.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
      let firstDateTime = orginalDateTimeArr[0];
      let lastDateTime = orginalDateTimeArr[orginalDateTimeArr.length - 1];
      let compareDateTime = firstDateTime.toString().localeCompare(lastDateTime.toString());
      expect(compareDateTime).not.to.be.lt(0);
    });

    cy.log("**click fifth column to get ASC order and get start date and time**");
    monitorPage.getOrderColumnMonitorTable("Start Date and Time").should("exist").scrollIntoView().should("be.visible").click().then(() => {
      monitorPage.getRowData(firstPageTableCellsJobId, "stepStartDate").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => firstPageTableCellsDateTime.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
      });
    });
    monitorPage.getTableNestedRows().should("be.visible");

  });

  it("Ascending order validations Validate column order for Step Name,	Step Type,	StatusEntity, Type Start, Date and Time ", () => {

    cy.log("**order original job id array**");
    firstPageTableCellsJobId.forEach(element => cy.log(element));

    cy.log("**compare order job id and check expanded table**");
    firstPageTableCellsJobIdAux.forEach(element => cy.log(element));
    let firstPageTableCellsJobIdVar = firstPageTableCellsJobId.toString().replace(/\n/g, "");
    let firstPageTableCellsJobIdAuxVar = firstPageTableCellsJobIdAux.toString().replace(/\n/g, "");
    cy.wrap(firstPageTableCellsJobIdVar).should("deep.equal", firstPageTableCellsJobIdAuxVar);

    cy.log("**check step name order ASC**");
    firstPageTableCellsStepName.forEach(element => cy.log(element));
    let firstStepName = firstPageTableCellsStepName[0];
    let lastStepName = firstPageTableCellsStepName[firstPageTableCellsStepName.length - 1];
    let compareStepName = firstStepName.toString().localeCompare(lastStepName.toString());
    cy.wrap(compareStepName).should("not.be.gt", 0);

    cy.log("**check step type order ASC**");
    firstPageTableCellsStepType.forEach(element => cy.log(element));
    let firstStepType = firstPageTableCellsStepType[0];
    let lastStepType = firstPageTableCellsStepType[firstPageTableCellsStepType.length - 1];
    let compareStepType = firstStepType.toString().localeCompare(lastStepType.toString());
    cy.wrap(compareStepType).should("not.be.gt", 0);


    cy.log("**check step status order ASC**");
    firstPageTableCellsStatus.forEach(element => cy.log(element));
    let firstStatus = firstPageTableCellsStatus[0];
    let lastStatus = firstPageTableCellsStatus[firstPageTableCellsStatus.length - 1];
    let compareStatus = firstStatus.toString().localeCompare(lastStatus.toString());
    cy.wrap(compareStatus).should("not.be.gt", 0);


    cy.log("**check step entity type order ASC**");
    firstPageTableCellsEntityType.forEach(element => cy.log(element));
    let firstEntityType = firstPageTableCellsEntityType[0];
    let lastEntityType = firstPageTableCellsEntityType[firstPageTableCellsEntityType.length - 2];
    let compareEntityType = firstEntityType.toString().localeCompare(lastEntityType.toString());
    cy.wrap(compareEntityType).should("not.be.gt", 0);
  });

  it("Descending order validations for column order for Step Name,	Step Type,	StatusEntity, Type Start, Date and Time ", () => {
    cy.log("**check step name order DESC**");
    monitorPage.getOrderColumnMonitorTable("Step Name").should("exist").scrollIntoView().should("be.visible").dblclick({force: true}).then(() => {
      monitorPage.getTableNestedRows().should("be.visible");
      monitorPage.getRowData(firstPageTableCellsJobId, "stepNameDiv").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => firstPageTableCellsStepName1.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
        let firstStepName = firstPageTableCellsStepName1[0];
        let lastStepName = firstPageTableCellsStepName1[firstPageTableCellsStepName1.length - 1];
        let compareStepName = firstStepName.toString().localeCompare(lastStepName.toString());
        expect(compareStepName).not.to.be.lt(0);
      });
    });

    cy.log("**check step type order DESC**");
    monitorPage.getOrderColumnMonitorTable("Step Type").should("exist").scrollIntoView().should("be.visible").dblclick({force: true}).then(() => {
      monitorPage.getTableNestedRows().should("be.visible");
      monitorPage.getRowData(firstPageTableCellsJobId, "stepType").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => firstPageTableCellsStepType1.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
        let firstStepType = firstPageTableCellsStepType1[0];
        let lastStepType = firstPageTableCellsStepType1[firstPageTableCellsStepType1.length - 1];
        let compareStepType = firstStepType.toString().localeCompare(lastStepType.toString());
        expect(compareStepType).not.to.be.lt(0);
      });
    });

    cy.log("**check step status order DESC**");
    monitorPage.getOrderColumnMonitorTable("Status").should("exist").scrollIntoView().should("be.visible").dblclick({force: true}).then(() => {
      monitorPage.getTableNestedRows().should("be.visible");
      monitorPage.getRowData(firstPageTableCellsJobId, "stepStatus").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => {
            if (el) { firstPageTableCellsStatus1.push(el.getAttribute("data-testid")); } else { firstPageTableCellsStatus1.push(""); }
          });
        let firstStatus = firstPageTableCellsStatus1[0];
        let lastStatus = firstPageTableCellsStatus1[firstPageTableCellsStatus1.length - 1];
        let compareStatus = firstStatus.toString().localeCompare(lastStatus.toString());
        expect(compareStatus).not.to.be.lt(0);
      });
    });

    //Commenting this validations due to a bug DHFPROD-9157
    /*cy.log("**check step entity type order DESC**");
    monitorPage.getOrderColumnMonitorTable("Entity Type").scrollIntoView().dblclick({force: true}).then(() => {
      monitorPage.getTableNestedRows().should("be.visible");
      monitorPage.getRowData(firstPageTableCellsJobId, "stepEntityType").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) =>  firstPageTableCellsEntityType1.push(el.innerText.toString().replace(/\t/g, "").split("\r\n"));
          });
        let firstEntityType = firstPageTableCellsEntityType1[0];
        let lastEntityType = firstPageTableCellsEntityType1[firstPageTableCellsEntityType1.length - 1];
        let compareEntityType = firstEntityType.toString().localeCompare(lastEntityType.toString());
        expect(compareEntityType).not.to.be.lt(0);
      });
    });*/

    cy.log("**check step datetime order DESC**");
    monitorPage.getOrderColumnMonitorTable("Start Date and Time").should("exist").scrollIntoView().should("be.visible").dblclick({force: true}).then(() => {
      monitorPage.getTableNestedRows().should("be.visible");
      monitorPage.getRowData(firstPageTableCellsJobId, "stepStartDate").then(($row) => {
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
    monitorPage.getCollapseAllTableRows().scrollIntoView().click({force: true});
    monitorPage.getRowByIndex(1).click({force: true});
    monitorPage.checkExpandedRow();
    monitorPage.getPaginationPageSizeOptions().first().scrollIntoView().should("be.visible").select("10 / page");
    mappingStepDetail.selectCustomPageSourceTable("2");

    cy.log("**Go to another page and back**");
    toolbar.getLoadToolbarIcon().click();
    toolbar.getMonitorToolbarIcon().click();

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
    monitorPage.getOrderColumnMonitorTable("Step Type").should("exist").scrollIntoView().should("be.visible").click().then(() => {
      monitorPage.getRowData(firstPageTableCellsJobId, "stepType").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => firstPageTableCellsStepType.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
      });
    });

    cy.log("**Go to another page and back to verify data from session storage**");
    toolbar.getLoadToolbarIcon().click();
    toolbar.getMonitorToolbarIcon().click();
    monitorPage.verifyVisibilityTableHeader("Load", false);
    monitorPage.verifyVisibilityTableHeader("Flow Name", false);
    monitorPage.getColumnSelectorIcon().click();
    mappingStepDetail.selectColumnPopoverById("column-user-id").should("not.be.checked");
    mappingStepDetail.selectColumnPopoverById("column-flowName-id").should("not.be.checked");

    cy.log("**Reset visible columns options**");
    mappingStepDetail.selectColumnPopoverById("column-user-id").click();
    mappingStepDetail.selectColumnPopoverById("column-flowName-id").click();
    monitorPage.getColumnSelectorApplyButton().should("be.visible").click();
  });

  it("Save table settings to session storage and get it back part 2", () => {
    cy.log("**Checking sorting from session storage**");
    firstPageTableCellsStepType.forEach(element => cy.log(element));
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
    cy.wait(1500);
    browsePage.getShowMoreLink("step-type").click();
    monitorPage.validateAppliedFacetTableRows("step-type", 2, "mapping");
  });

  it("Apply facet search and clear individual grey facet", () => {
    monitorPage.getExpandAllTableRows().scrollIntoView().click({force: true});
    cy.wait(1500);
    monitorPage.validateClearGreyFacet("step-type", 0);
  });

  it("Apply facet search and clear all grey facets", () => {
    cy.wait(1000);
    monitorPage.validateGreyFacet("step-type", 0);
    monitorPage.validateGreyFacet("flow", 0);
    browsePage.getClearGreyFacets().click();
  });

  it("Verify functionality of clear and apply facet buttons", () => {
    browsePage.getClearAllFacetsButton().should("be.disabled");
    browsePage.getApplyFacetsButton().should("be.visible").should("be.disabled");
    cy.wait(1000);
    monitorPage.validateGreyFacet("step-type", 0);
    browsePage.getClearAllFacetsButton().should("not.be.disabled");
    browsePage.getApplyFacetsButton().should("be.visible").should("not.be.disabled").click();
    cy.waitForAsyncRequest();
    browsePage.getClearAllFacetsButton().should("not.be.disabled");
    browsePage.getApplyFacetsButton().should("be.visible").should("be.disabled");
    monitorPage.validateGreyFacet("step", 0);
    browsePage.getClearAllFacetsButton().should("not.be.disabled");
    browsePage.getApplyFacetsButton().should("be.visible").should("not.be.disabled");
    browsePage.getClearAllFacetsButton().click();
    cy.waitForAsyncRequest();
    browsePage.getClearAllFacetsButton().should("be.disabled");
    browsePage.getApplyFacetsButton().should("be.visible").should("be.disabled");
  });

  it("Verify step status faceting", () => {
    cy.scrollTo("top", {ensureScrollable: false});
    cy.wait(1000);
    monitorSidebar.verifyFacetCategory("status");
    browsePage.getApplyFacetsButton().should("be.visible").scrollIntoView().click({force: true});
    cy.waitForAsyncRequest();
    cy.scrollTo("left", {ensureScrollable: false});
    monitorPage.validateAppliedFacetTableRows("status", 3, "completed");
    cy.waitForAsyncRequest();
  });

  it("apply multiple facets, deselect them, apply changes, apply multiple, clear them, verify no facets checked", () => {
    browsePage.clickShowMoreLink("step");
    browsePage.getShowMoreLink("step").scrollIntoView();
    monitorPage.getFacetCheckbox("step", "loadPersonJSON").scrollIntoView().click({force: true});
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").should("be.checked");
    browsePage.getGreySelectedFacets("loadPersonJSON").should("exist");
    browsePage.clickShowMoreLink("flow");
    browsePage.getShowMoreLink("flow").scrollIntoView();
    monitorPage.getFacetCheckbox("flow", flowName).scrollIntoView().click({force: true});
    browsePage.getFacetItemCheckbox("flow", flowName).should("be.checked");
    browsePage.getGreySelectedFacets(flowName).should("exist");
    monitorPage.getFacetCheckbox("step-type", "ingestion").scrollIntoView().click({force: true});
    browsePage.getFacetItemCheckbox("step-type", "ingestion").should("be.checked");
    browsePage.getGreySelectedFacets("ingestion").should("exist");
    browsePage.getFacetApplyButton().scrollIntoView().click({force: true});
    monitorPage.clearFacetSearchSelection(flowName);
    cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
    browsePage.getFacetItemCheckbox("step-type", "ingestion").should("be.checked");
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").click();
    browsePage.getFacetItemCheckbox("step-type", "ingestion").click();
    cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").should("not.be.checked");
    browsePage.getFacetItemCheckbox("step-type", "ingestion").should("not.be.checked");
    browsePage.getGreySelectedFacets("loadPersonJSON").should("not.exist");
    browsePage.getGreySelectedFacets("ingestion").should("not.exist");
    cy.waitForAsyncRequest();
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").click();
    browsePage.getFacetItemCheckbox("step-type", "ingestion").click();
    cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
    browsePage.getFacetApplyButton().click();
    monitorPage.clearFacetSearchSelection("loadPersonJSON");
    monitorPage.clearFacetSearchSelection("ingestion");
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").should("not.be.checked");
    browsePage.getFacetItemCheckbox("step-type", "ingestion").should("not.be.checked");
    browsePage.getGreySelectedFacets("loadPersonJSON").should("not.exist");
    browsePage.getGreySelectedFacets("ingestion").should("not.exist");
  });


  it("Verify facets can be selected, applied and cleared using clear text", () => {
    monitorPage.getFacetCheckbox("step", "loadPersonJSON").scrollIntoView().click({force: true});
    cy.waitForAsyncRequest();
    browsePage.getFacetSearchSelectionCount("step").should("contain", "1");
    browsePage.getClearFacetSelection("step").click();
    browsePage.waitForSpinnerToDisappear();
  });

  it("Apply facets, unchecking them should not recheck original facets", () => {
    monitorPage.getFacetCheckbox("step", "loadPersonJSON").scrollIntoView().click({force: true});
    monitorPage.getFacetCheckbox("step", "mapPersonJSON").scrollIntoView().click({force: true});
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").should("be.checked");
    browsePage.getFacetItemCheckbox("step", "mapPersonJSON").should("be.checked");
    browsePage.getGreySelectedFacets("loadPersonJSON").should("exist");
    browsePage.getGreySelectedFacets("mapPersonJSON").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").should("be.checked");
    cy.get("#monitorContent").scrollTo("top", {ensureScrollable: false});
    cy.findByTestId("step-" + "mapPersonJSON" + "-checkbox").trigger("mousemove", {force: true});
    browsePage.getFacetItemCheckbox("step", "mapPersonJSON").should("be.checked");
    browsePage.getFacetItemCheckbox("status", "completed").click();
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").click();
    browsePage.waitForSpinnerToDisappear();
    cy.findByTestId("step-" + "mapPersonJSON" + "-checkbox").trigger("mousemove", {force: true});
    browsePage.getFacetItemCheckbox("step", "mapPersonJSON").scrollIntoView().click();
    browsePage.getFacetItemCheckbox("status", "completed").click();
    cy.findByTestId("step-" + "loadPersonJSON" + "-checkbox").trigger("mousemove", {force: true});
    browsePage.getFacetItemCheckbox("step", "loadPersonJSON").should("not.be.checked");
    cy.get("#monitorContent").scrollTo("top", {ensureScrollable: false});
    browsePage.getFacetItemCheckbox("step", "mapPersonJSON").should("not.be.checked");
    browsePage.getFacetItemCheckbox("status", "completed").should("not.be.checked");
  });

  it("Verify select, apply, remove grey and applied startTime facet", () => {
    cy.log("Select multiple facets and remove startTime grey facet");
    browsePage.getClearAllFacetsButton().then(($ele) => {
      if ($ele.is(":enabled")) {
        cy.log("**clear all facets**");
        browsePage.getClearAllFacetsButton().click();
        browsePage.waitForSpinnerToDisappear();
        cy.waitForAsyncRequest();
      }
    });
    monitorPage.validateGreyFacet("step-type", 0);
    monitorPage.validateGreyFacet("step-type", 1);
    monitorPage.selectStartTimeFromDropDown("Today");
    monitorPage.getSelectedTime("Today").should("contain", "Today");
    browsePage.getGreySelectedFacets("Today").should("exist");
    monitorPage.validateClearStartTimeGreyFacet("Today");
    //Commenting this validations due to a bug DHFPROD-10318
    //monitorPage.getSelectedTime("Today").should("contain", "Today");

    cy.log("Select multiple facets and apply all facets");
    monitorPage.selectStartTimeFromDropDown("Today");
    monitorPage.getSelectedTime("Today").should("contain", "Today");
    browsePage.getApplyFacetsButton().should("be.visible").click();
    browsePage.getAppliedFacets("Today").should("exist");
    monitorPage.getSelectedTime("Today").should("contain", "Today");

    cy.log("Remove applied startTime facet");
    monitorPage.clearFacetSearchSelection("Today");
    //Commenting this validations due to a bug DHFPROD-10318
    //browsePage.getSelectedFacet("Today").should("not.exist");
    browsePage.getClearAllFacetsButton().then(($ele) => {
      if ($ele.is(":enabled")) {
        cy.log("**clear all facets**");
        browsePage.getClearAllFacetsButton().click();
        browsePage.waitForSpinnerToDisappear();
        cy.waitForAsyncRequest();
      }
    });
  });
});