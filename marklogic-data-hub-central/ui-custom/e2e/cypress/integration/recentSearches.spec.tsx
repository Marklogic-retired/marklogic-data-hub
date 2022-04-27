import landingPage from "../support/pages/landing";
import searchPage from "../support/pages/search";

let searchPerson="";
let searchAddress="";
let searchPhone="";

describe("Recent Searches Validations ", () => {
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
    landingPage.recentSearchesClear().should("be.disabled");
    landingPage.noRecentSearches().should("be.visible");
  });
  it("Click on serach button for navigating to search page and get search values", () => {
    searchPage.searchButton().click();
    searchPage.resultsList().should("be.visible");
    searchPage.resultTitle().eq(0).then(nameVal => {
      searchPerson = nameVal.text();
    });
    searchPage.resultAddress().eq(0).then(addressVal => {
      searchAddress = addressVal.text();
    });
    searchPage.resultPhone().eq(0).then(phoneVal => {
      searchPhone = phoneVal.text();
    });
  });
  it("Search values ", () => {
    searchPage.menuSearchBox().clear().type(searchPerson).type("{enter}");
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    landingPage.entityViewerTitle().click();
    landingPage.recentSearchesRows().should("have.length", 1);
    landingPage.recentSearchesText().eq(0).then($result => {
      expect($result.text().trim()).to.equal(searchPerson);
    });
    landingPage.recentSearchesClear().should("not.be.disabled");
    landingPage.noRecentSearches().should("not.exist");
    landingPage.searchBox().should("have.value", searchPerson).type("{enter}");
    searchPage.resultsList().should("be.visible");
    landingPage.entityViewerTitle().click();
    landingPage.recentSearchesRows().should("have.length", 1);
    landingPage.recentSearchesText().eq(0).then($result => {
      expect($result.text().trim()).to.equal(searchPerson);
    });
    searchPage.menuSearchBox().clear().type("{enter}");
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    landingPage.entityViewerTitle().click();
    landingPage.recentSearchesRows().should("have.length", 1);
    landingPage.recentSearchesText().eq(0).then($result => {
      expect($result.text().trim()).to.equal(searchPerson);
    });
    landingPage.recentSearchesClear().should("not.be.disabled");
    landingPage.noRecentSearches().should("not.exist");
  });
  it("Search other values ", () => {
    searchPage.menuSearchBox().clear().type(searchAddress).type("{enter}");
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    landingPage.entityViewerTitle().click();
    landingPage.recentSearchesRows().should("have.length", 2);
    landingPage.recentSearchesText().eq(0).then($result => {
      expect($result.text().trim()).to.equal(searchAddress);
    });
    landingPage.recentSearchesText().eq(1).then($result => {
      expect($result.text().trim()).to.equal(searchPerson);
    });
    landingPage.searchBox().clear().type(searchPhone).type("{enter}");
    searchPage.resultsList().should("be.visible");
    landingPage.entityViewerTitle().click();
    landingPage.recentSearchesRows().should("have.length", 3);
    landingPage.recentSearchesText().eq(0).then($result => {
      expect($result.text().trim()).to.equal(searchPhone);
    });
    landingPage.recentSearchesText().eq(1).then($result => {
      expect($result.text().trim()).to.equal(searchAddress);
    });
    landingPage.recentSearchesText().eq(2).then($result => {
      expect($result.text().trim()).to.equal(searchPerson);
    });
  });
  it("Validate clear button ", () => {
    landingPage.recentSearchesClear().should("not.be.disabled").click();
    landingPage.recentSearchesConfirmationModal().should("be.visible");
    landingPage.recentSearchesConfirmationNo().click();
    landingPage.recentSearchesConfirmationModal().should("not.exist");
    landingPage.recentSearchesRows().should("have.length", 3);
    landingPage.recentSearchesText().eq(0).then($result => {
      expect($result.text().trim()).to.equal(searchPhone);
    });
    landingPage.recentSearchesText().eq(1).then($result => {
      expect($result.text().trim()).to.equal(searchAddress);
    });
    landingPage.recentSearchesText().eq(2).then($result => {
      expect($result.text().trim()).to.equal(searchPerson);
    });
    landingPage.recentSearchesClear().should("not.be.disabled").click();
    landingPage.recentSearchesConfirmationModal().should("be.visible");
    landingPage.recentSearchesConfirmationYes().click();
    landingPage.recentSearchesConfirmationModal().should("not.exist");
    landingPage.noRecentSearches().should("be.visible");
  });
});
