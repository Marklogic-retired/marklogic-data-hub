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

  moreLink() {
    return cy.findByTestId(`moreLink`);
  }

  lessLink() {
    return cy.findByTestId(`lessLink`);
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
   * Xpath Expresion
   * @param propertyName
   * @example OrderId, address
   * @param value
   * @example /
   */
  setXpathExpressionInput(propertyName: string, value: string) {
    cy.findByTestId(`${propertyName}-mapexpression`).type(value);
  }

  validateMapValues(entityName: string, propertyName: string, value:string) {
    cy.findByTestId(`${entityName}-${propertyName}-value`).find(".ml-tooltip-container").should("have.text", value);
  }

  goBackToCurateHomePage() {
    cy.findByLabelText("Back").click();
  }

  noDataAvailable() {
    return cy.get("#noData");
  }
}

const mappingStepDetail = new MappingStepDetail();
export default mappingStepDetail;
