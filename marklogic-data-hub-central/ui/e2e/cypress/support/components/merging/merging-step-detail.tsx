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


}

const mergingStepDetail = new MergingStepDetail();
export default mergingStepDetail;
