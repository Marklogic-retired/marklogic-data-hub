class RelationshipModal {

  getModalHeader() {
    return cy.findByLabelText("relationshipHeader", {timeout: 120000});
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

  verifySourceEntity(entityName: string) {
    return cy.findByTestId(`${entityName}-sourceNodeName`);
  }

  verifyTargetEntity(entityName: string) {
    return cy.findByTestId(`${entityName}-targetNodeName`);
  }

  targetEntityDropdown() {
    return cy.findByTestId("targetEntityDropdown");
  }

  verifyEntityOption(entityName: string) {
    return cy.findByTestId(`${entityName}-option`);
  }

  selectTargetEntityOption(entityName: string) {
    return cy.findByTestId(`${entityName}-option`).click();
  }

  toggleCardinality() {
    cy.findByTestId("cardinalityButton").click({force: true});
  }

  editJoinProperty(joinPropertyName: string) {
    cy.findByTestId("join-property-dropdown").click();
    cy.findByLabelText(`${joinPropertyName}-option`).click();
  }

  cancelModal() {
    cy.findByLabelText("relationship-modal-cancel").click(({force: true}));
  }

  addRelationshipSubmit() {
    cy.findByLabelText("relationship-modal-submit").click(({force: true}));
  }

  searchEntityDropdown(searchInput: string) {
    cy.get(".ant-select-search__field__wrap > #dropdownList").type(searchInput);
  }

  confirmationOptions(option: string) {
    return cy.findByText(option);
  }
}

const relationshipModal = new RelationshipModal();
export default relationshipModal;
