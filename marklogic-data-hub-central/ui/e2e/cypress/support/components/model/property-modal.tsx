class PropertyModal {
  newPropertyName(str: string) {
    cy.get('#property-name').type(str);
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

  clickCheckbox(checkboxId: string) {
    return cy.get(`#${checkboxId}`).check();
  }

  getCancelButton() {
    return cy.get('#property-modal-cancel');
  }

  getAddButton() {
    return cy.get('#property-modal-add');
  }

}

export default PropertyModal