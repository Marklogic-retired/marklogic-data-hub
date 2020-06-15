/// <reference types="cypress"/>

import browsePage from '../support/pages/browse';
import queryComponent from '../support/components/query/manage-queries-modal'
import { Application } from '../support/application.config';
import { toolbar } from '../support/components/common/index';


describe('save/manage queries scenarios, developer role', () => {

    beforeEach(() => {
        cy.visit('/');
        cy.contains(Application.title);
        cy.loginAsDeveloper().withRequest();
        toolbar.getExploreToolbarIcon().should('exist');
        toolbar.getExploreToolbarIcon().click();
        browsePage.getExploreButton().should('exist');
        browsePage.getExploreButton().click();
        cy.wait(200);
        browsePage.getFacetView();
        browsePage.selectEntity('All Entities');

    });

    it('apply facet search,open save modal, save new query, edit query details, save a copy of current query', () => {
        browsePage.selectEntity('Customer');
        browsePage.getSelectedEntity().should('contain', 'Customer');
        cy.wait(500);
        browsePage.getFacetItemCheckbox('firstname', 'Kelley').click();
        browsePage.getFacetItemCheckbox('firstname', 'Lara').click();
        browsePage.getSelectedFacets().should('exist');
        browsePage.getGreySelectedFacets('Kelley').should('exist');
        browsePage.getGreySelectedFacets('Lara').should('exist');
        browsePage.getFacetApplyButton().click();
        browsePage.getSaveModalIcon().click();
        cy.wait(500);
        browsePage.getSaveQueryName().should('be.visible');
        browsePage.getSaveQueryName().type('new-query');
        browsePage.getSaveQueryDescription().should('be.visible');
        browsePage.getSaveQueryDescription().type('new-query description');
        browsePage.getSaveQueryButton().click();
        cy.wait(500);
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
        browsePage.getFacetItemCheckbox('lastname', 'Adams').click();
        browsePage.getGreySelectedFacets('Adams').should('exist');
        browsePage.getSaveModalIcon().click();
        browsePage.getRadioOptionSelected();
        browsePage.getEditSaveChangesButton().click();
        browsePage.getSelectedQueryDescription().should('contain', 'new-query-2 description');
    });

    it('save/saveAs/edit more queries with duplicate query name from browse and manage queries view', () => {
        browsePage.selectQuery("new-query-2");
        browsePage.getSelectedQuery().should('contain', 'new-query-2');
        cy.wait(500);
        browsePage.getFacetItemCheckbox('email', 'laraadams@emoltra.com').click();

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
                if($someVal === "new-query-2") {
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
        browsePage.selectEntity('PersonXML');
        browsePage.getSelectedEntity().should('contain', 'PersonXML');
        cy.wait(500);
        browsePage.getFacetItemCheckbox('fname', 'Alex').click();
        browsePage.getSelectedFacets().should('exist');
        browsePage.getGreySelectedFacets('Alex').should('exist');
        browsePage.getFacetApplyButton().click();
        browsePage.getSaveModalIcon().click();
        cy.wait(500);
        browsePage.getSaveQueryName().type('person-query');
        browsePage.getSaveQueryDescription().type('person-query description');
        browsePage.getSaveQueryButton().click();
        cy.wait(500);
        browsePage.getSelectedQuery().should('contain', 'person-query');
        browsePage.getFacetItemCheckbox('lname', 'Hopkins').click();
        browsePage.getGreySelectedFacets('Hopkins').should('exist');
        browsePage.getDiscardChangesIcon().click();
        browsePage.getDiscardYesButton().click();
        browsePage.getAppliedFacets('Alex').should('exist');
        browsePage.getFacetItemCheckbox('lname', 'Hopkins').click();
        browsePage.getGreySelectedFacets('Hopkins').should('exist');
        browsePage.getDiscardChangesIcon().click();
        browsePage.getDiscardNoButton().click();
        browsePage.getGreySelectedFacets('Hopkins').should('exist');
    });


    it('Switching between queries when making changes to saved query', () => {
        // creating query 1 with customer entity
        browsePage.selectEntity('Customer');
        browsePage.getSelectedEntity().should('contain', 'Customer');
        cy.wait(500);
        browsePage.getFacetItemCheckbox('email', 'abbottwalton@emoltra.com').click();
        browsePage.getFacetItemCheckbox('lastname', 'Abbott').click();
        browsePage.getFacetApplyButton().click();
        browsePage.getSaveModalIcon().click();
        cy.wait(500);
        browsePage.getSaveQueryName().type('query-1');
        browsePage.getSaveQueryDescription().type('query-1 description');
        browsePage.getSaveQueryButton().click();
        cy.wait(500);
        browsePage.getSelectedQuery().should('contain', 'query-1');
        browsePage.getSelectedQueryDescription().should('contain', 'query-1 description');
        // creating query 2 using save a copy
        browsePage.getSaveACopyModalIcon().click();
        browsePage.getSaveQueryName().type("query-2");
        browsePage.getSaveQueryButton().click();
        // Making changes to query-2 and switching to query-1
        browsePage.getClearFacetSearchSelection('Abbott').click();
        browsePage.selectQuery("query-1");
        browsePage.getQueryConfirmationCancelClick().click();
        browsePage.selectQuery("query-1");
        browsePage.getQueryConfirmationNoClick().click();
        browsePage.getSelectedQuery().should('contain', 'query-1');
        browsePage.getClearFacetSearchSelection('Abbott').click();
        browsePage.selectQuery("query-2");
        browsePage.getQueryConfirmationYesClick().click();
        browsePage.getEditSaveChangesButton().click();
        browsePage.getSelectedQuery().should('contain', 'query-2');
        browsePage.selectQuery("query-1");
        browsePage.getClearAllButton().should('exist');
    });

    it('Switching between entities when making changes to saved query', () => {
        browsePage.selectQuery("new-query");
        browsePage.getClearFacetSearchSelection('Kelley').click();
        browsePage.selectEntity('Person');
        browsePage.getEntityConfirmationCancelClick().click();
        browsePage.getSelectedQuery().should('contain', 'new-query');
        browsePage.getSelectedEntity().should('contain', 'Customer');
        browsePage.getAppliedFacets('Lara').should('exist');
        browsePage.selectEntity('Person');
        browsePage.getEntityConfirmationNoClick().click();
        browsePage.getSelectedEntity().should('contain', 'Person');
        browsePage.selectEntity('Customer');
        browsePage.getSelectedQuery().should('contain', 'select a query');
        browsePage.selectQuery('new-query');
        browsePage.getAppliedFacets('Lara').should('exist');
        browsePage.getClearFacetSearchSelection('Lara').click();
        browsePage.selectEntity('Person');
        browsePage.getEntityConfirmationYesClick().click();
        browsePage.getEditSaveChangesButton().click();
        browsePage.getSelectedEntity().should('contain', 'Person');
        browsePage.selectEntity('Customer');
        browsePage.selectQuery('new-query');
        browsePage.getAppliedFacets('Kelley').should('exist');
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
        browsePage.getHubPropertiesExpanded();
        browsePage.getFacetItemCheckbox('collection', 'Person').click();
        browsePage.getFacetApplyButton().click();
        browsePage.getSaveModalIcon().should('not.be.visible')
    });

    it('open manage queries, edit query', () => {
        browsePage.getManageQueriesModalOpened();
        queryComponent.getManageQueryModal().should('be.visible');
        queryComponent.getEditQuery().click();
        queryComponent.getEditQueryName().clear();
        queryComponent.getEditQueryName().type('edited-query');
        queryComponent.getSubmitButton().click();
    });

    it('open manage queries, apply query', () => {
        browsePage.getManageQueriesModalOpened();
        queryComponent.getManageQueryModal().should('be.visible');
        queryComponent.getQueryByName('edited-query').click();
        cy.wait(500);
        browsePage.getSelectedQuery().should('contain', 'edited-query');
    });

    it('open manage queries, delete query', () => {
        browsePage.getManageQueriesModalOpened()
        queryComponent.getManageQueryModal().should('be.visible');
        queryComponent.getDeleteQuery().first().click();
        queryComponent.getDeleteQueryYesButton().click({force: true});
        browsePage.getManageQueryCloseIcon().click();
        queryComponent.getManageQueryModal().should('not.be.visible');
        browsePage.getSelectedQuery().should('contain', 'select a query');
        browsePage.getSelectedQueryDescription().should('contain', '');
    });

});

