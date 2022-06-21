class ExplorePage {

  getTitleExplore() {
    return cy.get(`[aria-label="title-explore"]`);
  }

  scrollToBottom() {
    return cy.get(`#browseContainer`).scrollTo("bottom");
  }

  getPaginationPageSizeOptions() {
    return cy.get(`#pageSizeSelect`);
  }
}

export default new ExplorePage();