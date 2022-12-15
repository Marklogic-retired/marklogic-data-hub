class EntityTypeTable {
  getEntity(entityName: string) {
    return cy.findByTestId(`${entityName}-span`);
  }

  getEntityInstanceCount(entityName: string) {
    return cy.findByTestId(`${entityName}-instance-count`);
  }

  getEntityInstanceCountValue(entityName: string) {
    return cy.findByTestId(`${entityName}-instance-count`).then(function(value) {
      return parseInt(value.text().replace(",", ""));
    });
  }

  getEntityLastProcessed(entityName: string) {
    return cy.findByTestId(`${entityName}-last-processed`);
  }

  getExpandEntityIcon(entityName: string) {
    cy.get(`[data-testid="${entityName}-Entity Type-expand-icon"]`).click();
  }

  sortByEntityName() {
    return cy.get("th").eq(0).click();
  }

  sortByInstanceCount() {
    return cy.get("th").eq(1).click();
  }

  sortByLastProcessed() {
    return cy.get("th").eq(2).click();
  }

  getDeleteEntityIcon(entityName: string) {
    return cy.findByTestId(`${entityName}-trash-icon`);
  }

  waitForTableToLoad() {
    cy.waitUntil(() => cy.get(".hc-table_row").should("have.length.gt", 0));
  }

  viewEntityInGraphView(entityName: string) {
    cy.get(`[data-testid="${entityName}-graphView-icon"]`).should("exist").scrollIntoView().click({force: true});
    cy.wait(2000);
  }

  getRevertButtonTableView() {
    return cy.findByLabelText("revert-changes-table-view");
  }
  goToNextTablePage() {
    return cy.get("[title='Next Page']").scrollIntoView().click();
  }

  getConceptClass(conceptName: string) {
    return cy.get(`[data-testid=${conceptName}-span]`);
  }

  getDeleteConceptClassIcon(conceptName: string) {
    return cy.findByTestId(`${conceptName}-trash-icon`);
  }

  sortByNodeTypeConcept() {
    cy.get("[data-testid='nodeType']").scrollIntoView().should("be.visible").click();
  }

}

const entityTypeTable = new EntityTypeTable();
export default entityTypeTable;
