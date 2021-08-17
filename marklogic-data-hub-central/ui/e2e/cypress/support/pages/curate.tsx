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
    cy.findByTestId(`${stepName}-flowsList`).should("be.visible", {timeout: 5000}).click();
  }

  openStepDetails(stepName: string) {
    cy.findByTestId(`${stepName}-stepDetails`).should("be.visible", {timeout: 5000}).click();
  }

  /**
     * Depends on openExistingFlowDropdown() being called first
     * @param flowName
     */
  getExistingFlowFromDropdown(flowName: string) {
    return cy.findByLabelText(`${flowName}-option`);
  }

  /**
     * Verifies if Map/Custom tabs exists
     * @param entityTypeId -- entity Type like Customer, Order or "No Entity Type"
     * @param mapTabShould -- Cypress ".should" chainers like exist/visible or not.exist/not.visible etc
     * @param customTabShould -- Cypress ".should" chainers like exist/visible or not.exist/not.visible etc
     */
  verifyTabs(entityTypeId: string, mapTabShould: string, customTabShould: string) {
    cy.findByTestId(`${entityTypeId}-Map`).should(mapTabShould);
    cy.findByTestId(`${entityTypeId}-Custom`).should(customTabShould);
  }

  selectMergeTab(entityTypeId: string) {
    cy.waitUntil(() => cy.findByTestId(`${entityTypeId}-Merge`)).click();
  }

  selectMatchTab(entityTypeId: string) {
    cy.waitUntil(() => cy.findByTestId(`${entityTypeId}-Match`)).click({force: true});
  }

  selectCustomTab(entityTypeId: string) {
    cy.waitUntil(() => cy.findByTestId(`${entityTypeId}-Custom`)).click();
  }

  addNewStep() {
    return cy.findByLabelText("icon: plus-circle");
  }

  addNewStepDisabled() {
    return cy.findByLabelText("add-new-card-disabled");
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
    return cy.findByTestId(`${stepName}-edit`);
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
    cy.findByTestId(`${stepName}-to-${flowName}-Confirm`).click();
  }

  dataPresent() {
    return cy.get("#dataPresent");
  }

  xpathExpression(propertyName: string) {
    return cy.findByTestId(`${propertyName}-mapexpression`);
  }

  targetCollectionDropdown() {
    cy.get(".ant-select-dropdown").eq(0).click();
  }

  alertContent() {
    return cy.get(`[id="hc-alert-component-content"]`);
  }

  removeTargetCollection(collection: string) {
    cy.get(`[title=${collection}] span[class="ant-select-selection__choice__remove"]`).click();
  }

  matchTargetCollection(collection: string) {
    return cy.get(`[id="additionalColl"] [class="ant-select-selection__rendered"] [title=${collection}]`);
  }

  targetCollection(collection: string) {
    cy.get("div[id=\"additionalColl\"]").type(collection);
  }

  mergeTargetCollection(collection: string) {
    return cy.get(`[data-row-key=${collection}] [class^="advanced-target-collections_preWrap"]`);
  }
}

const curatePage = new CuratePage();
export default curatePage;