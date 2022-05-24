import landingPage from "../support/pages/landing";
import searchPage from "../support/pages/search";

let orginalArr=[];
let unSortedArr=[];

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
  it("Visit Entity Viewer Application and select an Entity", () => {
    cy.visit("/");
    landingPage.whatsNewChart().should("be.visible");
    searchPage.menuEntityDropdown().click();
    searchPage.selectEntity("Person").click();
    searchPage.searchButton().click();
    searchPage.resultsList().should("be.visible");
  });
  it("Validate the createOn values are sorted in ascending ", () => {
    searchPage.sortIcon().eq(0).click({force: true});
    searchPage.createdOn().each((item) => {
      orginalArr.push(item.text().split(" ")[2]);
    }).then(() => {
      unSortedArr.push(...orginalArr);
      orginalArr.sort(function(a, b) {
        a = a.split("-").join("");
        b = b.split("-").join("");
        return a-b;
      });
      expect(JSON.stringify(orginalArr)).to.equal(JSON.stringify(unSortedArr));
    });
  });
  it("Validate the createOn values are sorted in descending ", () => {
    unSortedArr = [];
    orginalArr = [];
    searchPage.sortIcon().eq(0).click({force: true});
    searchPage.createdOn().each((item) => {
      orginalArr.push(item.text().split(" ")[2]);
    }).then(() => {
      unSortedArr.push(...orginalArr);
      orginalArr.sort(function(a, b) {
        a = a.split("-").join("");
        b = b.split("-").join("");
        return b-a;
      });
      expect(JSON.stringify(orginalArr)).to.equal(JSON.stringify(unSortedArr));
    });
    });
    it("Validate the createOn sorting is retained ", () => {
    landingPage.entityViewerTitle().click();
    landingPage.dashboard().should("be.visible");	
    searchPage.searchButton().click();
    searchPage.resultsList().should("be.visible");
    unSortedArr = [];
    orginalArr = [];
    searchPage.createdOn().each((item) => {
      orginalArr.push(item.text().split(" ")[2]);
    }).then(() => {
      unSortedArr.push(...orginalArr);
      orginalArr.sort(function(a, b) {
        a = a.split("-").join("");
        b = b.split("-").join("");
        return b-a;
      });
      expect(JSON.stringify(orginalArr)).to.equal(JSON.stringify(unSortedArr));
    });
  });
});
