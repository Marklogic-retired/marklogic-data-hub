import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import browsePage from "../../support/pages/browse";
import LoginPage from "../../support/pages/login";

const entity: string = "Order";

describe("Test table export icon", () => {
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

  it("Validate that the export icon appear only when an entity is selected", () => {
    cy.log("**Go to Explore section**");
    toolbar.getExploreToolbarIcon().click();

    cy.log("**Export button should not exist in snippet, graph and table view**");
    browsePage.clickFacetView();
    browsePage.getDataExportIcon().should("not.exist");
    browsePage.clickTableView();
    browsePage.getDataExportIcon().should("not.exist");
    browsePage.clickTableView();
    browsePage.getDataExportIcon().should("not.exist");

    cy.log("**Export button should appear when select an entity**");
    browsePage.selectBaseEntity(entity);
    browsePage.waitForSpinnerToDisappear();
    browsePage.getDataExportIcon().should("be.visible");

    cy.log("**Export button should disappear when deselect an entity**");
    browsePage.removeBaseEntity(entity);
    browsePage.getDataExportIcon().should("not.exist");
  });
});