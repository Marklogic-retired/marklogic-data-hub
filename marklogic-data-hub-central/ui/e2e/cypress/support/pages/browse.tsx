import 'cypress-wait-until';

class BrowsePage {

  getSelectedEntity() {
    return cy.get('.ant-select-selection-selected-value').invoke('text')
  }

  getSpinner() {
      return cy.findByTestId('spinner');
  }

  waitForSpinnerToDisappear() {
      cy.waitUntil(() => this.getSpinner().should('not.be.visible'));
  }

  waitForTableToLoad() {
      cy.waitUntil(() => this.getTableRows().should('have.length.gt',0));
  }

  selectEntity(entity: string) {
    this.waitForSpinnerToDisappear();
    cy.get('#entity-select').click();
    cy.get(`[data-cy="entity-option-${entity}"]`).click();
    this.waitForSpinnerToDisappear();
  }

  getTotalDocuments() {
    this.waitForSpinnerToDisappear();
    return cy.get('[data-cy=total-documents]').then( value => {
        return parseInt(value.first().text().replace(/,/, ""));
    });
  }

  getInstanceViewIcon() {
    return cy.get('[data-cy=instance]');
  }

  getSourceViewIcon() {
    return cy.get('[data-cy=source]');
  }

  getDocuments() {
    return cy.get('#search-results li');
  }

  getDocument(index: number) {
    return cy.get(`[data-cy=document-list-item-${index}]`);
  }

  getDocumentEntityName(index: number) {
    return this.getDocument(index).find('[data-cy=entity-name]').invoke('text');
  }

  getDocumentPKey(index: number) {
      return this.getDocument(index).find('[data-cy=primary-key]').invoke('text');
  }

  getDocumentPKeyValue(index: number) {
    return this.getDocument(index).find('[data-cy=primary-key-value]').invoke('text');
  }

  getDocumentSnippet(index: number) {
    return this.getDocument(index).find('[data-cy=snippet]').invoke('text');
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
    return cy.get('[data-cy="' + facet + '-facet"]');
  }

  getFacetItems(facet: string) {
    return cy.get('[data-cy="' + facet + '-facet-item"]');
  }

  getFacetItemCheckbox(facet: string, str: string) {
    return cy.findByTestId(`${facet}-${str}-checkbox`);
  }

  getFacetItemCount(facet: string, str: string) {
    return cy.get(`[data-cy="${facet}-${str}-count]`);
  }

  getClearFacetSearchSelection(facet: string) {
    return cy.get('[data-cy="clear-' + facet + '"]');
  }

  clearFacetSearchSelection(facet: string) {
    cy.get('[data-cy="clear-' + facet + '"]').click();
    this.waitForSpinnerToDisappear();
  }

  getFacetSearchSelectionCount(facet: string) {
    return cy.get('[data-cy="' + facet + '-selected-count"]').invoke('text');
  }

  /*applyFacetSearchSelection(facet: string) {
    return cy.get('[data-cy=' + facet + '-facet-apply-button]').click();
  }
  */

  getSelectedFacets() {
    return cy.get('[data-cy=selected-facet-block]');
  }

  getGreySelectedFacets(facet: string) {
    return cy.get('#selected-facets [data-cy="clear-grey-' + facet + '"]');
  }

  getAppliedFacets(facet: string) {
    return cy.get('#selected-facets [data-cy="clear-' + facet + '"]');
  }

  getClearGreyFacets() {
    return cy.get('[data-cy=clear-all-grey-button]');
  }

  getFacetApplyButton() {
    return cy.get('svg[data-icon="check-square"]')
    //return cy.get('#selected-facets [data-cy=facet-apply-button]');
  }

  getClearAllButton() {
    return cy.get('[data-cy=clear-all-button]');
  }

  applyDatePickerSelection(facet: string) {
    return cy.get('[data-cy=datepicker-facet-apply-button]').click();
  }

  //search bar
  search(str: string) {
    cy.get('[data-cy=search-bar]').type(str);
    cy.get('.ant-input-search-button').click();
    this.waitForTableToLoad();
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
  clickFacetView() {
    this.waitForSpinnerToDisappear();
    this.waitForTableToLoad();
    return cy.get('[data-cy=facet-view]').click();
  }

  clickTableView() {
    this.waitForSpinnerToDisappear();
    this.waitForTableToLoad();
    return cy.get('[data-cy=table-view]').click();
  }

  //table
  getColumnTitle(index: number) {
    return cy.get(`.ant-table-thead th:nth-child(${index}) .ant-table-column-title`).invoke('text');
  }

  getTableRows() {
    return cy.get('.ant-table-row');
  }

  getTableViewInstanceIcon() {
    return cy.get('.ant-table-row:last-child [data-cy=instance]');
  }

  getTableViewSourceIcon() {
    return cy.get('.ant-table-row:last-child [data-cy=source]');
  }

  getExpandableTableView() {
    return cy.get('.ant-table-row:nth-child(1) .ant-table-row-expand-icon-cell').click();
  }

  getExpandable() {
    return cy.get('.ant-table-row-expand-icon-cell');
  }

  getTableColumns() {
    return cy.get('.ant-table-header-column');
  }

  getTableCell(rowIndex: number, columnIndex: number) {
    return cy.get(`.ant-table-row:nth-child(${rowIndex}) td:nth-child(${columnIndex}) div`).invoke('text')
  }

  getTableUriCell(rowIndex: number) {
    return cy.get(`.ant-table-row:nth-child(${rowIndex}) td:nth-child(2) div span`).invoke('text')
  }

  getTableTitle(index: number) {
    return cy.get(`.ant-table-thead tr th:nth-child(${index}) .ant-table-column-title`);
  }

  getColumnSelectorIcon() {
    return cy.get('[data-cy=column-selector] > div > svg');
  }

  getColumnSelectorCancel() {
      return cy.get('button span').contains('Cancel');
  }

  //popover
  getColumnSelector() {
    return cy.get('.ant-popover-inner');
  }

  getTreeItems() {
    return cy.get('.ant-popover-inner ul > li');
  }

  getTreeItem(index: number) {
    return cy.get(`.ant-popover-inner ul > li:nth-child(${index})`);
  }

  getTreeItemTitle(index: number) {
    return cy.get(`.ant-popover-inner ul > li:nth-child(${index}) span:last-child`);
  }
  getTreeItemChecked(index: number) {
    cy.get(`.ant-popover-inner ul > li:nth-child(${index}) .ant-tree-checkbox`).should('not.have.class', 'ant-tree-checkbox-checked') ? cy.get(`.ant-popover-inner ul > li:nth-child(${index}) .ant-tree-checkbox`).click() : '';
  }

  getTreeItemUnchecked(index: number) {
    cy.get(`.ant-popover-inner ul > li:nth-child(${index}) .ant-tree-checkbox`).should('have.class', 'ant-tree-checkbox-checked') ? cy.get(`.ant-popover-inner ul > li:nth-child(${index}) .ant-tree-checkbox`).click() : '';
  }

  //Save queries

  getSaveModalIcon() {
    return cy.get('svg[data-icon="save"]')
  }

  getSaveQueryName() {
    return cy.get('#save-query-name');
  }

  getSaveQueryDescription() {
    return cy.get('#save-query-description');
  }

  getSaveQueryButton() {
    return cy.get('#save-query-button');
  }

  getSaveQueryCancelButton() {
    return cy.get('#save-query-cancel-button');
  }

  getSaveQueriesDropdown() {
    return cy.get('#dropdownList');
  }

  getEditQueryModalIcon() {
    return cy.get('svg[data-icon="pencil-alt"]')
  }

  getSaveACopyModalIcon() {
    return cy.get('svg[data-icon="copy"]')
  }

  getEditQueryDetailFormName() {
    return cy.get('#edit-query-detail-name');
  }

  getEditQueryDetailDesc() {
    return cy.get('#edit-query-detail-description');
  }

  getEditQueryDetailButton() {
    return cy.get('#edit-query-detail-button');
  }

  getEditQueryDetailCancelButton() {
    return cy.get('#edit-query-detail-cancel-button');
  }

  getRadioOptionSelected() {
    return cy.get('[type="radio"]').first().check();
  }

  getEditSaveChangesButton() {
    return cy.get('#edit-save-changes-button');
  }

  getEditSaveChangesCancelButton() {
    return cy.get('#edit-save-changes-cancel-button');
  }

  getEditSaveChangesFormName() {
    return cy.get('#save-changes-query-name');
  }

  getDiscardChangesIcon() {
    return cy.get('svg[data-icon="undo"]')
  }

  getDiscardYesButton() {
    return cy.get('#discard-yes-button');
  }

  getDiscardNoButton() {
    return cy.get('#discard-no-button');
  }

  getCloseIcon() {
    return cy.get('svg[data-icon="close"]');
  }

  getManageQueryCloseIcon() {
    return cy.get('.manage-modal-close-icon');
  }

  getResetQueryButton() {
    return cy.get('#reset-changes')
  }

  //temp query icon
  getManageQueriesIcon() {
    return cy.get('[data-testid=manage-queries-modal-icon]');
  }

  getManageQueriesModalOpened() {
    cy.waitUntil(() => cy.get('.fa-cog')).click();
    cy.waitUntil(() => cy.get('.ant-dropdown-menu-item')).click();
    this.waitForTableToLoad();
  }

  //saved query dropdown
  getSelectedQuery() {
    return this.getSaveQueriesDropdown().invoke('text');
  }

  getErrorMessage() {
    return cy.get('.ant-form-explain');
  }

  selectQuery(query: string) {
    this.getSaveQueriesDropdown().click();
    return cy.get(`[data-cy="query-option-${query}"]`).click();
  }

  getSelectedQueryDescription() {
    return cy.get('#selected-query-description').invoke('text');
  }

  // Switching queries confirmation buttons

  getQueryConfirmationCancelClick() {
    return cy.get('#query-confirmation-cancel-button');
  }

  getQueryConfirmationNoClick() {
    return cy.get('#query-confirmation-no-button');
  }

  getQueryConfirmationYesClick() {
    return cy.get('#query-confirmation-yes-button');
  }

  // Switching entities confirmation buttons

  getEntityConfirmationCancelClick() {
    return cy.get('#entity-confirmation-cancel-button');
  }

  getEntityConfirmationNoClick() {
    return cy.get('#entity-confirmation-no-button');
  }

  getEntityConfirmationYesClick() {
    return cy.get('#entity-confirmation-yes-button');
  }

  // Reset Query Confirmation buttons
  getResetConfirmationCancelClick() {
    return cy.get('#reset-confirmation-cancel-button').click();
  }

  getResetConfirmationNoClick() {
    return cy.get('#reset-confirmation-no-button').click();
  }

  getResetConfirmationYesClick() {
    return cy.get('#reset-confirmation-yes-button').click();
  }

  // Zero state Explorer
  getExploreButton() {
    return cy.get('[data-cy=explore]');
  }

  getQuerySelector() {
    return cy.get('#query-selector');
  }

  getQueryByName(query:string) {
    return cy.get(`[data-cy=query-option-${query}]`);
  }



}

const browsePage = new BrowsePage();
export default browsePage;
