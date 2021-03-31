class RunPage {

  createFlowButton() {
    return cy.findByText("Create Flow").closest("button");
  }

  toggleFlowConfig(flowName: string) {
    cy.waitUntil(() => cy.findByText(flowName).closest("div")).click();
    cy.waitUntil(() => cy.contains("Map"));
  }

  getFlowName(flowName: string) {
    return cy.findByText(flowName);
  }

  editSave() {
    return cy.findByLabelText("Save");
  }

  editCancel() {
    return cy.findByLabelText("Cancel");
  }

  setFlowName(flowName: string) {
    cy.findByPlaceholderText("Enter name").type(flowName);
  }

  setFlowDescription(flowDesc: string) {
    cy.findByPlaceholderText("Enter description").type(flowDesc);
  }

  newFlowModal() {
    return cy.findByText("New Flow");
  }

  addStep(stepName: string) {
    return cy.findByLabelText(`addStep-${stepName}`).click({force: true});
  }

  addStepToFlow(stepName: string) {
    cy.findByLabelText(`${stepName}-to-flow`).click();
    return cy.findByLabelText("Yes").click();
  }

  verifyStepInFlow(stepType: string, stepName: string) {
    cy.waitForModalToDisappear();
    cy.findByText(stepType).should("be.visible");
    cy.findAllByText(stepName).first().should("be.visible");
  }

  runStep(stepName: string) {
    cy.waitUntil(() => cy.findByLabelText(`runStep-${stepName}`)).click({force: true});
    cy.waitForAsyncRequest();
  }

  runLastStepInAFlow(stepName: string) {
    cy.waitUntil(() => cy.findAllByLabelText(`runStep-${stepName}`)).last().click({force: true});
    cy.waitForAsyncRequest();
  }

  deleteStep(stepName: string) {
    return cy.findByLabelText(`deleteStep-${stepName}`);
  }

  deleteStepDisabled(stepName: string) {
    return cy.findByLabelText(`deleteStepDisabled-${stepName}`);
  }

  deleteFlow(flowName: string) {
    return cy.findByTestId(`deleteFlow-${flowName}`);
  }

  deleteFlowDisabled(flowName: string) {
    return cy.findByLabelText(`deleteFlowDisabled-${flowName}`);
  }

  deleteFlowConfirmationMessage(flowName: string) {
    return cy.get("div").should("contain.text", `Are you sure you want to delete the ${flowName} flow?`);
  }
  deleteStepConfirmationMessage(stepName: string, flowName: string) {
    return cy.get("div").should("contain.text", `Are you sure you want to remove the ${stepName} step from the ${flowName} flow?`);
  }

  explorerLink() {
    return cy.findByTestId("explorer-link");
  }

  expandFlow(flowName: string) {
    return cy.get(`#${flowName}`).click();
  }
}

const runPage = new RunPage();
export default runPage;
