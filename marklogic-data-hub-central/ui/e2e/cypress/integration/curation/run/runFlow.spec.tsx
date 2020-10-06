import {Application} from "../../../support/application.config";
import {tiles, toolbar} from "../../../support/components/common";
import runPage from "../../../support/pages/run";
import browsePage from "../../../support/pages/browse";

describe('Run Tile tests', () => {

    beforeEach( () => {
        cy.visit('/');
        cy.contains(Application.title);
        cy.loginAsTestUserWithRoles('hub-central-flow-writer').withRequest();
        cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
        cy.waitUntil(() => runPage.getFlowName('personJSON').should('be.visible'));
    });

    after(() => {
        cy.deleteRecordsInFinal('master-xml-person', 'mapPersonXML');
        cy.resetTestUser();
    });

    it('should load xml merged document and display content', () => {
        //Verifies DHFPROD-5863
        //Run map,match and merge step for Person entity using xml documents
        runPage.toggleFlowConfig('personXML');
        runPage.runStep('mapPersonXML').click();
        cy.verifyStepRunResult('success','Mapping', 'mapPersonXML');
        tiles.closeRunMessage().click();
        runPage.runStep('match-xml-person').click();
        cy.verifyStepRunResult('success','Matching', 'match-xml-person');
        tiles.closeRunMessage().click();
        runPage.runStep('merge-xml-person').click();
        cy.verifyStepRunResult('success','Merging', 'merge-xml-person');
        tiles.closeRunMessage().click();

        //Verify detail page renders with expected content
        toolbar.getExploreToolbarIcon().click();
        cy.waitUntil(() => browsePage.getExploreButton()).click();
        browsePage.selectEntity('Person');
        browsePage.getSelectedEntity().should('contain', 'Person');
        browsePage.getTotalDocuments().should('be.greaterThan', 14);
        browsePage.getHubPropertiesExpanded();
        browsePage.clickMoreLink('collection');
        browsePage.getFacetItemCheckbox('collection', 'sm-Person-merged').click();
        browsePage.getGreySelectedFacets('sm-Person-merged').should('exist');
        browsePage.getFacetApplyButton().click();
        browsePage.getTotalDocuments().should('be', 2);
        browsePage.getSourceViewIcon().first().click();
        cy.waitForAsyncRequest();
        browsePage.waitForSpinnerToDisappear();
        cy.contains('uri: /com.marklogic.smart-mastering/merged/').should('be.visible');
        cy.contains('123 Bates St').scrollIntoView().should('be.visible');
        cy.contains('456 Bates St').should('be.visible');
    });

});
