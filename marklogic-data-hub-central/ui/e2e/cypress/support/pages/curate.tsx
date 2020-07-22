class CuratePage {
    /**
     * Open/close the entity type id to expose/hide the map/custom step configurations
     * @param entityTypeId
     * @example Customer
     */
    toggleEntityTypeId(entityTypeId: string) {
        cy.waitUntil(() => cy.findByTestId(entityTypeId)).click();
    }

    noEntityType() {
        return cy.findByTestId('noEntityType');
    }

    /**
     * Verifies if Map/Custom tabs exists
     * @param entityTypeId -- entity Type like Customer, Order or "No Entity Type"
     * @param mapTabShould -- Cypress ".should" chainers like exist/visible or not.exist/not.visible etc
     * @param customTabShould -- Cypress ".should" chainers like exist/visible or not.exist/not.visible etc
     */
    verifyTabs(entityTypeId: string, mapTabShould: string, customTabShould: string) {
        cy.findByTestId(`${entityTypeId}-Map`).should(mapTabShould);
        cy.findByTestId(`${entityTypeId}-Cusstom`).should(customTabShould);
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

    saveEdit(stepName: string) {
        return cy.findByTestId(`${stepName}-edit-save`)
    }

    cancelEdit(stepName: string) {
        return cy.findByTestId(`${stepName}-edit-cancel`)
    }

    deleteDisabled() {
        return cy.get('[role="disabled-delete-mapping button"]');
    }
}

const curatePage = new CuratePage();
export default curatePage;
