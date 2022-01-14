import {Application} from "../../support/application.config";
import browsePage from "../../support/pages/browse";
import LoginPage from "../../support/pages/login";
import {BaseEntityTypes} from "../../support/types/base-entity-types";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import graphExplore from "../../support/pages/graphExplore";
import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";

/**
 * NOTE: This test will involve all operations related to the specific sidebar, for now it's quiet simple
 * (more functionality will be developed in the future)
 */

describe("Test '/Explore' left sidebar", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);

    cy.log("**Logging into the app as a developer**");
    cy.loginAsDeveloper().withRequest().then(() =>{
      LoginPage.postLogin()
      //Saving Local Storage to preserve session
      cy.saveLocalStorage();
    });
    
    
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    Cypress.Cookies.preserveOnce("HubCentralSession");
    cy.restoreLocalStorage().then(() =>{
      cy.log(`**Go to Explore section**`);
      cy.visit("/tiles/explore");
    });
   
  });

  it("Validate that the left sidebar opens up and closes correctly when un/selecting a base entity", () => {
    cy.log(`**Selecting 'Customer' base entity**`);
    entitiesSidebar.showMoreEntities().click({force:true});
    entitiesSidebar.clickOnBaseEntity(BaseEntityTypes.CUSTOMER);
    browsePage.getSearchField().should("not.exist");
    entitiesSidebar.getEntityTitle(BaseEntityTypes.CUSTOMER).should("be.visible");

    cy.log("**Base entity icon is displayed on the entity icons list**");
    entitiesSidebar.getEntityIconFromList(BaseEntityTypes.CUSTOMER).should("be.visible");

    cy.log("**Returning to main sidebar and confirming it's visible**");
    entitiesSidebar.backToMainSidebarButton.should("be.visible").click();
    browsePage.getSearchField().should("be.visible");
    entitiesSidebar.getEntityTitle(BaseEntityTypes.CUSTOMER).should("not.exist");
  });

  it("Validate search text and applying them over a base entities", () => {
    cy.log("**Selecting Customer entity**");
    browsePage.getGraphView().click();
    entitiesSidebar.clickOnBaseEntity(BaseEntityTypes.CUSTOMER);

    cy.log("**Testing search input**");
    entitiesSidebar.getInputSearch().type("adams");
    entitiesSidebar.getInputSearch().should("have.value", "adams");

    cy.log("****Applying text search**");
    entitiesSidebar.clickOnApplyFacetsButton();
    browsePage.waitForSpinnerToDisappear();
    cy.wait(3000);

    cy.log("**Checking node amount shown**");
    graphExplore.getAllNodes().then((nodes: any) => {
      expect(Object.keys(nodes).length).to.be.equals(2);
    });
  });


  //For now it's skip until BE is integrated and can apply facets over graph
  it.skip("Validate facets on graph view and applying them over a base entities", () => {
    cy.log("**Testing checkbox facet**");
    entitiesSidebar.clickFacetCheckbox("Adams Cole");
    entitiesSidebar.getFacetCheckbox("Adams Cole").should("be.checked");
    entitiesSidebar.clickOnApplyFacetsButton();

    browsePage.waitForSpinnerToDisappear();
    cy.wait(3000);

    cy.log("**Checking node amount shown**");
    graphExplore.getAllNodes().then((nodes: any) => {
      expect(Object.keys(nodes).length).to.be.equals(2);
    });
  });

  it("Validate facets on table view and applying them over a base entities", () => {
    cy.log("**Opening table view**");
    browsePage.getTableView().click();

    cy.log("**Checking facet is selected**");
    entitiesSidebar.clickFacetCheckbox("Adams Cole");
    entitiesSidebar.getFacetCheckbox("Adams Cole").should("be.checked");
    browsePage.getGreySelectedFacets("Adams Cole").should("exist");

    cy.log("**Applying facet**");
    entitiesSidebar.clickOnApplyFacetsButton();
    browsePage.getAppliedFacets("Adams Cole").should("exist");

    cy.log("**Checking table rows amount shown**");
    browsePage.getHCTableRows().should("have.length", 2);

    cy.log("**Testing date facet**");
    entitiesSidebar.getDateFacet().should("have.text", "birthDate");
    entitiesSidebar.selectDateRange({time: "facet-datetime-picker-date"});
    entitiesSidebar.getDateFacet().should("not.be.empty");
    entitiesSidebar.backToMainSidebarButton.should("be.visible").click();
  });

  it("Searching main search side panel", () => {
    cy.log("Typing Adams in search bar and click on apply facets");
    entitiesSidebar.getMainPanelSearchInput().type("Adams");
    entitiesSidebar.getApplyFacetsButton().click();
    browsePage.waitForSpinnerToDisappear();

    cy.log("Verifying the results in table view");
    browsePage.getTableViewResults("Customer-102");
    browsePage.getTableViewResults("Customer-103");

    cy.log("Verifying the results in snippet view");
    browsePage.getSnippetView().click();
    browsePage.getSnippetViewResults("Customer-102").should("be.visible");
    browsePage.getSnippetViewResults("Customer-103").should("be.visible");

    cy.log("Switch to graph view and verify search summary is visible");
    browsePage.clickGraphView().click();
    browsePage.getGraphSearchSummary().should("have.length.gt", 0);

    cy.log("Find and click on Customer-102 node");
    graphExplore.focusNode(ExploreGraphNodes.CUSTOMER_102);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true});
    });

    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true});
    });

    browsePage.getDetailViewURI("/json/customers/Cust2.json").should("be.visible");
    entitiesSidebar.clickOnApplyFacetsButton();
    browsePage.getHCTableRows().should("have.length", 0);
    entitiesSidebar.clickOnClearFacetsButton();
    entitiesSidebar.backToMainSidebarButton.click();
    browsePage.waitForHCTableToLoad();
  });

  it("Searching text on related entities", () => {
    cy.log("**Selecting Order entity**");
    //TODO: Bug: The page renders twice, so waiting for the spinner does not work.
    cy.wait(3000);
    browsePage.selectBaseEntity("Order");
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.clickOnRelatedEntity("Person");

    cy.log("**Testing search input**");
    entitiesSidebar.getInputSearch().type("Alice");
    entitiesSidebar.getInputSearch().should("have.value", "Alice");
    entitiesSidebar.clickOnApplyFacetsButton();

    cy.log("**Checking table rows amount shown**");
    browsePage.getHCTableRows().should("have.length", 1);
    entitiesSidebar.clickOnClearFacetsButton();
    entitiesSidebar.getInputSearch().should("have.value", "");
    browsePage.getHCTableRows().should("have.length.greaterThan", 1);
  });
});
