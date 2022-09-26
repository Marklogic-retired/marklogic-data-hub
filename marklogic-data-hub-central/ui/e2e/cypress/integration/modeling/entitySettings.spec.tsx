/// <reference types="cypress"/>

import modelPage from "../../support/pages/model";
import {graphViewSidePanel} from "../../support/components/model/index";
import {Application} from "../../support/application.config";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";
import graphVis from "../../support/components/model/graph-vis";
import {BaseEntityTypes} from "../../support/types/base-entity-types";
import graphExplore from "../../support/pages/graphExplore";
import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";
import browsePage from "../../support/pages/browse";
import homePage from "../../support/pages/home";
import graphExploreSidePanel from "../../support/components/explore/graph-explore-side-panel";
import dataModelDisplaySettingsModal from "../../support/components/explore/data-model-display-settings-modal";
import explorePage from "../../support/pages/explore";


const defaultSelectLabel = "Select...";
const defaultSelectProperty = "Select property";
const defaultEntityTypeData = {
  name: BaseEntityTypes.BABYREGISTRY,
  properties: {
    babyRegistryId: "babyRegistryId",
    arrivalDate: "arrivalDate",
    ownedBy: "ownedBy"
  },
  propertiesValues: {
    babyRegistryId: 3039,
    ownedBy: 301
  }
};

const propertiesOnHoverData = {
  babyRegistryId: "babyRegistryId: 3039",
  arrivalDate: "arrivalDate:",
  ownedBy: "ownedBy: 301"
};

describe("Entity display settings in model tile", () => {

  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    //Setup hubCentral config for testing
    cy.setupHubCentralConfig();
    cy.log("**Go to graph view in model tile**");
    homePage.getModelCard().click();
    cy.waitForAsyncRequest();
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });
  //login with valid account
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage();
  });
  it("can change entity display settings in model tile and change in explore", () => {
    modelPage.selectView("project-diagram");
    cy.waitForAsyncRequest();
    cy.wait(5000);
    cy.log(`**Click on ${defaultEntityTypeData.name} entity to open side bar**`);
    graphVis.getPositionsOfNodes(defaultEntityTypeData.name).then((nodePositions: any) => {
      let babyRegistryCoordinates: any = nodePositions[defaultEntityTypeData.name];
      graphVis.getGraphVisCanvas().trigger("mouseover", babyRegistryCoordinates.x, babyRegistryCoordinates.y, {force: true}).click(babyRegistryCoordinates.x, babyRegistryCoordinates.y, {force: true});
    });
    cy.wait(1000);

    /**graphVis.getPositionsOfNodes(defaultEntityTypeData.name).then((nodePositions: any) => {
      let babyRegistryCoordinates: any = nodePositions[defaultEntityTypeData.name];
      cy.wait(200);
      graphVis.getGraphVisCanvas().click(babyRegistryCoordinates.x, babyRegistryCoordinates.y);
      if (Cypress.isBrowser("!firefox")) {
        graphVis.getGraphVisCanvas().click(babyRegistryCoordinates.x, babyRegistryCoordinates.y);
      }
    });*/

    cy.log("**Change side bar tab to Entity Type**");
    graphViewSidePanel.getEntityTypeTab().click();
    graphViewSidePanel.getEntityDescription().should("be.visible");

    cy.log("**Verify no label are selected, select new one and check the selection**");
    graphViewSidePanel.getEntityLabelDropdown(defaultEntityTypeData.name).should("have.text", defaultSelectLabel);
    graphViewSidePanel.getEntityLabelDropdown(defaultEntityTypeData.name).click();
    graphViewSidePanel.getEntityLabelDropdownOption(defaultEntityTypeData.name, defaultEntityTypeData.properties.ownedBy).click();
    graphViewSidePanel.getEntityLabelDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.ownedBy);

    cy.log("**Verify no propertiesOnHover are selected, select new one and check the selection**");
    graphViewSidePanel.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultSelectProperty);
    graphViewSidePanel.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    graphViewSidePanel.getPropertiesOnHoverDropdownOption(defaultEntityTypeData.properties.babyRegistryId).click({force: true});
    graphViewSidePanel.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    graphViewSidePanel.getPropertiesOnHoverDropdownOption(defaultEntityTypeData.properties.arrivalDate).click({force: true});
    graphViewSidePanel.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    graphViewSidePanel.getPropertiesOnHoverDropdownOption(defaultEntityTypeData.properties.ownedBy).click({force: true});
    graphViewSidePanel.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.babyRegistryId);
    graphViewSidePanel.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.arrivalDate);
    graphViewSidePanel.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.ownedBy);

    cy.log("**Close model tile and go to explore**");
    homePage.getTileCloseButton().click();
    homePage.getExploreCard().click();
    cy.waitForAsyncRequest();

    cy.log("**Click on babyRegistry node and verify that properties on hover show up in the tooltip**");
    graphExplore.getGraphVisCanvas().should("exist");
    cy.wait(5000);
    graphExplore.stopStabilization();
    graphExplore.focusNode(ExploreGraphNodes.BABY_REGISTRY_3039);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.BABY_REGISTRY_3039).then((nodePositions: any) => {
      let baby_registry_3039_nodeposition: any = nodePositions[ExploreGraphNodes.BABY_REGISTRY_3039];
      graphExplore.getGraphVisCanvas().trigger("mouseover", baby_registry_3039_nodeposition.x, baby_registry_3039_nodeposition.y);
    });
    cy.wait(1000);

    graphExplore.getPositionsOfNodes(ExploreGraphNodes.BABY_REGISTRY_3039).then((nodePositions: any) => {
      let baby_registry_3039_nodeposition: any = nodePositions[ExploreGraphNodes.BABY_REGISTRY_3039];
      cy.wait(150);
      graphExplore.getGraphVisCanvas().click(baby_registry_3039_nodeposition.x, baby_registry_3039_nodeposition.y, {force: true});
      if (Cypress.isBrowser("!firefox")) {
        graphExplore.getGraphVisCanvas().click(baby_registry_3039_nodeposition.x, baby_registry_3039_nodeposition.y, {force: true});
      }

      cy.findByText(propertiesOnHoverData.babyRegistryId).should("exist");
      cy.contains(propertiesOnHoverData.arrivalDate);
      cy.findByText(propertiesOnHoverData.ownedBy).should("exist");
    });

    cy.log("**Check in the side bar the label of the node**");

    cy.log("**Click on babyRegistry node to open the side panel**");
    graphExplore.getGraphVisCanvas().should("exist");
    cy.wait(2000);
    graphExplore.stopStabilization();
    graphExplore.focusNode(ExploreGraphNodes.BABY_REGISTRY_3039);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.BABY_REGISTRY_3039).then((nodePositions: any) => {
      let baby_registry_3039_nodeposition: any = nodePositions[ExploreGraphNodes.BABY_REGISTRY_3039];
      graphExplore.getGraphVisCanvas().trigger("mouseover", baby_registry_3039_nodeposition.x, baby_registry_3039_nodeposition.y, {force: true});
      graphExplore.getGraphVisCanvas().click(baby_registry_3039_nodeposition.x, baby_registry_3039_nodeposition.y, {force: true});
    });

    graphExploreSidePanel.getSidePanel().scrollIntoView().should("be.visible");
    graphExploreSidePanel.getSidePanelHeading().should("contain.text", defaultEntityTypeData.propertiesValues.ownedBy);


    cy.log("**Open Entity Display Settings modal to check the values on label and propertiesOnHover**");
    explorePage.clickExploreSettingsMenuIcon();
    browsePage.getEntityTypeDisplaySettingsButton().scrollIntoView().click({force: true});
    dataModelDisplaySettingsModal.getModalBody().should("be.visible");

    cy.log("**Verify label are selected, and select new one**");
    dataModelDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).should("have.text", defaultEntityTypeData.properties.ownedBy);
    dataModelDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).click();
    dataModelDisplaySettingsModal.getEntityLabelDropdownOption(defaultEntityTypeData.name, defaultEntityTypeData.properties.babyRegistryId).click();
    dataModelDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.babyRegistryId);

    cy.log("**Verify propertiesOnHover are selected**");
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.babyRegistryId);
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.arrivalDate);
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.ownedBy);

    cy.log("**Deselect ownedBy properties on properties on hover**");
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdownCloseOption(defaultEntityTypeData.name, defaultEntityTypeData.properties.ownedBy).click();
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("not.contain.text", defaultEntityTypeData.properties.ownedBy);

    cy.log("**Save changes and close the modal**");
    dataModelDisplaySettingsModal.getModalSaveButton().click();
    dataModelDisplaySettingsModal.getModalBody().should("not.exist");

    cy.log("**Close explore tile and go to model**");
    homePage.getTileCloseButton().click();
    homePage.getModelCard().click();
    cy.waitForAsyncRequest();

    cy.log("**Go to graph view**");
    modelPage.selectView("project-diagram");
    cy.waitForAsyncRequest();
    cy.wait(2000);

    cy.log(`**Click on ${defaultEntityTypeData.name} entity to open side bar**`);
    graphVis.getPositionsOfNodes(defaultEntityTypeData.name).then((nodePositions: any) => {
      let babyRegistryCoordinates: any = nodePositions[defaultEntityTypeData.name];
      graphVis.getGraphVisCanvas().trigger("mouseover", babyRegistryCoordinates.x, babyRegistryCoordinates.y, {force: true});
    });
    cy.wait(500);

    graphVis.getPositionsOfNodes(defaultEntityTypeData.name).then((nodePositions: any) => {
      let babyRegistryCoordinates: any = nodePositions[defaultEntityTypeData.name];
      cy.wait(150);
      graphVis.getGraphVisCanvas().click(babyRegistryCoordinates.x, babyRegistryCoordinates.y);
      if (Cypress.isBrowser("!firefox")) {
        graphVis.getGraphVisCanvas().click(babyRegistryCoordinates.x, babyRegistryCoordinates.y);
      }
    });

    cy.log("**Change side bar tab to Entity Type**");
    graphViewSidePanel.getEntityTypeTab().click();
    graphViewSidePanel.getEntityDescription().should("be.visible");

    cy.log("**label should have babyRegistryId value**");
    graphViewSidePanel.getEntityLabelDropdown(defaultEntityTypeData.name).should("have.text", defaultEntityTypeData.properties.babyRegistryId);

    cy.log("**propertiesOnHover should have babyRegistryId and arrivalDate, should not have ownedBy**");
    graphViewSidePanel.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.babyRegistryId);
    graphViewSidePanel.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.arrivalDate);
    graphViewSidePanel.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("not.contain.text", defaultEntityTypeData.properties.ownedBy);
  });

});
