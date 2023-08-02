import {toolbar} from "../components/common";
import "cypress-wait-until";
import homePage from "./home";
class MonitorPage {
  getMonitorContainer() {
    return cy.get(`#monitorContent`);
  }

  scrollMonitorToPageSelect() {
    cy.get(`#monitorContent`).scrollTo("bottom", {ensureScrollable: false});
    cy.wait(500);
    return cy.get(`#monitorContent`).scrollTo("right", {ensureScrollable: false});
  }

  getTableRows() {
    return cy.get(".hc-table_row");
  }

  verifyTableRow(stepName: string) {
    return cy.get(`[data-testid=${stepName}-result]`);
  }

  getTableNestedRows() {
    return cy.get(".rowExpandedDetail");
  }

  getAllJobIdLink() {
    return cy.findAllByTestId("jobId-link");
  }

  clickPaginationItem(index: number) {
    return cy.get(`#top-search-pagination-bar .ant-pagination-item-${index}`).click({force: true});
  }
  getPaginationPageSizeOptions() {
    return cy.get(`#pageSizeSelect`);
  }
  getPageSizeOption(pageSizeOption: string) {
    return cy.findByText(pageSizeOption);
  }
  checkCurrentPage(page: number) {
    cy.get(`#pagination-item-${page}`).first().scrollIntoView().contains(page).should("exist");
  }

  selectAndApplyFacet(testId: string, index: number) {
    // BUG: The page it's re-rendering twice. There's no request to intercept.
    cy.wait(1000);
    cy.get(`[data-testid=${testId}-facet] input`).eq(index).should("be.visible").check();
    cy.wait(1000);
    cy.get(`[data-testid="facet-apply-button"]`).click();
    cy.wait(1000);
  }
  getFacetCheckbox(facetType: string, facetName: string) {
    return cy.get(`[data-testid=${facetType}-${facetName}-checkbox]`);
  }

  clickFacetCheckbox(facetType: string, facetName: string) {
    this.getFacetCheckbox(facetType, facetName).scrollIntoView().click({force: true});
    cy.waitForAsyncRequest();
  }

  validateAppliedFacetTableRows(facetType: string, index: number, facetName: string) {
    // filter by checking "mapping" facet
    this.getFacetCheckbox(facetType, facetName).should("be.visible").check();
    cy.wait(2000);
    cy.get(`[id="selected-facets"] [data-testid="facet-apply-button"]`).should("be.visible").click();

    cy.get(`[data-testid=${facetType}-${facetName}-checkbox]`).should("be.visible").then(($btn) => {
      let facet = $btn.next("label").text();
      cy.get("#selected-facets [data-testid=\"clear-" + $btn.val() + "\"]").should("exist");
      // On firefox it gets stuck and then tries everything at once
      cy.wait(1000);
      // Click expand all table rows to validate info inside
      this.getExpandAllTableRows().scrollIntoView().click().then(() => {
        if (facetType === "status") {
          cy.get(".rowExpandedDetail").then(($row) => {
            for (let i = 0; i < $row.length; i++) {
              cy.get(".rowExpandedDetail > .stepStatus").eq(i).invoke("attr", "data-testid").then((id) => {
                expect(id).to.equal(facetName);
              });
            }
          });
        } else {
          cy.get(".rowExpandedDetail").then(($row) => {
            for (let i = 0; i < $row.length; i++) {
            //validate row expanded info
              cy.get(".rowExpandedDetail > div").eq(index).should("contain.text", facet.charAt(0).toUpperCase() + facet.slice(1));
            }
          });
        }
        cy.findByTestId(`clear-${$btn.val()}`).scrollIntoView().trigger("mouseover").dblclick({force: true});
      });

    });
  }
  validateAppliedFacet(facetType: string, index: number) {
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).check();
    cy.get(`[data-testid="facet-apply-button"]`).click({force: true});
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).then(($btn) => {
      let facet = $btn.val();
      cy.get("#selected-facets [data-cy=\"clear-grey-" + facet + "\"]").should("exist");
      cy.findByTestId(`${facetType}-${facet}-checkbox`).should("be.checked");
    });
  }
  validateGreyFacet(facetType: string, index: number) {
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).check().then(($btn) => {
      let facet = $btn.val();
      cy.get("#selected-facets [data-cy=\"clear-grey-" + facet + "\"]").should("exist");
    });
  }
  validateClearGreyFacet(facetType: string, index: number) {
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).check();
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).then(($btn) => {
      let facet = $btn.val();
      cy.get("#selected-facets [data-cy=\"clear-grey-" + facet + "\"]").should("exist");
      cy.findByTestId(`clear-grey-${facet}`).scrollIntoView().trigger("mouseover").dblclick({force: true});
    });
  }
  validateClearStartTimeGreyFacet(option: string) {
    cy.get(`[data-testid=clear-grey-${option}]`).click();
  }

  selectStartTimeFromDropDown(option: string) {
    this.getStartTimeDropDown().click();
    this.getStartTimeOption(option).should("be.visible").click();
    cy.waitForAsyncRequest();
  }

  clearFacets() {
    cy.get(`[aria-label="clear-facets-button"]`).click();
  }

  getStartTimeDropDown() {
    return cy.get("#date-select-wrapper");
  }

  getStartTimeOption(option: string) {
    return cy.get(`[id*="react-select-"] [data-testid="${option}-option"]`);
  }

  getSelectedTime(option: string) {
    return cy.get(`[id="date-select-wrapper"] [data-testid="${option}-option"]`).invoke("text");
  }

  clearFacetSearchSelection(facet: string) {
    cy.get("[data-testid=\"start-time-facet\"]").scrollIntoView();
    cy.get("[data-testid=\"start-time-facet\"]").trigger("mousemove", {force: true});
    cy.findByTestId(`clear-${facet}`).scrollIntoView();
    cy.findByTestId(`clear-${facet}`).trigger("mousemove", {force: true}).dblclick({force: true});
    cy.waitUntil(() => cy.findByTestId("spinner").should("have.length", 0));
    cy.waitForAsyncRequest();
  }

  getTableHeaders() {
    return cy.get(`th[class^="hc-table_header"]`);
  }

  verifyVisibilityTableHeader(headerName: string, visible: boolean) {
    if (visible) cy.get("thead").should("include.text", headerName);
    else cy.get("thead").should("not.include.text", headerName);
  }

  getColumnSelectorIcon() {
    return cy.get(`[data-testid="column-selector-icon"]`).scrollIntoView();
  }

  getColumnSelectorPopover() {
    return cy.get(`[data-testid="column-selector-popover"]`);
  }

  getColumnSelectorColumns() {
    return cy.get(`[aria-label="column-option"]`);
  }

  getColumnSelectorCheckboxs() {
    return cy.get(`input[data-testId^="columnOptionsCheckBox"]`);
  }

  getColumnSelectorCancelButton() {
    return cy.get(`[data-testId="cancel-column-selector"]`);
  }

  getColumnSelectorApplyButton() {
    return cy.get(`[data-testid="apply-column-selector"]`);
  }

  get tableHeaders() {
    return cy.get("#mainTable th");
  }

  get tableRows() {
    return cy.get("#mainTable tr.hc-table_row");
  }

  getTableBodyColumnByIndex(index: number) {
    return cy.get(`#mainTable tr.hc-table_row td:nth-child(${index})`);
  }

  /**

   * It find an index by header description and apply the callback function in every cell in that column

   * @param {String} header - Name of the Column header

   * @param {Function} cb - callback function to execute in every cell that index match with header description

   */
  getTableElement(header: string, cb: Function) {
    this.tableHeaders.each(($elem, index) => {
      const headerValue = $elem.text();
      if (headerValue.includes(header)) {
        this.getTableBodyColumnByIndex(index + 1).then($column => {
          cy.wrap($column).each($cell => cb($cell));
        });
      }
    });
  }

  getUnapliedCustomButtonFacet(value: string) {
    cy.get(`[data-testid="clear-grey-${value}"]`);
  }
  getExpandAllTableRows() {
    return cy.get("#expandIcon path");
  }

  getCollapseAllTableRows() {
    return cy.get("#collapseIcon path");
  }

  getRowByIndex(rowIndex: number) {
    return cy.get("*[class^=\"hc-table_iconIndicator\"]").eq(rowIndex).scrollIntoView().should("be.visible");
  }

  checkExpandedRow() {
    return cy.get(".reset-expansion-style").scrollIntoView().should("exist");
  }

  getOrderColumnMonitorTable(column: string, order?: string) {
    return cy.get(`[aria-label="${column} ${order ? "sort " + order : "sortable"}"]`);
  }

  getEntityLabelNames() {
    return cy.get(`.rowExpandedDetail > div`);
  }

  getRowData(JobId:any, value: string) {
    return cy.get(`.reset-expansion-style:eq(" ` + this.searchBiggerRowIndex(JobId) + `") .${value}`);
  }

  searchBiggerRowIndex(array: any) {
    let countRow: number = 0;
    let countRowAux: number = 0;
    let indexAux: number = 0;

    array.forEach((element: any, index: any) => {
      countRowAux = Cypress.$(".reset-expansion-style:eq(" + index + ") .stepType").length;
      if (countRowAux > countRow) {
        countRow = countRowAux;
        indexAux = index;
      }
    });
    return indexAux;
  }

  getExpandoRowIconByJobId(jobId: string) {
    return cy.get(`[data-testid="${jobId}-expand-icon"]`);
  }

  getJobIdValueModal(jobIdValueModal: string) {
    return cy.get(`[data-testid="${jobIdValueModal}"]`);
  }

  getStepTypeValueModal() {
    return cy.get(`[class^="job-response_stepType"]`);
  }

  getElementByClass(className:string) {
    return cy.get(className);
  }

  navigate() {
    cy.url().then((url: string) => {
      if (!url.includes("http")) {
        homePage.navigate();
      }
    });
    toolbar.getMonitorToolbarIcon().should("be.visible").click();
    cy.waitForAsyncRequest();
  }
}
const monitorPage = new MonitorPage();
export default monitorPage;
