class LoadPage {

  //Load tile list view page objects
  /**
     * @param type - accepts `table` for list-view or `th-large` for card-view
     */
  loadView(type: string) {
    return cy.get(`[data-icon="${type}"]`);
  }

  /**
     * @param type - accepts `list` or `card`
     */
  addNewButton(type: string) {
    return cy.findByLabelText(`add-new-${type}`);
  }

  stepName(stepName: string) {
    return cy.findByText(stepName);
  }

  stepDescription(stepDesc: string) {
    return cy.findByText(stepDesc);
  }
  //
  // stepSourceFormat(stepName: string) {
  //
  // }
  //
  // stepTargetFormat(stepName: string) {
  //
  // }
  //
  // stepLastUpdated(stepName: string) {
  //
  // }
  //
  // columnSort(columnName: string) {
  //
  // }

  closeModal() {
    return cy.get("[aria-label=\"icon: close\"]");
  }

  /**
     * add to flow icon in load table view
     * @param stepName
     */
  addToFlow(stepName: string) {
    return cy.findByLabelText(`${stepName}-add-icon`);
  }

  addToFlowDisabled(stepName: string) {
    return cy.findByLabelText(`${stepName}-disabled-add-icon`);
  }

  switchEditAdvanced() {
    return cy.findByText("Advanced");
  }

  switchEditBasic() {
    return cy.findByText("Basic");
  }

  getSortIndicator() {
    return cy.get(`[aria-label^="Name"] [aria-label="icon: caret-up"]`);
  }

  newFlow() {
    return cy.findByText("New flow");
  }


  deleteStep(stepName: string) {
    return cy.findByTestId(`${stepName}-delete`);
  }

  deleteStepDisabled(stepName: string) {
    return cy.findByTestId(`${stepName}-disabled-delete`);
  }

  deleteConfirmation(option: string) {
    return cy.findByLabelText(option);
  }

  deleteStepConfirmationMessage(stepName: string) {
    return cy.findByText(`Are you sure you want to delete the ${stepName} step`);
  }

  addStepToFlowConfirmationMessage() {
    return cy.findByLabelText("step-not-in-flow");
  }
  addStepExistingToFlowConfirmationMessage() {
    return cy.findByLabelText("step-in-flow");
  }

  addStepExistingToFlowRunConfirmationMessage() {
    return cy.findByLabelText("step-in-flow-run");
  }

  runStepSelectFlowConfirmation() {
    return cy.findByLabelText("step-in-no-flows-confirmation");
  }

  selectFlowToRunIn(flowName: string) {
    cy.findByTestId(`${flowName}-run-step`).click();
  }

  runStepExistsOneFlowConfirmation() {
    return cy.findByLabelText("run-step-one-flow-confirmation");
  }

  runStepExistsMultFlowsConfirmation() {
    return cy.findByLabelText("run-step-mult-flows-confirmation");
  }

  confirmContinueRun() {
    cy.findByLabelText("continue-confirm").click();
  }
  clickPaginationItem(index: number) {
    return cy.get(`[title="${index}"]`).scrollIntoView().click();
  }

  /**
     * @param text - a string that matches any button by its label
     */
  findByButtonText(text: string) {
    return cy.findByLabelText(text);
  }

  //New/Edit modal page objects
  stepNameInput() {
    return  cy.findByPlaceholderText("Enter name");
  }

  stepDescriptionInput() {
    return cy.findByPlaceholderText("Enter description");
  }

  stepSourceNameInput() {
    return cy.findByPlaceholderText("Enter Source Name");
  }

  stepSourceNameType() {
    return cy.findByPlaceholderText("Enter Source Type");
  }

  selectSourceFormat(format: string) {
    cy.get("#sourceFormat-select-wrapper").click();
    cy.findAllByText(`${format}`).last().click({force: true});
  }

  selectTargetFormat(format: string) {
    cy.get("#targetFormat-select-wrapper").click();
    cy.findAllByText(`${format}`).last().click();
  }

  uriPrefixInput() {
    return cy.findByPlaceholderText("Enter URI Prefix");
  }

  cancelButton() {
    return cy.findByTestId("create-edit-load-form").findByLabelText("Cancel");
  }

  confirmationOptions(option: string) {
    return cy.findByLabelText(option);
  }

  confirmationOptionsAll(option: string) {
    return cy.findAllByLabelText(option);
  }

  editLoadModal() {
    return cy.get(`[data-testid='create-edit-load-form']`);
  }

  saveButton() {
    return cy.findByTestId("create-edit-load-form").findByLabelText("Save");
  }

  /**
     * Clicks on a database option
     * @param db - accepts `STAGING` or `FINAL`
     */
  selectTargetDB(db: string) {
    cy.get("#targetDatabase-select-wrapper").click().contains(`data-hub-${db}`).click({force: true});
  }

  /**
     * This input field takes multiple values with special character sequences for keyboard events
     */
  targetCollectionInput() {
    return cy.findByLabelText("additionalColl-select");
  }

  defaultCollections(collectionName: string) {
    return cy.findByTestId(`defaultCollections-${collectionName}`);
  }

  /**
     * Overwrite the existing default permissions
     * @param permissions - accepts a comma separated text of roles and capabilities alternately
     * @example role1,cap1,role2,cap2
     */
  setTargetPermissions(permissions: string) {
    return cy.get("#targetPermissions").clear().type(permissions);
  }

  /**
     * Add to the existing default permissions
     * @param permissions - accepts a comma separated text of roles and capabilities alternately
     * @example role1,cap1,role2,cap2
     */
  appendTargetPermissions(permissions: string) {
    return cy.get("#targetPermissions").type(`,${permissions}`);
  }

  setBatchSize(batchSize: string) {
    cy.get("#batchSize").clear().type(batchSize);
  }

  /**
     * Textarea that takes a file path in fixtures and pastes the json object {} in the text area
     * @param fixturePath - file path to headerContent json config file
     * @see https://docs.cypress.io/api/commands/type.html#Key-Combinations
     */
  setHeaderContent(fixturePath: string) {
    cy.fixture(fixturePath).then(content => {
      cy.get("#headers").clear().type(JSON.stringify(content), {parseSpecialCharSequences: false});
    });
  }

  /**
     * Textarea that takes a file path in fixtures and pastes the json array object [] in the text area
     * @param fixturePath - file path to stepInterceptor json config file
     * @see https://docs.cypress.io/api/commands/type.html#Key-Combinations
     */
  setStepInterceptor(fixturePath: string) {
    cy.findByText("Interceptors").click();
    if (fixturePath === "") { return cy.get("#interceptors").clear(); } else {
      cy.fixture(fixturePath).then(content => {
        cy.get("#interceptors").clear().type(JSON.stringify(content), {parseSpecialCharSequences: false});
      });
    }
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

  jsonValidateError() {
    return cy.findByText("Invalid JSON");
  }

  cancelSettings(stepName: string) {
    return cy.findByTestId(`${stepName}-cancel-settings`);
  }

  saveSettings(stepName: string) {
    return cy.findByTestId(`${stepName}-save-settings`);
  }

  duplicateStepErrorMessage() {
    return cy.findByLabelText("duplicate-step-error");
  }

  duplicateStepErrorMessageClosed() {
    return cy.findByLabelText("duplicate-step-error").should("not.exist");
  }

  //Load tile card view page objects
  editStepInCardView(stepName: string) {
    return cy.findByTestId(`${stepName}-edit`);
  }

  runStep(stepName: string) {
    return cy.findByTestId(`${stepName}-run`);
  }

  runInNewFlow(stepName: string) {
    return cy.findByTestId(`${stepName}-run-toNewFlow`);
  }

  addToNewFlow(stepName: string) {
    return cy.findByTestId(`${stepName}-toNewFlow`);
  }

  addStepToNewFlow(stepName: string) {
    cy.get(`[aria-label="${stepName}"]`).trigger("mouseover", {force: true});
    this.addToNewFlow(stepName).click({force: true});
  }

  addStepToNewFlowListView(stepName: string) {
    cy.findByLabelText(`${stepName}-add-icon`).click();
    this.addToNewFlow(stepName).click({force: true});
    cy.waitForAsyncRequest();
  }

  existingFlowsList(stepName: string) {
    return cy.get(`#${stepName}-flowsList-select-wrapper`);
  }

  addStepToExistingFlow(stepName: string, flowName: string) {
    this.stepName(stepName).trigger("mouseover", {force: true});
    this.existingFlowsList(stepName).click();
    cy.findByLabelText(`${flowName}-option`).click();
  }

  getContainerTitle() {
    return cy.get(`[aria-label="title-load"]`);
  }

  missingPermissionTooltip(stepName: string) {
    return cy.get(`#${stepName}missing-permission-tooltip`);
  }

}

const loadPage = new LoadPage();
export default loadPage;
