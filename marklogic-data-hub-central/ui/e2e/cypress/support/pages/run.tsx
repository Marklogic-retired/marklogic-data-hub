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
    return cy.findByText(flowName).first();
  }

  isFlowNotVisible(flowName: string) {
    return cy.get(`#${flowName}`).should("not.exist");
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
    cy.wait(1500);
    cy.get(`#${flowName} ${this.flowBodyContainer}`).findAllByText(stepType).first().scrollIntoView().should("exist");
    cy.get(`#${flowName} ${this.flowBodyContainer}`).findAllByText(stepType).first().scrollIntoView().should("be.visible");
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

  closeFlowStatusModal(flowName: string) {
    cy.wait(2000);
    return cy.get(`[aria-label=${flowName}-close]`).click({force: true, multiple: true});
  }

  runStep(stepName: string, flowName: string) {
    cy.waitUntil(() => cy.get(`#${flowName}`).findAllByLabelText(`runStep-${stepName}`)).first().click({force: true});
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
    cy.get(`#runFlow-${flowName}`).click({force: true});
  }

  verifyStepRunResult(stepName: string, jobSatus: string) {
    cy.get(`[data-testid=${stepName}-${jobSatus}`).should("exist");
  }

  verifyDisabledRunButton(stepName: string) {
    cy.findByTestId(`runFlow-${stepName}`).should("be.disabled");
  }
}

const runPage = new RunPage();
export default runPage;
