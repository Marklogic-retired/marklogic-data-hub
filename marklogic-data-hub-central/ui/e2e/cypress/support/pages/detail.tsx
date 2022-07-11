class DetailPage {

  getInstanceView() {
    return cy.get(`[data-rr-ui-event-key="instance"]`);
  }

  getSourceView() {
    return cy.get(`[data-rr-ui-event-key="full"]`);
  }

  getMetadataView() {
    return cy.get(`[data-rr-ui-event-key="metadata"]`);
  }

  getRelationshipsView() {
    return cy.get(`[data-rr-ui-event-key="relationships"]`);
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
    return cy.get(".document-table-demo");
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
    return cy.get(`[class^="Detail_collectionsTable"]`);
  }

  getDocumentPermissions() {
    return cy.get(`[class^="Detail_recordPermissionsTable"]`);
  }

  getDocumentMetadataValues() {
    return cy.get(`[class^="Detail_recordMetadataTable"]`);
  }

  getDocumentProperties() {
    return cy.findByTestId("doc-properties-container");
  }

  getDocumentNoPropertiesMessage() {
    return cy.findByTestId("doc-no-properties-message");
  }
  getRelatedEntitiesTitle() {
    return cy.findByTestId("related-entities-title");
  }
  getRelatedConceptsTitle() {
    return cy.findByTestId("related-concepts-title");
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

  getExpandBtn() {
    return cy.get(`[data-testid="expandBtn"]`);
  }

  getRelationItems() {
    return cy.get(`[class^="Detail_entityRelationsItems"]`);
  }

}

const detailPage = new DetailPage();
export default detailPage;
