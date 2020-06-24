class PropertyModal {
  newPropertyName(str: string) {
    cy.get('#property-name').type(str);
  }

  clearPropertyName() {
    cy.get('#property-name').clear();
  }

  getStructuredTypeName() {
    return cy.get('#structured-label');
  }

  openPropertyDropdown() {
    return cy.get('.ant-cascader-picker').click();
  }

  getTypeFromDropdown(type: string) {
    return cy.get(`ul > li`).first().get(`[title="${type}"]`);
  }

  getCascadedTypeFromDropdown(type: string) {
    return cy.get(`ul > li`).last().get(`[title="${type}"]`);
  }

  getYesRadio(radioValue: string) {
    return cy.get(`[aria-label="${radioValue}-yes"]`);
  }

  getNoRadio(radioLabel: string) {
    return cy.get(`[aria-label="${radioLabel}-no"]`);
  }

  getCheckbox(checkboxId: string) {
    return cy.get(`#${checkboxId}`);
  }

  clickCheckbox(checkboxId: string) {
    return cy.get(`#${checkboxId}`).check();
  }

  getCancelButton() {
    return cy.get('[aria-label="property-modal-submit"');
  }

  getSubmitButton() {
    return cy.get('[aria-label="property-modal-submit"');
  }

}

const propertyModal = new PropertyModal();
export default propertyModal
