import dataModelDisplaySettingsModal from "../../support/components/explore/data-model-display-settings-modal";
import graphExploreSidePanel from "../../support/components/explore/graph-explore-side-panel";
import specificSidebar from "../../support/components/explore/specific-sidebar";
import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";
import {BaseEntityTypes} from "../../support/types/base-entity-types";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import graphExplore from "../../support/pages/graphExplore";
import {toolbar} from "../../support/components/common";
import explorePage from "../../support/pages/explore";
import browsePage from "../../support/pages/browse";
import LoginPage from "../../support/pages/login";

//ToDo: Should move it to RTL test
//const defaultSelectLabel = "Select...";
//const defaultSelectProperty = "Select property";
const defaultEntityTypeData = {
  name: BaseEntityTypes.CUSTOMER,
  properties: {
    name: "name",
    email: "email",
    nicknames: "nicknames",
    shipping: "shipping",
    shippingStreet: {
      value: "street",
      label: "shipping > street"
    }
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
  shippingStreet: "shipping > street:"
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
    cy.loginAsDeveloper().withRequest();
    LoginPage.navigateToMainPage();
    cy.setupHubCentralConfig();

    browsePage.waitForSpinnerToDisappear();
    cy.wait(3000);
    toolbar.getExploreToolbarIcon().should("be.visible").click({force: true});
    cy.waitForAsyncRequest();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Open settings modal, check default values, select new ones cancel and check that the defaults values are keep", {defaultCommandTimeout: 120000}, () => {
    cy.log("**Select Graph view and open explore settings modal**");
    browsePage.clickGraphView();
    explorePage.clickExploreSettingsMenuIcon();
    browsePage.getEntityTypeDisplaySettingsButton().scrollIntoView().click({force: true});
    dataModelDisplaySettingsModal.getModalBody().should("be.visible");

    cy.log("**Verify default color it's selected, select new one and check the selection**");
    dataModelDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).should("have.attr", "data-color").then(color => {
      expect(Cypress._.toLower(color)).equal(Cypress._.toLower(defaultEntityTypeData.color.HEX));
    });
    dataModelDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).click();
    dataModelDisplaySettingsModal.getColorInPicket(newEntityTypeData.color.HEX).click();
    dataModelDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).should("have.attr", "data-color", Cypress._.toLower(newEntityTypeData.color.HEX));

    cy.log("**Verify default icon it's selected, select new one and check the selection**");
    dataModelDisplaySettingsModal.getEntityTypeIconButtonWrapper(defaultEntityTypeData.name).should("have.attr", "data-icon", defaultEntityTypeData.icon);
    dataModelDisplaySettingsModal.getEntityTypeIconButton(defaultEntityTypeData.name).click();
    dataModelDisplaySettingsModal.getEntityTypeIconSearchInput(defaultEntityTypeData.name).type(newEntityTypeData.icon);
    dataModelDisplaySettingsModal.getEntityTypeIconMenu(defaultEntityTypeData.name).find("svg").last().click();
    dataModelDisplaySettingsModal.getEntityTypeIconButtonWrapper(defaultEntityTypeData.name).should("have.attr", "data-icon", newEntityTypeData.icon);

    cy.log("**Verify no label are selected, select new one and check the selection**");
    //ToDo: Should move it to RTL test
    //dataModelDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).should("have.text", defaultSelectLabel);
    dataModelDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).click();
    cy.waitForAsyncRequest();
    dataModelDisplaySettingsModal.getEntityLabelDropdownOption(
      defaultEntityTypeData.name, defaultEntityTypeData.properties.name).click();
    dataModelDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.name);

    cy.log("**Verify no propertiesOnHover are selected, select new one and check the selection**");
    //ToDo: Should move it to RTL test
    //dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultSelectProperty);
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdownOption(
      defaultEntityTypeData.properties.name).click({force: true});
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdownOption(
      defaultEntityTypeData.properties.email).click({force: true});
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    dataModelDisplaySettingsModal.getPropertiesOnHoverExpandDropdownOption(
      defaultEntityTypeData.properties.shipping).click({force: true});
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdownOption(
      defaultEntityTypeData.properties.shippingStreet.value).click({force: true});
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.name);
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.email);
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.shippingStreet.label);

    cy.log("**Cancel the edition and verify that the modal close**");
    dataModelDisplaySettingsModal.getModalCancelButton().click();
    dataModelDisplaySettingsModal.getModalBody().should("not.exist");

    cy.log("**Reopen the settings modal and check that not was saved the data and are present the default values**");
    browsePage.getEntityTypeDisplaySettingsButton().scrollIntoView().click({force: true});
    dataModelDisplaySettingsModal.getModalBody().should("be.visible");
    dataModelDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).should("have.attr", "data-color").then(color => {
      expect(Cypress._.toLower(color)).equal(Cypress._.toLower(defaultEntityTypeData.color.HEX));
    });
    dataModelDisplaySettingsModal.getEntityTypeIconButtonWrapper(defaultEntityTypeData.name).should("have.attr", "data-icon", defaultEntityTypeData.icon);
    //ToDo: Should move it to RTL test
    //dataModelDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).should("have.text", defaultSelectLabel);
    //dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultSelectProperty);

    cy.log("**Close the modal**");
    dataModelDisplaySettingsModal.getModalCloseButton().click();
    dataModelDisplaySettingsModal.getModalBody().should("not.exist");
  });

  it("Open settings modal, select new values and save the changes", {defaultCommandTimeout: 120000}, () => {
    browsePage.waitForSpinnerToDisappear();
    cy.wait(1000);
    cy.log("**Select Graph view and open explore settings modal**");
    browsePage.clickGraphView();
    cy.wait(2000);
    explorePage.clickExploreSettingsMenuIcon();
    browsePage.getEntityTypeDisplaySettingsButton().scrollIntoView().click({force: true});
    dataModelDisplaySettingsModal.getModalBody().should("be.visible");

    cy.log("**Check quantity of rows in the table**");
    dataModelDisplaySettingsModal.getTableRows().should("have.length.gt", 2);

    cy.log(`**Filter ${defaultEntityTypeData.name} entity by search option**`);
    dataModelDisplaySettingsModal.getIconSearch().click({force: true});
    dataModelDisplaySettingsModal.getSearchInput().type(defaultEntityTypeData.name, {timeout: 2000});
    dataModelDisplaySettingsModal.getSearchSearchButton().click();
    dataModelDisplaySettingsModal.getTableRows().should("have.length", 1);

    cy.log("**Select new color and check the selection**");
    dataModelDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).click();
    dataModelDisplaySettingsModal.getColorInPicket(newEntityTypeData.color.HEX).click();
    dataModelDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).should("have.attr", "data-color", Cypress._.toLower(newEntityTypeData.color.HEX));

    cy.log("**Select new icon and check the selection**");
    dataModelDisplaySettingsModal.getEntityTypeIconButton(defaultEntityTypeData.name).click();
    dataModelDisplaySettingsModal.getEntityTypeIconSearchInput(defaultEntityTypeData.name).type(newEntityTypeData.icon);
    dataModelDisplaySettingsModal.getEntityTypeIconMenu(defaultEntityTypeData.name).find("svg").last().click();
    dataModelDisplaySettingsModal.getEntityTypeIconButtonWrapper(defaultEntityTypeData.name).should("have.attr", "data-icon", newEntityTypeData.icon);

    cy.log("**Select label and check the selection**");
    dataModelDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).click();
    dataModelDisplaySettingsModal.getEntityLabelDropdownOption(
      defaultEntityTypeData.name, defaultEntityTypeData.properties.name).click();
    dataModelDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.name);

    cy.log("**Select propertiesOnHover and check the selection**");
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdownOption(
      defaultEntityTypeData.properties.name).click({force: true});
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdownOption(
      defaultEntityTypeData.properties.email).click({force: true});
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).click();
    dataModelDisplaySettingsModal.getPropertiesOnHoverExpandDropdownOption(
      defaultEntityTypeData.properties.shipping).click({force: true});
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdownOption(
      defaultEntityTypeData.properties.shippingStreet.value).click({force: true});
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.name);
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.email);
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.shippingStreet.label);

    cy.log("**Clear filter and check table rows");
    dataModelDisplaySettingsModal.getIconSearch().click({force: true});
    dataModelDisplaySettingsModal.getSearchInput().should("have.value", defaultEntityTypeData.name);
    dataModelDisplaySettingsModal.getSearchResetButton().click();
    dataModelDisplaySettingsModal.getTableRows().should("have.length.gt", 2);

    cy.log("**Open search dialog and input should be empty");
    dataModelDisplaySettingsModal.getIconSearch().click({force: true});
    dataModelDisplaySettingsModal.getSearchInput().should("have.value", "");
    dataModelDisplaySettingsModal.getSearchResetButton().click();

    cy.log("**Save the changes**");
    dataModelDisplaySettingsModal.getModalSaveButton().click();
    cy.waitForAsyncRequest();
    dataModelDisplaySettingsModal.getModalBody().should("not.exist");

    cy.log("**Reopen the settings modal and check the new values**");
    browsePage.getEntityTypeDisplaySettingsButton().scrollIntoView().click({force: true});
    dataModelDisplaySettingsModal.getModalBody().should("be.visible");
    dataModelDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).should("have.attr", "data-color", Cypress._.toLower(newEntityTypeData.color.HEX));
    dataModelDisplaySettingsModal.getEntityTypeIconButtonWrapper(defaultEntityTypeData.name).should("have.attr", "data-icon", newEntityTypeData.icon);
    dataModelDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.name);
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.name);
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.email);
    dataModelDisplaySettingsModal.getPropertiesOnHoverDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.shippingStreet.label);

    cy.log("**Close the modal**");
    dataModelDisplaySettingsModal.getModalCloseButton().click();
    dataModelDisplaySettingsModal.getModalBody().should("not.exist");

    cy.log("**Check in the sidebar that the entity type have the new color and icon**");
    entitiesSidebar.getBaseEntity(defaultEntityTypeData.name).should("be.visible").and("have.attr", "data-color").then(color => {
      expect(Cypress._.toLower(color)).equal(Cypress._.toLower(newEntityTypeData.color.HEX));
    });
    entitiesSidebar.getBaseEntity(defaultEntityTypeData.name).should("have.css", "background-color", newEntityTypeData.color.RGB);
    entitiesSidebar.getBaseEntity(defaultEntityTypeData.name).should("have.attr", "data-icon").then(icon => {
      expect(Cypress._.toLower(icon)).equal(Cypress._.toLower(newEntityTypeData.icon));
    });

    cy.log("**Click on customer node and verify that label in side bar**");
    cy.wait(5000);
    graphExplore.stopStabilization();
    cy.waitForAsyncRequest();
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
      cy.findByText(propertiesOnHoverData.shippingStreet).should("exist");
    });

    cy.log("**Open graph side panel and validate data**");
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let customer_102_nodePosition: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      cy.wait(150);
      graphExplore.getGraphVisCanvas().trigger("mouseover", customer_102_nodePosition.x, customer_102_nodePosition.y);
      graphExplore.getGraphVisCanvas().click(customer_102_nodePosition.x, customer_102_nodePosition.y, {force: true});

      graphExploreSidePanel.getSidePanel().scrollIntoView().should("exist");
      graphExploreSidePanel.getSidePanelHeading().should("contain.text", defaultEntityTypeData.propertiesValues.name);

    });
  });

  it("Verify settings modal with a selected entity type in the sidebar", {defaultCommandTimeout: 120000}, () => {
    browsePage.waitForSpinnerToDisappear();
    cy.wait(1000);
    cy.log("**Select Graph view**");
    browsePage.clickGraphView();
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
    explorePage.clickExploreSettingsMenuIcon();
    browsePage.getEntityTypeDisplaySettingsButton().scrollIntoView().click({force: true});
    dataModelDisplaySettingsModal.getModalBody().should("be.visible");

    cy.log("**Select new color and check the selection**");
    dataModelDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).click();
    dataModelDisplaySettingsModal.getColorInPicket(newEntityTypeData2.color.HEX).click();
    dataModelDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).should("have.attr", "data-color", Cypress._.toLower(newEntityTypeData2.color.HEX));

    cy.log("**Select new icon and check the selection**");
    dataModelDisplaySettingsModal.getEntityTypeIconButton(defaultEntityTypeData.name).click();
    dataModelDisplaySettingsModal.getEntityTypeIconSearchInput(
      defaultEntityTypeData.name).type(newEntityTypeData2.icon);
    dataModelDisplaySettingsModal.getEntityTypeIconMenu(defaultEntityTypeData.name).find("svg").last().click();
    dataModelDisplaySettingsModal.getEntityTypeIconButtonWrapper(defaultEntityTypeData.name).should("have.attr", "data-icon", newEntityTypeData2.icon);
    dataModelDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).click();
    dataModelDisplaySettingsModal.getEntityLabelDropdownOption(
      defaultEntityTypeData.name, defaultEntityTypeData.properties.email).click();

    cy.log("**Save the changes**");
    dataModelDisplaySettingsModal.getModalSaveButton().click();
    dataModelDisplaySettingsModal.getModalBody().should("not.exist");

    cy.log("**Reopen the settings modal and check the new values**");
    browsePage.getEntityTypeDisplaySettingsButton().scrollIntoView().click({force: true});
    dataModelDisplaySettingsModal.getModalBody().should("be.visible");
    dataModelDisplaySettingsModal.getEntityTypeColorButton(defaultEntityTypeData.name).should("have.attr", "data-color", Cypress._.toLower(newEntityTypeData2.color.HEX));
    dataModelDisplaySettingsModal.getEntityTypeIconButtonWrapper(defaultEntityTypeData.name).should("have.attr", "data-icon", newEntityTypeData2.icon);
    dataModelDisplaySettingsModal.getEntityLabelDropdown(defaultEntityTypeData.name).should("contain.text", defaultEntityTypeData.properties.email);

    cy.log("**Close the modal**");
    dataModelDisplaySettingsModal.getModalCloseButton().click();
    dataModelDisplaySettingsModal.getModalBody().should("not.exist");

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
    cy.waitForAsyncRequest();
    cy.wait(5000);
    graphExplore.stopStabilization();
    cy.waitForAsyncRequest();
    graphExplore.focusNode(ExploreGraphNodes.CUSTOMER_102);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let customer_102_nodePosition: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      graphExplore.getGraphVisCanvas().trigger("mouseover", customer_102_nodePosition.x, customer_102_nodePosition.y);
      graphExplore.getGraphVisCanvas().click(customer_102_nodePosition.x, customer_102_nodePosition.y, {force: true});
      cy.wait(3000);
    });
    graphExploreSidePanel.getSidePanel().scrollIntoView().should("be.visible");
    graphExploreSidePanel.getSidePanelHeading().should("contain.text", defaultEntityTypeData.propertiesValues.email);
  });
});
