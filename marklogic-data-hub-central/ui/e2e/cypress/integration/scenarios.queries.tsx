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

    it('verify manage queries modal', () => {
        browsePage.getManageQueriesIcon().click();
        queryComponent.getManageQueryModal().should('be.visible')
    });



});