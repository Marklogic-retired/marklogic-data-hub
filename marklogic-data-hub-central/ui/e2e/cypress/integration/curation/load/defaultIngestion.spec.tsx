import {Application} from "../../../support/application.config";
import {tiles, toolbar} from "../../../support/components/common";
import loadPage from "../../../support/pages/load";

describe('Default ingestion ', () => {

    beforeEach(() => {
        cy.visit('/');
        cy.contains(Application.title);
        cy.loginAsTestUserWithRoles("hub-central-load-writer", "hub-central-flow-writer").withRequest();
        cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
        tiles.waitForTableToLoad();
    });

    afterEach(() => {
        cy.resetTestUser();
    })

    after(() => {
        cy.loginAsDeveloper().withRequest();
        cy.deleteSteps('ingestion', 'cyZIPTest');//'cyCSVTest', 'cyXMTest',
        cy.deleteFlows( 'zipE2eFlow');//'csvE2eFlow', 'xmlE2eFlow',
    })

    it('Verifies CRUD functionality from list view', () => {
        let stepName = 'cyTestName';
        //Verify Cancel
        loadPage.loadView('table').click();
        loadPage.addNewButton('list').click();
        loadPage.stepNameInput().type(stepName);
        loadPage.stepDescriptionInput().type('cyTestDesc');
        loadPage.selectSourceFormat('XML');
        loadPage.selectTargetFormat('XML');
        loadPage.uriPrefixInput().type('/e2eLoad/');
        loadPage.cancelButton().click();
        cy.findByText('Discard changes?').should('be.visible');
        loadPage.confirmationOptions('No').click();
        loadPage.cancelButton().click();
        loadPage.confirmationOptions('Yes').click();
        cy.findByText(stepName).should('not.be.visible');

        //Verify Save
        loadPage.addNewButton('list').click();
        loadPage.stepNameInput().type(stepName);
        loadPage.stepDescriptionInput().type('cyTestDesc');
        loadPage.selectSourceFormat('XML');
        loadPage.selectTargetFormat('XML');
        loadPage.uriPrefixInput().type('/e2eLoad/');
        loadPage.saveButton().click();
        cy.findByText(stepName).should('be.visible');

        //Verify Edit
        loadPage.stepName(stepName).click();
        loadPage.stepNameInput().should('be.disabled');
        loadPage.stepDescriptionInput().clear().type('UPDATE');
        loadPage.saveButton().click();
        cy.findByText('UPDATE').should('be.visible');

        //Verify Settings
        loadPage.stepSettings(stepName).click();
        loadPage.stepNameInSettings().should('have.text', stepName);
        loadPage.selectTargetDB('FINAL');
        loadPage.targetCollectionInput().type('e2eTestCollection{enter}test1{enter}test2{enter}');
        cy.findByText('Default Collections').click();
        loadPage.defaultCollections(stepName).should('be.visible');
        loadPage.appendTargetPermissions('data-hub-common-writer,update');
        loadPage.selectProvGranularity('Off');
        loadPage.setBatchSize('200');
        //Verify JSON error
        cy.get('#headers').clear().type('{').tab();
        loadPage.jsonValidateError().should('be.visible');
        loadPage.setHeaderContent('loadTile/headerContent');
        //Verify JSON error
        cy.findByText('Processors').click();
        cy.get('#processors').clear().type('["test": "fail"]').tab();
        loadPage.jsonValidateError().should('be.visible');
        cy.findByText('Processors').click(); //closing the processor text area
        loadPage.setStepProcessor('loadTile/stepProcessor');
        //Verify JSON error
        cy.findByText('Custom Hook').click();
        cy.get('#customHook').clear().type('{test}', { parseSpecialCharSequences: false }).tab();
        loadPage.jsonValidateError().should('be.visible');
        cy.findByText('Custom Hook').click(); //closing the custom hook text area
        loadPage.setCustomHook('loadTile/customHook');
        loadPage.cancelSettings(stepName).click();
        loadPage.confirmationOptions('No').click();
        loadPage.saveSettings(stepName).click();
        loadPage.stepName(stepName).should('be.visible');

        //Verify Delete
        loadPage.deleteStep(stepName).click();
        loadPage.confirmationOptions("No").click();
        loadPage.stepName(stepName).should('be.visible');
        loadPage.deleteStep(stepName).click();
        loadPage.confirmationOptions('Yes').click();
        loadPage.stepName(stepName).should('not.be.visible');

    })

    it('Verifies CRUD functionality from card view and run in a flow', () => {
        let stepName = 'cyTestName';
        let flowName= 'newE2eFlow';
        //Verify Cancel
        loadPage.loadView('th-large').click();
        loadPage.addNewButton('card').click();
        loadPage.stepNameInput().type(stepName);
        loadPage.stepDescriptionInput().type('cyTestDesc');
        loadPage.selectSourceFormat('TEXT');
        loadPage.selectTargetFormat('TEXT');
        loadPage.uriPrefixInput().type('/e2eLoad/');
        loadPage.cancelButton().click();
        cy.findByText('Discard changes?').should('be.visible');
        loadPage.confirmationOptions('No').click();
        loadPage.cancelButton().click();
        loadPage.confirmationOptions('Yes').click();
        cy.findByText(stepName).should('not.be.visible');

        //Verify Save
        loadPage.addNewButton('card').click();
        loadPage.stepNameInput().type(stepName);
        loadPage.stepDescriptionInput().type('cyTestDesc');
        loadPage.uriPrefixInput().type('/e2eJSON/');
        loadPage.saveButton().click();
        cy.findByText(stepName).should('be.visible');

        //Verify Edit
        loadPage.editStepInCardView(stepName).click();
        loadPage.stepNameInput().should('be.disabled');
        loadPage.stepDescriptionInput().clear().type('UPDATE');
        loadPage.saveButton().click();
        loadPage.stepName(stepName).should('be.visible');

        //Verify Settings
        loadPage.stepSettings(stepName).click();
        loadPage.stepNameInSettings().should('have.text', stepName);
        loadPage.selectTargetDB('STAGING');
        loadPage.targetCollectionInput().type('e2eTestCollection{enter}test1{enter}test2{enter}');
        cy.findByText('Default Collections').click();
        loadPage.defaultCollections(stepName).should('be.visible');
        loadPage.setTargetPermissions('data-hub-common,read,data-hub-common-writer,update');
        loadPage.selectProvGranularity('Off');
        loadPage.setBatchSize('200');
        //Verify JSON error
        cy.get('#headers').clear().type('{').tab();
        loadPage.jsonValidateError().should('be.visible');
        loadPage.setHeaderContent('loadTile/headerContent');
        //Verify JSON error
        cy.findByText('Processors').click();
        cy.get('#processors').clear().type('["test": "fail"]').tab();
        loadPage.jsonValidateError().should('be.visible');
        cy.findByText('Processors').click(); //closing the processor text area
        loadPage.setStepProcessor('');
        //Verify JSON error
        cy.findByText('Custom Hook').click();
        cy.get('#customHook').clear().type('{test}', { parseSpecialCharSequences: false }).tab();
        loadPage.jsonValidateError().should('be.visible');
        cy.findByText('Custom Hook').click(); //closing the custom hook text area
        loadPage.setCustomHook('');
        loadPage.cancelSettings(stepName).click();
        loadPage.confirmationOptions('No').click();
        loadPage.saveSettings(stepName).click();
        loadPage.stepName(stepName).should('be.visible');

        //Verify Add to New Flow
        loadPage.addStepToNewFlow(stepName);
        cy.findByText('New Flow').should('be.visible');
        cy.findByPlaceholderText('Enter name').type(flowName);
        cy.findByPlaceholderText('Enter description').type(`${flowName} description`);
        loadPage.confirmationOptions('Save').click();
        cy.verifyStepAddedToFlow('Load', stepName);

        //Run the flow with invalid input
        cy.findByLabelText(`runStep-${stepName}`).click();
        cy.uploadFile('input/test-1');
        cy.verifyStepRunResult('failed','Ingestion', stepName)
            .should('contain.text', 'Document is not JSON');
        tiles.closeRunMessage().click();

        //Run the flow with JSON input
        cy.findByLabelText(`runStep-${stepName}`).click();
        cy.uploadFile('input/test-1.json');
        cy.verifyStepRunResult('success','Ingestion', stepName);
        tiles.closeRunMessage().click();
        cy.findByLabelText(`deleteStep-${stepName}`).click();
        loadPage.confirmationOptions('Yes').click();

        //Verify Add to Existing Flow after changing source/target format to TEXT
        cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
        tiles.waitForTableToLoad();
        loadPage.loadView('th-large').click();
        loadPage.editStepInCardView(stepName).click();
        loadPage.selectSourceFormat('TEXT');
        loadPage.selectTargetFormat('TEXT');
        loadPage.saveButton().click();
        loadPage.stepName(stepName).should('be.visible');
        loadPage.addStepToExistingFlow(stepName, flowName);
        cy.findByText(`Are you sure you want to add "${stepName}" to flow "${flowName}"?`).should('be.visible');
        loadPage.confirmationOptions('Yes').click();
        cy.verifyStepAddedToFlow('Load', stepName);

        //Run the flow with TEXT input
        cy.findAllByLabelText(`runStep-${stepName}`).last().click();
        cy.uploadFile('input/test-1.txt');
        cy.verifyStepRunResult('success','Ingestion', stepName);
        tiles.closeRunMessage().click();

        //Delete the flow
        cy.findByTestId(`deleteFlow-${flowName}`).click();
        cy.findByText(`Are you sure you want to delete flow "${flowName}"?`).should('be.visible');
        loadPage.confirmationOptions('Yes').click();

        //Verify Delete step
        cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
        tiles.waitForTableToLoad();
        loadPage.deleteStep(stepName).click();
        loadPage.confirmationOptions("No").click();
        loadPage.stepName(stepName).should('be.visible');
        loadPage.deleteStep(stepName).click();
        loadPage.confirmationOptions('Yes').click();
        loadPage.stepName(stepName).should('not.be.visible');
    })

    //TODO: Uncommnt after DHFPROD-5520 is fixed
    xit('Verify ingestion for csv filetype', () => {
        let stepName = 'cyCSVTest';
        let flowName= 'csvE2eFlow';
        loadPage.loadView('th-large').click();
        loadPage.addNewButton('card').click();
        loadPage.stepNameInput().type(stepName);
        loadPage.stepDescriptionInput().type('cyTestDesc');
        loadPage.selectSourceFormat('Delimited Text');
        loadPage.selectTargetFormat('XML');
        loadPage.uriPrefixInput().type('/e2eCSV/');
        loadPage.saveButton().click();
        cy.findByText(stepName).should('be.visible');

        loadPage.addStepToNewFlow(stepName);
        cy.findByText('New Flow').should('be.visible');
        cy.findByPlaceholderText('Enter name').type(flowName);
        cy.findByPlaceholderText('Enter description').type(`${flowName} description`);
        loadPage.confirmationOptions('Save').click();
        cy.verifyStepAddedToFlow('Load', stepName);

        cy.findByLabelText(`runStep-${stepName}`).click();
        cy.uploadFile('input/test-1.csv');
        cy.verifyStepRunResult('success','Ingestion', stepName);
        tiles.closeRunMessage().click();
    })

    it('Verify ingestion for zip filetype', () => {
        let stepName = 'cyZIPTest';
        let flowName= 'zipE2eFlow';
        loadPage.loadView('th-large').click();
        loadPage.addNewButton('card').click();
        loadPage.stepNameInput().type(stepName);
        loadPage.stepDescriptionInput().type('cyTestDesc');
        loadPage.selectSourceFormat('BINARY');
        loadPage.selectTargetFormat('BINARY');
        loadPage.uriPrefixInput().type('/e2eBinary/');
        loadPage.saveButton().click();
        cy.findByText(stepName).should('be.visible');

        loadPage.addStepToNewFlow(stepName);
        cy.findByText('New Flow').should('be.visible');
        cy.findByPlaceholderText('Enter name').type(flowName);
        cy.findByPlaceholderText('Enter description').type(`${flowName} description`);
        loadPage.confirmationOptions('Save').click();
        cy.verifyStepAddedToFlow('Load', stepName);

        cy.findByLabelText(`runStep-${stepName}`).click();
        cy.uploadFile('input/test-1.zip');
        cy.verifyStepRunResult('success','Ingestion', stepName);
        tiles.closeRunMessage().click();
    })

    //TODO: Uncommnt after DHFPROD-5520 is fixed
    xit('Verify ingestion for xml filetype', () => {
        let stepName = 'cyXMTest';
        let flowName= 'xmlE2eFlow';
        loadPage.loadView('th-large').click();
        loadPage.addNewButton('card').click();
        loadPage.stepNameInput().type(stepName);
        loadPage.stepDescriptionInput().type('cyTestDesc');
        loadPage.selectSourceFormat('XML');
        loadPage.selectTargetFormat('XML');
        loadPage.uriPrefixInput().type('/e2eXml/');
        loadPage.saveButton().click();
        cy.findByText(stepName).should('be.visible');

        loadPage.addStepToNewFlow(stepName);
        cy.findByText('New Flow').should('be.visible');
        cy.findByPlaceholderText('Enter name').type(flowName);
        cy.findByPlaceholderText('Enter description').type(`${flowName} description`);
        loadPage.confirmationOptions('Save').click();
        cy.verifyStepAddedToFlow('Load', stepName);

        cy.findByLabelText(`runStep-${stepName}`).click();
        cy.uploadFile('input/test-1.xml');
        cy.verifyStepRunResult('success','Ingestion', stepName);
        tiles.closeRunMessage().click();
    })

    xit('Run Ingest in a flow to verify failed_with_error status',() => {

    })

    xit('Verifies usage of step processors', () => {

    })

    xit('Verifies usage of custom hook', () => {

    })
})
