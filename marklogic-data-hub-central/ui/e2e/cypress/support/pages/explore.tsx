class ExplorePage {

  getTitleExplore() {
    return cy.get(`[aria-label="title-explore"]`);
  }

  scrollToBottom() {
    return cy.get(`#browseContainer`).scrollTo("bottom");
  }

  getPaginationPageSizeOptions() {
    return cy.get(`#pageSizeSelect`);
  }
  // Column selector
  getColumnSelectorApplyButton() {
    return cy.get(`[data-testid="apply-column-selector"]`);
  }

  getColumnSelectorPopover() {
    return cy.get(`[data-testid="column-selector-popover"]`);
  }

  getColumnSelectorColumns() {
    return cy.get(`[aria-label="column-option"]`);
  }

  getColumnSelectorCancelButton() {
    return cy.get(`[data-testId="cancel-column-selector"]`);
  }

  getColumnSelectorCheckboxs() {
    return cy.get(`[class^="rc-tree-checkbox"]`);
  }
  // Snippet view
  getSnippetViewResults(text: string) {
    return cy.findByLabelText(text);
  }

  getGraphSearchSummary() {
    return cy.findByLabelText("graph-view-searchSummary");
  }

  getDetailViewURI(uri: string) {
    return cy.findByLabelText(uri);
  }

  getSearchField() {
    return cy.get(`#graph-view-filter-input`);
  }
  scrollSideBarTop() {
    return cy.get("#hc-sider-content").scrollTo("top", {ensureScrollable: false});
  }
  scrollSideBarBottom() {
    return cy.get("#hc-sider-content").scrollTo("bottom", {ensureScrollable: false});
  }
  backToResults() {
    cy.get("#back-button").click({force: true});
  }

  getIncludeHubArtifactsSwitch() {
    return cy.findByTestId("toggleHubArtifacts");
  }
  // Database
  getDatabaseButton(database: string) {
    return cy.get(`#switch-database-${database}`);
  }

  getStagingDatabaseButton() {
    cy.get(`[aria-label="switch-database-staging"] ~ label`).scrollIntoView().click();
    // cy.intercept("POST", "**/entitySearch?*").as("entitySearchStaging");
    // cy.wait("@entitySearchStaging");
    //tried intercept + wait on request but didn't work. Leaving comment as reference
    cy.wait(6000);
  }
  getFinalDatabaseButton() {
    cy.get(`[aria-label="switch-database-final"] ~ label`).scrollIntoView().click();
    // cy.intercept("POST", "/api/entitySearch?database=final").as("entitySearchFinal");
    // cy.wait("@entitySearchFinal");
    //tried intercept + wait on request but didn't work. Leaving comment as reference
    cy.wait(3000);
  }

  getAllDataButton() {
    return cy.get(`[aria-label="switch-datasource-all-data"] ~ label`);
  }
  getEntities() {
    return cy.get(`[aria-label="switch-datasource-entities"] ~ label`);
  }
  getGraphVisExploreContainer() {
    return cy.get(`#graphVisExplore`);
  }
  clickExploreSettingsMenuIcon() {
    cy.wait(1000);
    cy.get("[aria-label=explore-settingsIcon-menu]").should("exist");
    return cy.get("[aria-label=explore-settingsIcon-menu]").click({force: true});
  }
  getColumnHeader(columnName: string) {
    return cy.get(`[data-testid='resultsTableColumn-${columnName}']`);
  }
  getHeaderSortArrow(columnName: string) {
    return this.getColumnHeader(columnName).siblings("[class^=\"hc-table_caretContainer\"]");
  }
  getEntityTypeDisplaySettingsDropdown(text: string) {
    return cy.get("a.dropdown-item").contains(text);
  }
  getIconSelector(entity: string) {
    return cy.get(`#${entity}-icon-picker`);
  }
  getEntityTypeFromTable(entity: string) {
    return cy.get(`[aria-label="${entity}-entityType"]`);
  }
  getIcon(icon: string) {
    return cy.get(`[data-testid="default-${icon}-icon-option"]`);
  }
  getCurrentIcon(currentIcon: string) {
    return cy.get(`[data-testid="default-${currentIcon}-icon-selected"]`);
  }
  getDisplaySettingsEntityColor(entity: string) {
    return cy.get(`[data-testid=${entity}-color]`);
  }
}

export default new ExplorePage();