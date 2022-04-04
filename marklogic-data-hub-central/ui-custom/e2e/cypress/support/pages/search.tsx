class SearchPage {

  summaryMeter() {
    return cy.get(".SummaryMeter_meter__Q7YfM");
  }
  menuSearchBox() {
    return cy.get(".sticky-top").findByTestId("searchBox");
  }
  menuEntityDropdown() {
    return cy.get(".sticky-top").find("#searchBoxDropdown");
  }

}

const searchPage = new SearchPage();
export default searchPage;
