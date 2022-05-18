class MergingStepDetail {

  addStrategyButton() {
    return cy.findByLabelText("add-merge-strategy");
  }

  getDeleteMergeStrategyButton(str: string) {
    return cy.findByTestId(`mergestrategy-${str}`);
  }

  getDeleteStrategyText() {
    return cy.findByLabelText("delete-merge-strategy-text");
  }

  cancelMergeDeleteModalButton() {
    return cy.findByLabelText("delete-merge-modal-discard");
  }

  confirmMergeDeleteModalButton() {
    return cy.findByLabelText("delete-merge-modal-confirm");
  }

  addMergeRuleButton() {
    return cy.findByLabelText("add-merge-rule");
  }

  getDeleteMergeRuleButton(str: string) {
    return cy.findByTestId(`mergerule-${str}`);
  }

  getDeleteMergeRuleText() {
    return cy.findByLabelText("delete-merge-rule-text");
  }

  verifyRowExpanded() {
    return cy.findByText("Priority Order");
  }

  getSortIndicator(colName: string) {
    return cy.get(`[aria-label^="${colName}"] [aria-label="icon: caret-up"]`);
  }

  getSortAscIcon() {
    return cy.get(`[aria-label="icon: caret-up"]`);
  }

  getSortDescIcon() {
    return cy.get(`[aria-label="icon: caret-down"]`);
  }
}

const mergingStepDetail = new MergingStepDetail();
export default mergingStepDetail;
