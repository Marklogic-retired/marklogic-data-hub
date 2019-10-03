class ViewPage {

    getTotalEntities() {
        return cy.get('[data-cy=total-container] > div:first-child .ant-statistic-content-value-int').then(function(value){
            return parseInt(value.text());
        }); 
    }

    getTotalDocuments() {
        return cy.get('[data-cy=total-container] > div:last-child .ant-statistic-content-value-int').then(function(value){
            return parseInt(value.text().replace(',',''));
        }); 
    }

    expandEntityRow(name:string) {
        return cy.get('.ant-table-tbody tr[data-row-key=' + name + '] .ant-table-row-expand-icon-cell').click();    
    }

    getEntityRow(property:string) {
        return cy.get('tr[data-row-key=' + property + ']');
    }

    getEntityProperty(property:string) {
        return this.getEntityRow('id').find('td').eq(0).invoke('text');
    }

    getEntityDataType(property:string) {
        return this.getEntityRow('id').find('td').eq(1).invoke('text');
    }

    getEntityIndexSettings(property:string) {
        return this.getEntityRow('id').find('td').eq(2).invoke('text');
    }

    getEntity(entity:string) {
        return cy.get('[data-cy=' + entity +  ']');
    }

}

export default ViewPage;