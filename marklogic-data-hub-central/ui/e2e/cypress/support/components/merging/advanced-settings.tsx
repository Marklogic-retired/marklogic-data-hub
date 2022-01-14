class AdvancedSettings {

  setTargetCollection(event: string, value: string) {
    cy.get(`[data-testid="${event}-edit"]`).click();
    cy.get(`[aria-label="additionalColl-select-${event}"]`)
      .parent()
      .click();
    cy.get(`[aria-label="additionalColl-select-${event}"]`)
      .should("exist")
      .type(value, {force: true})
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
