import common from "../pages/browse";
class BaseEntitySidebar {
  //Elements
  backToMainSidebar() {
    cy.findByLabelText("base-entity-icons-list-close").scrollIntoView().should("be.visible").click({force: true});
    cy.wait(1000); //element is detached from DOM issue following this, so stall before next command
  }
  getBaseEntity(entity: string) {
    return cy.get(`div[aria-label="base-entities-selection"] div[aria-label="base-entities-${entity}"]`);
  }
  getBaseEntityOption(entity: string) {
    return cy.get(`[aria-label="base-option-${entity}"]`);
  }
  removeSelectedBaseEntity() {
    cy.get(`[class="css-xb97g8"]`).first().scrollIntoView().should("be.visible").click({force: true});
  }

  removeLastSelectedBaseEntity() {
    cy.get(`[class="css-xb97g8"]`).last().scrollIntoView().should("be.visible").click();
  }

  selectEntity(entity: string) {
    common.waitForSpinnerToDisappear();
    cy.get(`#entity-select-wrapper div[class=" css-1s2thzd-control"]`, {timeout: 6000}).should("be.visible").click();
    cy.get(`#entity-select-MenuList [data-cy="entity-option-${entity}"]`).scrollIntoView().click({force: true});
    cy.waitForAsyncRequest();
    common.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
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

  getFacetCheckboxEmail(email: string) {
    return cy.get(`input[data-testid="email-${email}-checkbox"]`);
  }

  getCollectionCheckbox(facetName:string, name: string) {
    return cy.get(`input[data-testid="${facetName}-${name}-checkbox"]`);
  }
  getInputSearch() {
    return cy.get("#specif-search-input");
  }
  getDateFacet() {
    return cy.get("[data-testid='facet-date-picker']");
  }
  getDateFacetLabel() {
    return this.getDateFacet().find("p");
  }
  getDateFacetTitle() {
    return cy.get("[data-testid='facet-date-picker'] > p");
  }

  getRelatedEntity(entityName: string) {
    return cy.get(`[aria-label="related-entity-${entityName}"]`);
  }

  getBaseEntityDropdown() {
    return cy.get("#entitiesSidebar-select-wrapper");
  }

  getSelectedEntityText() {
    return cy.get("#entitiesSidebar-select-wrapper").invoke("text");
  }

  openBaseEntityDropdown() {
    cy.wait(2000);
    cy.get("#entitiesSidebar-select-wrapper").scrollIntoView().click("right");
  }

  selectBaseEntityOption(entityName: string) {
    cy.get(`[aria-label="base-option-${entityName}"]`).scrollIntoView().should("be.visible").click();
  }


  showMoreEntities() {
    return cy.get(`[data-cy="show-more-base-entities"]`);
  }
  showMoreRelatedConcept() {
    return cy.get(`[data-testid="show-more-relatedconcepts"]`);
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

  getApplyFacetsButton() {
    return cy.get("button[aria-label='apply-facets-button']");
  }

  getClearFacetsButton() {
    return cy.get("button[aria-label='clear-facets-button']");
  }

  getClearQuery() {
    return cy.get(`[aria-label="clear-query"]`);
  }

  getClearQueryTooltip() {
    return cy.get(`[aria-label="clear-query-tooltip"]`);
  }
  getClearOneFacet(facetName: String) {
    return cy.get(`[data-cy="clear-${facetName}"]`);
  }

  clearQuery() {
    this.getClearQuery().click();
  }

  getRelatedEntityPanel() {
    return cy.get(`[data-testid="related-entity-panel"]`);
  }

  toggleAllDataView() {
    cy.get(`[aria-label="switch-datasource-all-data"] ~ label`).scrollIntoView().click();
  }

  toggleEntitiesView() {
    cy.get(`[aria-label="switch-datasource-entities"] ~ label`).click();
  }

  verifyCollapsedRelatedEntityPanel() {
    return cy.get(`[class^="after-indicator sidebar_disabledTitleCheckbox"][class$="accordion-button collapsed"]`);
  }

  toggleRelatedEntityPanel() {
    cy.get("#related-entities .accordion-button").click({force: true});
  }

  getDisabledEntityTooltip() {
    return cy.get(`[aria-label="disabled-entity-tooltip"]`);
  }


  //Actions
  openBaseEntityFacets(entity: string) {
    cy.get(`div[aria-label="base-entities-selection"] div[aria-label="base-entities-${entity}"]`).click();
  }
  clickFacetCheckbox(name: string) {
    this.getFacetCheckbox(name).click();
  }
  clickOnApplyFacetsButton() {
    this.getApplyFacetsButton().click();
  }
  clickOnClearFacetsButton() {
    this.getClearFacetsButton().click();
  }
  clickOnRelatedEntity(entity: string) {
    this.getRelatedEntity(entity).click();
  }

  getRelatedEntityIcon(entityName: string) {
    return cy.get(`[aria-label="related-entity-icon-${entityName}"]`);
  }

  getDisabledRelatedEntityTooltip() {
    return cy.get(`[aria-label="disabled-related-entity-tooltip"]`);
  }

  //facet indicators and filter
  getEntityFacetFilterQuantity(entityName: string) {
    return cy.get(`[aria-label="base-entities-${entityName}-filter"]`);
  }

  getEntityFacetAmountBar(entityName: string) {
    return cy.get(`[aria-label="base-entities-${entityName}-amountbar"]`);
  }

  getRelatedConceptsPanel() {
    return cy.get("#related-concepts .accordion-button");
  }

  getDisabledRelatedConceptsTooltip() {
    return cy.get(`[aria-label="disabled-related-concept-tooltip"]`);
  }

  getAllRelatedConceptsCheckbox() {
    return cy.get(`[aria-label="related-concepts-checkbox"]`);
  }

  getSingleConceptCheckbox(conceptName: string) {
    return cy.get(`[aria-label="related-concept-check-${conceptName}"]`);
  }
}
export default new BaseEntitySidebar();
