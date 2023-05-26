import entitiesSidebar from "../../support/pages/entitiesSidebar";
import graphExplore from "../../support/pages/graphExplore";
import browsePage from "../../support/pages/browse";
import detailPage from "../../support/pages/detail";

describe("Navigation through all the Explore views (Table, Snippet, Graph and Details)", () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
  });

  beforeEach(() => {
    cy.log("**Navigate to Explore**");
    cy.loginAsDeveloper().withRequest();
    browsePage.navigate();
    browsePage.getClearAllFacetsButton().then(($ele) => {
      if ($ele.is(":enabled")) {
        cy.log("**clear all facets**");
        browsePage.getClearAllFacetsButton().click();
        browsePage.waitForSpinnerToDisappear();
      }
    });
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
    browsePage.waitForSpinnerToDisappear();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  it("Switch views and validate they get updated correctly", () => {
    cy.log("**Select Table view and validate it switches correctly**");
    browsePage.clickTableView();
    graphExplore.getGraphVisCanvas().should("not.exist");
    browsePage.getSnippetViewResult().should("not.exist");
    browsePage.getTotalDocuments().should("exist").should("be.greaterThan", 25);

    cy.log("**Go to Snippet View**");
    browsePage.clickSnippetView();
    graphExplore.getGraphVisCanvas().should("not.exist");
    browsePage.getHCTableRows().should("not.exist");
    browsePage.getSnippetViewResult().should("be.visible");

    cy.log("**Go to graph view**");
    browsePage.clickGraphView();
    graphExplore.getGraphVisCanvas().should("be.visible");
    graphExplore.stopStabilization();
    browsePage.getSnippetViewResult().should("not.exist");
    browsePage.getHCTableRows().should("not.exist");
  });

  it("Switch views, go to details and back", () => {
    cy.log("**Go to Snippet View**");
    browsePage.clickSnippetView();
    browsePage.getSnippetViewResult().should("be.visible");

    cy.log("**Click on source icon in first row and check in details page that source tab icon should be active**");
    browsePage.getSourceViewIcon().first().click();
    detailPage.getInstanceView().should("not.have.class", "active");
    detailPage.getSourceView().should("have.class", "active");
    detailPage.getMetadataView().should("not.have.class", "active");

    cy.log("**Click back button and check in explore view that snippet tab icon should be active**");
    detailPage.clickBackButton();
    browsePage.viewSelector("graph").prev().should("not.be.checked");
    browsePage.viewSelector("table").prev().should("not.be.checked");
    browsePage.viewSelector("snippet").prev().should("be.checked");

    cy.log("**Switch to table view**");
    browsePage.clickTableView();
    browsePage.waitForSpinnerToDisappear();

    cy.log("**Click on instance icon in first row and check in details page that instance tab icon should be active**");
    browsePage.getInstanceViewIcon().first().click();
    detailPage.getInstanceView().should("have.class", "active");
    detailPage.getSourceView().should("not.have.class", "active");
    detailPage.getMetadataView().should("not.have.class", "active");

    cy.log("**Click back button and check in explore view that table tab icon should be active**");
    detailPage.clickBackButton();
    browsePage.viewSelector("graph").prev().should("not.be.checked");
    browsePage.viewSelector("table").prev().should("be.checked");
    browsePage.viewSelector("snippet").prev().should("not.be.checked");
  });

  it("Remove alert stabilize nodes", () => {
    browsePage.waitForSpinnerToDisappear();
    graphExplore.getGraphVisCanvas().should("be.visible");

    cy.log("Remove Alert");
    cy.findByText("The graph stabilization process causes the graph nodes to move automatically. To skip this process and view a static configuration, toggle OFF “Physics animation”.");
    cy.findByLabelText("Close-alert").click();
    cy.findAllByText("The graph stabilization process causes the graph nodes to move automatically. To skip this process and view a static configuration, toggle OFF “Physics animation”.").should("not.exist");

    cy.log("**Go to another view and check the alert is not present**");
    cy.findByLabelText("title-link").click();
    cy.log("**Go to Explore section**");
    browsePage.navigate();
    graphExplore.getGraphVisCanvas().should("be.visible");
    cy.wait(5000);
    browsePage.waitForSpinnerToDisappear();
    cy.findAllByText("The graph stabilization process causes the graph nodes to move automatically. To skip this process and view a static configuration, toggle OFF “Physics animation”.").should("not.exist");

    cy.log("**Clear local store and check the message appears**");
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.loginAsDeveloperV2().withRequest();
    browsePage.navigate();
    graphExplore.getGraphVisCanvas().should("be.visible");
    cy.wait(5000);
    browsePage.waitForSpinnerToDisappear();
    cy.findAllByText("The graph stabilization process causes the graph nodes to move automatically. To skip this process and view a static configuration, toggle OFF “Physics animation”.");
  });
});
