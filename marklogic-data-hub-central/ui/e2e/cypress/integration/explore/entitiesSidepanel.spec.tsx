import {Application} from "../../support/application.config";
import browsePage from "../../support/pages/browse";
import {toolbar} from "../../support/components/common";
import LoginPage from "../../support/pages/login";
import {BaseEntityTypes} from "../../support/types/base-entity-types";
import entitiesSidebar from "../../support/pages/entitiesSidebar";

/**
 * NOTE: This test will involve all operations related to the specific sidebar, for now it's quiet simple
 * (more functionality will be developed in the future)
 */

describe("Test '/Explore' left sidebar", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);

    cy.log("**Logging into the app as a developer**");
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    Cypress.Cookies.preserveOnce("HubCentralSession");
    cy.restoreLocalStorage();
  });
  it("Validate that the left sidebar opens up and closes correctly when un/selecting a base entity", () => {
    cy.log(`**Go to Explore section?**`);
    toolbar.getExploreToolbarIcon().click();

    cy.log(`**Selecting 'Address' base entity**`);
    entitiesSidebar.clickOnBaseEntity(BaseEntityTypes.ADDRESS);
    browsePage.getSearchField().should("not.exist");
    entitiesSidebar.getEntityTitle(BaseEntityTypes.ADDRESS).should("be.visible");

    cy.log("**Base entity icon is displayed on the entity icons list**");
    entitiesSidebar.getEntityIconFromList(BaseEntityTypes.ADDRESS).should("be.visible");

    cy.log("**Returning to main sidebar and confirming it's visible**");
    entitiesSidebar.backToMainSidebarButton.should("be.visible").click();
    browsePage.getSearchField().should("be.visible");
    entitiesSidebar.getEntityTitle(BaseEntityTypes.ADDRESS).should("not.exist");
  });
});