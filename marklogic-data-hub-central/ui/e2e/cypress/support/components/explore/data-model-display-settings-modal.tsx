class DataModelDisplaySettingsModal {

  getModalBody() {
    return cy.get(`[id="entityTypeDisplaySettingsContainer"]`);
  }

  getTableRows() {
    return this.getModalBody().find(`[class^="hc-table_row"]`);
  }

  getEntityTypeColorButton(entityType: string) {
    return cy.get(`[id="${entityType}-color-button"]`);
  }

  getColorInPicket(color: string) {
    return cy.get(`[title="${color}"]`);
  }

  getEntityTypeIconButtonWrapper(entityType: string) {
    return cy.get(`[id="${entityType}-icon-picker"]`);
  }

  getEntityTypeIconButton(entityType: string) {
    return cy.get(`[id="${entityType}-icon-picker"] > div`);
  }

  getEntityTypeIconMenu(entityType: string) {
    return cy.get(`[id="${entityType}-icon-picker"] > div > div:last-child`);
  }

  getEntityTypeIconSearchInput(entityType: string) {
    return cy.get(`[id="${entityType}-icon-picker"]`).find("input");
  }

  getEntityLabelDropdown(entityType: string) {
    return cy.get(`[id="${entityType}-entityLabel-select-wrapper"]`).scrollIntoView();
  }

  getEntityLabelDropdownOption(entityType: string, option: string) {
    return cy.get(`[aria-label="${entityType}-labelOption-${option}"]`).first().scrollIntoView();
  }

  getPropertiesOnHoverDropdown(entityType: string) {
    return cy.get(`div[aria-label="${entityType}-property-to-match-dropdown"]`).scrollIntoView();
  }

  getPropertiesOnHoverDropdownOption(option: string) {
    return cy.get(`[aria-label="${option}-option"]`).first().scrollIntoView();
  }

  getPropertiesOnHoverExpandDropdownOption(option: string) {
    return cy.get(`[aria-label="${option}-option"]`).first().scrollIntoView().find(`[aria-label="icon: caret-down"]`);
  }

  getPropertiesOnHoverDropdownCloseOption(entityType: string, option: string) {
    return this.getPropertiesOnHoverDropdown(entityType).first().find(`[title="${option}"]`).find(`[class="rc-tree-select-selection-item-remove-icon"]`);
  }

  getModalCloseButton() {
    return cy.get(`[id="close-settings-modal"]`);
  }

  getModalCancelButton() {
    return cy.get(`[id="cancel-entityType-settings-modal"]`);
  }

  getModalSaveButton() {
    return cy.get(`[id="save-entityType-settings-modal"]`);
  }

  // filter selectors
  getIconSearch() {
    return cy.get(`[id="hc-popover-search-search-icon"]`);
  }

  getSearchPopover() {
    return cy.get(`[id="hc-popover-search"]`);
  }

  getSearchInput() {
    return cy.get(`[id="hc-popover-search-input"]`);
  }

  getSearchSearchButton() {
    return cy.get(`[id="hc-popover-search-search-button"]`);
  }

  getSearchResetButton() {
    return cy.get(`[id="hc-popover-search-reset-button"]`);
  }

  getConceptRadioButtopn() {
    return cy.get(`[id="concepts"]`);
  }

  /** Concepts selectors   */
  getConceptExpandRow(concept: string) {
    return cy.get(`[data-testid="${concept}-expand-icon"]`);
  }

  getConceptColorButton(concept: string) {
    return cy.get(`[id="${concept}-color-button"]`);
  }

  getConceptIconButtonWrapper(concept: string) {
    return cy.get(`[id="${concept}-icon-picker"]`);
  }

  getConceptIconButton(concept: string) {
    return cy.get(`[id="${concept}-icon-picker"] > div`);
  }

  getConceptIconSearchInput(concept: string) {
    return cy.get(`[id="${concept}-icon-picker"]`).find("input");
  }

  getConceptIconMenu(concept: string) {
    return cy.get(`[id="${concept}-icon-picker"] > div > div:last-child`);
  }
}

const dataModelDisplaySettingsModal = new DataModelDisplaySettingsModal();
export default dataModelDisplaySettingsModal;
