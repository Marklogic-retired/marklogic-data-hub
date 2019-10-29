class BrowsePage {

    getSelectedEntity() {
        return cy.get('.ant-select-selection').invoke('attr', 'data-cy');
    }

    selectEntity(entity: string) {
        cy.get('#entity-select').click();
        return cy.get('[data-cy=entity-option]').each(function (item) {
            if (item.text() === entity) {
                return item.click();
            }
        });
    }

    getTotalDocuments() {
        return cy.get('[data-cy=total-documents]').eq(0).then(function (value) {
            return parseInt(value.text().replace(/,/g, ""));
        });
    }

    getDocuments() {
        return cy.get('[data-cy=document-list-item]');
    }

    getDocument(index: number) {
        return this.getDocuments().eq(index);
    }

    getDocumentEntityName(index: number) {
        return this.getDocument(index).find('[data-cy=entity-name]').invoke('text');
    }

    getDocumentId(index: number) {
        return this.getDocument(index).find('[data-cy=primary-key]').invoke('text');
    }

    getDocumentSnippet(index: number) {
        return this.getDocument(index).find('[data-cy=snipped]').invoke('text');
    }

    getDocumentCreatedOn(index: number) {
        return this.getDocument(index).find('[data-cy=created-on]').invoke('text');
    }

    getDocumentSources(index: number) {
        return this.getDocument(index).find('[data-cy=sources]').invoke('text');
    }

    getDocumentFileType(index: number) {
        return this.getDocument(index).find('[data-cy=file-type]').invoke('text');
    }

    getDocumentById(index: number) {
        return this.getDocument(index).find('[data-cy=primary-key]');
    }


    /**
     * facet search
     * available facets are 'collection', 'created-on', 'job-id', 'flow', 'step'
    */

    getFacet(facet: string) {
        return cy.get('[data-cy=' + facet + '-facet]');
    }

    getFacetItems(facet: string) {
        return cy.get('[data-cy=' + facet + '-facet-item]');
    }

    getFacetItem(facet: string, str: string) {
        return this.getFacetItems(facet).then(($el) => {
            for (let i = 0; i < $el.length; i++) {
                let $element = Cypress.$($el[i]);
                if ($element.find("label > span:last-child").text().trim() === str) {
                    return cy.wrap($element);
                }
            }
        });
    }

    getFacetItemCheckbox(facet: string, str: string) {
        return this.getFacetItem(facet, str).find('[data-cy=' + facet + '-facet-item-checkbox]');
    }

    getFacetValue(facet: string, str: string) {
        return this.getFacetItem(facet, str).find('[data-cy=' + facet + '-facet-item-value]');
    }

    getFacetItemCount(facet: string, str: string) {
        return this.getFacetItem(facet, str).find('[data-cy=' + facet + '-facet-item-count]');
    }

    clearFacetSearchSelection(facet: string) {
        return cy.get('[data-cy=' + facet + '-clear]').click();
    }

    getFacetSearchSelectionCount(facet: string) {
        return cy.get('[data-cy=' + facet + '-selected-count]').invoke('text');
    }

    //search bar
    search(str: string) {
        cy.get('[data-cy=search-bar]').type(str);
        cy.get('.ant-input-search-button').click();
    }

}

export default BrowsePage;