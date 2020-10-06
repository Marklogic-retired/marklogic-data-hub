class CreateEditMappingDialog {
  getMappingNameInput() {
    return cy.get('#name');
  }

  setMappingName(str: string) {
    cy.get('#name').type(str);
  }

  clearMappingName() {
    cy.get('#name').focus().clear();
  }

  setMappingDescription(str: string) {
    cy.get('#description').type(str);
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
    cy.get('#collList').type(str);
  }

  /**
   * Set query input, depends on setSourceRadio being set to 'Query'
   * @param str
   * @example cts.collectionQuery('order-input')
   */
  setQueryInput(str: string) {
    cy.get('#srcQuery').type(str);
  }

  saveButton() {
    return cy.findByTestId('mapping-dialog-save');
  }

  cancelButton() {
    return cy.findByTestId('mapping-dialog-cancel');
  }
}

const createEditMappingDialog = new CreateEditMappingDialog();
export default createEditMappingDialog;
