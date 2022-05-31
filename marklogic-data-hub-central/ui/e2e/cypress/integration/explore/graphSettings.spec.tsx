import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import specificSidebar from "../../support/components/explore/specific-sidebar";
import entityTypeDisplaySettingsModal from "../../support/components/explore/entity-type-display-settings-modal";
import graphExploreSidePanel from "../../support/components/explore/graph-explore-side-panel";
import browsePage from "../../support/pages/browse";
import LoginPage from "../../support/pages/login";
import {BaseEntityTypes} from "../../support/types/base-entity-types";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import graphExplore from "../../support/pages/graphExplore";
import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";

const defaultSelectText = "Select...";
const defaultEntityTypeData = {
  name: BaseEntityTypes.CUSTOMER,
  properties: {
    name: "name",
    email: "email",
    nicknames: "nicknames",
    shipping: "shipping"
  },
  propertiesValues: {
    id: 102,
    name: "Adams Cole",
    email: "adamscole@nutralab.com",
  },
  icon: "FaShapes",
  color: {
    HEX: "#EEEFF1",
  }
};
const propertiesOnHoverData = {
  name: "name: Adams Cole",
  email: "email: adamscole@nutralab.com",
  shipping: "shipping:"
};
// We must have the same color in rgb and hex because the browser to apply the background changes it to rgb even if the value is passed in hex
// "#FFF0A3" == "rgb(255, 240, 163)"
const newEntityTypeData = {
  label: "name",
  icon: "FaAndroid",
  color: {
    HEX: "#FFF0A3",
    RGB: "rgb(255, 240, 163)",
  }
};

// We must have the same color in rgb and hex because the browser to apply the background changes it to rgb even if the value is passed in hex
// "#FFD0AE" == "rgb(255, 208, 174)"
const newEntityTypeData2 = {
  label: "email",
  icon: "FaAngular",
  color: {
    HEX: "#FFD0AE",
    RGB: "rgb(255, 208, 174)",
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

    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage();
    cy.visit("/");
    cy.log("**Go to Explore section**");
    toolbar.getExploreToolbarIcon().click({force: true});
  });

  it("Open settings modal, check default values, select new ones cancel and check that the defaults values are keep", () => {
    browsePage.waitForSpinnerToDisappear();
    cy.wait(3000);
    cy.log("**Select Graph view and open explore settings modal**");
    browsePage.clickGraphView();
    browsePage.waitForSpinnerToDisappear();
    browsePage.clickExploreSettingsMenuIcon();
    browsePage.getEntityTypeDisplaySettingsButton().scrollIntoView().click({force: true});
    entityTypeDisplaySettingsModal.getModalBody().should("be.visible");

    cy.log("**Verify default color it's selected, select new one and check the selection**");
    entityTypeDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).should("have.attr", "data-color").then(color => {
      expect(Cypress._.toLower(color)).equal(Cypress._.toLower(defaultEntityTypeData.color.HEX));
    });
    entityTypeDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).click();
    entityTypeDisplaySettingsModal.getColorInPicket(newEntityTypeData.color.HEX).click();
    entityTypeDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).should("have.attr", "data-color", Cypress._.toLower(newEntityTypeData.color.HEX));

    cy.log("**Verify default icon it's selected, select new one and check the selection**");
    entityTypeDisplaySettingsModal.getEntityTypeIconButtonWrapper(defaultEntityTypeData.name).should("have.attr", "data-icon", defaultEntityTypeData.icon);
    entityTypeDisplaySettingsModal.getEntityTypeIconButton(defaultEntityTypeData.name).click();
    entityTypeDisplaySettingsModal.getEntityTypeIconSearchInput(defaultEntityTypeData.name).type(newEntityTypeData.icon);
    entityTypeDisplaySettingsModal.getEntityTypeIconMenu(defaultEntityTypeData.name).find("svg").last().click();
    entityTypeDisplaySettingsModal.getEntityTypeIconButtonWrapper(defaultEntityTypeData.name).should("have.attr", "data-icon", newEntityTypeData.icon);

    cy.log("**Verify no label are selected, select new one and check the selection**");
    entityTypeDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).should("have.text", defaultSelectText);
    entityTypeDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).click();
    entityTypeDisplaySettingsModal.getEntityLabelDropdownOption(defaultEntityTypeData.name, defaultEntityTypeData.properties.name).click();
    entityTypeDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.name);

    cy.log("**Verify no propertiesOnHover are selected, select new one and check the selection**");
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("have.text", defaultSelectText);
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdownOption(defaultEntityTypeData.name, defaultEntityTypeData.properties.name).click();
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdownOption(defaultEntityTypeData.name, defaultEntityTypeData.properties.email).click();
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdownOption(defaultEntityTypeData.name, defaultEntityTypeData.properties.shipping).click();
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.name);
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.email);
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.shipping);

    cy.log("**Cancel the edition and verify that the modal close**");
    entityTypeDisplaySettingsModal.getModalCancelButton().click();
    entityTypeDisplaySettingsModal.getModalBody().should("not.exist");

    cy.log("**Reopen the settings modal and check that not was saved the data and are present the default values**");
    browsePage.getEntityTypeDisplaySettingsButton().scrollIntoView().click({force: true});
    entityTypeDisplaySettingsModal.getModalBody().should("be.visible");
    entityTypeDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).should("have.attr", "data-color").then(color => {
      expect(Cypress._.toLower(color)).equal(Cypress._.toLower(defaultEntityTypeData.color.HEX));
    });
    entityTypeDisplaySettingsModal.getEntityTypeIconButtonWrapper(defaultEntityTypeData.name).should("have.attr", "data-icon", defaultEntityTypeData.icon);
    entityTypeDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).should("have.text", defaultSelectText);
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("have.text", defaultSelectText);

    cy.log("**Close the modal**");
    entityTypeDisplaySettingsModal.getModalCloseButton().click();
    entityTypeDisplaySettingsModal.getModalBody().should("not.exist");
  });

  it("Open settings modal, select new values and save the changes", () => {
    browsePage.waitForSpinnerToDisappear();
    cy.wait(1000);
    cy.log("**Select Graph view and open explore settings modal**");
    browsePage.clickGraphView();
    browsePage.waitForSpinnerToDisappear();
    cy.wait(2000);
    browsePage.clickExploreSettingsMenuIcon();
    browsePage.getEntityTypeDisplaySettingsButton().scrollIntoView().click({force: true});
    entityTypeDisplaySettingsModal.getModalBody().should("be.visible");

    cy.log("**Check quantity of rows in the table**");
    entityTypeDisplaySettingsModal.getTableRows().should("have.length.gt", 2);

    cy.log(`**Filter ${defaultEntityTypeData.name} entity by search option**`);
    entityTypeDisplaySettingsModal.getIconSearch().click({force: true});
    entityTypeDisplaySettingsModal.getSearchInput().type(defaultEntityTypeData.name, {timeout: 2000});
    entityTypeDisplaySettingsModal.getSearchSearchButton().click();
    entityTypeDisplaySettingsModal.getTableRows().should("have.length", 1);

    cy.log("**Select new color and check the selection**");
    entityTypeDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).click();
    entityTypeDisplaySettingsModal.getColorInPicket(newEntityTypeData.color.HEX).click();
    entityTypeDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).should("have.attr", "data-color", Cypress._.toLower(newEntityTypeData.color.HEX));

    cy.log("**Select new icon and check the selection**");
    entityTypeDisplaySettingsModal.getEntityTypeIconButton(defaultEntityTypeData.name).click();
    entityTypeDisplaySettingsModal.getEntityTypeIconSearchInput(defaultEntityTypeData.name).type(newEntityTypeData.icon);
    entityTypeDisplaySettingsModal.getEntityTypeIconMenu(defaultEntityTypeData.name).find("svg").last().click();
    entityTypeDisplaySettingsModal.getEntityTypeIconButtonWrapper(defaultEntityTypeData.name).should("have.attr", "data-icon", newEntityTypeData.icon);

    cy.log("**Select label and check the selection**");
    entityTypeDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).click();
    entityTypeDisplaySettingsModal.getEntityLabelDropdownOption(defaultEntityTypeData.name, defaultEntityTypeData.properties.name).click();
    entityTypeDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.name);

    cy.log("**Select propertiesOnHover and check the selection**");
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdownOption(defaultEntityTypeData.name, defaultEntityTypeData.properties.name).click();
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdownOption(defaultEntityTypeData.name, defaultEntityTypeData.properties.email).click();
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdownOption(defaultEntityTypeData.name, defaultEntityTypeData.properties.shipping).click();
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.name);
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.email);
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.shipping);

    cy.log("**Clear filter and check table rows");
    entityTypeDisplaySettingsModal.getIconSearch().click({force: true});
    entityTypeDisplaySettingsModal.getSearchInput().should("have.value", defaultEntityTypeData.name);
    entityTypeDisplaySettingsModal.getSearchResetButton().click();
    entityTypeDisplaySettingsModal.getTableRows().should("have.length.gt", 2);

    cy.log("**Open search dialog and input should be empty");
    entityTypeDisplaySettingsModal.getIconSearch().click({force: true});
    entityTypeDisplaySettingsModal.getSearchInput().should("have.value", "");
    entityTypeDisplaySettingsModal.getSearchResetButton().click();

    cy.log("**Save the changes**");
    entityTypeDisplaySettingsModal.getModalSaveButton().click();
    entityTypeDisplaySettingsModal.getModalBody().should("not.exist");

    cy.log("**Reopen the settings modal and check the new values**");
    browsePage.getEntityTypeDisplaySettingsButton().scrollIntoView().click({force: true});
    entityTypeDisplaySettingsModal.getModalBody().should("be.visible");
    entityTypeDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).should("have.attr", "data-color", Cypress._.toLower(newEntityTypeData.color.HEX));
    entityTypeDisplaySettingsModal.getEntityTypeIconButtonWrapper(defaultEntityTypeData.name).should("have.attr", "data-icon", newEntityTypeData.icon);
    entityTypeDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.name);
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.name);
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.email);
    entityTypeDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.shipping);

    cy.log("**Close the modal**");
    entityTypeDisplaySettingsModal.getModalCloseButton().click();
    entityTypeDisplaySettingsModal.getModalBody().should("not.exist");

    cy.log("**Check in the sidebar that the entity type have the new color and icon**");
    entitiesSidebar.getBaseEntity(defaultEntityTypeData.name).should("be.visible").and("have.attr", "data-color").then(color => {
      expect(Cypress._.toLower(color)).equal(Cypress._.toLower(newEntityTypeData.color.HEX));
    });
    entitiesSidebar.getBaseEntity(defaultEntityTypeData.name).should("have.css", "background-color", newEntityTypeData.color.RGB);
    entitiesSidebar.getBaseEntity(defaultEntityTypeData.name).should("have.attr", "data-icon").then(icon => {
      expect(Cypress._.toLower(icon)).equal(Cypress._.toLower(newEntityTypeData.icon));
    });

    cy.log("**Click on customer node and verify that label in side bar**");
    graphExplore.stopStabilization();
    graphExplore.focusNode(ExploreGraphNodes.CUSTOMER_102);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let customer_102_nodePosition: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      graphExplore.getGraphVisCanvas().trigger("mouseover", customer_102_nodePosition.x, customer_102_nodePosition.y);
    });
    cy.wait(500);

    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let customer_102_nodePosition: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      cy.wait(150);
      graphExplore.getGraphVisCanvas().click(customer_102_nodePosition.x, customer_102_nodePosition.y, {force: true});
      graphExplore.getGraphVisCanvas().click(customer_102_nodePosition.x, customer_102_nodePosition.y, {force: true});

      cy.findByText(propertiesOnHoverData.name).should("exist");
      cy.findByText(propertiesOnHoverData.email).should("exist");
      cy.findByText(propertiesOnHoverData.shipping).should("exist");
    });

    cy.log("**Open graph side panel and validate data**");
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let customer_102_nodePosition: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      cy.wait(150);
      graphExplore.getGraphVisCanvas().trigger("mouseover", customer_102_nodePosition.x, customer_102_nodePosition.y);
      graphExplore.getGraphVisCanvas().click(customer_102_nodePosition.x, customer_102_nodePosition.y, {force: true});

      graphExploreSidePanel.getSidePanel().scrollIntoView().should("be.visible");
      graphExploreSidePanel.getSidePanelHeading().should("contain.text", defaultEntityTypeData.propertiesValues.name);

    });
  });

  it("Verify settings modal with a selected entity type in the sidebar", () => {
    browsePage.waitForSpinnerToDisappear();
    cy.wait(1000);
    cy.log("**Select Graph view**");
    browsePage.clickGraphView();
    browsePage.waitForSpinnerToDisappear();
    cy.wait(2000);

    cy.log("**Go to specific entity panel and check icon, title and background color**");
    entitiesSidebar.openBaseEntityFacets(defaultEntityTypeData.name);
    specificSidebar.getLeftBarEntityIcon(defaultEntityTypeData.name).should("have.css", "background-color", newEntityTypeData.color.RGB);
    specificSidebar.getLeftBarEntityIcon(defaultEntityTypeData.name).should("have.attr", "data-icon").then(icon => {
      expect(Cypress._.toLower(icon)).equal(Cypress._.toLower(newEntityTypeData.icon));
    });
    specificSidebar.getEntitySiderComponent(defaultEntityTypeData.name).should("have.css", "background-color", newEntityTypeData.color.RGB);
    specificSidebar.getEntitySpecifIcon(defaultEntityTypeData.name).should("have.attr", "data-icon").then(icon => {
      expect(Cypress._.toLower(icon)).equal(Cypress._.toLower(newEntityTypeData.icon));
    });
    specificSidebar.getEntitySpecifTitle(defaultEntityTypeData.name).should("contain", defaultEntityTypeData.name);

    cy.log("**Open explore settings modal**");
    browsePage.clickExploreSettingsMenuIcon();
    browsePage.getEntityTypeDisplaySettingsButton().scrollIntoView().click({force: true});
    entityTypeDisplaySettingsModal.getModalBody().should("be.visible");

    cy.log("**Select new color and check the selection**");
    entityTypeDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).click();
    entityTypeDisplaySettingsModal.getColorInPicket(newEntityTypeData2.color.HEX).click();
    entityTypeDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).should("have.attr", "data-color", Cypress._.toLower(newEntityTypeData2.color.HEX));

    cy.log("**Select new icon and check the selection**");
    entityTypeDisplaySettingsModal.getEntityTypeIconButton(defaultEntityTypeData.name).click();
    entityTypeDisplaySettingsModal.getEntityTypeIconSearchInput(defaultEntityTypeData.name).type(newEntityTypeData2.icon);
    entityTypeDisplaySettingsModal.getEntityTypeIconMenu(defaultEntityTypeData.name).find("svg").last().click();
    entityTypeDisplaySettingsModal.getEntityTypeIconButtonWrapper(defaultEntityTypeData.name).should("have.attr", "data-icon", newEntityTypeData2.icon);
    entityTypeDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).click();
    entityTypeDisplaySettingsModal.getEntityLabelDropdownOption(defaultEntityTypeData.name, defaultEntityTypeData.properties.email).click();

    cy.log("**Save the changes**");
    entityTypeDisplaySettingsModal.getModalSaveButton().click();
    entityTypeDisplaySettingsModal.getModalBody().should("not.exist");

    cy.log("**Reopen the settings modal and check the new values**");
    browsePage.getEntityTypeDisplaySettingsButton().scrollIntoView().click({force: true});
    entityTypeDisplaySettingsModal.getModalBody().should("be.visible");
    entityTypeDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).should("have.attr", "data-color", Cypress._.toLower(newEntityTypeData2.color.HEX));
    entityTypeDisplaySettingsModal.getEntityTypeIconButtonWrapper(defaultEntityTypeData.name).should("have.attr", "data-icon", newEntityTypeData2.icon);
    entityTypeDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.email);

    cy.log("**Close the modal**");
    entityTypeDisplaySettingsModal.getModalCloseButton().click();
    entityTypeDisplaySettingsModal.getModalBody().should("not.exist");

    cy.log("**Check the changes in the specific sidebar**");
    specificSidebar.getLeftBarEntityIcon(defaultEntityTypeData.name).should("have.css", "background-color", newEntityTypeData2.color.RGB);
    specificSidebar.getLeftBarEntityIcon(defaultEntityTypeData.name).should("have.attr", "data-icon").then(icon => {
      expect(Cypress._.toLower(icon)).equal(Cypress._.toLower(newEntityTypeData2.icon));
    });
    specificSidebar.getEntitySiderComponent(defaultEntityTypeData.name).should("have.css", "background-color", newEntityTypeData2.color.RGB);
    specificSidebar.getEntitySpecifIcon(defaultEntityTypeData.name).should("have.attr", "data-icon").then(icon => {
      expect(Cypress._.toLower(icon)).equal(Cypress._.toLower(newEntityTypeData2.icon));
    });
    specificSidebar.getEntitySpecifTitle(defaultEntityTypeData.name).should("contain", defaultEntityTypeData.name);

    cy.log("**Go back in the sidebar**");
    entitiesSidebar.backToMainSidebar();

    cy.log("**Check in the sidebar that the entity type have the new color and icon**");
    entitiesSidebar.getBaseEntity(defaultEntityTypeData.name).should("be.visible").and("have.attr", "data-color").then(color => {
      expect(Cypress._.toLower(color)).equal(Cypress._.toLower(newEntityTypeData2.color.HEX));
    });
    entitiesSidebar.getBaseEntity(defaultEntityTypeData.name).and("have.css", "background-color", newEntityTypeData2.color.RGB);
    entitiesSidebar.getBaseEntity(defaultEntityTypeData.name).and("have.attr", "data-icon").then(icon => {
      expect(Cypress._.toLower(icon)).equal(Cypress._.toLower(newEntityTypeData2.icon));
    });

    cy.log("**Click on customer node and verify that label in side bar**");
    cy.wait(1000);
    graphExplore.stopStabilization();
    graphExplore.focusNode(ExploreGraphNodes.CUSTOMER_102);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let customer_102_nodePosition: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      graphExplore.getGraphVisCanvas().trigger("mouseover", customer_102_nodePosition.x, customer_102_nodePosition.y);
      graphExplore.getGraphVisCanvas().click(customer_102_nodePosition.x, customer_102_nodePosition.y, {force: true});

    });
    cy.wait(1000);

    /* graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let customer_102_nodePosition: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      cy.wait(150);
      graphExplore.getGraphVisCanvas().click(customer_102_nodePosition.x, customer_102_nodePosition.y, {force: true});
      graphExplore.getGraphVisCanvas().click(customer_102_nodePosition.x, customer_102_nodePosition.y, {force: true});
    });
*/
    graphExploreSidePanel.getSidePanel().scrollIntoView().should("be.visible");
    graphExploreSidePanel.getSidePanelHeading().should("contain.text", defaultEntityTypeData.propertiesValues.email);
  });
});