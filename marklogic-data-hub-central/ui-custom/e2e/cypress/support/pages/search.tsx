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
  searchButton() {
    return cy.findByTestId("submit");
  }
  resultsList() {
    return cy.get(".resultsList");
  }
  resultTitle() {
    return cy.get(".details .title span");
  }
  resultAddress() {
    return cy.get(".Address");
  }
  resultPhone() {
    return cy.get(".phone");
  }
  resultEmail() {
    return cy.get(".email");
  }
  getFacet(facet: number, facetVal: number) {
    return cy.get(".facet").eq(facet).find("label").eq(facetVal);
  }
  resultCategories() {
    return cy.get(".categories");
  }
  resultStatus() {
    return cy.get(".status");
  }
  
}

const searchPage = new SearchPage();
export default searchPage;
