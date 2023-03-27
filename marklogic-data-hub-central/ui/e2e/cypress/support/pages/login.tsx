class LoginPage {

  getUsername() {
    return cy.get("#username");
  }

  getPassword() {
    return cy.get("#password");
  }

  getLoginButton() {
    return cy.get("#submit");
  }

  postLogin() {
    cy.visit("/tiles");
    cy.location("pathname", {timeout: 10000}).should("include", "/tiles");
    cy.wait(2000);
    //cy.window().its("stompClientConnected").should("exist");
  }

  clickTitle() {
    cy.get(`[class*="Overview_title"]`).contains("Welcome to MarkLogic Data Hub Central").click();
  }
}

const loginPage = new LoginPage();
export default loginPage;
