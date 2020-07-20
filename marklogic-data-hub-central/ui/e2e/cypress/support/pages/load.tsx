import {FileLocation} from "ts-loader/dist/types/interfaces";
import {Simulate} from "react-dom/test-utils";
import mouseOver = Simulate.mouseOver;

class LoadPage {

    //Load tile list view page objects
    /**
     * @param type - accepts `table` for list-view or `th-large` for card-view
     */
    loadView(type: string) {
        return cy.get(`[data-icon="${type}"`);
    }

    /**
     * @param type - accepts `list` or `card`
     */
    addNewButton(type: string) {
        return cy.findByLabelText(`add-new-${type}`)
    }

    stepName(stepName: string) {
        return cy.findByText(stepName);
    }

    stepDescription(stepName: string) {

    }

    stepSourceFormat(stepName: string) {

    }

    stepTargetFormat(stepName: string) {

    }

    stepLastUpdated(stepName: string) {

    }

    columnSort(columnName: string) {

    }

    closeModal() {
        return cy.get('[aria-label="icon: close"]')
    }

    stepSettings(stepName: string) {
        return cy.findByTestId(`${stepName}-settings`);
    }

    deleteStep(stepName: string) {
        return cy.findByTestId(`${stepName}-delete`);
    }

    deleteConfirmation(option: string) {
        return cy.findByLabelText(option);
    }

    pagination() {

    }

    /**
     * @param text - a string that matches any button by its label
     */
    findByButtonText(text: string) {
        return cy.findByLabelText(text);
    }

    //New/Edit modal page objects
    stepNameInput() {
        return  cy.findByPlaceholderText('Enter name');
    }

    stepDescriptionInput() {
        return cy.findByPlaceholderText('Enter description');
    }

    selectSourceFormat(format: string) {
        cy.get('#sourceFormat').click();
        cy.findAllByText(`${format}`).last().click();
    }

    selectTargetFormat(format: string) {
        cy.get('#targetFormat').click();
        cy.findAllByText(`${format}`).last().click();
    }

    uriPrefixInput() {
        return cy.findByPlaceholderText('Enter URI Prefix');
    }

    cancelButton() {
        return cy.findByLabelText('Cancel');
    }

    confirmationOptions(option: string) {
        return cy.findByLabelText(option);
    }

    saveButton() {
        return cy.findByLabelText('Save');
    }

    //Settings page objects
    stepNameInSettings() {
        return cy.get('div p').last();
    }

    /**
     * Clicks on a database option
     * @param db - accepts `STAGING` or `FINAL`
     */
    selectTargetDB(db: string) {
        cy.findByLabelText('targetDatabase-select').click();
        cy.findByTestId(`targetDbOptions-data-hub-${db}`).click();
    }

    /**
     * This input field takes multiple values with special character sequences for keyboard events
     */
    targetCollectionInput() {
        return cy.findByLabelText('additionalColl-select');
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
        return cy.get('#targetPermissions').clear().type(permissions);
    }

    /**
     * Add to the existing default permissions
     * @param permissions - accepts a comma separated text of roles and capabilities alternately
     * @example role1,cap1,role2,cap2
     */
    appendTargetPermissions(permissions: string) {
        return cy.get('#targetPermissions').type(`,${permissions}`);
    }

    selectProvGranularity(options: string) {
        cy.get('#provGranularity').click();
        cy.findByTestId(`provOptions-${options}`).click();
    }

    setBatchSize(batchSize: string) {
        cy.get('#batchSize').clear().type(batchSize);
    }

    /**
     * Textarea that takes a file path in fixtures and pastes the json object {} in the text area
     * @param fixturePath - file path to headerContent json config file
     * @see https://docs.cypress.io/api/commands/type.html#Key-Combinations
     */
    setHeaderContent(fixturePath: string) {
        cy.fixture(fixturePath).then(content => {
            cy.get('#headers').clear().type(JSON.stringify(content), { parseSpecialCharSequences: false });
        });
    }

    /**
     * Textarea that takes a file path in fixtures and pastes the json array object [] in the text area
     * @param fixturePath - file path to stepProcessor json config file
     * @see https://docs.cypress.io/api/commands/type.html#Key-Combinations
     */
    setStepProcessor(fixturePath: string) {
        cy.findByText('Processors').click();
        if(fixturePath === '')
            return cy.get('#processors').clear();
        else cy.fixture(fixturePath).then(content => {
            cy.get('#processors').clear().type(JSON.stringify(content), { parseSpecialCharSequences: false });
        });
    }

    /**
     * Textarea that takes a file path in fixtures and pastes the json object {} in the text area
     * @param fixturePath - file path to customHook json config file
     * @see https://docs.cypress.io/api/commands/type.html#Key-Combinations
     */
    setCustomHook(fixturePath: string) {
        cy.findByText('Custom Hook').click();
        if(fixturePath === '')
            return cy.get('#customHook').clear();
        else cy.fixture(fixturePath).then(content => {
            cy.get('#customHook').clear().type(JSON.stringify(content), {parseSpecialCharSequences: false});
        });
    }

    jsonValidateError() {
        return cy.findByText('Invalid JSON');
    }

    cancelSettings(stepName: string) {
        return cy.findByTestId(`${stepName}-cancel-settings`);
    }

    saveSettings(stepName: string) {
        return cy.findByTestId(`${stepName}-save-settings`);
    }

    //Load tile card view page objects
    editStepInCardView(stepName: string) {
        return cy.findByTestId(`${stepName}-edit`);
    }

    addStepToNewFlow(stepName: string) {
        this.stepName(stepName).trigger('mouseover');
        cy.findByTestId(`${stepName}-toNewFlow`).click();
    }

    addStepToExistingFlow(stepName: string, flowName: string) {
        this.stepName(stepName).trigger('mouseover');
        cy.findByTestId(`${stepName}-flowsList`).click();
        cy.findByLabelText(flowName).click();
    }

}

const loadPage = new LoadPage();
export default loadPage;
