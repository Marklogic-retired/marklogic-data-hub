class DetailPage {

  getInstanceView() {
    return cy.get("#instance");
  }

  getSourceView() {
    return cy.get("#full");
  }

  getMetadataView() {
    return cy.get("#metadata");
  }

  getDocumentEntity() {
    return cy.get("[data-cy=document-title]");
  }

  getDocumentID() {
    return cy.get("[data-cy=document-id]");
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

  getDocumentUri() {
    return cy.findByTestId("document-uri");
  }

  getDocumentQuality() {
    return cy.findByTestId("document-quality");
  }

  getDocumentCollections() {
    return cy.findByTestId("collections-table");
  }

  getDocumentPermissions() {
    return cy.findByTestId("record-permissions-table");
  }

  getDocumentMetadataValues() {
    return cy.findByTestId("record-metadata-table");
  }

  getDocumentProperties() {
    return cy.findByTestId("doc-properties-container");
  }

  getDocumentNoPropertiesMessage() {
    return cy.findByTestId("doc-no-properties-message");
  }

  getDocumentXML() {
    return cy.findByTestId("xml-container");
  }

  clickBackButton() {
    return cy.get("#back-button").click({force: true});
  }

  attachmentPresent() {
    return cy.contains("attachments");
  }

}

const detailPage = new DetailPage();
export default detailPage;
