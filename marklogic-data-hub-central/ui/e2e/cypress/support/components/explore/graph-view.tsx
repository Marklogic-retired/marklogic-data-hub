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
  physicsAnimationToggle() {
    this.getPhysicsAnimationToggle().invoke("attr", "value")
      .then(val => {
        if (val === "true") {
          cy.wait(5000);
          graphView.getPhysicsAnimationToggle().scrollIntoView().click({force: true});
        } else {
          graphView.getPhysicsAnimationToggle().scrollIntoView().click({force: true});
          cy.wait(5000);
          graphView.getPhysicsAnimationToggle().scrollIntoView().click({force: true});
        }
      }
      );
  }
}

const graphView = new GraphView();
export default graphView;
