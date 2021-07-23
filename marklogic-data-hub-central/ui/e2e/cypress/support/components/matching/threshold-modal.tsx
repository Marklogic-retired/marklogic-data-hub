class ThresholdModal {

  setThresholdName(str: string) {
    cy.get("#name-input").focus().type(str);
  }

  clearThresholdName() {
    cy.get("#name-input").clear();
  }

  selectActionDropdown(action: string) {
    cy.findByLabelText("threshold-select").click();
    cy.findByLabelText(`${action}-option`).click({force: true});
  }

  setUriText(str: string) {
    cy.get("#uri-input").focus().type(str);
  }

  setFunctionText(str: string) {
    cy.get("#function-input").focus().type(str);
  }

  setNamespaceText(str: string) {
    cy.get("#namespace-input").focus().type(str);
  }

  cancelButton() {
    return cy.findByLabelText("cancel-threshold-modal");
  }

  saveButton() {
    return cy.findByLabelText("confirm-threshold-modal");
  }
}

const thresholdModal = new ThresholdModal();
export default thresholdModal;
