/// <reference types="cypress"/>

import modelPage from "../../support/pages/model";
import {
  graphViewSidePanel,
  graphView,
  conceptClassModal
} from "../../support/components/model/index";
import {confirmationModal, toolbar} from "../../support/components/common/index";
import {Application} from "../../support/application.config";
import {ConfirmationType} from "../../support/types/modeling-types";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";
import graphVis from "../../support/components/model/graph-vis";

describe("Concept classes in Modeling screen", () => {
  //Scenarios: create, edit, and save a new concept class, edit concept class description, duplicate concept class name check
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
    LoginPage.postLogin();

    //Setup hubCentral config for testing
    cy.setupHubCentralConfig();

    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.resetTestUser();
  });
  it("Create and verify new concept class", {defaultCommandTimeout: 120000}, () => {
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    cy.wait(5000);
    graphView.getAddButton().click();
    graphView.getAddConceptClassOption().should("be.visible").click({force: true});
    conceptClassModal.newConceptClassName("ShoeStyle");
    conceptClassModal.newConceptClassDescription("Different categories of shoe styles.");
    cy.waitUntil(() => conceptClassModal.getAddButton().click());
    conceptClassModal.getAddButton().should("not.exist");

    cy.wait(5000);
    cy.log("**View and edit concept class in the side panel**");
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let shoeStyleCoordinates: any = nodePositions["ShoeStyle"];
      cy.wait(150);
      graphVis.getGraphVisCanvas().trigger("mouseover", shoeStyleCoordinates.x, shoeStyleCoordinates.y, {force: true}).click(shoeStyleCoordinates.x, shoeStyleCoordinates.y, {force: true});
      // side panel heading shows concept name and info
    });
    graphViewSidePanel.getSelectedConceptClassHeading("ShoeStyle").should("exist");
    graphViewSidePanel.getSelectedConceptClassHeadingInfo("ShoeStyle").should("exist");
    graphViewSidePanel.getConceptClassDescription().should("be.visible");
    graphViewSidePanel.getConceptClassDescription().should("have.value", "Different categories of shoe styles.");

    modelPage.toggleColorSelector("ShoeStyle");
    modelPage.selectColorFromPicker("#D5D3DD").click();
    if (Cypress.isBrowser("!firefox")) {
      graphViewSidePanel.getConceptClassColor("ShoeStyle").should("have.css", "background", "rgb(213, 211, 221) none repeat scroll 0% 0% / auto padding-box border-box");
    }
    if (Cypress.isBrowser("firefox")) {
      graphViewSidePanel.getConceptClassColor("ShoeStyle").should("have.css", "background-color", "rgb(213, 211, 221)");
    }

    modelPage.openIconSelector("ShoeStyle");
    modelPage.selectIcon("ShoeStyle", "FaAccessibleIcon");
    modelPage.getIconSelected("ShoeStyle", "FaAccessibleIcon").should("exist");
    graphViewSidePanel.closeSidePanel();
    graphViewSidePanel.getSelectedConceptClassHeading("ShoeStyle").should("not.exist");

    cy.log("**Verify duplicate concept name error**");
    graphView.getAddButton().click();
    graphView.getAddConceptClassOption().should("be.visible").click({force: true});
    conceptClassModal.newConceptClassName("ShoeStyle");
    cy.waitUntil(() => conceptClassModal.getAddButton().click());
    cy.waitUntil(() => conceptClassModal.conceptClassNameError().should("exist"));
    conceptClassModal.getCancelButton().click();
  });

  it("Delete a concept class from graph view and publish the changes", {defaultCommandTimeout: 120000}, () => {
    // the graph needs to stabilize before we interact with it
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    modelPage.scrollPageBottom();
    cy.wait(6000);
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let shoeStyleCoordinates: any = nodePositions["ShoeStyle"];
      cy.wait(150);
      cy.waitUntil(() => graphVis.getGraphVisCanvas().click(shoeStyleCoordinates.x, shoeStyleCoordinates.y, {force: true}));
    });
    cy.wait(1500);

    graphViewSidePanel.getDeleteIcon("ShoeStyle").scrollIntoView().click({force: true});
    confirmationModal.getYesButton(ConfirmationType.DeleteConceptClass);
    confirmationModal.getDeleteConceptClassText().should("not.exist");
    cy.waitForAsyncRequest();
    graphViewSidePanel.getSelectedConceptClassHeading("ShoeStyle").should("not.exist");
    cy.wait(150);
    //Publish the changes
    cy.publishDataModel();
  });

});