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

  navigateToMainPage() {
    cy.intercept("GET", "/api/models/hubCentralConfig").as("lastRequest");
    cy.visit("/tiles");
    for (let i = 0; i < 5; i++) cy.wait("@lastRequest");
  }

  clickTitle() {
    cy.get(`[class*="Overview_title"]`).contains("Welcome to MarkLogic Data Hub Central").click();
  }
}

const loginPage = new LoginPage();
export default loginPage;
