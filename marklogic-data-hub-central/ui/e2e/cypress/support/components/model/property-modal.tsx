class PropertyModal {
  newPropertyName(str: string) {
    cy.get("#property-name").focus().type(str);
  }

  getPropertyModal() {
    return cy.get(`[aria-label="property-modal"]`);
  }

  clearPropertyName() {
    cy.get("#property-name").focus().clear();
  }

  getStructuredTypeName() {
    return cy.get("#structured-label");
  }

  openPropertyDropdown() {
    cy.get(".rc-cascader-selection-search").trigger("mouseover").click();
  }

  clearPropertyDropdown() {
    cy.get(".rc-cascader-clear-icon").trigger("mouseover").click();
  }

  getTypeFromDropdown(type: string) {
    cy.get(`ul > li`).first().get(`[title="${type}"]`).should("be.visible").click();
  }

  getTypeFromDropdownCascaderRC(type: string) {
    cy.get(`.rc-cascader-menus > ul > li`).first().get(`[data-value="${type}"]`).should("be.visible").click();
  }

  getCascadedTypeFromDropdown(type: string) {
    cy.get(`ul > li`).last().get(`[title="${type}"]`).should("be.visible").click();
  }

  getDisabledTypeFromDropdown() {
    return cy.get(".rc-cascader-menu-item-disabled");
  }

  getYesRadio(radioValue: string) {
    return cy.findByLabelText(`${radioValue}-yes`);
  }

  getNoRadio(radioLabel: string) {
    return cy.findByLabelText(`${radioLabel}-no`);
  }

  getCheckbox(checkboxId: string) {
    return cy.get(`#${checkboxId}`);
  }

  clickCheckbox(checkboxId: string) {
    return cy.get(`#${checkboxId}`).check();
  }

  getCancelButton() {
    cy.findByLabelText("property-modal-cancel").click();
  }

  getSubmitButton() {
    return cy.findByLabelText("property-modal-submit");
  }
  getDeleteIcon(propertyName: string) {
    return cy.findByTestId(`delete-${propertyName}`);
  }
  getToggleStepsButton() {
    return cy.findByLabelText("toggle-steps");
  }

  getForeignKeyDropdown() {
    return  cy.findByPlaceholderText("Select foreign key");
  }
  openForeignKeyDropdown() {
    this.getForeignKeySelectWrapper().trigger("mouseover").click();
  }
  getForeignKey(propertyName: string) {
    return cy.waitUntil(() => cy.findByLabelText(`${propertyName}-option`));
  }
  checkForeignKeyDropdownLength(len: number) {
    return cy.get(`#foreignKey-select-MenuList [role="option"]`).should("have.length", len);
  }

  verifyPropertyType(entityType: string) {
    return cy.get(".rc-cascader-selection-item").should("have.text", entityType);
  }

  getForeignKeySelectWrapper() {
    return cy.get("#foreignKey-select-wrapper");
  }

  verifyForeignKey(propertyName: string) {
    return this.getForeignKeySelectWrapper().should("have.text", propertyName);
  }

  verifyForeignKeyPlaceholder() {
    return this.getForeignKeySelectWrapper().should("have.text", "Select foreign key");
  }

  verifySameNamePropertyError(errorName: string) {
    return cy.get("[data-testid=\"same-name-property-error\"]").contains(errorName);
  }

  verifyPropertyNameError() {
    return cy.findByTestId("property-name-error").should("be.visible");
  }

  addTextInput(input:string, text:string) {
    cy.findByTestId(`${input}`).type(text);
  }

  confirmDeleteProperty(ariaLabel:string) {
    cy.get(`[aria-label="confirm-${ariaLabel}"]`).should("be.visible").click();
  }

}

const propertyModal = new PropertyModal();
export default propertyModal;
