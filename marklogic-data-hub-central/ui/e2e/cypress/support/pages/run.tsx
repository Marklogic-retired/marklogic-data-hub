class RunPage {

  private flowBodyContainer = ".accordion-collapse";

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
    cy.waitUntil(() => cy.findByLabelText(`addStep-${stepName}`)).click({force: true});
    cy.wait(1000);
  }

  addStepToFlow(stepName: string) {
    cy.findByLabelText(`${stepName}-to-flow`).scrollIntoView().click();
    cy.findByLabelText("Yes").click();
  }

  verifyStepInFlow(stepType: string, stepName: string, flowName: string) {
    cy.waitForModalToDisappear();
    cy.get(`#${flowName} ${this.flowBodyContainer}`).findByText(stepType).should("be.visible");
    cy.get(`#${flowName} ${this.flowBodyContainer}`).findAllByText(stepName).first().should("be.visible");
  }

  getFlowStatusModal() {
    return cy.get("[data-testid=job-response-modal]");
  }

  verifyFlowModalRunning(flowName: string) {
    cy.findByLabelText(`${flowName}-running`).should("be.visible");
  }

  verifyFlowModalCompleted(flowName: string) {
    cy.findByLabelText(`${flowName}-completed`).should("be.visible");
  }

  openFlowStatusModal(flowName: string) {
    cy.findByTestId(`${flowName}-StatusIcon`).click();
  }

  closeFlowStatusModal() {
    return cy.get("[aria-label=\"icon: close\"]").click();
  }

  runStep(stepName: string, flowName: string) {
    cy.waitUntil(() => cy.get(`#${flowName}`).findByLabelText(`runStep-${stepName}`)).click({force: true});
    cy.waitForAsyncRequest();
  }

  runLastStepInAFlow(stepName: string) {
    cy.waitUntil(() => cy.findAllByLabelText(`runStep-${stepName}`)).last().click({force: true});
    cy.waitForAsyncRequest();
  }

  deleteStep(stepName: string, flowName: string) {
    return cy.get(`#${flowName}`).findByLabelText(`deleteStep-${stepName}`);
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

  moveStepRight(stepName: string) {
    cy.waitUntil(() => cy.findAllByLabelText(`rightArrow-${stepName}`)).last().click({force: true});
    cy.waitForAsyncRequest();
  }

  moveStepLeft(stepName: string) {
    cy.waitUntil(() => cy.findAllByLabelText(`leftArrow-${stepName}`)).last().click({force: true});
    cy.waitForAsyncRequest();
  }

  openStepsSelectDropdown(flowName: string) {
    cy.findByLabelText(`stepSettings-${flowName}`).first().click();
  }

  clickSuccessCircleIcon(stepName: string, flowName: string) {
    cy.get(`#${flowName}`).within(() => {
      cy.findByTestId(`check-circle-${stepName}`).scrollIntoView().click();
    });
  }

  runFlow(flowName :string) {
    cy.findByTestId(`runFlow-${flowName}`).click();
  }
}

const runPage = new RunPage();
export default runPage;
