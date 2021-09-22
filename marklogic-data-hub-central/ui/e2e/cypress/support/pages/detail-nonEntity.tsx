class DetailPageNonEntity {

  getInstanceView() {
    return cy.findByTestId("instance-view");
  }

  getRecordView() {
    return cy.findByTestId("record-view");
  }

  getDocumentUri() {
    return cy.findByTestId("non-entity-document-uri");
  }

  getSourceTable() {
    return cy.findByTestId("sources-table");
  }

  getDocumentRecordType() {
    return cy.get("[data-cy=document-recordtype]");
  }

  getDocumentTable() {
    return cy.get("[data-cy=document-table]");
  }

  clickBackButton() {
    return cy.get("#back-button").click({force: true});
  }

  getHistoryTable() {
    return cy.findByTestId("history-table");
  }

  getDocumentQuality() {
    return cy.findByTestId("non-entity-document-quality");
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

}

const detailPageNonEntity = new DetailPageNonEntity();
export default detailPageNonEntity;
