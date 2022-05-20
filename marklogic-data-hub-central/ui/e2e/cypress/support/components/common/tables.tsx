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
}
export default new Tables();
