/// <reference types="cypress"/>

import browsePage from '../../support/pages/browse';
import queryComponent from '../../support/components/query/manage-queries-modal'
import { Application } from '../../support/application.config';
import { toolbar } from '../../support/components/common/index';
import 'cypress-wait-until';

describe('save/manage queries scenarios, developer role', () => {

    beforeEach(() => {
        cy.visit('/');
        cy.contains(Application.title);
        cy.loginAsDeveloper().withRequest();
        cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
        cy.waitUntil(() => browsePage.getExploreButton()).click();
        browsePage.waitForSpinnerToDisappear();
        browsePage.waitForTableToLoad();
    });

    it('apply facet search,open save modal, save new query, edit query details, save a copy of current query', () => {
        browsePage.selectEntity('Customer');
        browsePage.getSelectedEntity().should('contain', 'Customer');
        browsePage.getFacetItemCheckbox('name', 'Adams Cole').click();
        browsePage.getSelectedFacets().should('exist');
        browsePage.getGreySelectedFacets('Adams Cole').should('exist');
        browsePage.getFacetApplyButton().click();
        browsePage.getSaveModalIcon().click();
        browsePage.waitForSpinnerToDisappear();
        browsePage.getSaveQueryName().should('be.visible');
        browsePage.getSaveQueryName().type('new-query');
        browsePage.getSaveQueryDescription().should('be.visible');
        browsePage.getSaveQueryDescription().type('new-query description');
        browsePage.getSaveQueryButton().click();
        browsePage.waitForSpinnerToDisappear();
        // Creating a new query
        browsePage.getSelectedQuery().should('contain', 'new-query');
        browsePage.getSelectedQueryDescription().should('contain', 'new-query description');
        browsePage.getSaveQueryButton().should('not.be.visible');
        browsePage.getSaveQueriesDropdown().should('be.visible');
        //Editing a previous query
        browsePage.getEditQueryModalIcon().click();
        browsePage.getEditQueryDetailDesc().clear();
        browsePage.getEditQueryDetailDesc().type('new-query description edited');
        browsePage.getEditQueryDetailButton().click();
        browsePage.getSelectedQueryDescription().should('contain', 'new-query description edited');
        //saving a copy of previous query
        browsePage.getSaveACopyModalIcon().click();
        browsePage.getSaveQueryName().type('new-query-2');
        browsePage.getSaveQueryDescription().type('new-query-2 description');
        browsePage.getSaveQueryButton().click();
        browsePage.getSelectedQuery().should('contain', 'new-query-2');
        browsePage.getFacetItemCheckbox('name', 'loadCustomersJSON').click();
        browsePage.getGreySelectedFacets('loadCustomersJSON').should('exist');
        browsePage.getSaveModalIcon().click();
        browsePage.getRadioOptionSelected();
        browsePage.getEditSaveChangesButton().click();
        browsePage.getSelectedQueryDescription().should('contain', 'new-query-2 description');
    });

    it('save/saveAs/edit more queries with duplicate query name from browse and manage queries view', () => {
        browsePage.selectQuery("new-query-2");
        browsePage.getSelectedQuery().should('contain', 'new-query-2');
        browsePage.waitForSpinnerToDisappear();
        browsePage.getFacetItemCheckbox('email', 'adamscole@nutralab.com').click();
        // clicking on save changes icon
        browsePage.getSaveModalIcon().click();
        browsePage.getEditSaveChangesFormName().invoke('val').should('contain', 'new-query-2');
        browsePage.getEditSaveChangesFormName().clear();
        browsePage.getEditSaveChangesFormName().type("new-query");
        browsePage.getEditSaveChangesButton().click();
        browsePage.getErrorMessage().should('contain', 'You already have a saved query with a name of new-query');
        browsePage.getEditSaveChangesCancelButton().click();
        // checking previous query name is set clicking save modal icon
        browsePage.getSaveModalIcon().click();
        browsePage.getEditSaveChangesFormName().invoke('val').should('contain', 'new-query-2');
        browsePage.getEditSaveChangesCancelButton().click();
        // checking previous query name is set clicking edit modal icon
        browsePage.getEditQueryModalIcon().click();
        browsePage.getEditQueryDetailFormName().invoke('val').should('contain', 'new-query-2');
        browsePage.getEditQueryDetailCancelButton().click();
        // checking previous query name is set clicking save a copy modal icon
        browsePage.getSaveACopyModalIcon().click();
        browsePage.getSaveQueryName().invoke('val').should('be.empty');
        browsePage.getSaveQueryCancelButton().click();

        // clicking on edit changes icon
        browsePage.getEditQueryModalIcon().click();
        browsePage.getEditQueryDetailFormName().invoke('val').should('contain', 'new-query-2');
        browsePage.getEditQueryDetailFormName().clear();
        browsePage.getEditQueryDetailFormName().type("new-query");
        browsePage.getEditQueryDetailButton().click();
        browsePage.getErrorMessage().should('contain', 'You already have a saved query with a name of new-query');
        browsePage.getEditQueryDetailCancelButton().click();
        // checking previous query name is set clicking save modal icon
        browsePage.getSaveModalIcon().click();
        browsePage.getEditSaveChangesFormName().invoke('val').should('contain', 'new-query-2');
        browsePage.getEditSaveChangesCancelButton().click();
        // checking previous query name is set clicking edit modal icon
        browsePage.getEditQueryModalIcon().click();
        browsePage.getEditQueryDetailFormName().invoke('val').should('contain', 'new-query-2');
        browsePage.getEditQueryDetailCancelButton().click();
        // checking previous query name is set clicking save a copy modal icon
        browsePage.getSaveACopyModalIcon().click();
        browsePage.getSaveQueryName().invoke('val').should('be.empty');
        browsePage.getSaveQueryCancelButton().click();

        // clicking on save a copy icon
        browsePage.getSaveACopyModalIcon().click();
        browsePage.getSaveQueryName().clear();
        browsePage.getSaveQueryName().type("new-query");
        browsePage.getSaveQueryButton().click();
        browsePage.getErrorMessage().should('contain', 'You already have a saved query with a name of new-query');
        browsePage.getSaveQueryCancelButton().click();
        // checking previous query name is set clicking save modal icon
        browsePage.getSaveModalIcon().click();
        browsePage.getEditSaveChangesFormName().invoke('val').should('contain', 'new-query-2');
        browsePage.getEditSaveChangesCancelButton().click();
        // checking previous query name is set clicking edit modal icon
        browsePage.getEditQueryModalIcon().click();
        browsePage.getEditQueryDetailFormName().invoke('val').should('contain', 'new-query-2');
        browsePage.getEditQueryDetailCancelButton().click();
        // checking previous query name is set clicking save a copy modal icon
        browsePage.getSaveACopyModalIcon().click();
        browsePage.getSaveQueryName().invoke('val').should('be.empty');
        browsePage.getSaveQueryCancelButton().click();

        // checking manage query
        browsePage.getManageQueriesModalOpened();
        queryComponent.getManageQueryModal().should('be.visible');
        queryComponent.getEditQuery().click();
        queryComponent.getEditQueryName().invoke('text').as('qName');
        queryComponent.getEditQueryName().invoke('val').then(
            ($someVal) => {
                if ($someVal === "new-query-2") {
                    queryComponent.getEditQueryName().clear();
                    queryComponent.getEditQueryName().type('new-query');
                    queryComponent.getSubmitButton().click();
                    queryComponent.getErrorMessage().should('contain', 'You already have a saved query with a name of new-query');
                } else {
                    queryComponent.getEditQueryName().clear();
                    queryComponent.getEditQueryName().type('new-query-2');
                    queryComponent.getSubmitButton().click();
                    queryComponent.getErrorMessage().should('contain', 'You already have a saved query with a name of new-query-2');
                }
            }
        );
        queryComponent.getEditCancelButton().click();
        queryComponent.getManageQueryModal().type('{esc}');
        // checking previous query name is set clicking save modal icon
        browsePage.getSaveModalIcon().click();
        cy.get('@qName').then((qName) => {
            browsePage.getEditSaveChangesFormName().invoke('val').should('contain', qName);
        });
        browsePage.getEditSaveChangesCancelButton().click();
        // checking previous query name is set clicking edit modal icon
        browsePage.getEditQueryModalIcon().first().click();
        cy.get('@qName').then((qName) => {
            browsePage.getEditQueryDetailFormName().invoke('val').should('contain', qName);
        })
        browsePage.getEditQueryDetailCancelButton().click();
        // checking previous query name is set clicking save a copy modal icon
        browsePage.getSaveACopyModalIcon().click();
        browsePage.getSaveQueryName().invoke('val').should('be.empty');
        browsePage.getSaveQueryCancelButton().click();
    });

    it('Edit saved query and verify discard changes functionality', () => {
        browsePage.selectEntity('Person');
        browsePage.getSelectedEntity().should('contain', 'Person');
        browsePage.getFacetItemCheckbox('fname', 'Alexandra').click();
        browsePage.getSelectedFacets().should('exist');
        browsePage.getGreySelectedFacets('Alexandra').should('exist');
        browsePage.getFacetApplyButton().click();
        browsePage.getSaveModalIcon().click();
        browsePage.waitForSpinnerToDisappear();
        browsePage.getSaveQueryName().type('person-query');
        browsePage.getSaveQueryDescription().type('person-query description');
        browsePage.getSaveQueryButton().click();
        browsePage.waitForSpinnerToDisappear();
        browsePage.getSelectedQuery().should('contain', 'person-query');
        browsePage.getFacetItemCheckbox('lname', 'Wilson').click();
        browsePage.getGreySelectedFacets('Wilson').should('exist');
        browsePage.getDiscardChangesIcon().click();
        browsePage.getDiscardYesButton().click();
        browsePage.getAppliedFacets('Alexandra').should('exist');
        browsePage.getFacetItemCheckbox('lname', 'Wilson').click();
        browsePage.getGreySelectedFacets('Wilson').should('exist');
        browsePage.getDiscardChangesIcon().click();
        browsePage.getDiscardNoButton().click();
        browsePage.getGreySelectedFacets('Wilson').should('exist');
    });


    it('Switching between queries when making changes to saved query', () => {
        // creating query 1 with customer entity
        browsePage.selectEntity('Customer');
        browsePage.getSelectedEntity().should('contain', 'Customer');
        browsePage.getShowMoreLink().first().click();
        browsePage.getFacetItemCheckbox('email', 'carmellahardin@nutralab.com').click();
        browsePage.getFacetItemCheckbox('name', 'Carmella Hardin').click();
        browsePage.getFacetApplyButton().click();
        browsePage.getSaveModalIcon().click();
        browsePage.waitForSpinnerToDisappear();
        browsePage.getSaveQueryName().type('query-1');
        browsePage.getSaveQueryDescription().type('query-1 description');
        browsePage.getSaveQueryButton().click();
        browsePage.waitForSpinnerToDisappear();
        browsePage.getSelectedQuery().should('contain', 'query-1');
        browsePage.getSelectedQueryDescription().should('contain', 'query-1 description');
        // creating query 2 using save a copy
        browsePage.getSaveACopyModalIcon().click();
        browsePage.getSaveQueryName().type("query-2");
        browsePage.getSaveQueryButton().click();
        // Making changes to query-2 and switching to query-1
        browsePage.getClearFacetSearchSelection('Carmella Hardin').click();
        browsePage.selectQuery("query-1");
        browsePage.getQueryConfirmationCancelClick().click();
        browsePage.selectQuery("query-1");
        browsePage.getQueryConfirmationNoClick().click();
        browsePage.getSelectedQuery().should('contain', 'query-1');
        browsePage.getClearFacetSearchSelection('Carmella Hardin').click();
        browsePage.selectQuery("query-2");
        browsePage.getQueryConfirmationYesClick().click();
        browsePage.getEditSaveChangesButton().click();
        browsePage.getSelectedQuery().should('contain', 'query-2');
        browsePage.selectQuery("query-1");
        browsePage.getClearAllButton().should('exist');
    });

    it('Switching between entities when making changes to saved query', () => {
        browsePage.selectQuery("new-query");
        browsePage.getClearFacetSearchSelection('Adams Cole').click();
        browsePage.selectEntity('Person');
        browsePage.getEntityConfirmationCancelClick().click();
        browsePage.getSelectedQuery().should('contain', 'new-query');
        browsePage.getSelectedEntity().should('contain', 'Customer');
        browsePage.selectEntity('Person');
        browsePage.getEntityConfirmationNoClick().click();
        browsePage.getSelectedEntity().should('contain', 'Person');
        browsePage.selectEntity('Customer');
        browsePage.getSelectedQuery().should('contain', 'select a query');
        browsePage.selectQuery('new-query');
        browsePage.getFacetItemCheckbox('email', 'adamscole@nutralab.com').click();
        browsePage.selectEntity('Person');
        browsePage.getEntityConfirmationYesClick().click();
        browsePage.getEditSaveChangesButton().click();
        browsePage.getSelectedEntity().should('contain', 'Person');
        browsePage.selectEntity('Customer');
        browsePage.selectQuery('new-query');
        browsePage.getAppliedFacets('Adams Cole').should('exist');
    });

    it('Switching between entities when there are saved queries', () => {
        browsePage.selectEntity('Customer');
        browsePage.selectEntity('Person');
        browsePage.getSaveQueriesDropdown().should('be.visible');
        browsePage.getSelectedQuery().should('contain', 'select a query');
        //Checking if you are in person entity,select a saved query related to customer and shifting back to person
        browsePage.selectQuery('new-query');
        browsePage.getSelectedEntity().should('contain', 'Customer');
        browsePage.selectEntity('Person');
        browsePage.getSelectedEntity().should('contain', 'Person');
    });

    it('Save query button should not show up in all entities view', () => {
        browsePage.selectEntity('All Entities');
        browsePage.getSaveQueriesDropdown().should('be.visible');
        browsePage.getSelectedQuery().should('contain', 'select a query');
        // Should comment below line after DHFPROD-5392 is done
        browsePage.getHubPropertiesExpanded();
        browsePage.getFacetItemCheckbox('collection', 'Person').click();
        browsePage.getFacetApplyButton().click();
        browsePage.getSaveModalIcon().should('not.be.visible')
    });

    // Reset query confirmation
    it('Show Reset query button, open reset confirmation', () => {
        // Clicking on reset after selected facets are applied, saves new query and navigates to zero state
        browsePage.selectEntity('Customer');
        browsePage.getSelectedEntity().should('contain', 'Customer');
        browsePage.getSaveQueriesDropdown().should('be.visible');
        browsePage.getSelectedQuery().should('contain', 'select a query');
        browsePage.getFacetItemCheckbox('name', 'Adams Cole').click();
        browsePage.getSelectedFacets().should('exist');
        browsePage.getFacetApplyButton().click();
        browsePage.waitForSpinnerToDisappear();
        browsePage.getResetQueryButton().click();
        //selecting cancel will be in the same state as before
        browsePage.getResetConfirmationCancelClick();
        browsePage.getSelectedQuery().should('contain', 'select a query');
        browsePage.getResetQueryButton().click();
        // clicking on no doesn't create a new query and navigates to zero state
        browsePage.getResetConfirmationNoClick();
        browsePage.getExploreButton().should('be.visible');
        browsePage.getExploreButton().click();
        browsePage.selectEntity('Customer');
        browsePage.getFacetItemCheckbox('name', 'Adams Cole').click();
        browsePage.getSelectedFacets().should('exist');
        browsePage.getFacetApplyButton().click();
        browsePage.waitForSpinnerToDisappear();
        browsePage.getResetQueryButton().click();
        //selecting yes will save the new query and navigates to zero state
        browsePage.getResetConfirmationYesClick();
        browsePage.getSaveQueryName().should('be.visible');
        browsePage.getSaveQueryName().type('reset-query');
        browsePage.getSaveQueryButton().click();
        //verify created query on zero state page
        browsePage.getQuerySelector().click();
        browsePage.getQueryByName('reset-query').should('be.visible')
        browsePage.getQuerySelector().click();
        browsePage.getExploreButton().should('be.visible')
        browsePage.getExploreButton().click();
        browsePage.selectEntity('Customer');
        browsePage.selectQuery('reset-query');
        browsePage.getAppliedFacets('Adams Cole').should('exist');
    });

    it('Show Reset query button, clicking reset confirmation when making changes to saved query', () => {
        // Select saved query, make changes, click on reset opens a confirmation
        browsePage.selectEntity('Customer');
        browsePage.getSelectedEntity().should('contain', 'Customer');
        browsePage.getSaveQueriesDropdown().should('be.visible');
        browsePage.getSelectedQuery().should('contain', 'select a query');
        browsePage.getSaveQueriesDropdown().should('be.visible');
        browsePage.selectQuery('reset-query');
        browsePage.getSelectedQuery().should('contain', 'reset-query');
        browsePage.getFacetItemCheckbox('email', 'adamscole@nutralab.com').click();
        browsePage.getResetQueryButton().click();
        //selecting cancel will be in the same state as before
        browsePage.getResetConfirmationCancelClick();
        browsePage.getSelectedQuery().should('contain', 'reset-query');
        // clicking on no doesn't update query and navigates to zero state
        browsePage.getResetQueryButton().click();
        browsePage.getResetConfirmationNoClick();
        browsePage.getExploreButton().should('be.visible');
        browsePage.getExploreButton().click();
        //selecting yes will update the query and navigates to zero state
        browsePage.selectEntity('Customer');
        browsePage.selectQuery('reset-query');
        browsePage.getFacetItemCheckbox('email', 'adamscole@nutralab.com').click();
        browsePage.getResetQueryButton().click();
        browsePage.getResetConfirmationYesClick();
        browsePage.getRadioOptionSelected();
        browsePage.getEditSaveChangesButton().click();
        browsePage.getExploreButton().should('be.visible');
        browsePage.getExploreButton().click();
        browsePage.selectEntity('Customer');
        browsePage.selectQuery('reset-query');
        browsePage.getAppliedFacets('adamscole@nutralab.com').should('exist');
    });

    it('Show Reset query button, clicking reset icon navigates to zero state', () => {
        // Select saved query, make changes, click on reset opens a confirmation
        browsePage.selectEntity('Customer');
        browsePage.getSelectedEntity().should('contain', 'Customer');
        browsePage.getSaveQueriesDropdown().should('be.visible');
        browsePage.selectQuery('reset-query');
        browsePage.getResetQueryButton().click();
        browsePage.getExploreButton().should('be.visible');
        browsePage.getExploreButton().click();
    })

});


describe('manage queries modal scenarios, developer role', () => {

    beforeEach(() => {
        cy.visit('/');
        cy.contains(Application.title);
        cy.loginAsDeveloper().withRequest();
        cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
        cy.waitUntil(() => browsePage.getExploreButton()).click();
        browsePage.waitForSpinnerToDisappear();
        browsePage.waitForTableToLoad();
    });

    it('manage queries, edit, apply, delete query', () => {
        //edit query
        browsePage.getManageQueriesModalOpened();
        queryComponent.getManageQueryModal().should('be.visible');
        queryComponent.getEditQuery().click();
        queryComponent.getEditQueryName().clear();
        queryComponent.getEditQueryName().type('edited-query');
        queryComponent.getSubmitButton().click();
        //apply query
        queryComponent.getQueryByName('edited-query').click();
        browsePage.waitForSpinnerToDisappear();
        browsePage.getSelectedQuery().should('contain', 'edited-query');
        //remove query
        browsePage.getManageQueriesModalOpened()
        queryComponent.getManageQueryModal().should('be.visible');
        queryComponent.getDeleteQuery().first().click();
        queryComponent.getDeleteQueryYesButton().click({ force: true });
        browsePage.getManageQueryCloseIcon().click();
        queryComponent.getManageQueryModal().should('not.be.visible');
        browsePage.getSelectedQuery().should('contain', 'select a query');
        browsePage.getSelectedQueryDescription().should('contain', '');
    });
});


describe('manage queries modal scenarios on zero sate page, developer role', () => {

    beforeEach(() => {
        cy.visit('/');
        cy.contains(Application.title);
        cy.loginAsDeveloper().withRequest();
        cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    });

    after(() => {
        //clearing all the saved queries
        cy.deleteSavedQueries();
    })

    it('manage queries, edit, apply, delete query', () => {
        //edit query
        browsePage.getManageQueriesModalOpened();
        queryComponent.getManageQueryModal().should('be.visible');
        queryComponent.getEditQuery().click();
        queryComponent.getEditQueryName().clear();
        queryComponent.getEditQueryName().type('edited-query');
        queryComponent.getSubmitButton().click();
        //apply query
        queryComponent.getQueryByName('edited-query').click();
        browsePage.waitForSpinnerToDisappear();
        browsePage.getSelectedQuery().should('contain', 'edited-query');
        //remove query
        browsePage.getResetQueryButton().click();
        browsePage.getExploreButton().should('be.visible');
        browsePage.getManageQueriesModalOpened()
        queryComponent.getManageQueryModal().should('be.visible');
        queryComponent.getDeleteQuery().first().click();
        queryComponent.getDeleteQueryYesButton().click({ force: true });
        browsePage.getManageQueryCloseIcon().click();
        queryComponent.getManageQueryModal().should('not.be.visible');
    });
});
