import "cypress-wait-until";

class BrowsePage {

  getSelectedEntity() {
    return cy.get("#entity-select").invoke("text");
  }

  getSpinner() {
    return cy.findByTestId("spinner");
  }

  waitForSpinnerToDisappear() {
    cy.waitUntil(() => this.getSpinner().should("have.length", 0));
  }

  waitForTableToLoad() {
    cy.waitUntil(() => this.getTableRows().should("have.length.gt", 0));
  }

  waitForCardToLoad() {
    cy.waitUntil(() => this.getCard().should("have.length.gt", 0));
  }

  selectEntity(entity: string) {
    this.waitForSpinnerToDisappear();
    cy.get("#entity-select").click();
    cy.get(`[data-cy="entity-option-${entity}"]`).click({force: true});
    cy.waitForAsyncRequest();
    this.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
  }

  getTotalDocuments() {
    this.waitForSpinnerToDisappear();
    return cy.get("[data-cy=total-documents]").then(value => {
      return parseInt(value.first().text().replace(/,/, ""));
    });
  }

  clickPaginationItem(index: number) {
    return cy.get(`#top-search-pagination-bar .ant-pagination-item-${index}`).click();
  }

  getSelectedPaginationNumber() {
    return cy.get(`#top-search-pagination-bar .ant-pagination-item-active a`).invoke("text");
  }

  getInstanceViewIcon() {
    return cy.get("[data-cy=instance]");
  }

  getSourceViewIcon() {
    return cy.get("[data-cy=source]");
  }

  getDocuments() {
    return cy.get("#search-results li");
  }

  getDocument(index: number) {
    return cy.get(`[data-cy=document-list-item-${index}]`);
  }

  getDocumentEntityName(index: number) {
    return this.getDocument(index).find("[data-cy=entity-name]").invoke("text");
  }

  getDocumentPKey(index: number) {
    return this.getDocument(index).find("[data-cy=primary-key]").invoke("text");
  }

  getDocumentPKeyValue(index: number) {
    return this.getDocument(index).find("[data-cy=primary-key-value]").invoke("text");
  }

  getDocumentSnippet(index: number) {
    return this.getDocument(index).find("[data-cy=snippet]").invoke("text");
  }

  getDocumentCreatedOn(index: number) {
    return this.getDocument(index).find("[data-cy=created-on]").invoke("text");
  }

  getDocumentSources(index: number) {
    return this.getDocument(index).find("[data-cy=sources]").invoke("text");
  }

  getDocumentRecordType(index: number) {
    return this.getDocument(index).find("[data-cy=record-type]").invoke("text");
  }

  getDocumentById(index: number) {
    return this.getDocument(index).find("[data-cy=instance]");
  }

  getTooltip(tooltip: string) {
    return cy.get(`#${tooltip}-tooltip`);
  }

  /**
   * facet search
   * available facets are 'collection', 'created-on', 'job-id', 'flow', 'step'
   */

  getFacetName(facet: string) {
    return cy.get(".ml-tooltip-container").contains(facet);
  }

  getFacet(facet: string) {
    return cy.get("[data-cy=\"" + facet + "-facet\"]");
  }

  getFacetItems(facet: string) {
    return cy.get("[data-cy=\"" + facet + "-facet-item\"]");
  }

  getFacetItemCheckbox(facet: string, str: string) {
    return cy.findByTestId(`${facet}-${str}-checkbox`);
  }

  getFacetItemCount(facet: string, str: string) {
    return cy.get(`[data-cy="${facet}-${str}-count]`);
  }

  getClearFacetSearchSelection(facet: string) {
    return cy.get("[data-cy=\"clear-" + facet + "\"]");
  }

  clickClearFacetSearchSelection(facet: string) {
    cy.findByTestId(`clear-${facet}`).scrollIntoView();
    cy.findByTestId(`clear-${facet}`).trigger("mousemove").dblclick({force: true});
    this.waitForSpinnerToDisappear();
  }

  getFacetSearchSelectionCount(facet: string) {
    return cy.get("[data-cy=\"" + facet + "-selected-count\"]").invoke("text");
  }

  getClearFacetSelection(facet: string) {
    return cy.get(`[data-cy="${facet}-clear"]`);
  }

  /*applyFacetSearchSelection(facet: string) {
    return cy.get('[data-cy=' + facet + '-facet-apply-button]').click();
  }
  */

  getSelectedFacets() {
    return cy.get("[data-cy=selected-facet-block]");
  }

  computeStartDateOfTheWeek() {
    //The date calculations below is to get the start date of the week(Sun - Sat) that
    //shows up in the date picker and as applied facet
    let curr = new Date;
    let first = ("0" + (curr.getDate() - curr.getDay())).slice(-2);
    let month = ("0" + (curr.getMonth() + 1)).slice(-2);
    return `${curr.getFullYear()}-${month}-${first}`;
  }

  getGreySelectedFacets(facet: string) {
    return cy.get("#selected-facets [data-cy=\"clear-grey-" + facet + "\"]");
  }

  getAppliedFacets(facet: string) {
    return cy.get("#selected-facets [data-cy=\"clear-" + facet + "\"]");
  }

  getAppliedFacetName(facet: string) {
    return cy.findByTestId(`clear-${facet}`).invoke("text");
  }

  getClearGreyFacets() {
    return cy.get("[data-cy=clear-all-grey-button]");
  }

  getDateFacetPicker() {
    return cy.get(".ant-calendar-picker");
  }

  getSelectedFacet(facet: string) {
    return cy.get("#selected-facets > button").contains(facet);
  }

  selectDateRange() {
    this.getDateFacetPicker().click();
    cy.waitUntil(() => cy.get(".ant-calendar-range-part:first-child .ant-calendar-current-week > td:first-child")).click({force: true});
    cy.waitUntil(() => cy.get(".ant-calendar-range-part:first-child .ant-calendar-current-week > td:last-child")).click({force: true});
  }

  getDateFacetClearIcon() {
    return cy.get(".ant-calendar-picker .ant-calendar-picker-clear");
  }

  getDateFacetPickerIcon() {
    return cy.get(".ant-calendar-picker .ant-calendar-picker-icon");
  }

  getFacetApplyButton() {
    return cy.get("svg[data-icon=\"check-square\"]");
  }

  getClearAllFacetsButton() {
    return cy.get("[aria-label=clear-facets-button]", {timeout: 3000});
  }

  getApplyFacetsButton() {
    return cy.get("[aria-label=apply-facets-button]", {timeout: 3000});
  }

  getGreyRangeFacet(lowerBound: number) {
    return cy.get("#selected-facets [data-cy=\"clear-grey-"+ lowerBound +"\"]");
  }

  getRangeFacet(lowerBound: number) {
    return cy.get("#selected-facets [data-cy=\"clear-"+ lowerBound +"\"]");
  }

  clickPopoverSearch(facetName: string) {
    cy.findByTestId(`${facetName}-search-input`).click();
  }

  setInputField(facetName: string, str: string) {
    cy.findByTestId(`${facetName}-popover-input-field`).clear().type(str);
  }

  getPopOverCheckbox(str: string) {
    return cy.findByTestId(`${str}-popover-checkbox`);
  }


  applyDatePickerSelection(facet: string) {
    return cy.get("[data-cy=datepicker-facet-apply-button]").click();
  }

  //search bar
  search(str: string) {
    cy.get("[data-cy=search-bar]").clear().type(str);
    cy.get(".ant-input-search-button").click();
    // this.waitForTableToLoad();
    this.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
  }

  changeNumericSlider(val: string) {
    cy.get("[data-testid=numeric-slider-min]").type("{selectall}").type(val);
  }

  getSearchText() {
    return cy.get("[data-cy=search-bar]");
  }

  getShowMoreLink(facet: string) {
    return cy.findByTestId(`show-more-${facet}`);
  }

  clickMoreLink(facetType: string) {
    cy.findByTestId(`show-more-${facetType}`).click();
  }

  getHubPropertiesExpanded() {
    cy.wait(500);
    cy.get("#hub-properties > div > i").click();
  }

  getExpandableSnippetView() {
    return cy.get(".ant-list-items li:first-child [data-cy = expandable-icon]").click();
  }

  clearFacetSelection(facet: string) {
    cy.get(`[data-cy="${facet}-clear"]`).click();
    this.waitForSpinnerToDisappear();
  }

  //table, facet view
  clickFacetView() {
    this.waitForSpinnerToDisappear();
    this.waitForTableToLoad();
    cy.get("[data-cy=facet-view]").click().trigger("mouseout", {force: true});
  }

  getFacetView() {
    return cy.get("[data-cy=facet-view]");
  }

  getTableView() {
    return cy.get("[data-cy=table-view]");
  }

  clickTableView() {
    this.waitForSpinnerToDisappear();
    this.waitForTableToLoad();
    return cy.get("[data-cy=table-view]").click();
  }

  getSideBarCollapseIcon() {
    return cy.get("#sidebar-collapse-icon");
  }

  //table
  getColumnTitle(index: number) {
    return cy.get(`.ant-table-thead th:nth-child(${index}) .ant-table-column-title`).invoke("text");
  }

  clickColumnTitle(index: number) {
    cy.wait(500);
    return cy.get(`.ant-table-thead th:nth-child(${index}) .ant-table-column-title`).click();
  }

  getSortIndicatorAsc() {
    return cy.get(`.ant-table-column-sorter-up.on`);
  }

  getSortIndicatorDesc() {
    return cy.get(`.ant-table-column-sorter-down.on`);
  }

  getTableRows() {
    return cy.get(".ant-table-row");
  }

  getCard() {
    return cy.get(".card-body");
  }

  getTableViewInstanceIcon() {
    return cy.get(".ant-table-row:last-child [data-cy=instance]");
  }

  getTableViewSourceIcon() {
    return cy.getAttached(".ant-table-row:last-child [data-cy=source]");
  }

  getExpandableTableView() {
    return cy.get(".ant-table-row:nth-child(1) .ant-table-row-expand-icon-cell").click();
  }

  getExpandable() {
    return cy.get(".ant-table-row-expand-icon-cell");
  }

  getTableColumns() {
    return cy.get(".ant-table-header-column");
  }

  getTableCell(rowIndex: number, columnIndex: number) {
    return cy.get(`.ant-table-row:nth-child(${rowIndex}) td:nth-child(${columnIndex}) div`).invoke("text");
  }

  getTableUriCell(rowIndex: number) {
    return cy.get(`.ant-table-row:nth-child(${rowIndex}) td:nth-child(2) div span`).invoke("text");
  }

  getTableTitle(index: number) {
    return cy.get(`.ant-table-thead tr th:nth-child(${index}) .ant-table-column-title`);
  }

  getColumnSelectorIcon() {
    return cy.get("[data-cy=column-selector] > div > svg");
  }

  getColumnSelectorSearch() {
    return cy.get("input[placeholder=Search]");
  }

  selectColumnSelectorProperty(name:string) {
    cy.waitUntil(() => cy.findByTestId("column-selector-popover"));
    cy.get("li[data-testid=node-" + name + "] .ant-tree-checkbox").click({force: true});
  }

  getDataExportIcon() {
    return cy.get("[data-cy=query-export] > div > svg");
  }

  getColumnSelectorApply() {
    return cy.get("[data-testid=column-selector-popover] button").contains("Apply");
  }

  getColumnSelectorCancel() {
    return cy.get("button span").contains("Cancel");
  }

  //popover
  getColumnSelector() {
    return cy.get(".ant-popover-inner");
  }

  getTreeItems() {
    return cy.get(".ant-popover-inner ul > li");
  }

  getTreeItem(index: number) {
    return cy.get(`.ant-popover-inner ul > li:nth-child(${index})`);
  }

  getTreeItemTitle(index: number) {
    return cy.get(`.ant-popover-inner ul > li:nth-child(${index}) span:last-child`);
  }
  getTreeItemChecked(index: number) {
    cy.get(`.ant-popover-inner ul > li:nth-child(${index}) .ant-tree-checkbox`).should("not.have.class", "ant-tree-checkbox-checked") ? cy.get(`.ant-popover-inner ul > li:nth-child(${index}) .ant-tree-checkbox`).click() : "";
  }

  getTreeItemUnchecked(index: number) {
    cy.get(`.ant-popover-inner ul > li:nth-child(${index}) .ant-tree-checkbox`).should("have.class", "ant-tree-checkbox-checked") ? cy.get(`.ant-popover-inner ul > li:nth-child(${index}) .ant-tree-checkbox`).click() : "";
  }

  //Save queries

  getSaveModalIcon() {
    return cy.get("svg[data-icon=\"save\"]");
  }

  getSaveQueryName() {
    return cy.get("#save-query-name");
  }

  getSaveQueryDescription() {
    return cy.get("#save-query-description");
  }

  getSaveQueryButton() {
    return cy.get("#save-query-button");
  }

  getSaveQueryCancelButton() {
    return cy.get("#save-query-cancel-button");
  }

  getSaveQueriesDropdown() {
    return cy.get("#dropdownList");
  }

  getEditQueryModalIcon() {
    return cy.get("svg[data-icon=\"pencil-alt\"]");
  }

  getSaveACopyModalIcon() {
    return cy.get("svg[data-icon=\"copy\"]");
  }

  getEditQueryDetailFormName() {
    return cy.get("#edit-query-detail-name");
  }

  getEditQueryDetailDesc() {
    return cy.get("#edit-query-detail-description");
  }

  getEditQueryDetailButton() {
    return cy.get("#edit-query-detail-button");
  }

  getEditQueryDetailCancelButton() {
    return cy.get("#edit-query-detail-cancel-button");
  }

  getRadioOptionSelected() {
    return cy.get(".ant-modal [type=\"radio\"]").first().check();
  }

  getEditSaveChangesButton() {
    return cy.get("#edit-save-changes-button");
  }

  getEditSaveChangesCancelButton() {
    return cy.get("#edit-save-changes-cancel-button");
  }

  getEditSaveChangesFormName() {
    return cy.get("#save-changes-query-name");
  }

  getDiscardChangesIcon() {
    return cy.get("svg[data-icon=\"undo\"]");
  }

  getDiscardYesButton() {
    return cy.get("#discard-yes-button");
  }

  getDiscardNoButton() {
    return cy.get("#discard-no-button");
  }

  getCloseIcon() {
    return cy.get("svg[data-icon=\"close\"]");
  }

  getManageQueryCloseIcon() {
    return cy.get(".manage-modal-close-icon");
  }

  getResetQueryButton() {
    return cy.get("#reset-changes");
  }

  //temp query icon
  getManageQueriesIcon() {
    return cy.get("[data-testid=manage-queries-modal-icon]");
  }

  getManageQueriesModalOpened() {
    this.getManageQueriesButton().scrollIntoView().click({force: true});
    this.waitForTableToLoad();
  }

  getManageQueriesButton() {
    return cy.get("#manage-queries-button");
  }

  //saved query dropdown
  getSelectedQuery() {
    return this.getSaveQueriesDropdown().invoke("text");
  }

  getErrorMessage() {
    return cy.get(".ant-form-explain");
  }

  selectQuery(query: string) {
    this.getSaveQueriesDropdown().click();
    this.getQueryOption(query).click();
    this.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
  }

  getSelectedQueryDescription() {
    return cy.get("#selected-query-description").invoke("text");
  }

  getQueryOption(query: string) {
    return cy.get(`[data-cy="query-option-${query}"]`);
  }

  // Switching queries confirmation buttons

  getQueryConfirmationCancelClick() {
    return cy.get("#query-confirmation-cancel-button");
  }

  getQueryConfirmationNoClick() {
    return cy.get("#query-confirmation-no-button");
  }

  getQueryConfirmationYesClick() {
    return cy.get("#query-confirmation-yes-button");
  }

  // Switching entities confirmation buttons

  getEntityConfirmationCancelClick() {
    return cy.get("#entity-confirmation-cancel-button");
  }

  getEntityConfirmationNoClick() {
    return cy.get("#entity-confirmation-no-button");
  }

  getEntityConfirmationYesClick() {
    return cy.get("#entity-confirmation-yes-button");
  }

  // Reset Query Confirmation buttons
  getResetConfirmationCancelClick() {
    return cy.get("#reset-confirmation-cancel-button").click();
  }

  getResetConfirmationNoClick() {
    return cy.get("#reset-confirmation-no-button").click();
  }

  getResetConfirmationYesClick() {
    return cy.get("#reset-confirmation-yes-button").click();
  }

  getResetConfirmationYes() {
    return cy.get("#reset-confirmation-yes-button");
  }

  // Zero state Explorer
  getExploreButton() {
    return cy.get("[data-cy=explore]");
  }

  getQuerySelector() {
    return cy.get("#query-selector");
  }

  getQueryByName(query:string) {
    return cy.get(`[data-cy=query-option-${query}]`);
  }

  getFinalDatabaseButton() {
    return cy.findByText("Final");
  }

  getStagingDatabaseButton() {
    return cy.findByText("Staging");
  }

  getDatabaseButton(database: string) {
    return cy.get(`[aria-label='switch-database-${database}']`);
  }

  getTableViewButton() {
    return cy.findByText("Table");
  }

  getSnippetViewButton() {
    return cy.findByText("Snippet");
  }

  //data export modal
  getStructuredDataWarning() {
    return cy.findByTestId("export-warning");
  }

  getStructuredDataCancel() {
    return cy.get(".ant-modal-footer > div > :nth-child(1)");
  }

  //get snippet view result list
  getSnippetViewResult() {
    return cy.get("#snippetViewResult");
  }

  // getSelectedFacet(facet: string) {
  //   return cy.get('#selected-facets > button').contains(facet);
  // }

  //All Data
  getAllDataSnippetByUri(uri: string) {
    return cy.findByTestId(`${uri}-snippet`);
  }

  getNavigationIconForDocument(docUri: string) {
    return cy.findByTestId(`${docUri}-detailViewIcon`);
  }

  clearSearchText() {
    cy.get(".ant-input-clear-icon").click();
  }

  getPaginationPageSizeOptions() {
    return cy.get(".ant-pagination-options .ant-select-selection-selected-value");
  }

  getPageSizeOption(pageSizeOption: string) {
    return cy.findByText(pageSizeOption);
  }

  getDetailInstanceViewIcon(docUri: string) {
    return cy.findByTestId(`${docUri}-detailOnSeparatePage`);
  }

  getIncludeHubArtifactsSwitch() {
    return cy.findByTestId("toggleHubArtifacts");
  }

  getCreatedOnFacet() {
    return cy.get("#date-select");
  }

  getSelectedOptionForCreatedOnFacet() {
    return this.getCreatedOnFacet().invoke("text");
  }

  selectCreatedOnRangeOption(option: string) {
    return cy.findByTestId(`date-select-option-${option}`).click();
  }

  showMoreCollection() {
    cy.findByTestId("show-more-collection").click({force: true});
  }

  backToResults() {
    cy.get(".ant-page-header-back-button").click({force: true});
  }

  sliderMinimum() {
    return cy.findByTestId("numeric-slider-min");
  }
}

const browsePage = new BrowsePage();
export default browsePage;