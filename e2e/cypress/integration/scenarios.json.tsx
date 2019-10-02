/// <reference types="cypress"/>

import LoginPage from '../support/pages/login';

const loginPage = new LoginPage();

describe('json scenario on view entities page', () => {

    //login with valid account
    beforeEach(() => {
        cy.visit('/');
        cy.contains('Sign In');
        cy.fixture('users').then(user => {
            cy.login(user.username, user.password)
                .url()
                .should('include', '/view');
        })
    });

    it('has total entities and documents', () => {

    });

    it('has Person entity with properties and attributes', () => {

    });

    it('navigates to /browse on entity name click', () => {

    });

});

describe('json scenario browse documents page', () => {

    //login with valid account
    beforeEach(() => {
        cy.visit('/');
        cy.contains('Sign In');
        cy.fixture('users').then(user => {
            cy.login(user.username, user.password)
                .url()
                .should('include', '/view');
        })
        cy.visit('/browse');
    });

    it('has Person entity selected', () => {

    });

    it('has total entities and documents', () => {

    });

    it('has total entities and documents', () => {

    });

    it('has total entities and documents', () => {

    });

    it('has total entities and documents', () => {

    });


});
