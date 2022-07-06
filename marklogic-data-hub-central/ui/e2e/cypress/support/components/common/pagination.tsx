class Pagination {
  getPaginationPageSizeOptions() {
    return cy.get(`#pageSizeSelect`);
  }
  getPaginationSizeSelected() {
    return cy.get(`[class^="search-pagination_optionSelected"]`);
  }
  clickPaginationItem(index: number) {
    return cy.get(`#pagination-item-${index}`).scrollIntoView().click();
  }
  getCurrentPage() {
    return cy.get("li.page-item.active");
  }
}
export default new Pagination();