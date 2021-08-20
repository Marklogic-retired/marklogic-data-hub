class MappingStepDetail {
  clearMap() {
    return cy.findByTestId("Clear-btn");
  }

  testMap() {
    return cy.get("#Test-btn");
  }

  navigateUrisRight() {
    return cy.findByTestId("navigate-uris-right");
  }

  navigateUrisLeft() {
    return cy.findByTestId("navigate-uris-left");
  }

  expandSource() {
    return cy.get("#srcContainer #expandIcon");
  }

  collapseSource() {
    return cy.get("#srcContainer #collapseIcon");
  }

  toggleSourceFilterMenu() {
    cy.findByTestId("filterIcon-key").click();
  }

  setSourceSearch(propertyName: string) {
    cy.get("#searchInput-key").focus().type(propertyName);
  }

  resetSourceSearch() {
    return cy.findByTestId("ResetSearch-key");
  }

  submitSourceSearch() {
    return cy.findByTestId("submitSearch-key");
  }

  expandEntity() {
    return cy.get("#entityContainer #expandIcon");
  }

  collapseEntity() {
    return cy.get("#entityContainer #collapseIcon");
  }

  toggleEntityFilterMenu () {
    cy.findByTestId("filterIcon-name").click();
  }

  setEntitySearch(propertyName: string) {
    cy.findByTestId("searchInput-name").focus().type(propertyName);
  }

  resetEntitySearch() {
    return cy.findByTestId("ResetSearch-name");
  }

  submitEntitySearch() {
    return cy.findByTestId("submitSearch-name");
  }

  stepSettingsLink() {
    return cy.findByLabelText(`stepSettings`);
  }

  entitySettingsLink() {
    return cy.findByLabelText(`entitySettings`);
  }

  moreLink() {
    return cy.findByTestId(`moreLink`);
  }

  lessLink() {
    return cy.findByTestId(`lessLink`);
  }

  relatedFilterMenu (entityName: string) {
    return cy.get(`#${entityName}-entities-filter`);
  }

  deleteConfirmationButtonYes() {
    return cy.get(".ant-modal-content button.ant-btn").contains("Yes");
  }

  deleteConfirmationButtonNo() {
    return cy.get(".ant-modal-content button.ant-btn").contains("No");
  }

  relatedFilterSelection(entityName: string, relatedName: string) {
    return cy.get(`#${entityName}-entities-filter li[title="${relatedName}"]`);
  }

  relatedFilterSelectionDeleteIcon(entityName: string, relatedName: string) {
    return cy.get(`#${entityName}-entities-filter li[title="${relatedName}"]`).find("span.ant-select-selection__choice__remove");
  }

  entityTitle (title: string) {
    return cy.findByLabelText(`${title}-title`);
  }

  relatedDeleteIcon(entityName: string) {
    // data-testid="Relation (relatedTo Person)-delete"
    return cy.findByTestId(`${entityName}-delete`);
  }

  /**
   * Get property icon from dropdown list by Entity type property name
   * @param propertyName
   * @example OrderId, address
   */
  getListIcon(propertyName: string) {
    return cy.findByTestId(`${propertyName}-listIcon`);
  }

  /**
   * Get property from dropdown list of source data, depends on getListIcon() being clicked first
   * @param functionName
   * @example cleanPrefix, memoryLookup
   */
  getPropertyFromList(propertyName: string) {
    return cy.findByTestId(`${propertyName}-option`);
  }

  /**
   * Get function icon from dropdown list by Entity type property name
   * @param propertyName
   * @example OrderId, address
   */
  getFunctionIcon(propertyName: string) {
    return cy.findByTestId(`${propertyName}-functionIcon`);
  }

  /**
   * Get function from dropdown list, depends on getFunctionIcon() being clicked first
   * @param functionName
   * @example cleanPrefix, memoryLookup
   */
  getFunctionFromList(functionName: string) {
    return cy.findByTestId(`${functionName}-option`);
  }

  /**
   * Get function from dropdown list, depends on getFunctionIcon() or getListIcon() being clicked first
   * @param searchString
   * @example cleanPrefix, memoryLookup, OrderId, address
   */
  setDropdownSearchList(searchString: string) {
    cy.get("#dropdownList").focus().type(searchString);
  }

  /**
   * Get related entity from dropdown list, depends on relatedFilterMenu() being clicked first
   * @param entityTitle
   * @example Child (childOf Person)
   */
  getRelatedEntityFromList(entityTitle: string) {
    return cy.findByLabelText(`${entityTitle}-option`);
  }

  /**
   * Xpath Expression
   * @param propertyName
   * @example OrderId, address
   * @param value
   * @example /
   */
  setXpathExpressionInput(propertyName: string, value: string) {
    cy.findByTestId(`${propertyName}-mapexpression`).type(value);
  }

  validateContextInput(entityTitle: string, value:string) {
    return cy.findByTestId(`${entityTitle}-Context-mapexpression`).should("have.text", value);
  }

  validateURIInput(entityTitle: string, value:string) {
    return cy.findByTestId(`${entityTitle}-URI-mapexpression`).should("have.text", value);
  }

  validateMapValue(entityName: string, propertyName: string, value:string) {
    cy.get(`[data-testid=${entityName}-${propertyName}-value] > span`).should("have.text", value);
  }

  validateMapValueP(entityName: string, propertyName: string, value:string) {
    cy.get(`[data-testid=${entityName}-${propertyName}-value] > p`).should("have.text", value);
  }

  validateMapValueString(entityName: string, propertyName: string, value:string) {
    cy.get(`[data-testid="${entityName}-${propertyName}-value"] > span`).should("have.text", value);
  }

  validateMapInput(propertyName: string, value:string) {
    cy.findByTestId(`${propertyName}-mapexpression`).should("have.text", value);
  }

  getURIInput(entityTitle: string) {
    return cy.findByTestId(`${entityTitle}-URI-mapexpression`);
  }

  getURIValue(entityTitle: string) {
    return cy.get(`[data-testid="${entityTitle}-URI-value"]`);
  }

  getForeignIcon(propertyName: string) {
    return cy.findByTestId(`foreign-${propertyName}`);
  }

  goBackToCurateHomePage() {
    cy.findByLabelText("Back").click();
  }

  noDataAvailable() {
    return cy.get("#noData");
  }

  dataAvailable() {
    return cy.get("#dataPresent");
  }

  successMessage() {
    return cy.findByTestId("successMessage");
  }

  getEntitySettings(entityName: string) {
    return cy.findByTestId(`${entityName}-entity-settings`);
  }

  getTargetPermissions(entityName: string) {
    return cy.findByTestId(`${entityName}-targetPermissions`);
  }

  getSaveSettings(entityName: string) {
    return cy.findByLabelText(`${entityName}-save-settings`);
  }

  getValidationError(entityName: string) {
    return cy.findByLabelText(`${entityName}-validationError`);
  }

  cancelSettings() {
    return cy.findByTestId("cancel-settings");
  }

  targetCollection() {
    return cy.findByLabelText("additionalColl-select");
  }

  searchIcon() {
    return cy.findByTestId("filterIcon-name");
  }

  searchName() {
    return cy.findByTestId("searchInput-name");
  }

  searchButton() {
    return cy.findByTestId("submitSearch-name");
  }

  customerEntity() {
    return cy.findByTestId("Customer");
  }

  XPathInfoIcon() {
    return cy.findByTestId("XPathInfoIcon");
  }

  relatedInfoIcon() {
    return cy.findByTestId("relatedInfoIcon");
  }

  relatedInfoContent() {
    return cy.findByTestId("relatedInfoContent");
  }

  sourceFieldIcon(entityName: string) {
    cy.findByTestId(`${entityName}-URI-listIcon1`).trigger("mouseover");
  }

  verifySourceFieldTooltip() {
    cy.findByText("Source Field").should("be.visible");
  }

  propertyFunctionIcon(propertyName: string) {
    cy.findByTestId(`${propertyName}-101-functionIcon`).trigger("mouseover");
  }

  verifyFunctionTooltip() {
    cy.findByText("Function").should("be.visible");
  }

  referenceIcon(entityName: string) {
    cy.findByTestId(`${entityName}-URI-refIcon1`).trigger("mouseover");
  }

  verifyReferenceTooltip() {
    cy.findByText("Reference").should("be.visible");
  }

}

const mappingStepDetail = new MappingStepDetail();
export default mappingStepDetail;
