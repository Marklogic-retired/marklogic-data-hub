class PropertyModal {
  newPropertyName(str: string) {
    cy.get("#property-name").focus().type(str);
  }

  clearPropertyName() {
    cy.get("#property-name").focus().clear();
  }

  getStructuredTypeName() {
    return cy.get("#structured-label");
  }

  openPropertyDropdown() {
    cy.get(".ant-cascader-picker").trigger("mouseover").click();
  }

  clearPropertyDropdown() {
    cy.findByLabelText("icon: close-circle").trigger("mouseover").click();
  }

  getTypeFromDropdown(type: string) {
    return cy.get(`ul > li`).first().get(`[title="${type}"]`).should("be.visible");
  }

  getCascadedTypeFromDropdown(type: string) {
    return cy.get(`ul > li`).last().get(`[title="${type}"]`).should("be.visible");
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
  toggleForeignKeyDropdown() {
    cy.findByLabelText("foreignKey-select").trigger("mouseover").click();
  }
  getForeignKey(propertyName: string) {
    return cy.waitUntil(() => cy.findByLabelText(`${propertyName}-option`));
  }
  checkForeignKeyDropdownLength(len: number) {
    return cy.get(".ant-select-dropdown-menu").find("li").should("have.length", len);
  }

  verifyPropertyType(entityType: string) {
    return cy.get(".ant-cascader-picker-label").should("have.text", entityType);
  }
  verifyForeignKey(propertyName: string) {
    return cy.get(".ant-select-selection-selected-value").should("have.text", propertyName);
  }

  verifyForeignKeyPlaceholder() {
    return cy.get(".ant-select-selection__placeholder").should("be.visible");
  }

  verifySameNamePropertyError(errorName: string) {
    return cy.get("[data-testid=\"same-name-property-error\"]").contains(errorName);
  }

  verifyPropertyNameError(errorName: string) {
    return cy.get("[data-testid=\"property-name-error\"]").contains(errorName);
  }
}

const propertyModal = new PropertyModal();
export default propertyModal;
