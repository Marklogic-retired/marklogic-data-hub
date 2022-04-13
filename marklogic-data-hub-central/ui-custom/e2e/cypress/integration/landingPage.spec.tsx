import landingPage from "../support/pages/landing";
import searchPage from "../support/pages/search";

describe("Visit Entity Viewer Landing page", () => {
  it("Greets with Entity Viewer title", () => {
    cy.visit("/");
    cy.title().should("eq", "Entity Viewer");
    landingPage.dashboard().should("be.visible");
    landingPage.whatsNewChart().should("be.visible",{timeout:5000});
  });
  it("Validate the Header Menus", () => {
    landingPage.menuOptions().eq(0).should("be.visible");
    landingPage.menuOptions().eq(1).should("be.visible").should("have.attr", "href", "http://www.marklogic.com");
    landingPage.subMenu().click();
    landingPage.subMenuMlDocs().should("be.visible").should("have.attr", "href", "https://docs.marklogic.com/");

    cy.log("***Clicking on search sub menu option to validate the navigation to Search page***");
    landingPage.subMenuSearch().scrollIntoView().click("topLeft");
    searchPage.summaryMeter().should("exist");
    landingPage.entityViewerTitle().click();
    landingPage.dashboard().should("be.visible");
    searchPage.menuSearchBox().should("exist");
    searchPage.menuEntityDropdown().should("exist");

    cy.log("***Clicking on searchMenu to validate the navigation to Search page***");
    landingPage.menuOptions().eq(0).click();
    searchPage.summaryMeter().should("exist");
    landingPage.entityViewerTitle().click();
    landingPage.dashboard().should("be.visible");
  });
  it("Validate the Metrics section", () => {
    cy.contains("New entities this week");
    cy.contains("Sources added this week");
    cy.contains("Tasks created today");
    cy.contains("Activities unassigned");
  });
  it("Validate the default sections are displayed", () => {
    cy.contains("New Search");
    cy.contains("Recent Searches");
    cy.contains("What's New with Entities");
    cy.contains("Recently Visited");
  });
});
