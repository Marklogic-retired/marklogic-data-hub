import landingPage from "../support/pages/landing";
import searchPage from "../support/pages/search";
import recordDetailsPage from "../support/pages/recordDetails";

let recentPerson1="";
let recentPerson2="";
let recentPerson3="";

describe("Recently Visited Validations ", () => {
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
    landingPage.recentlyVisitedClear().should("be.disabled");
    landingPage.noRecentlyVisited().should("be.visible");
  });
  it("Click on serach button for navigating to search page and get search values", () => {
    searchPage.searchButton().click();
    searchPage.resultsList().should("be.visible");
    searchPage.resultTitle().eq(0).then(nameVal => {
      recentPerson1 = nameVal.text();
    });
    searchPage.resultTitle().eq(1).then(nameVal => {
      recentPerson2 = nameVal.text();
    });
    searchPage.resultTitle().eq(2).then(nameVal => {
      recentPerson3 = nameVal.text();
    });
    searchPage.resultTitle().eq(0).click({force: true});
    recordDetailsPage.backToSearch().should("be.visible");
  });
  it("View a record  ", () => {
    landingPage.entityViewerTitle().click();
    landingPage.recentlyVisitedRows().should("have.length", 1);
    landingPage.recentlyVisitedText().eq(0).then($result => {
      expect($result.text()).to.equal(recentPerson1);
    });
    landingPage.recentlyVisitedClear().should("not.be.disabled");
    landingPage.noRecentlyVisited().should("not.exist");
    landingPage.searchBox().clear().type(recentPerson1).type("{enter}");
    searchPage.resultsList().should("be.visible");
    searchPage.resultTitle().eq(0).click({force: true});
    recordDetailsPage.backToSearch().should("be.visible");
    landingPage.entityViewerTitle().should("be.visible").click({force: true});
    landingPage.recentlyVisitedRows().should("have.length", 1);
    landingPage.recentlyVisitedText().eq(0).then($result => {
      expect($result.text()).to.equal(recentPerson1);
    });
    searchPage.menuSearchBox().clear().type("{enter}");
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    landingPage.entityViewerTitle().should("be.visible").click({force: true});
    landingPage.recentlyVisitedRows().should("have.length", 1);
    landingPage.recentlyVisitedText().eq(0).then($result => {
      expect($result.text()).to.equal(recentPerson1);
    });
    landingPage.recentlyVisitedClear().should("not.be.disabled");
    landingPage.noRecentlyVisited().should("not.exist");
  });
  it("View multiple records profiles ", () => {
    searchPage.menuSearchBox().clear().type(recentPerson2).type("{enter}");
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.resultTitle().eq(0).click({force: true});
    recordDetailsPage.backToSearch().should("be.visible");
    landingPage.entityViewerTitle().should("be.visible").click({force: true});
    landingPage.recentlyVisitedRows().should("have.length", 2);
    landingPage.recentlyVisitedText().eq(0).then($result => {
      expect($result.text().trim()).to.equal(recentPerson2);
    });
    landingPage.recentlyVisitedText().eq(1).then($result => {
      expect($result.text().trim()).to.equal(recentPerson1);
    });
    landingPage.searchBox().clear().type(recentPerson3).type("{enter}");
    searchPage.resultsList().should("be.visible");
    searchPage.resultTitle().eq(0).click({force: true});
    recordDetailsPage.backToSearch().should("be.visible");
    landingPage.entityViewerTitle().should("be.visible").click({force: true});
    landingPage.recentlyVisitedRows().should("have.length", 3);
    landingPage.recentlyVisitedText().eq(0).then($result => {
      expect($result.text().trim()).to.equal(recentPerson3);
    });
    landingPage.recentlyVisitedText().eq(1).then($result => {
      expect($result.text().trim()).to.equal(recentPerson2);
    });
    landingPage.recentlyVisitedText().eq(2).then($result => {
      expect($result.text().trim()).to.equal(recentPerson1);
    });
  });
  it("Validate clear button ", () => {
    landingPage.recentlyVisitedClear().should("not.be.disabled").click();
    landingPage.recentlyVisitedConfirmationModal().should("be.visible");
    landingPage.recentSearchesConfirmationNo().click();
    landingPage.recentlyVisitedConfirmationModal().should("not.exist");
    landingPage.recentlyVisitedRows().should("have.length", 3);
    landingPage.recentlyVisitedText().eq(0).then($result => {
      expect($result.text().trim()).to.equal(recentPerson3);
    });
    landingPage.recentlyVisitedText().eq(1).then($result => {
      expect($result.text().trim()).to.equal(recentPerson2);
    });
    landingPage.recentlyVisitedText().eq(2).then($result => {
      expect($result.text().trim()).to.equal(recentPerson1);
    });
    landingPage.recentlyVisitedClear().should("not.be.disabled").click();
    landingPage.recentlyVisitedConfirmationModal().should("be.visible");
    landingPage.recentSearchesConfirmationYes().click();
    landingPage.recentlyVisitedConfirmationModal().should("not.exist");
    landingPage.noRecentlyVisited().should("be.visible");
  });
});
