class CompareValuesModal {

  getModal() {
    return cy.get(`[aria-label="compare-values-modal"]`);
  }

  getTableHeader() {
    return cy.get(".compare-values-model.react-bootstrap-table thead");
  }

  getUnmergeButton() {
    return cy.get(`[aria-label="confirm-merge-unmerge"]`);
  }

  getMergeButton() {
    return cy.get(`[aria-label="confirm-merge-unmerge"]`);
  }

  getMatchOneCell(propertyValue: string) {
    return cy.get(`[aria-label="${propertyValue}-cell1"]`);
  }

  getMatchTwoCell(propertyValue: string) {
    return cy.get(`[aria-label="${propertyValue}-cell2"]`);
  }
  getCancelButton() {
    return cy.get(`[aria-label="Cancel"]`);
  }

  confirmationYes() {
    return cy.get(`[aria-label="Yes"]`);
  }
}

const compareValuesModal = new CompareValuesModal();
export default compareValuesModal;
