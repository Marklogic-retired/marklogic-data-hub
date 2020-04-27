/// <reference types="cypress"/>

import LoginPage from '../support/pages/login';

const loginPage = new LoginPage();

describe('login', () => {
  before(() => {
    cy.visit('/');
  });

  it('greets with MarkLogic Data Hub', () => {
    cy.contains('MarkLogic Data Hub');
  });

  it('has links to privacy statement/policies', () => {
      cy.contains('Policies');
  });

  it('has link to terms and conditions ', () => {
    cy.contains('Terms and Conditions');
  });

  xit('has forgot password link', () => {
    loginPage.getforgotPasswordLink()
      .should('have.attr', 'href'); 
  });

  it('requires email', () => {
    //TODO doesn't work 
  });

  it('requires password', () => {
    //TODO doesn't work 
  });

  it('requires valid username and password', () => {
    //TODO doesn't work 
  });

  it('navigates to /home on seccessful login', () => {
    cy.loginAsDeveloper().withRequest()
    .url()
    .should('include', '/tile')
  });

});
