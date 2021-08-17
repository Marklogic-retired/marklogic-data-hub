class ManageQuery {

  getManageQueryModal() {
    return cy.get("[data-testid=manage-queries-modal]");
  }

  getEditQuery() {
    return cy.get(`[data-testid=edit]`).first();
  }

  getDeleteQuery() {
    cy.get(`[data-testid=delete]`).first().click({force: true});
    cy.waitUntil(() => queryComponent.getDeleteQueryYesButton().should("have.length.gt", 0));
    cy.get(".ant-btn-primary").contains("Yes").click({force: true});
  }

  getEditQueryName() {
    return cy.get(`#name`).first();
  }

  getEditQueryDescription() {
    return cy.get(`#description`).first();
  }

  getSubmitButton() {
    return cy.get("button[type=submit]").first();
  }

  getEditCancelButton() {
    return cy.get("#edit-query-dialog-cancel");
  }

  getQueryByName(query:string) {
    return cy.get(`[data-id=${query}]`).first();
  }

  getDeleteQueryYesButton() {
    return cy.get(".ant-btn-primary").contains("Yes");
  }

  getExportFileButton() {
    return cy.get("[data-icon=file-export]");
  }

  getErrorMessage() {
    return cy.get(".ant-form-explain");
  }

  getEditQueryIconForFirstRow() {
    return cy.get(".ant-table-row:first-child [data-testid=edit]");
  }

  getExportQueryIconForFirstRow() {
    return cy.get(".ant-table-row:first-child [data-testid=export]");
  }

  getDeleteQueryIconForFirstRow() {
    return cy.get(".ant-table-row:first-child [data-testid=delete]");
  }
}

const queryComponent = new ManageQuery();
export default queryComponent;
