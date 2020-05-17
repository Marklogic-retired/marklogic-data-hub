/// <reference types="cypress"/>

import BrowsePage from '../support/pages/browse';
import HomePage from "../support/pages/home";
import QueryComponent from '../support/components/query/manage-queries-modal'

const browsePage = new BrowsePage();
const homePage = new HomePage();
const queryComponent = new QueryComponent();


describe('save/manage queries scenarios, developer role', () => {

    beforeEach(() => {
        cy.visit('/');
        cy.contains('MarkLogic Data Hub');
        cy.loginAsDeveloper();
        cy.wait(500);
        // temporary change as tile is not working
        homePage.getTitle().click();
        cy.wait(500);
        // temporary change end here
        homePage.getBrowseEntities().click();
        cy.wait(1000);
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
        browsePage.getSelectedQuery().should('contain', 'new-query');
        browsePage.getSelectedQueryDescription().should('contain', 'new-query description');
        browsePage.getSaveQueryButton().should('not.be.visible');
        browsePage.getSaveQueriesDropdown().should('be.visible');
        browsePage.getEditQueryModalIcon().click();
        browsePage.getEditQueryDetailDesc().clear();
        browsePage.getEditQueryDetailDesc().type('new-query description edited');
        browsePage.getEditQueryDetailButton().click();
        browsePage.getSelectedQueryDescription().should('contain', 'new-query description edited');
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
        browsePage.getAppliedFacets('Adams').should('exist');
        cy.reload();
        cy.wait(500);
        // temporary change as tile is not working
        homePage.getTitle().click();
        cy.wait(500);
        // temporary change end here
        homePage.getBrowseEntities().click();
        cy.wait(1000);
        browsePage.getSelectedQuery().should('contain', 'new-query-2');
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
        browsePage.getManageQueriesIcon().click();
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



    it('open manage queries, edit query', () => {
        browsePage.getManageQueriesIcon().click();
        queryComponent.getManageQueryModal().should('be.visible');
        queryComponent.getEditQuery().click();
        queryComponent.getEditQueryName().clear();
        queryComponent.getEditQueryName().type('edited-query');
        queryComponent.getSubmitButton().click();
    });

    it('open manage queries, apply query', () => {
        browsePage.getManageQueriesIcon().click();
        queryComponent.getManageQueryModal().should('be.visible');
        queryComponent.getQueryByName('edited-query').click();
        cy.wait(500);
        browsePage.getSelectedQuery().should('contain', 'edited-query');
    });

    it('open manage queries, delete query', () => {
        browsePage.getManageQueriesIcon().click();
        queryComponent.getManageQueryModal().should('be.visible');
        queryComponent.getDeleteQuery().click();
        queryComponent.getDeleteQueryYesButton().click({force: true});
        browsePage.getManageQueryCloseIcon().click();
        queryComponent.getManageQueryModal().should('not.be.visible');
        browsePage.getSelectedQuery().should('contain', 'select a query');
        browsePage.getSelectedQueryDescription().should('contain', '');
    });

});

