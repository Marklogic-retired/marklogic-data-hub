class GraphView {
  getFilterInput() {
    return cy.findByLabelText("graph-view-filter-input");
  }

  getAddEntityButton() {
    return cy.findByLabelText("add-entity-type-relationship");
  }

  getPublishToDatabaseButton() {
    return cy.findByLabelText("publish-to-database");
  }

  getExportGraphIcon() {
    return cy.findByLabelText("graph-export");
  }

  getGraphVisContainer() {
    return cy.get("#graphVis");
  }
}

const graphView = new GraphView();
export default graphView;