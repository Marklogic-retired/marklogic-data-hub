import {Application} from "../../support/application.config";
import browsePage from "../../support/pages/browse";
import LoginPage from "../../support/pages/login";
import {BaseEntityTypes} from "../../support/types/base-entity-types";
import entitiesSidebar from "../../support/pages/entitiesSidebar";

describe("Test sidebar indicators", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);

    cy.log("**Logging into the app as a developer**");
    cy.loginAsDeveloper().withRequest().then(() => {
      LoginPage.postLogin();
      //Saving Local Storage to preserve session
      cy.saveLocalStorage();
    });
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage().then(() => {
      cy.log(`**Go to Explore section**`);
      cy.visit("/tiles/explore");
    });

  });

  it("On select entity specific facet should show the active filters when back to sidebar", () => {
    cy.log(`**Selecting 'Customer' base entity**`);
    cy.wait(2000);
    entitiesSidebar.showMoreEntities().click({force: true});

    cy.log("**Check the existence of the filter and quantity indicator bar**");
    entitiesSidebar.getEntityFacetFilterQuantity(BaseEntityTypes.CUSTOMER).should("be.visible");
    entitiesSidebar.getEntityFacetAmountBar(BaseEntityTypes.CUSTOMER).should("be.visible");

    cy.log("**Open specific sidebar**");
    entitiesSidebar.openBaseEntityFacets(BaseEntityTypes.CUSTOMER);
    browsePage.getSearchField().should("not.exist");
    entitiesSidebar.getEntityTitle(BaseEntityTypes.CUSTOMER).should("be.visible");

    cy.log("**Testing checkbox facet**");
    entitiesSidebar.clickFacetCheckbox("Adams Cole");
    entitiesSidebar.getFacetCheckbox("Adams Cole").should("be.checked");
    entitiesSidebar.clickOnApplyFacetsButton();

    browsePage.waitForSpinnerToDisappear();

    cy.log("**Base entity icon is displayed on the entity icons list**");
    entitiesSidebar.getEntityIconFromList(BaseEntityTypes.CUSTOMER).should("be.visible");

    cy.log("**Returning to main sidebar and confirming it's visible**");
    entitiesSidebar.backToMainSidebar();
    browsePage.getSearchField().should("be.visible");
    entitiesSidebar.getEntityTitle(BaseEntityTypes.CUSTOMER).should("not.exist");

    entitiesSidebar.getEntityFacetFilterQuantity(BaseEntityTypes.CUSTOMER).should("contain", "(1 filter)");
    entitiesSidebar.getEntityFacetFilterQuantity(BaseEntityTypes.CUSTOMER).should("contain", "2");
  });
});
