class Tables {

  get mainTable() {
    return cy.get("#mainTable");
  }
  getTableRows() {
    return cy.get(".hc-table_row");
  }
}
export default new Tables();
