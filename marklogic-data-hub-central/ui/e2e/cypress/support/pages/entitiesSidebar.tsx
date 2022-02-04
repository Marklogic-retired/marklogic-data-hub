class BaseEntitySidebar {
  //Elements
  backToMainSidebar() {
    return cy.findByLabelText("base-entity-icons-list-close");
  }
  getBaseEntity(entity: string) {
    return cy.get(`div[aria-label="base-entities-${entity}"]`);
  }
  getBaseEntityOption(entity: string) {
    return cy.get(`[aria-label="base-option-${entity}"]`);
  }
  removeSelectedBaseEntity() {
    return cy.get(`[class="css-xb97g8"]`).first().click();
  }
  getBaseEntityToolTip() {
    return cy.get("#baseEntityToolTip");
  }
  getEntityTitle(entity: string) {
    return cy.get(`div[aria-label="specif-sidebar-${entity}"]`);
  }
  getEntityIconFromList(entity: string) {
    return cy.get(`div[aria-label="base-entity-icon-${entity}"]`);
  }
  getFacetCheckbox(name: string) {
    return cy.get(`input[data-testid="name-${name}-checkbox"]`);
  }
  getInputSearch() {
    return cy.get("#specif-search-input");
  }
  getDateFacet() {
    return cy.get("[data-testid='facet-date-picker']");
  }

  getDateFacetTitle() {
    return cy.get("[data-testid='facet-date-picker'] > p");
  }


  getBaseEntityDropdown() {
    return cy.get("#entitiesSidebar-select-wrapper");
  }

  openBaseEntityDropdown() {
    return cy.get("#entitiesSidebar-select-wrapper").click("right");
  }

  selectBaseEntityOption(entityName: string) {
    return cy.get(`[aria-label="base-option-${entityName}"]`).click();
  }


  showMoreEntities() {
    return cy.get(`[data-cy="show-more-base-entities"]`);
  }

  getDateFacetPicker(options?: { time?: string }) {
    const pickerTestId = options && options.time ? options.time : "facet-datetime-picker-date";
    return cy.get(`[data-testid="${pickerTestId}"]`);
  }

  selectDateRange(options?: { time?: string }) {
    this.getDateFacetPicker(options).click();
    cy.get(".drp-calendar.left > .calendar-table tr:first-child > td:first-child").click({force: true});
    cy.get(".drp-calendar.left > .calendar-table tr:last-child > td:last-child").click({force: true});
  }
  getMainPanelSearchInput() {
    return cy.get("#graph-view-filter-input");
  }

  getApplyFacetsButton() {
    return cy.get("button[aria-label='apply-facets-button']");
  }

  getClearFacetsButton() {
    return cy.get("button[aria-label='clear-facets-button']");
  }

  getRelatedEntity() {
    return cy.get("[aria-label='related-entity-Person']");
  }

  getRelatedEntityPanel() {
    return cy.get(`[data-testid="related-entity-panel"]`);
  }

  toggleAllDataView() {
    return cy.get(`[aria-label="switch-datasource-all-data"]`).click();
  }

  toggleEntitiesView() {
    return cy.get(`[aria-label="switch-datasource-entities"]`).click();
  }

  verifyCollapsedRelatedEntityPanel() {
    return cy.get(`[class="after-indicator sidebar_disabledTitleCheckbox__PJkN4 accordion-button collapsed"]`);
  }
  //Actions
  openBaseEntityFacets(entity: string) {
    return this.getBaseEntity(entity).click();
  }
  clickFacetCheckbox(name: string) {
    return this.getFacetCheckbox(name).click();
  }
  clickOnApplyFacetsButton() {
    return this.getApplyFacetsButton().click();
  }
  clickOnClearFacetsButton() {
    return this.getClearFacetsButton().click();
  }
  clickOnRelatedEntity(entity: string) {
    return this.getRelatedEntity().click();
  }
}
export default new BaseEntitySidebar();
