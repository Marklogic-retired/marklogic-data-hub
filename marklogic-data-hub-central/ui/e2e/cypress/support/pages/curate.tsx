class CuratePage {
  /**
     * Open/close the entity type id to expose/hide the map/custom step configurations
     * @param entityTypeId
     * @example Customer
     */
  toggleEntityTypeId(entityTypeId: string) {
    cy.waitUntil(() => cy.findByTestId(entityTypeId)).click();
  }

  getEntityTypePanel(entityTypeId: string) {
    return cy.findByTestId(entityTypeId);
  }

  noEntityType() {
    return cy.findByTestId("noEntityType");
  }

  /**
     * Get Mapping step by entity and step name
     * @param entityTypeId
     * @example Order
     * @param stepName
     * @example map-orders
     */
  getEntityMappingStep(entityTypeId: string, stepName: string) {
    return cy.findByTestId(`${entityTypeId}-${stepName}-step`);
  }

  openMappingStepDetail(entityTypeId: string, stepName: string) {
    this.getEntityMappingStep(entityTypeId, stepName).should("be.visible", {timeout: 5000}).trigger("mouseover");
    cy.findByTestId(`${stepName}-stepDetails`).should("be.visible", {timeout: 5000}).click();
    this.verifyStepDetailsOpen(stepName);
  }

  addToNewFlow(entityTypeId: string, stepName: string) {
    this.getEntityMappingStep(entityTypeId, stepName).should("be.visible", {timeout: 5000}).trigger("mouseover");
    cy.findByTestId(`${stepName}-toNewFlow`).should("be.visible", {timeout: 5000}).click();
  }

  openExistingFlowDropdown(entityTypeId: string, stepName: string) {
    this.getEntityMappingStep(entityTypeId, stepName).should("be.visible", {timeout: 5000}).trigger("mouseover");
    cy.get(`#${stepName}-flowsList-select-wrapper`).should("be.visible", {timeout: 5000}).scrollIntoView().click();
  }

  openStepDetails(stepName: string) {
    cy.findByTestId(`${stepName}-stepDetails`).should("be.visible", {timeout: 5000}).click();
  }

  /**
     * Depends on openExistingFlowDropdown() being called first
     * @param flowName
     */
  getExistingFlowFromDropdown(stepName: string, flowName: string) {
    return cy.get(`#${stepName}-flowsList-select-MenuList [aria-label="${flowName}-option"]`);
  }

  getExistingFlowFromDropdown_OldWay(flowName: string) {
    return cy.findByTitle(`${flowName}`).find(`[aria-label^="Remove"]`).click();
  }
  /**
   * Select an existing flow from a match step dropdown
   * @param flowName
   */
  selectExistingFlowFromDropdown(flowName: string) {
    cy.get("li[role=\"option\"]", {timeout: 60000}).contains(flowName).click({force: true});
  }

  /**
     * Verifies if Map/Custom tabs exists
     * @param entityTypeId -- entity Type like Customer, Order or "No Entity Type"
     * @param mapTabShould -- Cypress ".should" chainers like exist/visible or not.exist/not.visible etc
     * @param customTabShould -- Cypress ".should" chainers like exist/visible or not.exist/not.visible etc
     */
  verifyTabs(entityTypeId: string, mapTabShould: string, customTabShould: string) {
    cy.get(`#${entityTypeId} [data-rr-ui-event-key="map"]`).should(mapTabShould);
    cy.get(`#${entityTypeId} [data-rr-ui-event-key="custom"]`).should(customTabShould);
  }

  selectMergeTab(entityTypeId: string) {
    cy.waitUntil(() => cy.get(`#${entityTypeId} [data-rr-ui-event-key="merge"]`)).click();
  }

  selectMatchTab(entityTypeId: string) {
    cy.waitUntil(() => cy.get(`#${entityTypeId} [data-rr-ui-event-key="match"]`)).click();
  }

  selectCustomTab(entityTypeId: string) {
    cy.waitUntil(() => cy.get(`#${entityTypeId} [data-rr-ui-event-key="custom"]`)).click();
  }

  addNewStep(curateTabId: string) {
    return cy.get(`#${curateTabId}`).findByLabelText("icon: plus-circle");
  }

  addNewStepDisabled(entityTypeId: string) {
    return cy.get(`#${entityTypeId}`).findByLabelText("add-new-card-disabled");
  }

  stepSettings(stepName: string) {
    return cy.findByTestId(`${stepName}-settings`);
  }

  cancelSettings(stepName: string) {
    return cy.findByTestId(`${stepName}-cancel-settings`);
  }

  saveSettings(stepName: string) {
    return cy.findByTestId(`${stepName}-save-settings`);
  }

  editStep(stepName: string) {
    return cy.get(`[data-testid="${stepName}-edit"]`);
  }

  switchEditAdvanced() {
    return cy.findByText("Advanced");
  }

  switchEditBasic() {
    return cy.findByText("Basic");
  }

  runStepInCardView(stepName: string) {
    return cy.findByTestId(`${stepName}-run`);
  }

  runInNewFlow(stepName: string) {
    return cy.findByTestId(`${stepName}-run-toNewFlow`);
  }

  runExistingFlowsList(stepName: string) {
    return cy.findByTestId(`${stepName}-run-flowsList`);
  }

  selectFlowToRunIn(flowName: string) {
    cy.findByTestId(`${flowName}-run-step`).click();
  }

  verifyStepNameIsVisible(stepName: string) {
    // cy.get('#name').should('be.visible');
    cy.waitUntil(() => cy.findByLabelText(`${stepName}-step-label`).should("have.length.gt", 0));
    cy.findByLabelText(`${stepName}-step-label`).should("be.visible");
    cy.findByText(stepName).should("be.visible");
  }

  verifyStepNameIsVisibleEdit(stepName: string) {
    cy.waitUntil(() => cy.findByLabelText(`${stepName}-step-label`).should("have.length.gt", 0));
    cy.findByLabelText(`${stepName}-step-label`).should("be.visible");
    cy.get(`[value=${stepName}]`).should("be.visible");
  }

  verifyStepDetailsOpen(stepName: string) {
    // cy.get('#name').should('be.visible');
    cy.findByLabelText(`${stepName}-details-header`).should("be.visible");
  }

  saveEdit() {
    return cy.findByTestId("mapping-dialog-save");
  }

  cancelEdit() {
    return cy.findByTestId("mapping-dialog-cancel");
  }

  deleteMappingStepButton(stepName: string) {
    return cy.findByTestId(`${stepName}-delete`);
  }

  deleteDisabled() {
    return cy.get("[role=\"disabled-delete-mapping button\"]");
  }

  addStepToFlowConfirmationMessage() {
    return cy.findByLabelText("step-not-in-flow");
  }

  addStepToFlowRunConfirmationMessage() {
    return cy.findByLabelText("step-not-in-flow-run");
  }

  addStepExistingToFlowConfirmationMessage() {
    return cy.findByLabelText("step-in-flow");
  }

  runStepSelectFlowConfirmation() {
    return cy.findByLabelText("step-in-no-flows-confirmation");
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

  confirmAddStepToFlow(stepName: string, flowName: string) {
    cy.findByTestId(`${stepName}-to-${flowName}-Confirm`).should("be.visible").click();
  }

  dataPresent() {
    return cy.get("#dataPresent");
  }

  xpathExpression(propertyName: string) {
    return cy.findByTestId(`${propertyName}-mapexpression`);
  }

  getAdditionalCollSelectWrapper() {
    return cy.get("#additionalColl-select-wrapper");
  }

  alertContent() {
    return cy.get(`[id="hc-alert-component-content"]`);
  }

  removeTargetCollection(collection: string) {
    this.getAdditionalCollSelectWrapper().get(`[aria-label="Remove ${collection}"]`).click();
  }

  matchTargetCollection(collection: string) {
    return this.getAdditionalCollSelectWrapper().findByText(collection).should("be.visible");
  }

  targetCollection(collection: string) {
    this.getAdditionalCollSelectWrapper().type(collection).find("input").typeTab();
  }

  mergeTargetCollection(collection: string) {
    // ToDo: we could refactor this when react-bootstrap-table2 supports row attributes
    // and go back to data-row-key
    return cy.get(`[data-coll-event=${collection}] [class^="advanced-target-collections_preWrap"]`);
  }
}

const curatePage = new CuratePage();
export default curatePage;
