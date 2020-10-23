class AdvancedSettingsDialog {

  getStepName(stepName: string) {
    return cy.findByLabelText(`step-name-${stepName}`)
  }

  /**
   * Set Source Database
   * @param dbName
   * @example data-hub-STAGING, data-hub-FINAL
   */
  setSourceDatabase(dbName: string) {
    cy.findByLabelText(`sourceDatabase-select`).click();
    cy.findByTestId(`sourceDbOptions-${dbName}`).click();
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
    cy.get('#property-name').type(collection);
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
    cy.get('#validateEntity');
    cy.findByTestId(`entityValOpts-${index}`).click();
  }

  batchSize() {
    return cy.get('#batchSize');
  }

  /**
   * Textarea that takes a file path in fixtures and pastes the {} in the text area
   * @param fixturePath - file path to stepProcessor json config file
   * @see https://docs.cypress.io/api/commands/type.html#Key-Combinations
   */
  setHeaderContent(fixturePath: string) {
    if(fixturePath === '')
        return cy.get('#headers').clear();
    else cy.fixture(fixturePath).then(content => {
        cy.get('#headers').clear().type(JSON.stringify(content), { parseSpecialCharSequences: false });
    });
  }


  toggleProcessors() {
    cy.findByLabelText('processors-expand').trigger('mouseover').click();
  }

  getProcessors() {
    return cy.get('#processors');
  }

  /**
   * Set processors
   * @param processor
   * @example [] as valid JSON string
   */
  setProcessors(processor: string) {
    cy.get('#processors').type(processor);
  }

  /**
   * Textarea that takes a file path in fixtures and pastes the json array object [] in the text area
   * @param fixturePath - file path to stepProcessor json config file
   * @see https://docs.cypress.io/api/commands/type.html#Key-Combinations
   */
  setStepProcessor(fixturePath: string) {
    cy.findByLabelText('processors-expand').trigger('mouseover').click();
    if(fixturePath === '')
        return cy.get('#processors').clear();
    else cy.fixture(fixturePath).then(content => {
        cy.get('#processors').clear().type(JSON.stringify(content), { parseSpecialCharSequences: false });
    });
  }

  toggleCustomHook() {
    cy.findByText('Custom Hook').click();
  }

  /**
   * Textarea that takes a file path in fixtures and pastes the json object {} in the text area
   * @param fixturePath - file path to customHook json config file
   * @see https://docs.cypress.io/api/commands/type.html#Key-Combinations
   */
  setCustomHook(fixturePath: string) {
    cy.findByText('Custom Hook').click();
    if (fixturePath === '')
      return cy.get('#customHook').clear();
    else cy.fixture(fixturePath).then(content => {
      cy.get('#customHook').clear().type(JSON.stringify(content), { parseSpecialCharSequences: false });
    });
  }

  cancelSettings(stepName: string) {
    return cy.findByTestId(`${stepName}-cancel-settings`);
  }

  saveSettings(stepName: string) {
    return cy.findByTestId(`${stepName}-save-settings`);
  }
}

const advancedSettingsDialog = new AdvancedSettingsDialog();
export default advancedSettingsDialog;
