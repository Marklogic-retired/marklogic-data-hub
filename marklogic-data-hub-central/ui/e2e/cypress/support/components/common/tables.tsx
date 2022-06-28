class Tables {

  get mainTable() {
    return cy.get("#mainTable");
  }
  getTableRows() {
    return cy.get("tr.hc-table_row");
  }
  getActiveTablePage() {
    return cy.get("li.page-item.active");
  }
  expandRow(rowName: string) {
    return cy.get(`[data-testid="${rowName}-expand-icon"]`).click();
  }
  getTableHeaders() {
    return cy.get(`th[class*="hc-table_header"]`);
  }
  getMainTableContainer() {
    return cy.get(`.resultTableMain`);
  }
  //table
  getColumnTitle(index: number) {
    return cy.get(`.table.table-bordered thead th:nth-child(${index}) .resultsTableHeaderColumn`).invoke("text");

  }
  clickColumnTitle(index: number) {
    cy.wait(500);
    return cy.get(`.table.table-bordered th:nth-child(${index}) .resultsTableHeaderColumn`).click();
  }
  getTableColumns() {
    return cy.get(".resultsTableHeaderColumn");
  }
  getTableCell(rowIndex: number, columnIndex: number) {
    return cy.get(`.hc-table_row:nth-child(${rowIndex}) td:nth-child(${columnIndex}) div`).invoke("text");
  }
}
export default new Tables();
