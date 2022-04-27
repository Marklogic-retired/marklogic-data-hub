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
  getFacetLabel(facet: number, facetVal: number) {
    return cy.get(".facet").eq(facet).find("label").eq(facetVal);
  }
  getFacetCount(facet: number, facetVal: number) {
    return cy.get(".facet").eq(facet).find("td.count").eq(facetVal);
  }
  clickFacet(facet: string, facetVal: string) {
    cy.findByTestId(facet+":"+facetVal).click();
  }
  removeFacet(facet: string, facetVal: string) {
    let facetVar = "[class*=\"badge\"] [id=\""+facet+":"+facetVal+"\"]";
    cy.get(facetVar).click({force: true});
  }
  getFacetMeter(facet: string, facetVal: string) {
    return cy.findByTestId(facet+":"+facetVal);
  }
  summaryMeterMin() {
    return cy.get(".SummaryMeter_min__kGLVa");
  }
  summaryMeterMax() {
    return cy.get(".SummaryMeter_max__2jRYb");
  }
  summaryMeterVal() {
    return cy.get(".SummaryMeter_returned__280i4 span");
  }
  getAllCategories() {
    return cy.get(".categories");
  }
  resultCategories() {
    return cy.get(".categories");
  }
  resultStatus() {
    return cy.get(".status");
  }
  getBadge() {
    return cy.get(".badge");
  }
  selectPageSizeOption(pageSizeOption: string) {
    cy.get(`#pageSizeSelect`).select(pageSizeOption, {force: true});
  }
  getMore() {
    return cy.get(".moreLess");
  }
  getIcon(index: number) {
    return cy.findByTestId(`entity-icon-${index}`);
  }
}

const searchPage = new SearchPage();
export default searchPage;
