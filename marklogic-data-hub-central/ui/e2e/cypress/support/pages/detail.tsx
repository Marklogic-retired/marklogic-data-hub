class DetailPage {

  getInstanceView() {
    return cy.get("[data-cy=\"instance-view\"]");
  }

  getSourceView() {
    return cy.get("[data-cy=\"source-view\"]");
  }

  getDocumentEntity() {
    return cy.get("[data-cy=document-title]");
  }

  getDocumentID() {
    return cy.get("[data-cy=document-id]");
  }

  getDocumentUri() {
    return cy.get("[data-cy=document-uri]");
  }

  getDocumentTimestamp() {
    return cy.get("[data-cy=document-timestamp]");
  }

  getDocumentSource() {
    return cy.get("[data-cy=document-source]");
  }

  getDocumentRecordType() {
    return cy.get("[data-cy=document-recordtype]");
  }

  getDocumentTable() {
    return cy.get("[data-cy=document-table]");
  }

  getDocumentJSON() {
    return cy.findByTestId("json-container");
  }

  getDocumentXML() {
    return cy.findByTestId("xml-container");
  }

  clickBackButton() {
    return cy.get("#back-button").click({force: true});
  }

}

const detailPage = new DetailPage();
export default detailPage;
