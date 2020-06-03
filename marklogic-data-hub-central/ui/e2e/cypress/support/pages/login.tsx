class LoginPage {

    getPrivacyLink() {
        return cy.get('[data-cy=privacy]');
    }

    getTermsLink() {
        return cy.get('[data-cy=terms]');
    }

    getforgotPasswordLink() {
        return cy.get('[data-cy=forgot]');    
    }

    getUsername() {
        return cy.get('#username'); 
    }

    getPassword() {
        return cy.get('#password');  
    }

    getLoginButton() {
        return cy.get('#submit'); 
    }
}

const loginPage = new LoginPage();
export default loginPage;
