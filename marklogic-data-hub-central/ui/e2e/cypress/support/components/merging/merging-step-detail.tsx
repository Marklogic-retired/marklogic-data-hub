class MergingStepDetail {

    addStrategyButton() {
        return cy.findByLabelText('add-merge-strategy');
    }

    getDeleteMergeStrategyButton(str: string) {
        return cy.findByTestId(`mergestrategy-${str}`);
    }

    getDeleteStrategyText() {
        return cy.findByLabelText('delete-merge-strategy-text');
    }

    cancelMergeDeleteModalButton() {
        return cy.findByLabelText('delete-merge-modal-discard');
    }

    confirmMergeDeleteModalButton() {
        return cy.findByLabelText('delete-merge-modal-confirm');
    }
}

const mergingStepDetail = new MergingStepDetail();
export default mergingStepDetail;
