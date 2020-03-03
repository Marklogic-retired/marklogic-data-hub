/// <reference types="cypress"/>

import LoginPage from '../support/pages/login';

const loginPage = new LoginPage();

describe('login', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('greets with Sign in', () => {
    cy.contains('Sign In');
  });

  it('has links to privacy statement/policies', () => {
    loginPage.getPrivacyLink()
      .should('have.attr', 'href')
      .and('include', 'https://www.marklogic.com/privacy/');
  });

  it('has link to terms and conditions ', () => {
    loginPage.getTermsLink()
      .should('have.attr', 'href')
      .and('include', 'https://s3-us-west-2.amazonaws.com/marklogic-services-resources/legal/ServiceTerms.pdf');
  });

  it('has forgot password link', () => {
    loginPage.getforgotPasswordLink()
      .should('have.attr', 'href'); //TODO curretly the link is empty
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

  it('navigates to /view on seccessful login', () => {
    cy.fixture('users').then(user => {
      cy.login(user.username, user.password)
      .wait(500)
      .url()
      .should('include', '/view');
    })
  });

});