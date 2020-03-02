class DetailPage {

    getInstanceView() {
        return cy.get('[data-cy="instance-view"]');
    }

    getSourceView() {
        return cy.get('[data-cy="source-view"]');
    }

    getDocumentEntity() {
        return cy.get('[data-cy=document-title]');
    }

    getDocumentID() {
        return cy.get('[data-cy=document-id]');
    }

    getDocumentTimestamp() {
        return cy.get('[data-cy=document-timestamp]');
    }

    getDocumentSource() {
        return cy.get('[data-cy=document-source]');
    }

    getDocumentFileType() {
        return cy.get('[data-cy=document-filetype]');
    }

    getDocumentTable() {
        return cy.get('[data-cy=document-table]');
    }

    getDocumentJSON() {
        return cy.get('.pretty-json-container');
    }

    getDocumentXML() {
        return cy.get('[data-cy=xml-document]');
    }

}

export default DetailPage;