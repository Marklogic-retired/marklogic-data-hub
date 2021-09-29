class RelationshipModal {

  getModalHeader() {
    return cy.findByLabelText("relationshipHeader", {timeout: 120000});
  }

  verifyRelationshipValue(relationshipName: string) {
    return cy.get("#relationship").should("have.value", relationshipName);
  }

  verifyForeignKeyValue(foreignKeyValue: string) {
    return cy.get(".ant-select-selection-selected-value").should("have.text", foreignKeyValue);
  }

  verifyForeignKeyPlaceholder() {
    return cy.get(".ant-select-selection__placeholder").should("be.visible");
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

  editForeignKey(foreignKeyName: string) {
    cy.findByTestId("foreignKey-dropdown").click();
    cy.findByLabelText(`${foreignKeyName}-option`).click();
  }

  toggleOptional() {
    return cy.findByText("Optional").click();
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
    cy.findByText(option).click({force: true});
  }
}

const relationshipModal = new RelationshipModal();
export default relationshipModal;
