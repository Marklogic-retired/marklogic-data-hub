import "cypress-wait-until";
class MonitorPage {
  getMonitorContainer() {
    return cy.get(`#monitorContent`);
  }
  getTableRows() {
    return cy.get(".hc-table_row");
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
  validateAppliedFacetTableRows(facetType: string, index: number) {
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).check();
    cy.findByTestId("facet-apply-button").click({force: true});
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).then(($btn) => {
      let facet = $btn.val();
      cy.get("#selected-facets [data-cy=\"clear-" + facet + "\"]").should("exist");
      cy.get(".hc-table_row").then(($row) => {
        for (let i = 0; i < $row.length; i++) {
          cy.get(".hc-table_row").eq(i).should("contain.text", facet);
        }
      });
      cy.findByTestId(`clear-${facet}`).trigger("mouseover").dblclick({force: true});
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
      cy.findByTestId(`clear-grey-${facet}`).trigger("mouseover").dblclick({force: true});
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
}
const monitorPage = new MonitorPage();
export default monitorPage;
