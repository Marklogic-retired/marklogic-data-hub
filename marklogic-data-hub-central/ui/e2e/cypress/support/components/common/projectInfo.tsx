class ProjectInfo {

  getAboutProject() {
    return cy.get("#service-name");
  }

  getDownloadHubCentralFilesButton() {
    return cy.get("[data-testid=downloadHubCentralFiles]");
  }

  getDownloadProjectButton() {
    return cy.get("[data-testid=downloadProjectFiles]");
  }

  getClearButton() {
    return cy.findByLabelText("Clear");
  }

  waitForInfoPageToLoad() {
    cy.waitUntil(() => cy.findByText("Download Hub Central Files").should("be.visible"));
  }
}

const projectInfo = new ProjectInfo();
export default projectInfo;
