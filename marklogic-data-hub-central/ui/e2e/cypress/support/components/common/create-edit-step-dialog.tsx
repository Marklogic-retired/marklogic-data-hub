class CreateEditStepDialog {
  //New/Edit modal page objects
  stepNameInput() {
    return cy.findByPlaceholderText("Enter name");
  }

  stepDescriptionInput() {
    return cy.findByPlaceholderText("Enter description");
  }

  /**
     * Set source type
     * @param sourceQuery
     * @example Collection, Query
     */
  setSourceRadio(sourceQuery: string) {
    cy.findByLabelText(`${sourceQuery}`).click();
  }

  /**
     * Set collection input, depends on setSourceRadio being set to 'Collection'
     * @param str
     * @example 'order-ingest'
     */
  setCollectionInput(str: string) {
    cy.get(".rbt-input-main").type(str);
  }

  reviewSelectContent (str: string) {
    return cy.get("a[id^='collList-item-']").contains(str);
  }

  getElementById(id: string) {
    return cy.get(`#${id}`);
  }

  getAdvancedTab() {
    return cy.findByText("Advanced");
  }

  getBasicTab() {
    return cy.findByText("Basic");
  }

  /**
     * Set query input, depends on setSourceRadio being set to 'Query'
     * @param str
     * @example cts.collectionQuery('order-input')
     */
  setQueryInput(str: string) {
    cy.get("#srcQuery").type(str, {timeout: 5000, delay: 0});
  }

  setTimestampInput() {
    return cy.findByPlaceholderText("Enter path to the timestamp");
  }

  saveButton(stepDefinitionType: string) {
    return cy.findByTestId(`${stepDefinitionType}-dialog-save`);
  }

  cancelButton(stepDefinitionType: string) {
    return cy.findByTestId(`${stepDefinitionType}-dialog-cancel`);
  }
}

const createEditStepDialog = new CreateEditStepDialog();
export default createEditStepDialog;