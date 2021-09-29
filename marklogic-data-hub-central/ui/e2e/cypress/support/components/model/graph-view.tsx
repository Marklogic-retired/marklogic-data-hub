class GraphView {
  getFilterInput() {
    return cy.findByLabelText("graph-view-filter-input");
  }

  getAddButton() {
    return cy.get(`[aria-label="add-entity-type-relationship"] > button`);
  }

  addNewRelationship() {
    return cy.findByText("Add new relationship");
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

  verifyEditInfoMessage() {
    return cy.findByLabelText("graph-edit-mode-info");
  }
}

const graphView = new GraphView();
export default graphView;