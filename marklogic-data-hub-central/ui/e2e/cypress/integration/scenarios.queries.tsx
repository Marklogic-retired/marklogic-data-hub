/// <reference types="cypress"/>

import LoginPage from '../support/pages/login';
import ViewPage from '../support/pages/view';
import BrowsePage from '../support/pages/browse';
import DetailPage from '../support/pages/detail';
import HomePage from "../support/pages/home";
import QueryComponent from '../support/components/query/manage-queries-modal'
import { exists } from 'fs';

const viewPage = new ViewPage();
const browsePage = new BrowsePage();
const detailPage = new DetailPage();
const homePage = new HomePage();
const queryComponent = new QueryComponent()


describe('save/manage queries scenarios', () => {

    beforeEach(() => {
        cy.visit('/');
        cy.contains('MarkLogic Data Hub');
        cy.loginAsDeveloper();
        cy.wait(500);
        homePage.getBrowseEntities().click();
        cy.wait(1000);
        browsePage.getFacetView();
        browsePage.selectEntity('All Entities');
    });

    it('apply facet search,open save modal and save queries', () => {
        browsePage.selectEntity('Customer');
        browsePage.getSelectedEntity().should('contain', 'Customer');
        cy.wait(500);
        browsePage.getFacetItemCheckbox('firstname', 'Kelley').click();
        browsePage.getFacetItemCheckbox('firstname', 'Lara').click();
        browsePage.getSelectedFacets().should('exist');
        browsePage.getGreySelectedFacets('Kelley').should('exist');
        browsePage.getFacetApplyButton().should('exist');
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
        browsePage.getSaveQueryButton().should('not.be.visible');
        browsePage.getSaveQueriesDropdown().should('be.visible');
    });

    it('open manage queries, edit query', () => {
        browsePage.getManageQueriesIcon().click();
        queryComponent.getManageQueryModal().should('be.visible');
        queryComponent.getEditQuery().click();
        queryComponent.getEditQueryName().type('2');
        queryComponent.getSubmitButton().click();
    });

    it('open manage queries, apply query', () => {
        browsePage.getManageQueriesIcon().click();
        queryComponent.getManageQueryModal().should('be.visible');
        queryComponent.getQueryByName('new-query2').click();
        cy.wait(500);
        browsePage.getSelectedQuery().should('contain', 'new-query2');
    });

    it('open manage queries, delete query', () => {
        browsePage.getManageQueriesIcon().click();
        queryComponent.getManageQueryModal().should('be.visible');
        queryComponent.getDeleteQuery().click();
        queryComponent.getDeleteQueryYesButton().click({force: true})
    });



});