class LoginPage {

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
