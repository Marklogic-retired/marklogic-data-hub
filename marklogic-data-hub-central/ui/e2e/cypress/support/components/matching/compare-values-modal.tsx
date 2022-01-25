class CompareValuesModal {
  getTableHeader() {
    return cy.get(".compare-values-model.react-bootstrap-table thead");
  }
}

const compareValuesModal = new CompareValuesModal();
export default compareValuesModal;
