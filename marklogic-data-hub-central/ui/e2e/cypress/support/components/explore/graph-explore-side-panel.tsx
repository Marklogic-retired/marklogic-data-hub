class GraphExploreSidePanel {
  getSidePanel() {
    return cy.get("[data-testid=\"graphSidePanel\"]");
  }

  getInstanceViewIcon() {
    return cy.get("[data-cy=instance]");
  }
}

const graphExploreSidePanel = new GraphExploreSidePanel();
export default graphExploreSidePanel;
