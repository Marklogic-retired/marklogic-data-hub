class AdvancedSettings {

  private selectWrapperSuffix = "-select-wrapper";
  private selectMenuListSuffix = "-select-MenuList";

  private sourceDatabse = "sourceDatabase";
  private targetDatabase = "targetDatabase";
  private additionalColl = "additionalColl";
  private targetPermissions = "targetPermissions";
  private provGranularity = "provGranularity";
  private batchSize = "batchSize";
  private interceptors = "interceptors";
  private customHook = "customHook";

  getSourceDatabaseSelectWrapper() {
    return cy.get(`#${this.sourceDatabse}${this.selectWrapperSuffix}`);
  }

  getSourceDatabaseSelectInput() {
    return cy.get(`#${this.sourceDatabse}`);
  }

  getSourceDatabaseSelectMenuList() {
    return cy.get(`#${this.sourceDatabse}${this.selectMenuListSuffix}`);
  }

  getTargetDatabaseSelectWrapper() {
    return cy.get(`#${this.targetDatabase}${this.selectWrapperSuffix}`);
  }

  getTargetDatabaseSelectInput() {
    return cy.get(`#${this.targetDatabase}`);
  }

  getTargetDatabaseSelectMenuList() {
    return cy.get(`#${this.targetDatabase}${this.selectMenuListSuffix}`);
  }

  getAdditionalCollSelectWrapper() {
    return cy.get(`#${this.additionalColl}${this.selectWrapperSuffix}`);
  }

  getAdditionalCollSelectInput() {
    return cy.get(`#${this.additionalColl}`);
  }

  getAdditionalCollSelectMenuList() {
    return cy.get(`#${this.additionalColl}${this.selectMenuListSuffix}`);
  }

  getTargetPermissions() {
    return cy.get(`#${this.targetPermissions}`);
  }

  getProvGranularitySelectWrapper() {
    return cy.get(`#${this.provGranularity}${this.selectWrapperSuffix}`);
  }

  getProvGranularitySelectInput() {
    return cy.get(`#${this.provGranularity}`);
  }

  getProvGranularitySelectMenuList() {
    return cy.get(`#${this.provGranularity}${this.selectMenuListSuffix}`);
  }

  getBatchSize() {
    return cy.get(`#${this.batchSize}`);
  }

  getInterceptors() {
    return cy.get(`#${this.interceptors}`);
  }

  getCustomHook() {
    return cy.get(`#${this.customHook}`);
  }

  toggleInterceptors() {
    cy.findByLabelText("interceptors-expand").trigger("mouseover").click();
  }

  toggleCustomHook() {
    cy.findByLabelText("custom-hook-expand").trigger("mouseover").click();
  }
}

const advancedSettings = new AdvancedSettings();
export default advancedSettings;
