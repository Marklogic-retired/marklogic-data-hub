class AdvancedSettingsDialog {

  getStepName(stepName: string) {
    return cy.findByLabelText(`step-name-${stepName}`);
  }

  /**
   * Set Source Database
   * @param dbName
   * @example data-hub-STAGING, data-hub-FINAL
   */
  setSourceDatabase(dbName: string) {
    cy.get(`#sourceDatabase-select-wrapper`).click();
    cy.get(`#sourceDatabase-select-MenuList [data-testid="sourceDbOptions-${dbName}"]`).scrollIntoView();
  }

  /**
   * Set Target Database
   * @param dbName
   * @example data-hub-STAGING, data-hub-FINAL
   */
  setTargetDatabase(dbName: string) {
    cy.findByLabelText(`targetDatabase-select`).click();
    cy.findByTestId(`targetDbOptions-${dbName}`).click();
  }

  addTargetCollection(collection: string) {
    cy.findByLabelText(`additionalColl-select`);
    cy.get("#property-name").type(collection);
  }

  /**
   * Set format
   * @param format
   * @example JSON, XML
   */
  setTargetFormat(format: string) {
    cy.findByLabelText(`targetFormat-select`).click();
    // update id
  }

  getTargetPermissions() {
    return cy.get(`#targetPermissions`);
  }

  setTargetPermissions(permissions: string) {
    cy.get(`#targetPermissions`).clear({force: true}).type(permissions);
  }

  /**
   * Set Provenance Granularity
   * @param provenance
   * @example Coarse-grained, Off
   */
  setProvenanceGranularity(provenance: string) {
    cy.findByLabelText(`provGranularity-select`);
    cy.findByTestId(`provOptions-${provenance}`).click();
  }

  /**
   * Set Entity Validation
   * @param index
   * @example 0 = Do not validate, 1 = store errors in headers, 2 = skip docs w/ errors
   */
  setEntityValidation(index: string) {
    cy.get("#validateEntity");
    cy.findByTestId(`entityValOpts-${index}`).click();
  }

  batchSize() {
    return cy.get("#batchSize");
  }

  /**
   * Textarea that takes a file path in fixtures and pastes the {} in the text area
   * @param fixturePath
   * @see https://docs.cypress.io/api/commands/type.html#Key-Combinations
   */
  setHeaderContent(fixturePath: string) {
    if (fixturePath === "") { return cy.get("#headers").clear(); } else {
      cy.fixture(fixturePath).then(content => {
        cy.get("#headers").clear().type(JSON.stringify(content), {parseSpecialCharSequences: false});
      });
    }
  }


  toggleInterceptors() {
    cy.findByLabelText("interceptors-expand").trigger("mouseover").click();
  }

  getInterceptors() {
    return cy.get("#interceptors");
  }

  /**
   * Set interceptors
   * @param interceptor
   * @example [] as valid JSON string
   */
  setInterceptors(interceptor: string) {
    cy.get("#interceptors").type(interceptor);
  }

  /**
   * Textarea that takes a file path in fixtures and pastes the json array object [] in the text area
   * @param fixturePath - file path to stepInterceptor json config file
   * @see https://docs.cypress.io/api/commands/type.html#Key-Combinations
   */
  setStepInterceptor(fixturePath: string) {
    cy.findByLabelText("interceptors-expand").trigger("mouseover").click();
    if (fixturePath === "") { return cy.get("#interceptors").clear(); } else {
      cy.fixture(fixturePath).then(content => {
        cy.get("#interceptors").clear().type(JSON.stringify(content), {parseSpecialCharSequences: false});
      });
    }
  }

  toggleCustomHook() {
    cy.findByText("Custom Hook").click();
  }

  /**
   * Textarea that takes a file path in fixtures and pastes the json object {} in the text area
   * @param fixturePath - file path to customHook json config file
   * @see https://docs.cypress.io/api/commands/type.html#Key-Combinations
   */
  setCustomHook(fixturePath: string) {
    cy.findByText("Custom Hook").click();
    if (fixturePath === "") { return cy.get("#customHook").clear(); } else {
      cy.fixture(fixturePath).then(content => {
        cy.get("#customHook").clear().type(JSON.stringify(content), {parseSpecialCharSequences: false});
      });
    }
  }

  cancelSettings(stepName: string) {
    return cy.findByTestId(`${stepName}-cancel-settings`);
  }

  cancelEntitySettings() {
    return cy.findByTestId(`cancel-settings`).click({force: true});
  }

  saveSettings(stepName: string) {
    return cy.findByTestId(`${stepName}-save-settings`);
  }

  saveEntitySettings() {
    cy.findByTestId("save-settings").click({force: true});
  }

  attachSourceDocument() {
    return cy.findByTestId("attachmentTrue");
  }
}

const advancedSettingsDialog = new AdvancedSettingsDialog();
export default advancedSettingsDialog;
