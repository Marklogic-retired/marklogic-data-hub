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
    return cy.get(`[class*="detail-page-non-entity_sourcesMetadataTable"] table`);
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
    return cy.get(`[class*="detail-page-non-entity_historyMetadataTable"] table`);
  }

  getDocumentQuality() {
    return cy.findByTestId("non-entity-document-quality");
  }

  getDocumentCollections() {
    return cy.get(`[class*="detail-page-non-entity_collectionsTable"] table`);
  }

  getDocumentPermissions() {
    return cy.get(`[class*="detail-page-non-entity_recordPermissionsTable"] table`);
  }

  getDocumentMetadataValues() {
    return cy.get(`[class*="detail-page-non-entity_recordMetadataTable"] table`);
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
