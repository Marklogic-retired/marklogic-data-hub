class GraphView {
  getConceptToggle() {
    return cy.get("[id=\"concepts-switch\"]");
  }
  getPhysicsAnimationToggle() {
    return cy.get("[id=\"physics-animation-id\"]");
  }
  getPhysicsAnimationHelpIcon() {
    return cy.get("[aria-label=\"icon: question-circle\"]").last();
  }
  getPhysicsAnimationTooltip() {
    return cy.get("[id=\"physics-animation-tooltip\"]");
  }

  getRelationshipLabelsToggle() {
    return cy.get("[id=\"relationship-label-id\"]");
  }
}

const graphView = new GraphView();
export default graphView;
