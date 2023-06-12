import common from "../pages/browse";
class BaseEntitySidebar {
  get searchInput() {
    return cy.get("[data-testid='search-bar']");
  }

  get dateFacetLabel() {
    return cy.get("[data-testid='facet-date-picker']").find("p");
  }

  get clearAllFacetsButton() {
    return cy.get("[aria-label=clear-facets-button]", {timeout: 3000});
  }

  get baseEntityDropdown() {
    return cy.get("#entitiesSidebar-select-wrapper");
  }

  get finalDataBaseButton() {
    return cy.get(`[aria-label="switch-database-final"] ~ label`);
  }

  get relatedConceptsPanel() {
    return cy.get("#related-concepts .accordion-button");
  }

  get allRelatedConceptsCheckbox() {
    return cy.get(`[aria-label="related-concepts-checkbox"]`);
  }

  get relatedEntityPanel() {
    return cy.get(`[data-testid="related-entity-panel"]`).find("button");
  }

  get disabledRelatedEntityTooltip() {
    return cy.get(`[aria-label="disabled-related-entity-tooltip"]`);
  }

  get disabledRelatedConceptsTooltip() {
    return cy.get(`[aria-label="disabled-related-concept-tooltip"]`);
  }

  get disabledEntityTooltip() {
    return cy.get(`[aria-label="disabled-entity-tooltip"]`);
  }

  get selectedEntityText() {
    return cy.get("#entitiesSidebar-select-wrapper").invoke("text");
  }

  get applyFacetsButton() {
    return cy.get("button[aria-label='apply-facets-button']");
  }

  get clearQueryLabel() {
    return cy.get(`[aria-label="clear-query"]`);
  }

  get clearQueryTooltip() {
    return cy.get(`[aria-label="clear-query-tooltip"]`);
  }

  getRelatedEntityIcon(entityName: string) {
    return cy.get(`[aria-label="related-entity-icon-${entityName}"]`);
  }

  getEntityFacetFilterQuantity(entityName: string) {
    return cy.get(`[aria-label="base-entities-${entityName}-filter"]`);
  }

  getEntityFacetAmountBar(entityName: string) {
    return cy.get(`[aria-label="base-entities-${entityName}-amountbar"]`);
  }

  getSingleConceptCheckbox(conceptName: string) {
    return cy.get(`[aria-label="related-concept-check-${conceptName}"]`);
  }

  getRelatedEntityCheckbox(entityName: string) {
    return cy.get(`[aria-label="related-entity-check-${entityName}"]`);
  }

  getBaseEntity(entity: string) {
    return cy.get(`div[aria-label="base-entities-selection"] div[aria-label="base-entities-${entity}"]`);
  }

  getBaseEntityOption(entity: string) {
    return cy.get(`[aria-label="base-option-${entity}"]`);
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

  getFacetCheckboxEmail(email: string) {
    return cy.get(`input[data-testid="email-${email}-checkbox"]`);
  }

  getCollectionCheckbox(facetName:string, name: string) {
    return cy.get(`input[data-testid="${facetName}-${name}-checkbox"]`);
  }

  getRelatedEntity(entityName: string) {
    return cy.get(`[aria-label="related-entity-${entityName}"]`);
  }

  switchToFinalDatabase() {
    this.finalDataBaseButton.scrollIntoView().click();
    cy.waitForAsyncRequest();
    common.waitForSpinnerToDisappear();
  }

  clearAllFacetsApplied() {
    this.clearAllFacetsButton.should("be.visible").click({force: true});
    cy.waitForAsyncRequest();
    common.waitForSpinnerToDisappear();
  }

  backToMainSidebar() {
    cy.findByLabelText("base-entity-icons-list-close").scrollIntoView().should("be.visible").click({force: true});
    cy.wait(1000); //element is detached from DOM issue following this, so stall before next command
  }

  removeSelectedBaseEntity() {
    cy.get(`[aria-label="Remove [object Object]"]`).first().scrollIntoView().should("be.visible").click({force: true});
  }

  removeLastSelectedBaseEntity() {
    cy.get(`[aria-label="Remove [object Object]"]`).last().scrollIntoView().should("be.visible").click();
  }

  selectEntity(entity: string) {
    common.waitForSpinnerToDisappear();
    cy.get(`#entity-select-wrapper div[class=" css-1s2thzd-control"]`, {timeout: 6000}).should("be.visible").click();
    cy.get(`#entity-select-MenuList [data-cy="entity-option-${entity}"]`).scrollIntoView().click({force: true});
    cy.waitForAsyncRequest();
    common.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
  }

  openBaseEntityDropdown() {
    cy.wait(2000);
    cy.get("#entitiesSidebar-select-wrapper").scrollIntoView().click("right");
  }

  selectBaseEntityOption(entityName: string) {
    cy.get(`[aria-label="base-option-${entityName}"]`).scrollIntoView().should("be.visible").click();
    cy.waitForAsyncRequest();
    common.waitForSpinnerToDisappear();
  }

  showMoreEntities() {
    return cy.get(`[data-cy="show-more-base-entities"]`).should("be.visible").click({force: true});
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

  getMainPanelSearchInput(input: string) {
    cy.get("#graph-view-filter-input").scrollIntoView().should("be.visible").then((e) => {
      Cypress.$(e).click();
    });
    cy.get("#graph-view-filter-input").clear().type(input);
  }

  clearQuery() {
    this.clearQueryLabel.click();
  }

  clearMainPanelSearch() {
    cy.get("[data-testid=\"hc-button-component\"]").contains("Clear Selection").click({force: true});
  }

  toggleAllDataView() {
    cy.intercept("POST", "/api/entitySearch?database=final").as("allData");
    cy.get(`[aria-label="switch-datasource-all-data"] ~ label`).scrollIntoView().click();
    cy.wait("@allData");
  }

  toggleEntitiesView() {
    cy.get(`[aria-label="switch-datasource-entities"] ~ label`).click();
  }

  toggleStagingView() {
    cy.intercept("POST", "/api/entitySearch?database=staging").as("staging");
    cy.get(`[aria-label="switch-database-staging"] ~ label`).scrollIntoView().click();
    cy.wait("@staging");
  }

  toggleRelatedEntityPanel() {
    cy.get("#related-entities .accordion-button").click({force: true});
  }

  openBaseEntityFacets(entity: string) {
    cy.get(`div[aria-label="base-entities-selection"] div[aria-label="base-entities-${entity}"]`).click();
  }

  clickFacetCheckbox(name: string) {
    this.getFacetCheckbox(name).click();
  }

  applyFacets() {
    this.applyFacetsButton.click();
    cy.waitForAsyncRequest();
  }

  selectRelatedEntity(entity: string) {
    this.getRelatedEntity(entity).click();
  }
}

export default new BaseEntitySidebar();
