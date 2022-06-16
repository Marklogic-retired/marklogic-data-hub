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

  getPaginationPageSizeOptions(entityName: string) {
    return cy.get(`[data-testid=${entityName}-table] > :nth-child(2) > .row > :nth-child(1) > .test > .sizePageSelector > #size-per-page`);
  }

  expandSource() {
    return cy.get("#srcContainer #expandIcon");
  }

  collapseSource() {
    return cy.get("#srcContainer #collapseIcon");
  }

  toggleSourceFilterMenu() {
    cy.findByTestId("filterIcon-srcName").click();
  }

  setSourceSearch(propertyName: string) {
    cy.get("#searchInput-source").focus().type(propertyName);
  }

  resetSourceSearch() {
    return cy.get(`[id="resetSearch-source"]`);
  }

  submitSourceSearch() {
    return cy.get(`[id="submitSearch-source"]`);
  }

  expandEntity() {
    return cy.get("#entityContainer #expandIcon");
  }

  collapseEntity() {
    return cy.get("#entityContainer #collapseIcon");
  }

  setEntitySearch(propertyName: string) {
    cy.get(`[id="searchInput-entity"]`).focus().type(propertyName);
  }

  resetEntitySearch() {
    return cy.get(`[id="resetSearch-entity"]`);
  }

  submitEntitySearch() {
    return cy.get(`[id="submitSearch-entity"]`);
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

  relatedFilterMenu(entityName: string) {
    cy.get(`#${entityName}-entities-filter-select-wrapper`).click();
  }

  deleteConfirmationButtonYes() {
    return cy.get(".modal-content button").contains("Yes");
  }

  deleteConfirmationButtonNo() {
    return cy.get(".modal-content button").contains("No");
  }

  relatedFilterSelection(entityName: string, relatedName: string) {
    return cy.get(`#${entityName}-entities-filter-select-wrapper [title="${relatedName}"]`);
  }

  relatedFilterSelectionDeleteIcon(entityName: string, relatedName: string) {
    return cy.get(`#${entityName}-entities-filter-select-wrapper [title="${relatedName}"]`).find(`[aria-label="icon: close"]`);
  }

  entityTitle(title: string) {
    return cy.findByLabelText(`${title}-title`);
  }

  relatedDeleteIcon(entityName: string) {
    // data-testid="Relation (relatedTo Person)-delete"
    return cy.findByTestId(`${entityName}-delete`);
  }

  getMapPropertyName(entityName: string, propertyName: string) {
    return cy.findByTestId(`${entityName}-${propertyName}-name`);
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

  getXpathExpressionInput(propertyName: string) {
    return cy.findByTestId(`${propertyName}-mapexpression`);
  }

  setXpathExpressionInput(propertyName: string, value: string) {
    this.getXpathExpressionInput(propertyName).scrollIntoView().clear().type(value);
  }

  getPropertyNameCell(propertyName: string, entity: string) {
    return cy.get(`[data-testid="${entity}-${propertyName}-name"]`);
  }

  validateContextInput(entityTitle: string, value: string) {
    return cy.findByTestId(`${entityTitle}-Context-mapexpression`).should("have.text", value);
  }

  validateURIInput(entityTitle: string, value: string) {
    return cy.findByTestId(`${entityTitle}-URI-mapexpression`).should("have.text", value);
  }

  validateMapValue(entityName: string, propertyName: string, value: string) {
    cy.get(`[data-testid=${entityName}-${propertyName}-value] > span`).should("have.text", value);
  }

  validateMapValueP(entityName: string, propertyName: string, value: string) {
    cy.get(`[data-testid=${entityName}-${propertyName}-value] > span > p`).should("have.text", value);
  }

  validateMapValueString(entityName: string, propertyName: string, value: string) {
    cy.get(`[data-testid="${entityName}-${propertyName}-value"] > span`).should("have.text", value);
  }

  validateMapURIValue(entityName: string, value: string) {
    cy.get(`[data-testid="${entityName}-URI-value"] > span`).should("have.text", value);
  }

  validateMapInput(propertyName: string, value: string) {
    cy.findByTestId(`${propertyName}-mapexpression`).should("have.text", value);
  }

  getURIInput(entityTitle: string) {
    return cy.findByTestId(`${entityTitle}-URI-mapexpression`);
  }

  getURIValue(entityTitle: string, value: string) {
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

  entityData() {
    return cy.get("#lowerTable");
  }

  successMessage() {
    return cy.findByTestId("successMessage");
  }

  getEntitySettings(entityName: string) {
    return cy.findByTestId(`${entityName}-entity-settings`);
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

  searchIcon(entityName: string) {
    return cy.get(`[id=filterIcon-${entityName}-entity] > path`).scrollIntoView();
  }

  searchName() {
    return cy.get(`[id="searchInput-entity"]`);
  }

  searchButton() {
    return cy.get(`[id="submitSearch-entity"]`);
  }

  customerEntity() {
    return cy.findByTestId("Customer");
  }

  editTargetPermissions(entityName: string, str: string) {
    cy.get("#targetPermissions").focus().clear().type(str);
  }

  XPathInfoIcon() {
    cy.get(`#mainTable > thead > tr > :nth-child(3) > span > [data-testid=XPathInfoIcon]`).trigger("mouseover");
    cy.get("#popover-emt-xpathdoclinks").should("be.visible");
    cy.get(`#mainTable > thead > tr > :nth-child(3) > span > [data-testid=XPathInfoIcon]`).trigger("mouseout");
  }

  relatedInfoIcon() {
    cy.findByTestId("relatedInfoIcon").trigger("mouseover");
    cy.findByTestId("relatedInfoContent").should("be.visible");
    cy.findByTestId("relatedInfoIcon").trigger("mouseout");
  }

  relatedInfoContent() {
    return cy.findByTestId("relatedInfoContent");
  }

  saveMapInput() {
    return cy.get(`[data-testid=foreignKeyIconLegend]`).click({force: true});
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

  expandDropdownPagination() {
    cy.get("#size-per-page").scrollIntoView().should("be.visible").click();
  }

  selectPagination(text: string) {
    cy.get(`[aria-label="${text}"]`).click();
  }

  selectPageSourceTable(page: string) {
    cy.get(".pagination .page-item a").contains(page).click();
  }

  expandAllSourceTable() {
    cy.get(`#dataPresent [data-icon="angle-double-down"]`).click();
  }

  verifyExpandedRows() {
    cy.get("*[class^=\"hc-table_childrenIndentTableExpanded\"]").should("exist");
  }

  verifyContent(content: string) {
    cy.contains(content);
  }

  verifyPageSourceTable(page: string) {
    cy.get(".pagination .page-item a").contains(page).should("exist");
  }

  addFilter(text: string) {
    cy.get("#filterIcon-srcName").click();
    cy.get("#searchInput-source").type(text);
    cy.get("#submitSearch-source").click();
  }

  verifyFilter() {
    cy.get("#filterIcon-srcName").click();
    cy.get("#searchInput-source").should("have.value", "ship");
  }

  resetFilter() {
    cy.get("#resetSearch-source").click({force: true});
  }

}

const mappingStepDetail = new MappingStepDetail();
export default mappingStepDetail;
