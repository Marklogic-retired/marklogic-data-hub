class GraphView {
  getFilterInput() {
    return cy.findByLabelText("graph-view-filter-input");
  }

  getAddButton() {
    return cy.findByLabelText("add-entity-type-relationship");
  }

  getAddEntityTypeOption() {
    return cy.findByLabelText("add-entity-type");
  }

  getAddRelationshipOption() {
    return cy.findByLabelText("add-relationship");
  }

  getPublishToDatabaseButton() {
    return cy.findByLabelText("publish-to-database");
  }

  getExportGraphIcon() {
    return cy.findByLabelText("graph-export");
  }
}

const graphView = new GraphView();
export default graphView;