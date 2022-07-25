class LandingPage {

  dashboard() {
    return cy.get(".dashboard");
  }
  entityViewerTitle() {
    return cy.get(".title a");
  }
  menuOptions() {
    return cy.get(".menu a");
  }
  subMenu() {
    return cy.get("#nav-dropdown");
  }
  subMenuMlDocs() {
    return cy.get(".dropdown-item").eq(0);
  }
  subMenuSearch() {
    return cy.get(".dropdown-item span");
  }
  whatsNewChart() {
    return cy.get(".chart");
  }
  searchBox() {
    return cy.get(".section").findByTestId("searchBox");
  }
  recentSearchesClear() {
    return cy.findByTestId("recentSearches-clearButton");
  }
  noRecentSearches() {
    return cy.get(".recentSearches .none-found");
  }
  recentSearchesText() {
    return cy.get(".recentSearches span.qtext");
  }
  recentSearchesRows() {
    return cy.get(".recentSearches").find("tbody tr");
  }
  recentSearchesConfirmationModal() {
    return cy.findByTestId("recent search-resetConfirmationModal");
  }
  recentSearchesConfirmationYes() {
    return cy.findByTestId("yesButton");
  }
  recentSearchesConfirmationNo() {
    return cy.findByTestId("noButton");
  }
  recentlyVisitedClear() {
    return cy.findByTestId("recentRecords-clearButton");
  }
  noRecentlyVisited() {
    return cy.get(".section").eq(2).find(".none-found");
  }
  recentlyVisitedText() {
    return cy.get(".recentRecords .title span");
  }
  recentlyVisitedRows() {
    return cy.get(".recentRecords").find(".result");
  }
  recentlyVisitedConfirmationModal() {
    return cy.findByTestId("recently visited record-resetConfirmationModal");
  }

}

const landingPage = new LandingPage();
export default landingPage;
