class GraphExploreSidePanel {
  getSidePanel() {
    return cy.get("[data-testid=\"graphSidePanel\"]");
  }

  getInstanceViewIcon() {
    return cy.get("[data-cy=instance]");
  }
  getTableCellValueByName(text : String) {
    return cy.get(`[title="${text}"]`).next();
  }
}

const graphExploreSidePanel = new GraphExploreSidePanel();
export default graphExploreSidePanel;
