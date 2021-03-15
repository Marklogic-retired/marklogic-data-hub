class AdvancedSettings {

  setTargetCollection(event: string, value: string) {
    cy.findByTestId(`${event}-edit`).click();
    cy.findByLabelText(`additionalColl-select-${event}`)
      .find("input")
      .first()
      .type(value)
      .type("{enter}");
  }

  keepTargetCollection(event: string) {
    cy.findByTestId(`${event}-keep`).click();
  }

  discardTargetCollection(event: string) {
    cy.findByTestId(`${event}-discard`).click();
  }

  additionalSettingsInput() {
    return cy.findByPlaceholderText("Please enter additional settings");
  }

  cancelSettingsButton(stepName: string) {
    return cy.findByTestId(`${stepName}-cancel-settings`);
  }

  saveSettingsButton(stepName: string) {
    return cy.findByTestId(`${stepName}-save-settings`);
  }
}

const advancedSettings = new AdvancedSettings();
export default advancedSettings;
