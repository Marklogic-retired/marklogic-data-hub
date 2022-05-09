import landingPage from "../support/pages/landing";
import searchPage from "../support/pages/search";
import recordeDetailsPage from "../support/pages/recordDetails";

let source1="";
let source2="";
let sourceCount="";
let status="";
let statusCount="";
let country="";
let countryCount="";
let createdDate="";
let startVal;
let endVal;

describe("Widget Validations ", () => {
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
  });
  it("Validate Initial search results ", () => {
    searchPage.searchButton().click();
    searchPage.resultsList().should("be.visible");
    searchPage.selectPageSizeOption("10 / page");
    searchPage.resultsList().should("be.visible");
    searchPage.summaryMeterMin().invoke("text").should("eq", "0");
    searchPage.summaryMeterMax().invoke("text").then(maxVal => {
      searchPage.summaryMeterVal().invoke("text").should("eq", maxVal);
      cy.contains("Showing 1-10 of " + maxVal + " results");
    });
  });
  it("Click on serach button for navigating to search page and get widget values", () => {
    searchPage.getFacetLabel(2, 0).then(sourcesVal => {
      source1 = sourcesVal.text();
    });
    searchPage.getFacetCount(2, 0).then(countVal => {
      sourceCount = countVal.text();
    });
    searchPage.getFacetLabel(2, 1).then(sourcesVal => {
      source2 = sourcesVal.text();
    });
    searchPage.getFacetLabel(3, 0).then(statusVal => {
      status = statusVal.text();
    });
    searchPage.getFacetCount(3, 0).then(countVal => {
      statusCount = countVal.text();
    });
    searchPage.getFacetLabel(4, 0).then(countriesVal => {
      country = countriesVal.text();
    });
    searchPage.getFacetCount(4, 0).then(countVal => {
      countryCount = countVal.text();
    });
    searchPage.createdOn().eq(0).then(dateVal => {
      createdDate = dateVal.text().split(" ")[2];
      cy.log(createdDate);
    });
  });
  it("Validate Source Widget ", () => {
    searchPage.getFacetMeter("meter-sources", source1).should("have.attr", "style").and("contain", "background-color: rgb(223, 223, 223)");
    searchPage.clickFacet("sources", source1);
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.getFacetMeter("meter-sources", source1).should("have.attr", "style").and("contain", "background-color: rgb(26, 204, 168)");
    searchPage.summaryMeterVal().invoke("text").should("eq", sourceCount);
    cy.contains("Showing 1-10 of " + sourceCount + " results");
    searchPage.getBadge().invoke("text").should("contain", source1);
    searchPage.getAllCategories().each((item) => {
      expect(item.text()).to.contain(source1);
    });
    searchPage.clickFacet("sources", source1);
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
  });
  it("Validate Status Widget ", () => {
    searchPage.getFacetMeter("meter-status", status).should("have.attr", "style").and("contain", "background-color: rgb(223, 223, 223)");
    searchPage.clickFacet("status", status);
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.getFacetMeter("meter-status", status).should("have.attr", "style").and("contain", "background-color: rgb(26, 204, 168)");
    searchPage.summaryMeterVal().invoke("text").should("eq", statusCount);
    cy.contains("Showing 1-10 of " + statusCount + " results");
    searchPage.getBadge().invoke("text").should("contain", status);
    searchPage.resultStatus().each((item) => {
      expect(item).to.contain.text(status);
    });
    searchPage.clickFacet("status", status);
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
  });
  it("Validate Contries Widget ", () => {
    searchPage.getFacetMeter("meter-country", country).should("have.attr", "style").and("contain", "background-color: rgb(223, 223, 223)");
    searchPage.clickFacet("country", country);
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.getFacetMeter("meter-country", country).should("have.attr", "style").and("contain", "background-color: rgb(26, 204, 168)");
    searchPage.summaryMeterVal().invoke("text").should("eq", countryCount);
    searchPage.getBadge().invoke("text").should("contain", country);
    searchPage.resultTitle().each((item, i) => {
      searchPage.resultTitle().eq(i).click({force: true});
      cy.contains(country).should("be.visible");
      recordeDetailsPage.backToSearch().click({force:true});
      searchPage.resultsList().should("be.visible");
    });
    searchPage.clickFacet("country", country);
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.getBadge().should("not.exist");
  });
  it("Validate Multiple Source Widget ", () => {
    searchPage.clickFacet("sources", source1);
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.clickFacet("sources", source2);
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.getFacetMeter("meter-sources", source1).should("have.attr", "style").and("contain", "background-color: rgb(26, 204, 168)");
    searchPage.getFacetMeter("meter-sources", source2).should("have.attr", "style").and("contain", "background-color: rgb(26, 204, 168)");
    searchPage.getBadge().invoke("text").should("contain", source1).and("contain", source2);
    searchPage.getAllCategories().each((item) => {
      if (item.text().includes(source1)) {
        console.log("found source1");
      } else if (item.text().includes(source2)) {
        console.log("found source2");
      } else {
        console.log(item.text());
        throw ("cannot find source1 or source2");
      }
    });
    searchPage.removeFacet("sources", source1);
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.getBadge().invoke("text").should("contain", source2);
    searchPage.getAllCategories().eq(0).invoke("text").should("contain", source2, {timeout: 10000});
    searchPage.getAllCategories().each((item) => {
      expect(item.text()).to.contain(source2);
    });
    searchPage.removeFacet("sources", source2);
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.getBadge().should("not.exist");
  });
  it("Validate show more widget links ", () => {
    searchPage.getMore().then($moreVal => {
      if ($moreVal.is(":visible")) {
        let temp = $moreVal.text().split(" ")[0];
        searchPage.getMore().eq(0).parent(".facetValues").find(".facetValue").then($value => {
          let facetCount = $value.length;
          let totalCount = +facetCount + +temp;
          searchPage.getMore().eq(0).click();
          searchPage.getMore().eq(0).parent(".facetValues").find(".facetValue").should("have.length", totalCount);
        });
      } else {
        cy.log("There are no hidden facets");
      }
    });
  });
  it("Validate Created Date Widget ", () => {
    searchPage.datePicker().eq(0).click();
    searchPage.showCalendar().eq(0).should("be.visible");
    searchPage.datePickerCal().eq(0).click();
    searchPage.showCalendar().eq(0).should("not.be.visible");
    searchPage.datePickerCal().eq(0).click();
    let startDate = new Date(createdDate).toLocaleString("en-us", {month: "short", year: "numeric"});
    let endDate = new Date().toLocaleString("en-us", {month: "short", year: "numeric"});
    cy.log(startDate);
    cy.log(endDate);
    const reClickStartDate = () => {
      searchPage.getMonth().eq(0).invoke("text").then(startMonth => {
        cy.log("startMonth "+startMonth);
        cy.log("startDate "+startDate);
        if (startMonth === startDate) {
          searchPage.selectStartDate().eq(0).click();
          return;
        }
        searchPage.prevMonthClick();
        reClickStartDate();
      });
    };
    const reClickEndDate = () => {
      searchPage.getMonth().eq(1).invoke("text").then(endMonth => {
        if (endMonth === endDate) {
          searchPage.selectEndDate().eq(0).click();
          return;
        }
        searchPage.nextMonthClick();
        reClickEndDate();
      });
    };
    reClickStartDate();
    reClickEndDate();
    searchPage.getBadgeDate().invoke("text").then(range => {
      cy.log("range "+range);
      startVal = new Date(range.split(" ")[0].trim());
      endVal = new Date(range.split(" ")[2].trim());
    });
    searchPage.resultsList().then(results => {
      if (results.is(":visible")) {
        searchPage.createdOn().each((item) => {
          let result = new Date(item.text().split(" ")[2]);
          expect(result).to.be.gte(startVal);
          expect(result).to.be.lte(endVal);
        });
      } else {
        cy.log("There are no records created between given dates");
      }
    });
  });
});
