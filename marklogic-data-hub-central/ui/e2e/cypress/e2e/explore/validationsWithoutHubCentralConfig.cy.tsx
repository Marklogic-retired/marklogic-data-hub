import explorePage from "../../support/pages/explore";
import browsePage from "../../support/pages/browse";
import "cypress-wait-until";

describe("Create and Edit Mapping Steps with Parameter Module Path", () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();

    cy.log("**Deleting hubCentralConfig file in FINAL**");
    cy.deleteFiles("FINAL", "/config/hubCentral.json");

    cy.log("**Deleting hubCentralConfig file in STAGING**");
    cy.deleteFiles("STAGING", "/config/hubCentral.json");
  });

  beforeEach(() => {
    cy.visit("/tiles/explore");
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  after(() => {
    // Visiting Modeling so hubCentralConfig file gets created again
    cy.visit("/tiles/model");
  });

  // This scenario it's when you load a project for the first time, and haven't visited Model's
  // page yet. And go directly to Explore page.
  it("Validate Data Model Display Settings when hubCentralConfig file does not exist", () => {
    cy.log("**Go to Data Model Display Settings**");
    browsePage.waitForSpinnerToDisappear();
    explorePage.clickExploreSettingsMenuIcon();
    explorePage.getEntityTypeDisplaySettingsDropdown("Data model display settings").should("be.visible").click();

    cy.log("**Confirm the entity settings table it's not empty and you can make modifications**");
    explorePage.getEntityTypeFromTable("BabyRegistry").should("exist");
    explorePage.getIconSelector("BabyRegistry").should("be.visible").click();
    explorePage.getIcon("FaAndroid").should("exist").click();
    explorePage.getCurrentIcon("FaAndroid").should("exist");
  });
});