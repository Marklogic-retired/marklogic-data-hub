import "cypress-wait-until";

class BrowsePage {

  // common spinners
  // Can be moved to a common components
  getSpinner() {
    return cy.findByTestId("spinner");
  }

  // common spinners
  // Can be moved to a common components
  waitForSpinnerToDisappear() {
    cy.waitUntil(() => this.getSpinner().should("have.length", 0, {timeout: 30000}));
    cy.waitForAsyncRequest();
  }

  // Common table
  // can be moved to a tableBase page object
  waitForHCTableToLoad() {
    this.getHCTableRows().should("have.length.gt", 0);
  }

  // common component
  waitForCardToLoad() {
    cy.waitUntil(() => this.getCard().should("have.length.gt", 0));
  }

  // common component
  getCard() {
    return cy.get(".card-body");
  }

  // common
  getTotalDocuments() {
    this.waitForSpinnerToDisappear();
    return cy.get("[data-cy=total-documents]").then(value => {
      return parseInt(value.first().text().replace(/,/, ""));
    });
  }

  totalNumberDocuments(records: string) {
    this.waitForSpinnerToDisappear();
    cy.get(`[class*="Browse_search"] [data-cy=total-documents]`).should("have.text", records, {timeout: 30000});
  }

  //common
  viewSelector(view: string) {
    return cy.get(`[aria-label="switch-view-${view}"]`);
  }

  //common
  switchView(view: string) {
    return cy.get(`[aria-label="switch-view-${view}"]`).scrollIntoView().should("be.visible").click({force: true, waitForAnimations: false});
  }

  // common
  getSnippetContainer() {
    return cy.get(`#snippetViewResult`);
  }

  // common
  clickPaginationItem(index: number) {
    return cy.get(`#pagination-item-${index}`).scrollIntoView().click();
  }

  // common
  getSelectedPaginationNumber() {
    return cy.get(`#top-search-pagination-bar .ant-pagination-item-active a`).invoke("text");
  }

  // common
  getInstanceViewIcon() {
    return cy.get("[data-cy=instance]");
  }

  // common
  getSourceViewIcon() {
    return cy.get("[data-cy=source]");
  }

  // common
  getDocuments() {
    return cy.get("#search-results .list-group-item");
  }

  // common - Get individual document
  getDocument(index: number) {
    return cy.get(`[data-cy=document-list-item-${index}]`);
  }

  // common
  getDocumentEntityName(index: number) {
    return this.getDocument(index).find("[data-cy=entity-name]").invoke("text");
  }

  // common
  getDocumentPKey(index: number) {
    return this.getDocument(index).find("[data-cy=primary-key]").invoke("text");
  }

  // common
  getDocumentPKeyValue(index: number) {
    return this.getDocument(index).find("[data-cy=primary-key-value]").invoke("text");
  }

  // common
  getDocumentSnippet(index: number) {
    return this.getDocument(index).find("[data-cy=snippet]").invoke("text");
  }

  // common
  getDocumentCreatedOn(index: number) {
    return this.getDocument(index).find("[data-cy=created-on]").invoke("text");
  }

  // common
  getDocumentSources(index: number) {
    return this.getDocument(index).find("[data-cy=sources]").invoke("text");
  }

  // common
  getDocumentRecordType(index: number) {
    return this.getDocument(index).find("[data-cy=record-type]").invoke("text");
  }

  // common
  getDocumentById(index: number) {
    return this.getDocument(index).find("[data-cy=instance]");
  }

  // common
  getTooltip(tooltip: string) {
    return cy.get(`#${tooltip}-tooltip`);
  }

  getExportIconTooltip() {
    return cy.get(`[id="export-results-tooltip"]`);
  }
  getPermissionsDeniedTooltip() {
    return cy.get("#missing-permission-tooltip");
  }

  /**
   * facet search
   * available facets are 'collection', 'created-on', 'job-id', 'flow', 'step'
   */

  getCollectionPopover() {
    return cy.get(`[aria-label="Collection-popover-search-label"]`);
  }

  collectionPopoverInput() {
    return cy.get(`[aria-label="Collection-popover-input-field"]`);
  }

  getPopoverFacetCheckbox(facetName: string) {
    return cy.get(`[aria-label="${facetName}-popover-checkbox"]`);
  }

  submitPopoverSearch() {
    return cy.get(`[aria-label="icon: check-square-o"]`).click();
  }
  // common
  getFacet(facet: string) {
    return cy.get("[data-cy=\"" + facet + "-facet\"]");
  }

  // common
  getFacetItems(facet: string) {
    return cy.get("[data-cy=\"" + facet + "-facet-item\"]");
  }

  // common
  getFacetItemCheckbox(facet: string, str: string) {
    return cy.findByTestId(`${facet}-${str}-checkbox`);
  }

  // common
  getClearFacetSearchSelection(facet: string) {
    return cy.get("[data-cy=\"clear-" + facet + "\"]");
  }

  // common
  clickClearFacetSearchSelection(facet: string) {
    cy.findByTestId(`clear-${facet}`).scrollIntoView();
    cy.findByTestId(`clear-${facet}`).trigger("mousemove").click({force: true});
    this.waitForSpinnerToDisappear();
  }

  // common
  getFacetSearchSelectionCount(facet: string) {
    return cy.get("[data-cy=\"" + facet + "-selected-count\"]").invoke("text");
  }

  // common
  getClearFacetSelection(facet: string) {
    return cy.get(`[data-cy="${facet}-clear"]`);
  }

  getSelectedFacets() {
    return cy.get("[data-cy=selected-facet-block]");
  }

  // common
  getGreySelectedFacets(facet: string) {
    return cy.get("#selected-facets [data-cy=\"clear-grey-" + facet + "\"]");
  }

  // common
  getAppliedFacets(facet: string) {
    return cy.get("#selected-facets [data-cy=\"clear-" + facet + "\"]");
  }

  // common
  getAppliedFacetName(facet: string) {
    return cy.findByTestId(`clear-${facet}`).invoke("text");
  }

  // common
  getClearGreyFacets() {
    return cy.get("[data-testid=clear-all-grey-button]");
  }

  // common
  getDateFacetPicker(options?: {time?: string}) {
    const pickerTestId = options && options.time ? options.time : "facet-datetime-picker-date";
    return cy.get(`[data-testid="${pickerTestId}"]`);
  }

  // common
  getSelectedFacet(facet: string) {
    return cy.get("#selected-facets > button").contains(facet);
  }

  // common
  selectDateRange(options?: {time?: string}) {
    this.getDateFacetPicker(options).click();
    cy.waitUntil(() => cy.get(".drp-calendar.left > .calendar-table tr:first-child > td:first-child")).click({force: true});
    cy.waitUntil(() => cy.get(".drp-calendar.left > .calendar-table tr:last-child > td:last-child")).click({force: true});

    if (options && options.time) {
      cy.waitUntil(() => cy.get(".daterangepicker .applyBtn").click());
    }
  }

  // common
  getDateFacetClearIcon(options?: {time?: string}) {
    const pickerTestId = options && options.time ? options.time : "facet-datetime-picker-date";
    return cy.get(`[data-testid="${pickerTestId}"] ~ svg[data-testid="datetime-picker-reset"]`);
  }

  // common
  getFacetApplyButton() {
    return cy.get("svg[data-icon=\"check-square\"]");
  }

  // common
  getClearAllFacetsButton() {
    return cy.get("[aria-label=clear-facets-button]", {timeout: 3000});
  }

  // common
  getApplyFacetsButton() {
    return cy.get("[aria-label=apply-facets-button]", {timeout: 3000});
  }

  // common
  getGreyRangeFacet(lowerBound: number) {
    return cy.get("#selected-facets [data-cy^=\"clear-grey-" + lowerBound + "\"]");
  }

  // common
  getRangeFacet(lowerBound: number) {
    return cy.get("#selected-facets [data-cy^=\"clear-" + lowerBound + "\"]");
  }

  clickPopoverSearch(facetName: string) {
    cy.findByTestId(`${facetName}-search-input`).click();
  }

  setInputField(facetName: string, str: string) {
    cy.get(`[aria-label=${facetName}-popover-input-field]`).clear().type(str, {force: true});
  }

  getPopOverCheckbox(str: string) {
    return cy.get(`[aria-label=${str}-popover-checkbox]`);
  }

  getPopOverLabel(facetName: string) {
    return cy.get(`[aria-label=${facetName}-popover-search-label]`);
  }

  confirmPopoverFacets() {
    cy.get(`[aria-label="icon: check-square-o"]`).click();
  }

  applyDatePickerSelection(facet: string) {
    return cy.get("[data-cy=datepicker-facet-apply-button]").click();
  }


  searchWithMagnifyingGlass() {
    return cy.get(`[data-testid="search-icon"]`);
  }

  //search bar
  search(str: string, withEnter = false, isCopyPaste = false) {
    const searchInput = withEnter ? str + "{enter}" : str;
    cy.findByPlaceholderText("Search").scrollIntoView().clear().type(searchInput);
    if (isCopyPaste) {
      cy.findByPlaceholderText("Search").scrollIntoView().invoke("val", searchInput);
    }
    if (!withEnter) {
      this.searchWithMagnifyingGlass().click();
    }
    // this.waitForTableToLoad();
    this.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    this.searchWithMagnifyingGlass().should("be.disabled");
  }

  // common
  changeNumericSlider(val: string) {
    cy.get("[data-testid=numeric-slider-min]").type("{selectall}").type(val);
  }

  // common
  getSearchText() {
    return cy.findByPlaceholderText("Search").clear();
  }

  // common
  getSearchBar() {
    return cy.findByPlaceholderText("Search");
  }

  // common
  getShowMoreLink(facet: string) {
    return cy.findByTestId(`show-more-${facet}`);
  }

  // common
  clickMoreLink(facetType: string) {
    cy.findByTestId(`show-more-${facetType}`).click({force: true});
  }

  // common
  getHubPropertiesExpanded() {
    cy.wait(1000);
    cy.get("#hub-properties .accordion-button").scrollIntoView().should("be.visible").click({force: true});
  }

  getHubProperties() {
    return cy.get("#hub-properties .accordion-button");
  }

  // common
  //table, facet view
  clickFacetView() {
    this.waitForSpinnerToDisappear();
    this.waitForHCTableToLoad();
    cy.get("[data-cy=facet-view]").click().trigger("mouseout", {force: true});
  }

  // common
  getFacetView() {
    return cy.get("[data-cy=facet-view]");
  }

  // common
  getTableView() {
    return cy.get("#tableView");
  }

  // common
  getGraphView() {
    return cy.get("[data-cy=graph-view]");
  }

  // common
  clickTableView() {
    cy.wait(1500);
    return this.getTableView().click({force: true});
  }

  // common
  clickGraphView() {
    this.getGraphView().click({force: true});
    this.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
  }

  // common
  clickSnippetView() {
    return this.getSnippetView().click({force: true});
  }

  // common
  clickOnBaseEntitiesDropdown() {
    return cy.get("#entitiesSidebar-select-wrapper").should("be.visible").click();
  }

  // common
  selectBaseEntity(entity: string) {
    this.clickOnBaseEntitiesDropdown();
    cy.get(`[aria-label='base-option-${entity}']`).scrollIntoView().click();
  }

  // common
  removeBaseEntity(entity: string) {
    cy.get(`[aria-label='Remove ${entity}']`).scrollIntoView().click({force: true});
  }
  // common
  getSortIndicatorAsc() {
    return cy.get(`[aria-label="icon: caret-up"]`);
  }

  // common
  getSortIndicatorDesc() {
    return cy.get(`[aria-label="icon: caret-down"]`);
  }

  // common
  getHCTableRows() {
    return cy.get(".hc-table_row");
  }

  // common
  getFirstTableViewInstanceIcon() {
    return cy.get(".hc-table_row:first-child [data-cy=instance]");
  }

  // common
  getTableViewInstanceIcon() {
    return cy.get(".hc-table_row:last-child [data-cy=instance]");
  }

  // common
  getTableViewSourceIcon() {
    return cy.getAttached(".hc-table_row:last-child [data-cy=source]");
  }

  // common
  getExpandableTableView() {
    return cy.get(".ant-table-row:nth-child(1) .ant-table-row-expand-icon-cell").click();
  }

  // common
  getExpandable() {
    return cy.get(`[class^="hc-table_iconIndicator"]`);
  }

  getTableCell(rowIndex: number, columnIndex: number) {
    return cy.get(`tbody > :nth-child(${rowIndex}) > :nth-child(${columnIndex})`).invoke("text");
  }

  getColumnSelectorIcon() {
    return cy.get("[data-cy=column-selector] > div svg");
  }

  getColumnSelectorSearch() {
    return cy.get("input[placeholder=Search]");
  }

  selectColumnSelectorProperty(name: string) {
    cy.waitUntil(() => cy.findByTestId("column-selector-popover"));
    cy.get("[data-testid=node-" + name + "] .rc-tree-checkbox").click({force: true});
  }

  getDataExportIcon() {
    return cy.get("[data-cy=\"query-export\"] > div svg");
  }

  getColumnSelectorApply() {
    return cy.get("[data-testid=column-selector-popover] button").contains("Apply");
  }

  getColumnSelectorCancel() {
    return cy.get("button span").contains("Cancel");
  }

  //popover
  getColumnSelector() {
    return cy.get(".popover-body");
  }

  getTreeItems() {
    return cy.get(".popover-body .rc-tree-list-holder-inner > .rc-tree-treenode");
  }

  getTreeItem(index: number) {
    return cy.get(`.popover-body .rc-tree-list-holder-inner > .rc-tree-treenode:nth-child(${index})`);
  }

  getTreeItemTitle(index: number) {
    return cy.get(`.popover-body rc-tree-list-holder-inner > .rc-tree-treenode:nth-child(${index}) span.rc-tree-title`);
  }
  getTreeItemChecked(index: number) {
    cy.get(`.popover-body .rc-tree-list-holder-inner > .rc-tree-treenode:nth-child(${index}) .rc-tree-checkbox`).should("not.have.class", "rc-tree-checkbox-checked") ? cy.get(`.popover-body .rc-tree-list-holder-inner > .rc-tree-treenode:nth-child(${index}) .rc-tree-checkbox`).click() : "";
  }

  getTreeItemUnchecked(index: number) {
    cy.get(`.popover-body .rc-tree-list-holder-inner > .rc-tree-treenode:nth-child(${index}) .rc-tree-checkbox`).should("have.class", "rc-tree-checkbox-checked") ? cy.get(`.popover-body .rc-tree-list-holder-inner > .rc-tree-treenode:nth-child(${index}) .rc-tree-checkbox`).click() : "";
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
    return cy.get("#dropdownList-select-wrapper");
  }

  getSaveQueriesDropdownInput() {
    return cy.get("#dropdownList");
  }

  getEllipsisButton() {
    return cy.get(`[aria-label="ellipsisButton"]`);
  }

  getEditQueryModalIcon() {
    return cy.get("svg[data-icon=\"pencil-alt\"]");
  }

  getSaveACopyModalIcon() {
    return cy.get("svg[data-icon=\"copy\"]");
  }

  // common
  getEditQueryDetailFormName() {
    return cy.get("#edit-query-detail-name");
  }

  // common
  getEditQueryDetailDesc() {
    return cy.get("#edit-query-detail-description");
  }

  // common
  getEditQueryDetailButton() {
    return cy.get("#edit-query-detail-button");
  }

  // common
  getEditQueryDetailCancelButton() {
    return cy.get("#edit-query-detail-cancel-button");
  }

  // common
  getRadioOptionSelected() {
    return cy.get(".modal-content [type=\"radio\"]").first().check();
  }

  // common
  getEditSaveChangesButton() {
    return cy.get("#edit-save-changes-button");
  }

  // common
  getEditSaveChangesCancelButton() {
    return cy.get("#edit-save-changes-cancel-button");
  }

  // common
  getEditSaveChangesFormName() {
    return cy.get("#save-changes-query-name");
  }

  // common
  getDiscardChangesIcon() {
    return cy.get("svg[data-icon=\"undo\"]");
  }

  // common
  getDiscardYesButton() {
    return cy.get("#discard-yes-button");
  }

  // common
  getDiscardNoButton() {
    return cy.get("#discard-no-button");
  }

  // common
  getCloseIcon() {
    return cy.get("svg[data-icon=\"close\"]");
  }

  // common
  getManageQueryCloseIcon() {
    return cy.get(".manage-modal-close-icon");
  }

  // common
  getResetQueryButton() {
    return cy.get("#reset-changes");
  }

  //temp query icon
  getManageQueriesIcon() {
    return cy.get("[data-testid=manage-queries-modal-icon]");
  }

  //Was replaced the table wich use this method, so we updated selector to use the new one
  getManageQueriesModalOpened() {
    this.getManageQueriesButton().scrollIntoView().click({force: true});
    this.getHCTableRows().should("have.length.gt", 0);
  }

  // common
  getManageQueriesButton() {
    return cy.get("[aria-label=manageQueries]");
  }

  // common
  getEntityTypeDisplaySettingsButton() {
    return cy.get("[aria-label=entityTypeDisplaySettings]");
  }

  // common
  //saved query dropdown
  getSelectedQuery() {
    return this.getSaveQueriesDropdown().invoke("text");
  }

  // common
  getErrorMessage() {
    return cy.get("[class*='validationError']");
  }

  // common
  selectQuery(query: string) {
    this.getSaveQueriesDropdownInput().scrollIntoView().click({force: true});
    this.getQueryOption(query).click({force: true});
    this.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
  }

  // common
  getSelectedQueryDescription() {
    return cy.get("#selected-query-description").invoke("text");
  }

  // common
  getQueryOption(query: string) {
    return cy.get(`#query-select-MenuList [data-cy="query-option-${query}"]`);
  }

  /** Switching queries confirmation buttons  */
  // common
  getQueryConfirmationNoClick() {
    return cy.get("#query-confirmation-no-button");
  }

  // common
  getQueryConfirmationYesClick() {
    return cy.get("#query-confirmation-yes-button");
  }

  // common
  getEntityConfirmationNoClick() {
    return cy.get("#entity-confirmation-no-button");
  }

  // common
  getEntityConfirmationYesClick() {
    return cy.get("#entity-confirmation-yes-button");
  }

  // common
  getResetConfirmationNoClick() {
    return cy.get("#reset-confirmation-no-button").click();
  }

  // common
  getResetConfirmationYesClick() {
    return cy.get("#reset-confirmation-yes-button").click();
  }

  // common
  getResetConfirmationYes() {
    return cy.get("#reset-confirmation-yes-button");
  }

  /** Snippet view  */

  getSnippetView() {
    return cy.get("#snippetView");
  }
  //get snippet view result list
  getSnippetViewResult() {
    return cy.get("#snippetViewResult");
  }
  databaseSwitch(database: string) {
    return cy.get(`[aria-label="switch-database-${database}"] ~ label`);
  }

  //All Data
  getAllDataSnippetByUri(uri: string) {
    return cy.findByTestId(`${uri}-snippet`);
  }

  getNavigationIconForDocument(docUri: string) {
    return cy.findByTestId(`${docUri}-detailViewIcon`);
  }

  getDetailInstanceViewIcon(docUri: string) {
    return cy.get(`[data-testid="${docUri}-detailOnSeparatePage"]`);
  }

  // common element
  showMoreCollection() {
    cy.findByTestId("show-more-collection").click({force: true});
  }

  //common element
  getTableViewResults(text:string) {
    return cy.findByTestId(text);
  }

  // common element
  getTableViewCell(text:string) {
    return cy.findByText(text);
  }

  // unmerge icon
  getUnmergeIcon() {
    return cy.get(`[aria-label="unmerge-icon"]`);
  }

  getMergeIcon() {
    return cy.get(`[data-testid="merge-icon"]`);
  }

  //merge icon
  getMergeRowIcon(rowNum: number) {
    return cy.get(`[data-testid="merge-icon${rowNum}"]`);
  }

  getMergeIconDisabled() {
    return cy.get(`[data-testid="disabled-merge-icon0"]`);
  }

  expandItemSnippetView(itemEntityName: string, primaryKeyValue: string) {
    return cy.get(`[aria-label="${itemEntityName + "-" + primaryKeyValue}"]`).should("be.visible").click({force: true});
  }

  getSnippetItem(primaryKeyValue: string) {
    return cy.get(`[aria-label="expandable-view-${primaryKeyValue}"]`);
  }

  expandItemTableView(primaryKeyValue: string) {
    return cy.get(`[data-testid="${primaryKeyValue}-expand-icon"]`).should("be.visible").click({force: true});
  }

  getStagingButton() {
    return cy.findByText("Staging");
  }

  getAllDataButton() {
    return cy.findByText("All Data");
  }

  get firstTableRow() {
    return cy.get("tr.hc-table_row");
  }
}

const browsePage = new BrowsePage();
export default browsePage;
