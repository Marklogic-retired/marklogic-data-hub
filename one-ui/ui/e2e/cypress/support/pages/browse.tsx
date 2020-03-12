class BrowsePage {

  /*getSelectedEntity() {
    return cy.get('.ant-select-selection').invoke('attr', 'data-cy');
  }*/

  getSelectedEntity() {
    return cy.get('.ant-select-selection-selected-value').invoke('text')
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

  getInstanceViewIcon(){
    return cy.get('[data-cy=instance]');
  }

  getSourceViewIcon(){
    return cy.get('[data-cy=source]');
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
    return this.getDocument(index).find('[data-cy=instance]');
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

  applyFacetSearchSelection(facet: string) {
    return cy.get('[data-cy=' + facet + '-facet-apply-button]').click();
  }

  applyDatePickerSelection(facet: string) {
    return cy.get('[data-cy=datepicker-facet-apply-button]').click();
  }
  
  getFacetApplyButton() {
    return cy.get('[data-cy=collection-facet-apply-button]');
  }

  //search bar
  search(str: string) {
    cy.get('[data-cy=search-bar]').type(str);
    cy.get('.ant-input-search-button').click();
    cy.wait(500);
  }

  getShowMoreLink() {
    return cy.get('div[data-cy="show-more"][style="display: block;"]');
  }

  getHubPropertiesExpanded() {
    return cy.get("#hub-properties > div > i").click();
  }

  getExpandableSnippetView() {
    return cy.get('.ant-list-items li:first-child [data-cy = expandable-icon]').click();
  }

  //table, facet view
  getFacetView() {
    return cy.get('[data-cy=facet-view]').click();
  }

  getTableView() {
    return cy.get('[data-cy=table-view]').click();
  }

  //table
  getColumnTitle(index:number) {
    return cy.get(`.ant-table-thead th:nth-child(${index}) .ant-table-column-title`).invoke('text');
  }

  getTableRows() {
    return cy.get('.ant-table-row');
  }

  getTableViewInstanceIcon(){
    return cy.get('.ant-table-row:last-child [data-cy=instance]');
  }

  getTableViewSourceIcon(){
    return cy.get('.ant-table-row:last-child [data-cy=source]');
  }

  getExpandableTableView() {
    return cy.get('.ant-table-row:nth-child(1) .ant-table-row-expand-icon-cell').click();
  }

  getExpandable() {
    return cy.get('.ant-table-row-expand-icon-cell');
  }

  getTableColumns(){
    return cy.get('.react-resizable');
  }

  getTableCell(rowIndex:number, columnIndex:number) {
    return cy.get(`.ant-table-row:nth-child(${rowIndex}) td:nth-child(${columnIndex}) div`).invoke('text')
  }

  getTableUriCell(rowIndex:number) {
    return cy.get(`.ant-table-row:nth-child(${rowIndex}) td:nth-child(2) div span`).invoke('text')
  }

  getTableTitle(index:number) {
    return cy.get(`.ant-table-thead tr th:nth-child(${index}) .ant-table-column-title`);
  }

  getColumnSelectorIcon(){
    return cy.get('[data-cy=column-selector] > div > svg');
  }


  //popover
  getColumnSelector(){
    return cy.get('.ant-popover-inner');
  }

  getTreeItems(){
    return cy.get('.ant-popover-inner ul > li');
  }

  getTreeItem(index:number){
    return cy.get(`.ant-popover-inner ul > li:nth-child(${index})`);
  }

  getTreeItemTitle(index:number){
    return cy.get(`.ant-popover-inner ul > li:nth-child(${index}) span:last-child`);
  }
  getTreeItemChecked(index:number){
     cy.get(`.ant-popover-inner ul > li:nth-child(${index}) .ant-tree-checkbox`).should('not.have.class', 'ant-tree-checkbox-checked') ? cy.get(`.ant-popover-inner ul > li:nth-child(${index}) .ant-tree-checkbox`).click() : '';
  }

  getTreeItemUnchecked(index:number){
    cy.get(`.ant-popover-inner ul > li:nth-child(${index}) .ant-tree-checkbox`).should('have.class', 'ant-tree-checkbox-checked') ? cy.get(`.ant-popover-inner ul > li:nth-child(${index}) .ant-tree-checkbox`).click() : '';
  }


}

export default BrowsePage;