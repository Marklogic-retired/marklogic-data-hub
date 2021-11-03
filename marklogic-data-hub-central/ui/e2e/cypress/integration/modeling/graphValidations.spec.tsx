/// <reference types="cypress"/>

import modelPage from "../../support/pages/model";
import {
  entityTypeTable,
  graphViewSidePanel,
} from "../../support/components/model/index";
import {confirmationModal, toolbar} from "../../support/components/common/index";
import {Application} from "../../support/application.config";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";
import graphVis from "../../support/components/model/graph-vis";
import {ConfirmationType} from "../../support/types/modeling-types";

describe("Graph Validations", () => {
  //Setup hubCentral config for testing
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
    cy.setupHubCentralConfig();
    cy.waitForAsyncRequest();
  });
  //login with valid account
  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => toolbar.getModelToolbarIcon().should("have.length.gt", 0)).click({force: true});
    cy.wait(3000);
    cy.waitForAsyncRequest();
    modelPage.selectView("table");
    cy.wait(1000);
    entityTypeTable.waitForTableToLoad();
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("can view and edit Entity Type tab in side panel", {defaultCommandTimeout: 120000}, () => {
    entityTypeTable.viewEntityInGraphView("Person");
    graphViewSidePanel.getEntityTypeTab().click();
    graphViewSidePanel.getEntityDescription().should("be.visible");
    cy.publishEntityModel();
    modelPage.getEntityModifiedAlert().should("not.exist");
    modelPage.getPublishButton().should("not.be.enabled");

    graphViewSidePanel.getEntityDescription().clear();
    graphViewSidePanel.getEntityNamespace().clear();
    graphViewSidePanel.getEntityPrefix().clear();

    graphViewSidePanel.getEntityDescription().clear();
    graphViewSidePanel.getEntityNamespace().clear();
    graphViewSidePanel.getEntityPrefix().clear();
    graphViewSidePanel.getEntityDescription().type("test description");
    graphViewSidePanel.getEntityNamespace().click();
    modelPage.getEntityModifiedAlert().should("exist");
    modelPage.getPublishButton().should("be.enabled");
    graphViewSidePanel.getEntityNamespace().type("test");
    graphViewSidePanel.getEntityDescription().click();
    cy.findByText("Since you entered a namespace, you must specify a prefix.").should("be.visible");
    graphViewSidePanel.getEntityPrefix().type("pre");
    graphViewSidePanel.getEntityDescription().click();
    cy.findByText("Invalid model: Namespace property must be a valid absolute URI. Value is test.").should("be.visible");
    graphViewSidePanel.getEntityDescription().clear();
    graphViewSidePanel.getEntityNamespace().type("http://example.org/test");
    graphViewSidePanel.getEntityDescription().click();
    cy.findByText("Invalid model: Namespace property must be a valid absolute URI. Value is test.").should("not.exist");
    graphViewSidePanel.getEditEntityTypeColor().click();
    graphViewSidePanel.selectColorFromPicker("#D5D3DD").click();
    if (Cypress.isBrowser("!firefox")) {
      graphViewSidePanel.getEntityTypeColor("Person").should("have.css", "background", "rgb(213, 211, 221) none repeat scroll 0% 0% / auto padding-box border-box");
    }
    if (Cypress.isBrowser("firefox")) {
      graphViewSidePanel.getEntityTypeColor("Person").should("have.css", "background-color", "rgb(213, 211, 221)");
    }
  });

  it("can filter and select entity type in graph view", {defaultCommandTimeout: 120000}, () => {
    modelPage.selectView("project-diagram");
    graphViewSidePanel.getSelectedEntityHeading("BabyRegistry").should("not.exist");
    //Enter First 3+ characters to select option from dropdown
    graphViewSidePanel.getGraphViewFilterInput().type("Bab");
    graphViewSidePanel.selectEntityDropdown();
    //Verify the side panel content for selected entity
    graphViewSidePanel.getSelectedEntityHeading("BabyRegistry").should("exist");
    graphViewSidePanel.getPropertiesTab().should("exist");
    graphViewSidePanel.getEntityTypeTab().should("exist");
    graphViewSidePanel.getDeleteIcon("BabyRegistry").should("exist");
  });

  it("can center on entity type in graph view", {defaultCommandTimeout: 120000}, () => {
    modelPage.selectView("project-diagram");
    cy.wait(500);
    graphVis.getPositionsOfNodes("Person").then((nodePositions: any) => {
      let personCoordinates: any = nodePositions["Person"];
      graphVis.getGraphVisCanvas().trigger("mouseover", personCoordinates.x, personCoordinates.y);
    });
    cy.wait(500);

    graphVis.getPositionsOfNodes("Person").then((nodePositions: any) => {
      let personCoordinates: any = nodePositions["Person"];
      cy.wait(150);
      graphVis.getGraphVisCanvas().rightclick(personCoordinates.x, personCoordinates.y);
      graphVis.getGraphVisCanvas().rightclick(personCoordinates.x, personCoordinates.y);
    });

    cy.wait(500);
    graphVis.getCenterOnEntityTypeOption("Person").trigger("mouseover").click();

    let centeredPersonX: any;
    let centeredPersonY: any;

    graphVis.getPositionsOfNodes("Person").then((nodePositions: any) => {
      centeredPersonX = nodePositions["Person"].x;
      centeredPersonY = nodePositions["Person"].y;

      //Person entity coordinates should be within the center of canvas
      expect(centeredPersonX).to.be.greaterThan(700);
      expect(centeredPersonX).to.be.lessThan(800);
      expect(centeredPersonY).to.be.greaterThan(300);
      expect(centeredPersonY).to.be.lessThan(400);
    });
  });

  it("can select all available nodes in graph view, locations persist", () => {
    let ids = ["BabyRegistry", "Client", "Customer", "Order", "Person"];
    let savedCoords: any = {};
    modelPage.selectView("project-diagram");

    // Select each entity node using retrieved coords
    ids.forEach(id => {
      graphVis.getPositionsOfNodes(id).then((nodePositions: any) => {
        let coords: any = nodePositions[id];
        savedCoords[id] = {x: coords.x, y: coords.y};
      });
    });

    // Exit graph view and return
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    confirmationModal.getNavigationWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.NavigationWarn);

    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    modelPage.selectView("project-diagram");

    // verify previously saved coords were persisted
    ids.forEach(id => {
      graphVis.getPositionsOfNodes(id).then((nodePositions: any) => {
        let coords: any = nodePositions[id];
        let persistedCoords = {x: coords.x, y: coords.y};
        expect(savedCoords[id].x).to.equal(persistedCoords.x);
        expect(savedCoords[id].y).to.equal(persistedCoords.y);
      });
    });

    // TODO rearrange nodes in graph view, test selection and persistence of changed positions

    // NOTE The following does not work, the node is selected but no dragging occurs
    // graphVis.getPositionsOfNodes().then((nodePositions: any) => {
    //   let clientCoords: any = nodePositions["Client"];
    //   graphVis.getGraphVisCanvas().trigger("pointerdown", clientCoords.x, clientCoords.y, {button: 0});
    //   graphVis.getGraphVisCanvas().trigger("pointermove", clientCoords.x+10, clientCoords.y+10, {button: 0});
    //   graphVis.getGraphVisCanvas().trigger("pointerup", clientCoords.x+20, clientCoords.y+20, {button: 0});
    // });

  });

});
