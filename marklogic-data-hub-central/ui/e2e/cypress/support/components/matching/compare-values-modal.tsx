class CompareValuesModal {
  getTableHeader() {
    return cy.get(".compare-values-model.react-bootstrap-table thead");
  }

  getUnmergeButton() {
    return cy.get(`[aria-label="confirm-unmerge"]`);
  }

  getMergeButton() {
    return cy.get(`[aria-label="confirm-merge"]`);
  }

  getCancelButton() {
    return cy.get(`[aria-label="Cancel"]`);
  }
}

const compareValuesModal = new CompareValuesModal();
export default compareValuesModal;
