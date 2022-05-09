import landingPage from "../support/pages/landing";
import searchPage from "../support/pages/search";

let searchPerson1="";
let searchPerson2="";
let searchPerson3="";
let summaryMeterMax="";

describe("Search Validations ", () => {
  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.intercept({
      method: "GET",
      url: "/api/explore**",
    }).as("getSearch");
  });
  afterEach(() => {
    cy.saveLocalStorage();
  });
  it("Visit Entity Viewer Application ", () => {
    cy.visit("/");
    landingPage.whatsNewChart().should("be.visible");
    searchPage.searchButton().click();
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.summaryMeterMax().then(maxVal => {
      summaryMeterMax = maxVal.text();
    });
  });
  it("Change pagesize to 80 ", () => {
    searchPage.selectPageSizeOption("80 / page");
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.resultTitle().should("have.length", 80);
    cy.contains("Showing 1-80 of " + summaryMeterMax + " results");
    landingPage.entityViewerTitle().click();
    landingPage.dashboard().should("be.visible");
    searchPage.searchButton().click();
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.resultTitle().should("have.length", 80);
    searchPage.resultTitle().eq(0).then(nameVal => {
      searchPerson1 = nameVal.text();
    });
    searchPage.resultTitle().eq(10).then(nameVal => {
      searchPerson2 = nameVal.text();
    });
    searchPage.resultTitle().eq(20).then(nameVal => {
      searchPerson3 = nameVal.text();
    });
    searchPage.summaryMeterMax().then(maxVal => {
      summaryMeterMax = maxVal.text();
    });
  });
  it("Change pagesize to 20 and 5 ", () => {
    searchPage.selectPageSizeOption("20 / page");
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.resultTitle().should("have.length", 20);
    cy.contains("Showing 1-20 of " + summaryMeterMax + " results");
    searchPage.selectPageSizeOption("40 / page");
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.resultTitle().should("have.length", 40);
    cy.contains("Showing 1-40 of " + summaryMeterMax + " results");
  });
  it("Change pagesize to 10 ", () => {
    searchPage.selectPageSizeOption("10 / page");
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.resultTitle().should("have.length", 10);
    cy.contains("Showing 1-10 of " + summaryMeterMax + " results");
    //Navigate to next page
    searchPage.nextPage().scrollIntoView().click({force: true});
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.resultTitle().eq(0).then(nameVal => {
      expect(nameVal.text()).to.equal(searchPerson2);
    });
    cy.contains("Showing 11-20 of " + summaryMeterMax + " results");
    //Navigate to previous page
    searchPage.previousPage().scrollIntoView().click({force: true});
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.resultTitle().eq(0).then(nameVal => {
      expect(nameVal.text()).to.equal(searchPerson1);
    });
    cy.contains("Showing 1-10 of " + summaryMeterMax + " results");
    searchPage.paginationComponent().find("li").eq(0).then(($page) => {
      const cls = $page.attr("class");
      expect(cls).to.contain("disabled");
    });
    //Navigate to third page
    searchPage.navigateToPage(3).scrollIntoView().click({force: true});
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.resultTitle().eq(0).then(nameVal => {
      expect(nameVal.text()).to.equal(searchPerson3);
    });
    cy.contains("Showing 21-30 of " + summaryMeterMax + " results");
    //Navigate to last page
    let num = Math.ceil(parseInt(summaryMeterMax)/10);
    searchPage.navigateToPage(num).scrollIntoView().click({force: true});
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.paginationComponent().find("li").eq(-1).then(($page) => {
      const cls = $page.attr("class");
      expect(cls).to.contain("disabled");
    });
    //Navigate to first page
    searchPage.navigateToPage(1).scrollIntoView().click({force: true});
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.resultTitle().eq(0).then(nameVal => {
      expect(nameVal.text()).to.equal(searchPerson1);
    });
  });
});
