class ProjectInfo {

  getAboutProject() {
    return cy.get("#service-name");
  }

  getDownloadButton() {
    return cy.findByLabelText("Download");
  }

  getClearButton() {
    return cy.findByLabelText("Clear");
  }

  waitForInfoPageToLoad() {
    cy.waitUntil(() => cy.findByText("Download Configuration Files").should("be.visible"));
  }
}

const projectInfo = new ProjectInfo();
export default projectInfo;
