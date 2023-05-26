class RunPage {

  private flowBodyContainer = ".accordion-collapse";

  createFlowButton() {
    return cy.findByText("Create Flow").closest("button");
  }

  toggleExpandFlow(flowName: string) {
    cy.get(`[data-testid="accordion-${flowName}"]`).click({force: true});
  }

  toggleFlowConfig(flowName: string) {
    cy.waitUntil(() => cy.findByText(flowName).closest("div")).click();
    cy.waitUntil(() => cy.contains("Map"));
  }

  getFlowName(flowName: string) {
    return cy.findAllByText(flowName);
  }

  getFlowNameHeader(flowName: string) {
    return cy.get(`#flow-header-${flowName}`);
  }

  getFlowStatusSuccess(flowName: string) {
    return cy.get(`[aria-label=${flowName}-completed]`);
  }

  getStepSuccess(stepName: string) {
    return cy.get(`[data-testid="${stepName}-success"]`);
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

  confirmModalError() {
    return cy.findByLabelText("Ok");
  }

  closeModalNewFlow() {
    return cy.findByLabelText("Close");
  }

  addStep(stepName: string) {
    cy.waitUntil(() => cy.findByLabelText(`addStep-${stepName}`)).click({force: true});
    cy.wait(1000);
  }

  addStepToFlow(stepName: string) {
    cy.findByLabelText(`${stepName}-to-flow`).scrollIntoView().click();
    cy.findByLabelText("Yes").click();
  }

  getAddStepDropdown(stepName: string) {
    return cy.get(`[aria-label="addStep-${stepName}"]`);
  }

  verifyStepInFlow(stepType: string, stepName: string, flowName: string, scroll?: boolean) {
    cy.waitForModalToDisappear();
    cy.wait(1500);
    cy.get(`#${flowName} ${this.flowBodyContainer}`).findAllByText(stepType).first().scrollIntoView().should("exist");
    cy.get(`#${flowName} ${this.flowBodyContainer}`).findAllByText(stepType).first().scrollIntoView().should("be.visible");
    if (scroll) {
      cy.get(`#${flowName} ${this.flowBodyContainer}`).findAllByText(stepName).first().scrollIntoView().should("be.visible");
    } else {
      cy.get(`#${flowName} ${this.flowBodyContainer}`).findAllByText(stepName).first().should("be.visible");
    }
  }

  verifyNoStepsInFlow() {
    cy.get(".show").findByText("There are no steps in this flow. Add a step here to populate and run the flow.").should("be.visible");
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

  getModalCompletedCue(flowName: string) {
    return cy.findByLabelText(`${flowName}-completed`);
  }

  openFlowStatusModal(flowName: string) {
    cy.findByTestId(`${flowName}-StatusIcon`).click();
  }

  closeFlowStatusModal(flowName: string) {
    cy.wait(2000);
    cy.get(`[aria-label=${flowName}-close]`).click({force: true, multiple: true});
  }

  getRunStep(stepName: string, flowName: string) {
    return cy.get(`#${flowName}`).find(`[aria-label="runStep-${stepName}"]`);
  }

  runStep(stepName: string, flowName: string) {
    cy.waitUntil(() => cy.get(`#${flowName}`).find(`[aria-label="runStep-${stepName}"]`)).first().should("be.visible").click({force: true});
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

  explorerLink(stepName: string) {
    return cy.findByTestId(`${stepName}-explorer-link`);
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
    cy.get(`svg[aria-label="stepSettings-${flowName}"]`).parent().click();
  }

  clickSuccessCircleIcon(stepName: string, flowName: string) {
    cy.get(`#${flowName}`).within(() => {
      cy.findByTestId(`check-circle-${stepName}`).scrollIntoView().click();
    });
  }

  getStepToRunCheckBox(stepToRun:string) {
    return cy.get(`#${stepToRun}`);
  }

  getDocumentsWritten(stepName: string) {
    return cy.get(`[aria-label=${stepName}-documents-written]`).then(value => {
      return parseInt(value.first().text().replace(/,/, ""));
    });
  }

  getRunFlowButton(flowName: string) {
    return cy.get(`#runFlow-${flowName}`);
  }

  runFlow(flowName: string) {
    cy.get(`#runFlow-${flowName}`).click({force: true});
  }

  verifyStepRunResult(stepName: string, jobSatus: string) {
    cy.get(`[data-testid="${stepName}-${jobSatus}"]`).scrollIntoView().should("be.visible");
  }

  verifyNoStepRunResult(stepName: string, jobSatus: string) {
    cy.get(`[data-testid="${stepName}-${jobSatus}"]`).should("not.exist");
  }


  verifyDisabledRunButton(stepName: string) {
    cy.findByTestId(`runFlow-${stepName}`).should("be.disabled");
  }

  clickStepInsidePopover(idStep: string) {
    cy.get(idStep).click();
  }

  controlUncheckedStep(idStep: string) {
    cy.get(idStep).should("not.be.checked");
  }

  controlCheckedStep(idStep: string) {
    cy.get(idStep).should("be.checked");
  }

  getStatusModalButton(flowName: string) {
    return cy.get(`[data-testid="${flowName}-flow-status"]`);
  }

  getStepFailureSummary(stepName: string) {
    return cy.get(`[data-testid="${stepName}-error-list"]`);
  }

  toggleFlowAccordion(flowName: string) {
    cy.get(`#${flowName} div[class^="accordion-collapse collapse"]`).then(($ele) => {
      if (!$ele.hasClass("show")) {
        cy.log("**Toggling accordion because it was closed.**");
        runPage.toggleExpandFlow(flowName);
      }
    });
  }

  getSpinner() {
    return cy.get("[data-testid='spinner']");
  }

  getSelectAll() {
    return cy.get("[data-testid='select-all-toggle']");
  }

  getEntityStepCards(flowName: string) {
    return cy.get(`[data-testid="${flowName}-panelContent"]`).children();
  }

  getStepsFromModal() {
    return cy.get(`tbody`).children();
  }

  verifyStepNotPresent(flowName:string, stepName:string) {
    cy.get(`#${flowName}-${stepName}-card`).should("not.exist");
  }

  verifyStepCardOrder(stepNames: string[]) {
    this.getStepsFromModal().each(($el, index) => {
      cy.wrap($el).should("contain.text", stepNames[index]);
    });
  }
}

const runPage = new RunPage();
export default runPage;
