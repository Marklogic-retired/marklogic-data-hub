import dataModelDisplaySettingsModal from "../../support/components/explore/data-model-display-settings-modal";
import graphExploreSidePanel from "../../support/components/explore/graph-explore-side-panel";
import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";
import {graphViewSidePanel} from "../../support/components/model/index";
import {BaseEntityTypes} from "../../support/types/base-entity-types";
import graphVis from "../../support/components/model/graph-vis";
import graphExplore from "../../support/pages/graphExplore";
import explorePage from "../../support/pages/explore";
import browsePage from "../../support/pages/browse";
import modelPage from "../../support/pages/model";
import homePage from "../../support/pages/home";
import "cypress-wait-until";

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
    cy.loginAsDeveloper().withRequest();
    cy.setupHubCentralConfig();
    modelPage.navigate();
  });

  it("Can change entity display settings in model tile and change in explore", () => {
    modelPage.switchTableView();
    modelPage.switchGraphView();
    cy.waitForAsyncRequest();
    cy.wait(5000);
    cy.log(`**Click on ${defaultEntityTypeData.name} entity to open side bar**`);
    graphVis.getPositionsOfNodes(defaultEntityTypeData.name).then((nodePositions: any) => {
      let babyRegistryCoordinates: any = nodePositions[defaultEntityTypeData.name];
      graphVis.getGraphVisCanvas().scrollTo(babyRegistryCoordinates.x, babyRegistryCoordinates.y, {ensureScrollable: false}).trigger("mouseover", babyRegistryCoordinates.x, babyRegistryCoordinates.y, {force: true}).click(babyRegistryCoordinates.x, babyRegistryCoordinates.y, {force: true});
    });
    cy.wait(1000);

    cy.log("**Change side bar tab to Entity Type**");
    graphViewSidePanel.getEntityTypeTab().scrollIntoView().click({force: true});
    graphViewSidePanel.getEntityDescription().should("be.visible");

    cy.log("**Verify no label are selected, select new one and check the selection**");
    graphViewSidePanel.getEntityLabelDropdown(defaultEntityTypeData.name).then(($ele) => {
      let text = $ele.text();
      if (text === defaultEntityTypeData.properties.ownedBy) {
        graphViewSidePanel.getEntityLabelDropdown(defaultEntityTypeData.name).click();
        graphViewSidePanel.getEntityLabelDropdownOption(
          defaultEntityTypeData.name, defaultEntityTypeData.properties.babyRegistryId).click();
        graphViewSidePanel.getEntityLabelDropdown(
          defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.babyRegistryId);
      }
    });
    graphViewSidePanel.getEntityLabelDropdown(defaultEntityTypeData.name).click();
    graphViewSidePanel.getEntityLabelDropdownOption(
      defaultEntityTypeData.name, defaultEntityTypeData.properties.ownedBy).click({force: true});
    graphViewSidePanel.getEntityLabelDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.ownedBy);

    cy.log("**Verify no propertiesOnHover are selected, select new one and check the selection**");

    cy.get("body").then((body) => {
      if (body.find(".rc-tree-select-selection-item-remove-icon").length > 0) {
        dataModelDisplaySettingsModal.getDropdownCloseOption().each(($button) => {
          cy.wrap($button).click();
        });
      }
    });
    graphViewSidePanel.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    graphViewSidePanel.getPropertiesOnHoverDropdownOption(
      defaultEntityTypeData.properties.babyRegistryId).should("be.visible").click({force: true});
    graphViewSidePanel.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    graphViewSidePanel.getPropertiesOnHoverDropdownOption(
      defaultEntityTypeData.properties.arrivalDate).click({force: true});
    graphViewSidePanel.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    graphViewSidePanel.getPropertiesOnHoverDropdownOption(
      defaultEntityTypeData.properties.ownedBy).click({force: true});
    graphViewSidePanel.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.babyRegistryId);
    graphViewSidePanel.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.arrivalDate);
    graphViewSidePanel.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.ownedBy);
    graphViewSidePanel.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    cy.wait(3000);

    cy.log("**Close model tile and go to explore**");
    homePage.getTileCloseButton().click();
    cy.waitForAsyncRequest();
    homePage.getExploreCard().click();
    cy.waitForAsyncRequest();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getClearAllFacetsButton().then(($ele) => {
      if ($ele.is(":enabled")) {
        cy.log("**clear all facets**");
        browsePage.getClearAllFacetsButton().click();
        browsePage.waitForSpinnerToDisappear();
      }
    });
  });

  it("Click on babyRegistry node and verify that properties on hover show up in the tooltip", () => {
    graphExplore.getGraphVisCanvas().should("exist");
    browsePage.search("3039", true, true);
    graphExplore.stopStabilization();
    cy.waitForAsyncRequest();
    browsePage.waitForSpinnerToDisappear();
    cy.wait(6000);
    graphExplore.focusNode(ExploreGraphNodes.BABY_REGISTRY_3039);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.BABY_REGISTRY_3039).then(
      (nodePositions: any) => {
        let baby_registry_3039_nodeposition: any = nodePositions[ExploreGraphNodes.BABY_REGISTRY_3039];
        graphExplore.getGraphVisCanvas().scrollTo(baby_registry_3039_nodeposition.x, baby_registry_3039_nodeposition.y, {ensureScrollable: false}).trigger("mouseover", baby_registry_3039_nodeposition.x, baby_registry_3039_nodeposition.y);
      });
    cy.wait(1000);

    graphExplore.getPositionsOfNodes(ExploreGraphNodes.BABY_REGISTRY_3039).then((nodePositions: any) => {
      let baby_registry_3039_nodeposition: any = nodePositions[ExploreGraphNodes.BABY_REGISTRY_3039];
      cy.wait(150);
      graphExplore.getGraphVisCanvas().click(
        baby_registry_3039_nodeposition.x, baby_registry_3039_nodeposition.y, {force: true});
      if (Cypress.isBrowser("!firefox")) {
        graphExplore.getGraphVisCanvas().click(
          baby_registry_3039_nodeposition.x, baby_registry_3039_nodeposition.y, {force: true});
      }
      if (Cypress.isBrowser("!chrome")) {
        cy.findByText(propertiesOnHoverData.babyRegistryId).should("exist");
        cy.contains(propertiesOnHoverData.arrivalDate);
        cy.findByText(propertiesOnHoverData.ownedBy).should("exist");
      }
    });
  });

  it("Check in the side bar the label of the node", () => {
    cy.log("**Click on babyRegistry node to open the side panel**");
    graphExplore.getGraphVisCanvas().should("exist");
    cy.wait(3000);
    graphExplore.focusNode(ExploreGraphNodes.BABY_REGISTRY_3039);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.BABY_REGISTRY_3039).then((nodePositions: any) => {
      let baby_registry_3039_nodeposition: any = nodePositions[ExploreGraphNodes.BABY_REGISTRY_3039];
      graphExplore.getGraphVisCanvas().scrollTo(baby_registry_3039_nodeposition.x, baby_registry_3039_nodeposition.y, {ensureScrollable: false}).trigger("mouseover", baby_registry_3039_nodeposition.x, baby_registry_3039_nodeposition.y, {force: true});
      graphExplore.getGraphVisCanvas().click(
        baby_registry_3039_nodeposition.x, baby_registry_3039_nodeposition.y, {force: true});
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
    dataModelDisplaySettingsModal.getEntityLabelDropdownOption(
      defaultEntityTypeData.name, defaultEntityTypeData.properties.babyRegistryId).click();
    dataModelDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.babyRegistryId);

    cy.log("**Verify propertiesOnHover are selected**");
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.babyRegistryId);
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.arrivalDate);
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.ownedBy);

    cy.log("**Deselect ownedBy properties on properties on hover**");
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdownCloseOption(
      defaultEntityTypeData.name, defaultEntityTypeData.properties.ownedBy).click();
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("not.contain.text", defaultEntityTypeData.properties.ownedBy);

    cy.log("**Save changes and close the modal**");
    dataModelDisplaySettingsModal.getModalSaveButton().click();
    dataModelDisplaySettingsModal.getModalBody().should("not.exist");

    cy.log("**Close explore tile and go to model**");
    homePage.getTileCloseButton().click();
    homePage.getModelCard().should("be.visible").click();
    cy.waitForAsyncRequest();
    browsePage.waitForSpinnerToDisappear();

    cy.log("**Go to graph view**");
    modelPage.switchGraphView();
    cy.waitForAsyncRequest();
    cy.wait(5000);
    browsePage.waitForSpinnerToDisappear();
  });

  it(`Click on ${defaultEntityTypeData.name} entity to open side bar`, () => {
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
