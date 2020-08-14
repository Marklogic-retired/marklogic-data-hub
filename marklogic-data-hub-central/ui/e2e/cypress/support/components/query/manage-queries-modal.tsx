class ManageQuery {

  getManageQueryModal() {
    return cy.get('[data-testid=manage-queries-modal]');
  }

  getEditQuery() {
    return cy.get(`[data-testid=edit]`).first();
  }

  getDeleteQuery() {
    return cy.get(`[data-testid=delete]`).first();
  }

  getEditQueryName() {
    return cy.get(`#name`).first();
  }

  getEditQueryDescription() {
    return cy.get(`#description`).first();
  }

  getSubmitButton() {
    return cy.get('button[type=submit]').first();
  }

  getEditCancelButton() {
    return cy.get('#edit-query-dialog-cancel');
  }

  getQueryByName(query:string) {
    return cy.get(`[data-id=${query}]`).first();
  }

  getDeleteQueryYesButton() {
    return cy.get('.ant-btn-primary').contains('Yes');
  }

  getExportFileButton() {
    return cy.get('[data-icon=file-export]');
  }

  getErrorMessage() {
    return cy.get('.ant-form-explain');
  }
}

const queryComponent = new ManageQuery();
export default queryComponent;
