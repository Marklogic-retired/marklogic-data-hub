import "cypress-wait-until";
class MonitorPage {
  getTableRows() {
    return cy.get(".hc-table_row");
  }
  waitForMonitorTableToLoad() {
    cy.waitUntil(() => this.getTableRows().should("have.length.gt", 0));
  }
  clickPaginationItem(index: number) {
    return cy.get(`#top-search-pagination-bar .ant-pagination-item-${index}`).click({force: true});
  }
  getPaginationPageSizeOptions() {
    return cy.get(`#pageSizeSelect`);
  }
  getPageSizeOption(pageSizeOption: string) {
    return cy.findByText(pageSizeOption);
  }
  validateAppliedFacetTableRows(facetType: string, index: number) {
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).check();
    cy.findByTestId("facet-apply-button").click({force: true});
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).then(($btn) => {
      let facet = $btn.val();
      cy.get("#selected-facets [data-cy=\"clear-" + facet + "\"]").should("exist");
      cy.get(".hc-table_row").then(($row) => {
        for (let i=0; i < $row.length; i++) {
          cy.get(".hc-table_row").eq(i).should("contain.text", facet);
        }
      });
      cy.findByTestId(`clear-${facet}`).trigger("mouseover").dblclick({force: true});
    });
  }
  validateAppliedFacet(facetType: string, index: number) {
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).check();
    cy.findByTestId("facet-apply-button").click({force: true});
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).then(($btn) => {
      let facet = $btn.val();
      cy.get("#selected-facets [data-cy=\"clear-" + facet + "\"]").should("exist");
      cy.findByTestId(`${facetType}-${facet}-checkbox`).should("be.checked");
    });
  }
  validateGreyFacet(facetType: string, index: number) {
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).check();
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).then(($btn) => {
      let facet = $btn.val();
      cy.get("#selected-facets [data-cy=\"clear-grey-" + facet + "\"]").should("exist");
    });
  }
  validateClearGreyFacet(facetType: string, index: number) {
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).check();
    cy.get(`[data-testid=${facetType}-facet] input`).eq(index).then(($btn) => {
      let facet = $btn.val();
      cy.get("#selected-facets [data-cy=\"clear-grey-" + facet + "\"]").should("exist");
      cy.findByTestId(`clear-grey-${facet}`).trigger("mouseover").dblclick({force: true});
    });
  }
  validateClearStartTimeGreyFacet(option: string) {
    cy.get(`[data-testid=clear-grey-${option}]`).click();
  }

  selectStartTimeFromDropDown(option: string) {
    this.getStartTimeDropDown().click();
    this.getStartTimeOption(option).click();
    cy.waitForAsyncRequest();
  }

  getStartTimeDropDown() {
    return cy.get("#date-select");
  }

  getStartTimeOption(option: string) {
    return cy.get(`[data-cy="date-select-option-${option}"]`);
  }

  getSelectedTime() {
    return this.getStartTimeDropDown().invoke("text");
  }

  clearFacetSearchSelection(facet: string) {
    cy.get("[data-testid=\"start-time-facet\"]").scrollIntoView();
    cy.get("[data-testid=\"start-time-facet\"]").trigger("mousemove", {force: true});
    cy.findByTestId(`clear-${facet}`).scrollIntoView();
    cy.findByTestId(`clear-${facet}`).trigger("mousemove", {force: true}).dblclick({force: true});
    cy.waitUntil(() => cy.findByTestId("spinner").should("have.length", 0));
  }

}
const monitorPage = new MonitorPage();
export default monitorPage;
