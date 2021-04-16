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


}

const monitorPage = new MonitorPage();
export default monitorPage;
