import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import dataModelDisplaySettingsModal from "../../support/components/explore/data-model-display-settings-modal";
import browsePage from "../../support/pages/browse";
import LoginPage from "../../support/pages/login";
import {BaseConcepts} from "../../support/types/base-concepts";
import explorePage from "../../support/pages/explore";

const defaultConceptData = {
  name: BaseConcepts.SHOETYPE,
  semanticConcept: BaseConcepts.SNEAKERS,
  rowKey: `${BaseConcepts.SHOETYPE}-${BaseConcepts.SNEAKERS}`,
  icon: "FaShapes",
  color: {
    HEX: "#EEEFF1",
  }
};
// We must have the same color in rgb and hex because the browser to apply the background changes it to rgb even if the value is passed in hex
// "#F3BEBE" == "rgb(243, 190, 190)"
// "#D1F5E8" == "rgb(238, 239, 241)"
const newConceptData = {
  icon: "FaEmpire",
  color: {
    HEX: "#F3BEBE",
    RGB: "rgb(255, 240, 163)",
  },
  semanticConcept: {
    icon: "FaPagelines",
    color: {
      HEX: "#D1F5E8",
      RGB: "rgb(238, 239, 241)",
    }
  }
};

describe("Entity Type Settings Modal", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);

    cy.log("**Logging into the app as a developer**");
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();

    //Setup hubCentral config for testing
    cy.setupHubCentralConfig();
  });

  beforeEach(() => {
    cy.visit("/");
    cy.log("**Go to Explore section**");
    toolbar.getExploreToolbarIcon().click({force: true});
  });

  it("Open settings modal, check default values, select new ones cancel and check that the defaults values are keep", () => {
    browsePage.waitForSpinnerToDisappear();
    cy.wait(3000);
    cy.log("**Select Graph view and open explore settings modal**");
    browsePage.clickGraphView();
    explorePage.clickExploreSettingsMenuIcon();
    browsePage.getEntityTypeDisplaySettingsButton().scrollIntoView().click({force: true});
    dataModelDisplaySettingsModal.getModalBody().should("be.visible");

    cy.log("**Switch to concepts table clicking on the checkbox**");
    dataModelDisplaySettingsModal.getConceptRadioButtopn().click();

    cy.log("**Change the color and icon to one root concept class**");
    cy.log("**(Concept Class) Verify default color it's selected, select new one and check the selection**");
    dataModelDisplaySettingsModal.getConceptColorButton(defaultConceptData.name).should("have.attr", "data-color").then(color => {
      expect(Cypress._.toLower(color)).equal(Cypress._.toLower(defaultConceptData.color.HEX));
    });
    dataModelDisplaySettingsModal.getConceptColorButton(defaultConceptData.name).click();
    dataModelDisplaySettingsModal.getColorInPicket(newConceptData.color.HEX).click();
    dataModelDisplaySettingsModal.getConceptColorButton(defaultConceptData.name).should("have.attr", "data-color", Cypress._.toLower(newConceptData.color.HEX));

    cy.log("**(Concept Class) Verify default icon it's selected, select new one and check the selection**");
    dataModelDisplaySettingsModal.getConceptIconButtonWrapper(defaultConceptData.name).should("have.attr", "data-icon", defaultConceptData.icon);
    dataModelDisplaySettingsModal.getConceptIconButton(defaultConceptData.name).click();
    dataModelDisplaySettingsModal.getConceptIconSearchInput(defaultConceptData.name).type(newConceptData.icon);
    dataModelDisplaySettingsModal.getConceptIconMenu(defaultConceptData.name).find("svg").last().click();
    dataModelDisplaySettingsModal.getConceptIconButtonWrapper(defaultConceptData.name).should("have.attr", "data-icon", newConceptData.icon);


    cy.log("**Cancel the edition and verify that the modal close**");
    dataModelDisplaySettingsModal.getModalCancelButton().click();
    dataModelDisplaySettingsModal.getModalBody().should("not.exist");

    cy.log("**Reopen the settings modal and check that not was saved the data and are present the default values**");
    browsePage.getEntityTypeDisplaySettingsButton().scrollIntoView().click({force: true});
    dataModelDisplaySettingsModal.getModalBody().should("be.visible");
    cy.log("**Switch to concepts table clicking on the checkbox**");
    dataModelDisplaySettingsModal.getConceptRadioButtopn().click();
    dataModelDisplaySettingsModal.getConceptColorButton(defaultConceptData.name).should("have.attr", "data-color").then(color => {
      expect(Cypress._.toLower(color)).equal(Cypress._.toLower(defaultConceptData.color.HEX));
    });
    dataModelDisplaySettingsModal.getConceptIconButtonWrapper(defaultConceptData.name).should("have.attr", "data-icon", defaultConceptData.icon);

    cy.log("**Close the modal**");
    dataModelDisplaySettingsModal.getModalCloseButton().click();
    dataModelDisplaySettingsModal.getModalBody().should("not.exist");
  });

  it("Open settings modal, select new values and save the changes", () => {
    browsePage.waitForSpinnerToDisappear();
    cy.wait(3000);
    cy.log("**Select Graph view and open explore settings modal**");
    browsePage.clickGraphView();
    explorePage.clickExploreSettingsMenuIcon();
    browsePage.getEntityTypeDisplaySettingsButton().scrollIntoView().click({force: true});
    dataModelDisplaySettingsModal.getModalBody().should("be.visible");

    cy.log("**Switch to concepts table clicking on the checkbox**");
    dataModelDisplaySettingsModal.getConceptRadioButtopn().click();

    cy.log("**Change the color and icon to one root concept class**");
    cy.log("**(Concept Class) Verify default color it's selected, select new one and check the selection**");
    dataModelDisplaySettingsModal.getConceptColorButton(defaultConceptData.name).should("have.attr", "data-color").then(color => {
      expect(Cypress._.toLower(color)).equal(Cypress._.toLower(defaultConceptData.color.HEX));
    });
    dataModelDisplaySettingsModal.getConceptColorButton(defaultConceptData.name).click();
    dataModelDisplaySettingsModal.getColorInPicket(newConceptData.color.HEX).click();
    dataModelDisplaySettingsModal.getConceptColorButton(defaultConceptData.name).should("have.attr", "data-color", Cypress._.toLower(newConceptData.color.HEX));

    cy.log("**(Concept Class) Verify default icon it's selected, select new one and check the selection**");
    dataModelDisplaySettingsModal.getConceptIconButtonWrapper(defaultConceptData.name).should("have.attr", "data-icon", defaultConceptData.icon);
    dataModelDisplaySettingsModal.getConceptIconButton(defaultConceptData.name).click();
    dataModelDisplaySettingsModal.getConceptIconSearchInput(defaultConceptData.name).type(newConceptData.icon);
    dataModelDisplaySettingsModal.getConceptIconMenu(defaultConceptData.name).find("svg").last().click();
    dataModelDisplaySettingsModal.getConceptIconButtonWrapper(defaultConceptData.name).should("have.attr", "data-icon", newConceptData.icon);


    cy.log("**Save the changes**");
    dataModelDisplaySettingsModal.getModalSaveButton().click();
    dataModelDisplaySettingsModal.getModalBody().should("not.exist");

    cy.log("**Reopen the settings modal and check the new values**");
    browsePage.getEntityTypeDisplaySettingsButton().scrollIntoView().click({force: true});
    dataModelDisplaySettingsModal.getModalBody().should("be.visible");
    cy.log("**Switch to concepts table clicking on the checkbox**");
    dataModelDisplaySettingsModal.getConceptRadioButtopn().click();
    dataModelDisplaySettingsModal.getConceptColorButton(defaultConceptData.name).should("have.attr", "data-color", Cypress._.toLower(newConceptData.color.HEX));
    dataModelDisplaySettingsModal.getConceptIconButtonWrapper(defaultConceptData.name).should("have.attr", "data-icon", newConceptData.icon);

    cy.log("**Close the modal**");
    dataModelDisplaySettingsModal.getModalCloseButton().click();
    dataModelDisplaySettingsModal.getModalBody().should("not.exist");
  });
});
