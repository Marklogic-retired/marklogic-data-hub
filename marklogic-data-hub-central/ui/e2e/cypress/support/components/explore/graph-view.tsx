class GraphView {
  getConceptToggle() {
    return cy.get("[id=\"concepts-switch\"]");
  }
}

const graphView = new GraphView();
export default graphView;
