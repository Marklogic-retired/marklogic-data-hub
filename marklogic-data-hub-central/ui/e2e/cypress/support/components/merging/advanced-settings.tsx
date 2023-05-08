class AdvancedSettings {

  setTargetCollection(event: string, value: string, action: string, column:string) {
    cy.get(`[data-testid="${event}-${action}"]`).click();
    cy.get(`[aria-label="${column}Coll-select-${event}"]`)
      .parent()
      .click();
    cy.get(`[aria-label="${column}Coll-select-${event}"]`)
      .should("exist")
      .type(`${value}{enter}`, {force: true});
  }

  keepTargetCollection(event: string) {
    cy.findByTestId(`${event}-keep`).click({force: true});
  }

  keepRemovedCollections(event: string) {
    cy.get(`[data-testid="${event}-keepRemoved"]`).click();
  }

  discardTargetCollection(event: string) {
    cy.findByTestId(`${event}-discard`).click();
  }

  discardRemovedCollections(event: string) {
    cy.get(`[data-testid="${event}-discardRemoved"]`).click();
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
