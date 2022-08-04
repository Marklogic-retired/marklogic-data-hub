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

  verifyTargetNode(nodeName: string) {
    return cy.findByTestId(`${nodeName}-targetNodeName`);
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
    cy.get("#inputEntitySearch").type(searchInput);
  }

  confirmationOptions(option: string) {
    cy.findByText(option).click({force: true});
  }

  getSourcePropertyListIcon() {
    return cy.get(`[data-testid="sourcePropertylistIcon"]`);
  }

  getSourcePropertySelectWrapper() {
    return cy.get("#property-dropdown-wrapper");
  }

  verifySourcePropertyValue(propertyValue: string) {
    return this.getSourcePropertySelectWrapper().should("have.text", propertyValue);
  }

  verifySourcePropertyPlaceholder() {
    return this.getSourcePropertySelectWrapper().should("have.text", "Select property");
  }

  editSourceProperty(propertyName: string) {
    this.getSourcePropertySelectWrapper().click();
    cy.get(`#foreignKey-dropdown-MenuList [aria-label="${propertyName}-option"]`).click();
  }

  getEntityToConceptClassViewOption() {
    return cy.get(`[id="entityToConceptClass"]`);
  }

  getEntityToEntityViewOption() {
    return cy.get(`[id="entityToEntity"]`);
  }

  verifyExpressionPlaceholder() {
    return cy.findByPlaceholderText("Enter the expression to create a custom concept IRI");
  }

  getDisabledRelationshipTypeTooltip() {
    return cy.get(`[aria-label="relationshipTypeToggleDisabledInfo"]`);
  }

  getDeleteRelationshipIcon() {
    return cy.get(`[data-testid="delete-relationship"]`);
  }

  selectRelationOptionForeignKey(option:string) {
    cy.get(`[aria-label="${option}"]`).click();
  }

}

const relationshipModal = new RelationshipModal();
export default relationshipModal;
