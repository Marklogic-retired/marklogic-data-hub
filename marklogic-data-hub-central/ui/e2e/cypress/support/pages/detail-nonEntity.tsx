class DetailPageNonEntity {

    getInstanceView() {
        return cy.findByTestId('instance-view');
    }

    getRecordView() {
        return cy.findByTestId('record-view');
    }

    getDocumentUri() {
        return cy.findByTestId('non-entity-document-uri');
    }

    getSourceTable() {
        return cy.findByTestId('sources-table');
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

    clickBackButton() {
        return cy.get('#back-button').click({force: true});
    }

    getHistoryTable() {
        return cy.findByTestId('history-table');
    }

}

const detailPageNonEntity = new DetailPageNonEntity();
export default detailPageNonEntity;
