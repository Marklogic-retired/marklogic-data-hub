class EntityTypeDisplaySettingsModal {

  getModalBody() {
    return cy.get(`[id="entityTypeDisplaySettingsContainer"]`);
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
    return cy.get(`[aria-label="${entityType}-labelOption-${option}"]`).scrollIntoView();
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
}

const entityTypeDisplaySettingsModal = new EntityTypeDisplaySettingsModal();
export default entityTypeDisplaySettingsModal;
