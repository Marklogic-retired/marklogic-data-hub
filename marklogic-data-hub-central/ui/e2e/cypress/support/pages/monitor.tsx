import "cypress-wait-until";
class MonitorPage {
  getTableRows() {
    return cy.get(".ant-table-row");
  }
  waitForMonitorTableToLoad() {
    cy.waitUntil(() => this.getTableRows().should("have.length.gt", 0));
  }
  clickPaginationItem(index: number) {
    return cy.get(`#top-search-pagination-bar .ant-pagination-item-${index}`).click({force: true});
  }
  getPaginationPageSizeOptions() {
    return cy.get(".ant-pagination-options .ant-select-selection-selected-value");
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
      cy.get(".ant-table-row").then(($row) => {
        for (let i=0; i < $row.length; i++) {
          cy.get(".ant-table-row").eq(i).should("contain.text", facet);
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


}
const monitorPage = new MonitorPage();
export default monitorPage;
