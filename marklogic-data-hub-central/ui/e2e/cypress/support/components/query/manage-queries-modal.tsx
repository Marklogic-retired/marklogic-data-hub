class ManageQuery {

  getManageQueryModal() {
    return cy.get("[data-testid=manage-queries-modal]");
  }

  getEditQuery() {
    return cy.get(`[aria-label=editIcon]`).first();
  }

  getDeleteQuery() {
    cy.get(`[data-icon="trash-alt"]`).first().click({force: true});
    queryComponent.getDeleteQueryYesButton().should("be.visible").click({force: true});
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

  getQueryByName(query: string) {
    return cy.get(`[data-id=${query}]`).first();
  }

  getDeleteQueryYesButton() {
    return cy.get(".btn.btn-primary").contains("Yes");
  }

  getExportFileButton() {
    return cy.get("[data-icon=file-export]");
  }

  getErrorMessageAnt() {
    return cy.get(".ant-form-explain");
  }

  getErrorMessage() {
    return cy.get("[class*='validationError']");
  }

  getEditQueryIconForFirstRow() {
    return cy.get("[aria-label='editIcon']").first();
  }

  getExportQueryIconForFirstRow() {
    return cy.get("[aria-label='exportIcon']").first();
  }

  getDeleteQueryIconForFirstRow() {
    return cy.get("[aria-label='deleteIcon']").first();
  }
}

const queryComponent = new ManageQuery();
export default queryComponent;
