class RelationshipModal {

  getModalHeader() {
    return cy.findByLabelText("relationshipHeader", {timeout: 120000});
  }

  verifyRelationshipValue(relationshipName: string) {
    return cy.get("#relationship").should("have.value", relationshipName);
  }

  getForeignKeySelectWrapper() {
    return cy.get("#foreignKey-dropdown-wrapper");
  }

  verifyForeignKeyValue(foreignKeyValue: string) {
    return this.getForeignKeySelectWrapper().should("have.text", foreignKeyValue);
  }

  verifyForeignKeyPlaceholder() {
    return this.getForeignKeySelectWrapper().should("have.text", "Select foreign key");
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
    this.getForeignKeySelectWrapper().click();
    cy.get(`#foreignKey-dropdown-MenuList [aria-label="${foreignKeyName}-option"]`).click();
  }

  toggleOptional() {
    return cy.get("#toggleOptional").click({force: true});
  }

  verifyHideOptionalBlock() {
    cy.findByTestId("optionalContent").should("not.exist");
  }

  verifyVisibleOptionalBlock() {
    cy.findByTestId("optionalContent").should("be.visible");
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
