class RelationshipModal {

  getModalHeader() {
    return cy.findByLabelText("relationshipHeader");
  }

  verifyRelationshipValue(relationshipName: string) {
    return cy.get("#relationship").should("have.value", relationshipName);
  }

  verifyJoinPropertyValue(joinPropertyValue: string) {
    return cy.get(".ant-select-selection-selected-value").should("have.text", joinPropertyValue);
  }

  editRelationshipName(relationshipName: string) {
    cy.get("#relationship").focus().clear();
    cy.get("#relationship").type(relationshipName);
  }

  verifyCardinality(cardinalityType: string) {
    return cy.findByTestId(cardinalityType);
  }

  toggleCardinality() {
    cy.findByTestId("cardinalityButton").click({force: true});
  }

  editJoinProperty(joinPropertyName: string) {
    cy.findByTestId("join-property-dropdown").click();
    cy.findByLabelText(`${joinPropertyName}-option`).click();
  }

  confirmationOptions(option: string) {
    return cy.findByText(option);
  }
}

const relationshipModal = new RelationshipModal();
export default relationshipModal;
