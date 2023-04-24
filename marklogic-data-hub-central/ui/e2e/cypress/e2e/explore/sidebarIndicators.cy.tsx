import {BaseEntityTypes} from "../../support/types/base-entity-types";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import explorePage from "../../support/pages/explore";
import browsePage from "../../support/pages/browse";

describe("Test sidebar indicators", () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
  });

  beforeEach(() => {
    cy.log(`**Go to Explore section**`);
    cy.visit("/tiles/explore");
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.log("**Logging into the app as a developer**");
    cy.loginAsDeveloper().withRequest();
    cy.log(`**Go to Explore section**`);
    cy.visit("/tiles/explore");
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("On select entity specific facet should show the active filters when back to sidebar", () => {
    cy.log(`**Selecting 'Customer' base entity**`);
    cy.wait(2000);
    entitiesSidebar.showMoreEntities().should("be.visible").click({force: true});

    cy.log("**Check the existence of the filter and quantity indicator bar**");
    entitiesSidebar.getEntityFacetFilterQuantity(BaseEntityTypes.CUSTOMER).should("be.visible");
    entitiesSidebar.getEntityFacetAmountBar(BaseEntityTypes.CUSTOMER).should("be.visible");

    cy.log("**Open specific sidebar**");
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);
    explorePage.getSearchField().should("not.exist");
    entitiesSidebar.getEntityTitle(BaseEntityTypes.CUSTOMER).should("be.visible");

    cy.log("**Testing checkbox facet**");
    entitiesSidebar.clickFacetCheckbox("Adams Cole");
    entitiesSidebar.getFacetCheckbox("Adams Cole").should("be.checked");
    entitiesSidebar.clickOnApplyFacetsButton();

    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();

    cy.log("**Base entity icon is displayed on the entity icons list**");
    entitiesSidebar.getEntityIconFromList(BaseEntityTypes.CUSTOMER).should("be.visible");

    cy.log("**Returning to main sidebar and confirming it's visible**");
    entitiesSidebar.backToMainSidebar();
    explorePage.getSearchField().should("be.visible");
    entitiesSidebar.getEntityTitle(BaseEntityTypes.CUSTOMER).should("not.exist");
    entitiesSidebar.showMoreEntities().should("be.visible").click({force: true});
    entitiesSidebar.getEntityFacetFilterQuantity(BaseEntityTypes.CUSTOMER).should("contain", "(1 filter)");
    entitiesSidebar.getEntityFacetFilterQuantity(BaseEntityTypes.CUSTOMER).should("contain", "2");
  });
});
