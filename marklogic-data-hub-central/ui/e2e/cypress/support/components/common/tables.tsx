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
}
export default new Tables();
