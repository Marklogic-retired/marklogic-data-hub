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
    cy.get(`#${entityName}-entities-filter`).click();
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
    cy.findByLabelText(`${entityTitle}-option`).click({force: true});
  }

  /**
   * Xpath Expression
   * @param propertyName
   * @example OrderId, address
   * @param value
   * @example /
   */
  setXpathExpressionInput(propertyName: string, value: string) {
    cy.findByTestId(`${propertyName}-mapexpression`).clear().type(value);
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

  validateMapURIValue(entityName: string, value:string) {
    cy.get(`[data-testid="${entityName}-URI-value"] > span`).should("have.text", value);
  }

  validateMapInput(propertyName: string, value:string) {
    cy.findByTestId(`${propertyName}-mapexpression`).should("have.text", value);
  }

  getURIInput(entityTitle: string) {
    return cy.findByTestId(`${entityTitle}-URI-mapexpression`);
  }

  getURIValue(entityTitle: string, value:string) {
    cy.get(`[data-testid="${entityTitle}-URI-value"]`).trigger("mouseover");
    cy.contains(value);
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
    cy.findByTestId("XPathInfoIcon").trigger("mouseover");
    cy.findByText("Documentation:").should("be.visible");
    cy.findByTestId("XPathInfoIcon").trigger("mouseout");
  }

  relatedInfoIcon() {
    cy.findByTestId("relatedInfoIcon").trigger("mouseover");
    cy.findByTestId("relatedInfoContent").should("be.visible");
    cy.findByTestId("relatedInfoIcon").trigger("mouseout");
  }

  relatedInfoContent() {
    return cy.findByTestId("relatedInfoContent");
  }

  verifySourceFieldTooltip(entityName: string) {
    cy.findByTestId(`${entityName}-URI-listIcon1`).trigger("mouseover");
    cy.findByText("Source Field").should("be.visible");
    cy.findByTestId(`${entityName}-URI-listIcon1`).trigger("mouseout");
  }

  verifyFunctionTooltip(propertyName: string) {
    cy.findByTestId(`${propertyName}-101-functionIcon`).trigger("mouseover");
    cy.findByText("Function").should("be.visible");
    cy.findByTestId(`${propertyName}-101-functionIcon`).trigger("mouseout");
  }

  verifyReferenceTooltip(entityName: string) {
    cy.findByTestId(`${entityName}-URI-refIcon1`).trigger("mouseover");
    cy.findByText("Reference").should("be.visible");
    cy.findByTestId(`${entityName}-URI-refIcon1`).trigger("mouseout");
  }

}

const mappingStepDetail = new MappingStepDetail();
export default mappingStepDetail;
