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
        return cy.findByTestId('noEntityType');
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

    openSourceToEntityMap(entityTypeId: string, stepName: string) {
      this.getEntityMappingStep(entityTypeId, stepName).trigger('mouseover');
      cy.waitUntil(() => cy.findByTestId(`${stepName}-stepDetails`)).click();
    }

    addToNewFlow(entityTypeId: string, stepName: string) {
      this.getEntityMappingStep(entityTypeId, stepName).trigger('mouseover');
      cy.waitUntil(() => cy.findByTestId(`${stepName}-toNewFlow`)).click();
    }

    openExistingFlowDropdown(entityTypeId: string, stepName: string) {
      this.getEntityMappingStep(entityTypeId, stepName).trigger('mouseover');
      cy.findByTestId(`${stepName}-flowsList`).click();
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

    addNewMapStep() {
        return cy.findByLabelText('icon: plus-circle');
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

    verifyStepNameIsVisible(stepName: string) {
        cy.get('#name').should('be.visible');
        cy.findByText(stepName).should('be.visible');
    }

    saveEdit() {
        return cy.findByTestId('mapping-dialog-save')
    }

    cancelEdit() {
        return cy.findByTestId('mapping-dialog-cancel')
    }

    deleteMappingStepButton(stepName: string) {
        return cy.findByTestId(`${stepName}-delete`)
    }

    deleteDisabled() {
        return cy.get('[role="disabled-delete-mapping button"]');
    }

    addStepToFlowConfirmationMessage(stepName: string, flowName: string) {
      return cy.findByText(`Are you sure you want to add "${stepName}" to flow "${flowName}"?`)
    }

    confirmAddStepToFlow(stepName: string, flowName: string) {
      cy.findByTestId(`${stepName}-to-${flowName}-Confirm`).click();
    }
}

const curatePage = new CuratePage();
export default curatePage;
