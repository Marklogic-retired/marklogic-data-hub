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
    cy.waitUntil(() => this.getSpinner().should("have.length", 0));
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

  getTotalDocuments() {
    this.waitForSpinnerToDisappear();
    return cy.get("[data-cy=total-documents]").then(value => {
      return parseInt(value.first().text().replace(/,/, ""));
    });
  }

  getAllDataButton() {
    return cy.get(`[aria-label="switch-datasource-all-data"] ~ label`);
  }
  getEntities() {
    return cy.get(`[aria-label="switch-datasource-entities"] ~ label`);
  }

  viewSelector(view: string) {
    return cy.get(`[aria-label="switch-view-${view}"]`);
  }

  switchView(view: string) {
    return cy.get(`[aria-label="switch-view-${view}"]`).should("be.visible").click({force: true, waitForAnimations: false});
  }

  getGraphVisExploreContainer() {
    return cy.get(`#graphVisExplore`);
  }
  getMainTableContainer() {
    return cy.get(`.resultTableMain`);
  }
  getSnippetContainer() {
    return cy.get(`#snippetViewResult`);
  }

  clickPaginationItem(index: number) {
    return cy.get(`#pagination-item-${index}`).scrollIntoView().click();
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
    return cy.get("#search-results .list-group-item");
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

  getExportIconTooltip() {
    return cy.get(`[id="export-results-tooltip"]`);
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
    cy.findByTestId(`clear-${facet}`).trigger("mousemove").click({force: true});
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
    return cy.get("[data-testid=clear-all-grey-button]");
  }

  getDateFacetPicker(options?: {time?: string}) {
    const pickerTestId = options && options.time ? options.time : "facet-datetime-picker-date";
    return cy.get(`[data-testid="${pickerTestId}"]`);
  }

  getSelectedFacet(facet: string) {
    return cy.get("#selected-facets > button").contains(facet);
  }

  selectDateRange(options?: {time?: string}) {
    this.getDateFacetPicker(options).click();
    cy.waitUntil(() => cy.get(".drp-calendar.left > .calendar-table tr:first-child > td:first-child")).click({force: true});
    cy.waitUntil(() => cy.get(".drp-calendar.left > .calendar-table tr:last-child > td:last-child")).click({force: true});

    if (options && options.time) {
      cy.waitUntil(() => cy.get(".daterangepicker .applyBtn").click());
    }
  }

  getDateFacetClearIcon(options?: {time?: string}) {
    const pickerTestId = options && options.time ? options.time : "facet-datetime-picker-date";
    return cy.get(`[data-testid="${pickerTestId}"] ~ svg[data-testid="datetime-picker-reset"]`);
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
    return cy.get("#selected-facets [data-cy^=\"clear-grey-" + lowerBound + "\"]");
  }

  getRangeFacet(lowerBound: number) {
    return cy.get("#selected-facets [data-cy^=\"clear-" + lowerBound + "\"]");
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
    cy.findByPlaceholderText("Search").scrollIntoView().clear().type(str);
    this.getApplyFacetsButton().click();
    // this.waitForTableToLoad();
    this.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
  }

  changeNumericSlider(val: string) {
    cy.get("[data-testid=numeric-slider-min]").type("{selectall}").type(val);
  }

  getSearchText() {
    return cy.findByPlaceholderText("Search").clear();
  }

  getSearchBar() {
    return cy.findByPlaceholderText("Search");
  }

  getShowMoreLink(facet: string) {
    return cy.findByTestId(`show-more-${facet}`);
  }

  clickMoreLink(facetType: string) {
    cy.findByTestId(`show-more-${facetType}`).click();
  }

  getHubPropertiesExpanded() {
    cy.wait(500);
    cy.get("#hub-properties .accordion-button").click({force: true});
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
    this.waitForHCTableToLoad();
    cy.get("[data-cy=facet-view]").click().trigger("mouseout", {force: true});
  }

  getFacetView() {
    return cy.get("[data-cy=facet-view]");
  }

  getTableView() {
    return cy.get("#tableView");
  }

  getGraphView() {
    return cy.get("[data-cy=graph-view]");
  }

  clickTableView() {
    cy.wait(1500);
    return cy.get("[data-cy=table-view]").click({force: true});
  }
  clickSwitchToTableView() {
    return cy.get("#tableView").click();
  }

  clickGraphView() {
    return this.getGraphView().click();
  }
  clickSnippetView() {
    return this.getSnippetView().click();
  }

  getSideBarCollapseIcon() {
    return cy.get("#sidebar-collapse-icon");
  }

  clickOnBaseEntitiesDropdown() {
    return cy.get("#entitiesSidebar-select-wrapper").should("be.visible").click();
  }

  selectBaseEntity(entity: string) {
    this.clickOnBaseEntitiesDropdown();
    cy.get(`[aria-label='base-option-${entity}']`).scrollIntoView().click();
  }

  removeBaseEntity(entity: string) {
    cy.get(`[aria-label='Remove ${entity}']`).scrollIntoView().click();
  }

  //table
  getColumnTitle(index: number) {
    return cy.get(`.table.table-bordered thead th:nth-child(${index}) .resultsTableHeaderColumn`).invoke("text");

  }

  clickColumnTitle(index: number) {
    cy.wait(500);
    return cy.get(`.table.table-bordered th:nth-child(${index}) .resultsTableHeaderColumn`).click();
  }

  getSortIndicatorAsc() {
    return cy.get(`[aria-label="icon: caret-up"]`);
  }

  getSortIndicatorDesc() {
    return cy.get(`[aria-label="icon: caret-down"]`);
  }

  //TODO: Refactor - is duplicated
  getTableRows() {
    return cy.get(".ant-table-row");
  }

  getHCTableRows() {
    return cy.get(".hc-table_row");
  }


  getTableViewInstanceIcon() {
    return cy.get(".hc-table_row:last-child [data-cy=instance]");
  }

  getTableViewSourceIcon() {
    return cy.getAttached(".hc-table_row:last-child [data-cy=source]");
  }

  getExpandableTableView() {
    return cy.get(".ant-table-row:nth-child(1) .ant-table-row-expand-icon-cell").click();
  }

  getExpandable() {
    return cy.get(`[class^="hc-table_iconIndicator"]`);
  }

  getTableColumns() {
    return cy.get(".resultsTableHeaderColumn");
  }

  getTableCell(rowIndex: number, columnIndex: number) {
    return cy.get(`.hc-table_row:nth-child(${rowIndex}) td:nth-child(${columnIndex}) div`).invoke("text");
  }

  getTableUriCell(rowIndex: number) {
    return cy.get(`.ant-table-row:nth-child(${rowIndex}) td:nth-child(2) div span`).invoke("text");
  }

  getTableTitle(index: number) {
    return cy.get(`.ant-table-thead tr th:nth-child(${index}) .ant-table-column-title`);
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
    return cy.get(".modal-content [type=\"radio\"]").first().check();
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

  //Was replaced the table wich use this method, so we updated selector to use the new one
  getManageQueriesModalOpened() {
    this.getManageQueriesButton().scrollIntoView().click({force: true});
    this.getHCTableRows().should("have.length.gt", 0);
  }

  clickExploreSettingsMenuIcon() {
    cy.wait(1000);
    cy.get("[aria-label=explore-settingsIcon-menu]").should("exist");
    return cy.get("[aria-label=explore-settingsIcon-menu]").click({force: true});
  }

  getManageQueriesButton() {
    return cy.get("[aria-label=manageQueries]");
  }

  getEntityTypeDisplaySettingsButton() {
    return cy.get("[aria-label=entityTypeDisplaySettings]");
  }

  //saved query dropdown
  getSelectedQuery() {
    return this.getSaveQueriesDropdown().invoke("text");
  }

  getErrorMessage() {
    return cy.get("[class*='validationError']");
  }

  selectQuery(query: string) {
    this.getSaveQueriesDropdownInput().scrollIntoView().click({force: true});
    this.getQueryOption(query).click({force: true});
    this.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
  }

  getSelectedQueryDescription() {
    return cy.get("#selected-query-description").invoke("text");
  }

  getQueryOption(query: string) {
    return cy.get(`#query-select-MenuList [data-cy="query-option-${query}"]`);
  }

  // Switching queries confirmation buttons

  getQueryConfirmationNoClick() {
    return cy.get("#query-confirmation-no-button");
  }

  getQueryConfirmationYesClick() {
    return cy.get("#query-confirmation-yes-button");
  }

  getEntityConfirmationNoClick() {
    return cy.get("#entity-confirmation-no-button");
  }

  getEntityConfirmationYesClick() {
    return cy.get("#entity-confirmation-yes-button");
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

  getQueryByName(query: string) {
    return cy.get(`[data-cy=query-option-${query}]`);
  }

  getFinalDatabaseButton() {
    cy.findByText("Final").click();
    // cy.intercept("POST", "/api/entitySearch?database=final").as("entitySearchFinal");
    // cy.wait("@entitySearchFinal");
    //tried intercept + wait on request but didn't work. Leaving comment as reference
    cy.wait(3000);
  }

  getStagingDatabaseButton() {
    cy.findByText("Staging").scrollIntoView().click();
    // cy.intercept("POST", "**/entitySearch?*").as("entitySearchStaging");
    // cy.wait("@entitySearchStaging");
    //tried intercept + wait on request but didn't work. Leaving comment as reference
    cy.wait(6000);
  }

  getDatabaseButton(database: string) {
    return cy.get(`#switch-database-${database}`);
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

  //All Data
  getAllDataSnippetByUri(uri: string) {
    return cy.findByTestId(`${uri}-snippet`);
  }

  getNavigationIconForDocument(docUri: string) {
    return cy.findByTestId(`${docUri}-detailViewIcon`);
  }

  clearSearchText() {
    cy.get("*[class^=\"hc-search_cleanIcon\"]").click();
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
    cy.get("#back-button").click({force: true});
  }

  scrollSideBarTop() {
    return cy.get("#hc-sider-content").scrollTo("top", {ensureScrollable: false});
  }

  scrollSideBarBottom() {
    return cy.get("#hc-sider-content").scrollTo("bottom", {ensureScrollable: false});
  }

  sliderMinimum() {
    return cy.findByTestId("numeric-slider-min");
  }

  getSearchField() {
    return cy.get(`#graph-view-filter-input`);
  }

  getTableViewResults(text:string) {
    return cy.findByTestId(text).should("have.length.gt", 0);
  }


  getTableViewCell(text:string) {
    return cy.findByText(text);
  }

  getSnippetView() {
    return cy.get("#snippetView");
  }

  getGraphSearchSummary() {
    return cy.findByLabelText("graph-view-searchSummary");
  }

  getDetailViewURI(uri:string) {
    return cy.findByLabelText(uri);
  }

  getSnippetViewResults(text:string) {
    return cy.findByLabelText(text);
  }

  getColumnSelectorPopover() {
    return cy.get(`[data-testid="column-selector-popover"]`).scrollIntoView();
  }

  getColumnSelectorColumns() {
    return cy.get(`[aria-label="column-option"]`);
  }

  getColumnSelectorCancelButton() {
    return cy.get(`[data-testId="cancel-column-selector"]`);
  }

  getColumnSelectorApplyButton() {
    return cy.get(`[data-testid="apply-column-selector"]`);
  }

  getTableHeaders() {
    return cy.get(`th[class*="hc-table_header"]`);
  }

  getColumnSelectorCheckboxs() {
    return cy.get(`[class^="rc-tree-checkbox"]`);
  }
}

const browsePage = new BrowsePage();
export default browsePage;
