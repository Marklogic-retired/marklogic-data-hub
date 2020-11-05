class CreateEditStepDialog {
    //New/Edit modal page objects
    stepNameInput() {
        return cy.findByPlaceholderText('Enter name');
    }

    stepDescriptionInput() {
        return cy.findByPlaceholderText('Enter description');
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

    setTimestampInput() {
      return cy.findByPlaceholderText('Enter path to the timestamp');
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