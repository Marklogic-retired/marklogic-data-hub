import "cypress-wait-until";
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

  waitForMonitorTableToLoad() {
    cy.waitUntil(() => this.getTableRows().should("have.length.gt", 0));
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

  selectAndApplyFacet(testId:string, index:number) {
    // BUG: The page it's re-rendering twice. There's no request to intercept.
    cy.wait(1000);
    cy.get(`[data-testid=${testId}-facet] input`).eq(index).should("be.visible").check();
    cy.findByTestId("facet-apply-button").click({force: true});
  }

  validateAppliedFacetTableRows(facetType: string, index: number) {
    // filter by facet
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).check();
    cy.findByTestId("facet-apply-button").click({force: true});
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).then(($btn) => {
      let facet = $btn.next("label").text();
      cy.get("#selected-facets [data-cy=\"clear-" + $btn.val() + "\"]").should("exist");
      // On firefox it gets stuck and then tries everything at once
      cy.wait(1000);
      // Click expand all table rows to validate info inside
      this.getExpandAllTableRows().scrollIntoView().click().then(() => {
        cy.get(".rowExpandedDetail").then(($row) => {
          for (let i = 0; i < $row.length; i++) {
            //validate row expanded info
            cy.get(".rowExpandedDetail > div").eq(2).should("contain.text", facet.charAt(0).toUpperCase() + facet.slice(1));
          }
        });
        cy.findByTestId(`clear-${$btn.val()}`).scrollIntoView().trigger("mouseover").dblclick({force: true});
      });

    });
  }
  validateAppliedFacet(facetType: string, index: number) {
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).check();
    cy.findByTestId("facet-apply-button").click({force: true});
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).then(($btn) => {
      let facet = $btn.val();
      cy.get("#selected-facets [data-cy=\"clear-" + facet + "\"]").should("exist");
      cy.findByTestId(`${facetType}-${facet}-checkbox`).should("be.checked");
    });
  }
  validateGreyFacet(facetType: string, index: number) {
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).check();
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).then(($btn) => {
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
    this.getStartTimeOption(option).click();
    cy.waitForAsyncRequest();
  }

  clearFacets() {
    cy.get(`[aria-label="clear-facets-button"]`).click();
  }

  getStartTimeDropDown() {
    return cy.get("#date-select");
  }

  getStartTimeOption(option: string) {
    return cy.get(`[data-cy="date-select-option-${option}"]`);
  }

  getSelectedTime() {
    return this.getStartTimeDropDown().invoke("text");
  }

  clearFacetSearchSelection(facet: string) {
    cy.get("[data-testid=\"start-time-facet\"]").scrollIntoView();
    cy.get("[data-testid=\"start-time-facet\"]").trigger("mousemove", {force: true});
    cy.findByTestId(`clear-${facet}`).scrollIntoView();
    cy.findByTestId(`clear-${facet}`).trigger("mousemove", {force: true}).dblclick({force: true});
    cy.waitUntil(() => cy.findByTestId("spinner").should("have.length", 0));
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
    return cy.get(`[data-testid="column-selector-popover"]`).scrollIntoView();
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

  getRowData(JobId, value: string) {
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

}
const monitorPage = new MonitorPage();
export default monitorPage;
