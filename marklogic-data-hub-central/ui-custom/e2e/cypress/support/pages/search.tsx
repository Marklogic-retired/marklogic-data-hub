class SearchPage {

  summaryMeter() {
    return cy.get(".summaryMeter");
  }
  menuSearchBox() {
    return cy.get(".sticky-top").findByTestId("searchBox");
  }
  menuEntityDropdown() {
    return cy.get("main #searchBoxDropdown");
  }
  searchButton() {
    return cy.findByTestId("submit");
  }
  resultsList() {
    return cy.get(".resultsList");
  }
  resultTitle() {
    return cy.get(".details .title span span");
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
    return cy.get(".min");
  }
  summaryMeterMax() {
    return cy.get(".max");
  }
  summaryMeterVal() {
    return cy.get(".returned span");
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
  getBadgeDate() {
    return cy.get(`[class*="badge"] [class*="nameLabel"]`);
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
  navigateToPage(page: number) {
    return cy.get(`#pagination-item-${page}`);
  }
  nextPage() {
    return cy.contains("span[class=visually-hidden]", "Next");
  }
  previousPage() {
    return cy.contains("span[class=visually-hidden]", "Previous");
  }
  paginationComponent() {
    return cy.get("#pagination");
  }
  createdOn() {
    return cy.get(".timestamp span.DateTime");
  }
  datePicker() {
    return cy.get(".pickerContainer .input");
  }
  datePickerCal() {
    return cy.get(".pickerContainer .calendarIcon");
  }
  showCalendar() {
    return cy.get(`[class*="daterangepicker ltr"]`);
  }
  getMonth() {
    return cy.get(".month");
  }
  prevMonthClick() {
    cy.get(".prev").click();
  }
  nextMonthClick() {
    cy.get(".next").click();
  }
  selectStartDate() {
    return cy.get(`[class="drp-calendar left"] [class="available"]`);
  }
  selectEndDate() {
    return cy.get(`[class="drp-calendar right"] [class="available"]`);
  }
  selectEntity(entity: string) {
    return cy.contains("main .dropdown-item", entity);
  }
  sortIcon() {
    return cy.get(".sortIcons svg");
  }
}

const searchPage = new SearchPage();
export default searchPage;
