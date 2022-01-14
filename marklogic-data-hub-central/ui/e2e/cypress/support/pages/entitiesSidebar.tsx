class BaseEntitySidebar {
  //Elements
  get backToMainSidebarButton() {
    return cy.get(`[aria-label="base-entity-icons-list-close"]`);
  }
  getBaseEntity(entity: string) {
    return cy.get(`div[aria-label="base-entities-${entity}"]`);
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

  getDateFacetPicker(options?: { time?: string }) {
    const pickerTestId = options && options.time ? options.time : "facet-datetime-picker-date";
    return cy.get(`[data-testid="${pickerTestId}"]`);
  }

  selectDateRange(options?: { time?: string }) {
    this.getDateFacetPicker(options).click();
    cy.get(".drp-calendar.left > .calendar-table tr:first-child > td:first-child").click({force: true});
    cy.get(".drp-calendar.left > .calendar-table tr:last-child > td:last-child").click({force: true});
  }

  //Actions
  clickOnBaseEntity(entity: string) {
    return this.getBaseEntity(entity).click();
  }
  clickFacetCheckbox(name: string) {
    return this.getFacetCheckbox(name).click();
  }
}
export default new BaseEntitySidebar();