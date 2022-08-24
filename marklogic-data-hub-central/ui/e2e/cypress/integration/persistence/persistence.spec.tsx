import {confirmationModal, toolbar} from "../../support/components/common";
import {
  entityTypeModal,
  entityTypeTable,
  graphViewSidePanel,
  propertyModal
} from "../../support/components/model/index";

import {Application} from "../../support/application.config";
import {ConfirmationType} from "../../support/types/modeling-types";
import LoginPage from "../../support/pages/login";
import curatePage from "../../support/pages/curate";
import explore from "../../support/pages/browse";
import {generateUniqueName} from "../../support/helper";
import graphView from "../../support/components/explore/graph-view";
import graphVis from "../../support/components/model/graph-vis";
import loadPage from "../../support/pages/load";
import {matchingStepDetail} from "../../support/components/matching";
import mergingStepDetail from "../../support/components/merging/merging-step-detail";
import modelPage from "../../support/pages/model";
import multiSlider from "../../support/components/common/multi-slider";
import propertyTable from "../../support/components/model/property-table";
import tables from "../../support/components/common/tables";

describe("Validate persistence across Hub Central", () => {
  let entityNamesAsc: string[] = [];
  let entityNamesDesc: string[] = [];
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer", "hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
    LoginPage.postLogin();
    //Setup hubCentral config for testing
    cy.setupHubCentralConfig();
  });
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer", "hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
    cy.waitForAsyncRequest();
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Go to load tile, switch to list view, sort, and then visit another tile. When returning to load tile the list view is persisted", {defaultCommandTimeout: 120000}, () => {
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    loadPage.loadView("table").click();
    loadPage.addNewButton("list").should("be.visible");
    cy.waitUntil(() => cy.findByTestId("loadTableName").click());
    cy.get("[aria-label=\"icon: caret-up\"]").should("have.attr", "class").and("match", /hc-table_activeCaret/);
  });
  it(" Explore tile: the graph view switches settings should be preserved", () => {
    toolbar.getExploreToolbarIcon().click();
    explore.getGraphView().click();

    cy.log("**Switch off all the toggles**");
    graphView.getConceptToggle().click();
    graphView.getConceptToggle().should("have.value", "false");

    graphView.getPhysicsAnimationToggle().click();
    graphView.getPhysicsAnimationToggle().should("have.value", "false");

    graphView.getRelationshipLabelsToggle().click();
    graphView.getRelationshipLabelsToggle().should("have.value", "false");

    cy.log("**Switch Tile and come back, toggle value should be the same**");
    toolbar.getCurateToolbarIcon().click();
    toolbar.getExploreToolbarIcon().click();
    graphView.getRelationshipLabelsToggle().should("have.value", "false");
    graphView.getPhysicsAnimationToggle().should("have.value", "false");
    graphView.getPhysicsAnimationToggle().should("have.value", "false");


  });
  it("Go to curate tile, and validate that the accordion and tabs are kept when switching between pages", () => {
    toolbar.getCurateToolbarIcon().click();
    curatePage.getAccordionButton(0).click();
    curatePage.getAccordionButton(1).click();
    curatePage.getAccordionButtonTab(0, 1).click();
    curatePage.getAccordionButtonTab(1, 2).click();
    cy.log("**Before switch page**");
    toolbar.getLoadToolbarIcon().click();
    toolbar.getCurateToolbarIcon().click();
    cy.log("**After come back to curate tile**");
    curatePage.getAccordionButton(0).should("have.attr", "aria-expanded");
    curatePage.getAccordionButton(1).should("have.attr", "aria-expanded");
    curatePage.getAccordionButtonTab(0, 1).should("have.attr", "aria-selected");
    curatePage.getAccordionButtonTab(1, 2).should("have.attr", "aria-selected");
    curatePage.getAccordionButtonTab(0, 0).click();
    curatePage.getAccordionButtonTab(0, 0).click();
    curatePage.getAccordionButton(0).click();
    curatePage.getAccordionButton(1).click();
  });

  it("Go to model tile, expand entity and property tables, and then visit another tile. When returning to the model tile, the expanded rows are persisted.", () => {
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    cy.log("Table view");
    modelPage.selectView("table");
    entityTypeTable.getExpandEntityIcon("Customer");
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.get("body")
      .then(($body) => {
        if ($body.find("[aria-label=\"confirm-navigationWarn-yes\"]").length) {
          confirmationModal.getYesButton(ConfirmationType.NavigationWarn);
        }
      });
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    modelPage.selectView("table");
    cy.findByTestId("shipping-shipping-span").should("exist");
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.get("body")
      .then(($body) => {
        if ($body.find("[aria-label=\"confirm-navigationWarn-yes\"]").length) {
          confirmationModal.getYesButton(ConfirmationType.NavigationWarn);
        }
      });
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    modelPage.selectView("table");
    cy.findByTestId("shipping-shipping-span").should("exist");

    cy.log("Graph view");
    modelPage.selectView("project-diagram");
    modelPage.scrollPageBottom();
    cy.wait(500);
    graphVis.getPositionsOfNodes("Customer").then((nodePositions: any) => {
      let customerCoordinates: any = nodePositions["Customer"];
      graphVis.getGraphVisCanvas().trigger("mouseover", customerCoordinates.x, customerCoordinates.y);
      graphVis.getGraphVisCanvas().click(customerCoordinates.x, customerCoordinates.y);
    });

    cy.log("Check the open tab is persistent");
    graphViewSidePanel.getEntityTypeTab().click();
    graphViewSidePanel.getEntityTypeTabContent().should("exist");

    cy.log("Visit run tile and come back to model");
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.get("body")
      .then(($body) => {
        if ($body.find("[aria-label=\"confirm-navigationWarn-yes\"]").length) {
          confirmationModal.getYesButton(ConfirmationType.NavigationWarn);
        }
      });
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    graphViewSidePanel.getEntityTypeTabContent().should("exist");

    graphViewSidePanel.getPropertiesTab().click();
    propertyTable.getExpandIcon("shipping").scrollIntoView().click();

    cy.log("Verify property has expanded");
    propertyTable.getProperty("shipping-street").scrollIntoView();
    propertyTable.getProperty("shipping-city").scrollIntoView();

    cy.log("Visit run tile and come back to model");
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.get("body")
      .then(($body) => {
        if ($body.find("[aria-label=\"confirm-navigationWarn-yes\"]").length) {
          confirmationModal.getYesButton(ConfirmationType.NavigationWarn);
        }
      });
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();

    cy.log("Verify property is still expanded");
    propertyTable.getProperty("shipping-street").scrollIntoView();
    propertyTable.getProperty("shipping-city").scrollIntoView();

  });

  it("Go to run tile, expand flows and then visit another tile. When returning to the rrun tile, the expanded flows are persisted.", () => {
    // "Switch to run view, expand flows, and then visit another tile. When returning to run tile, the expanded flows are persisted."
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.get("body")
      .then(($body) => {
        if ($body.find("[aria-label=\"confirm-navigationWarn-yes\"]").length) {
          confirmationModal.getYesButton(ConfirmationType.NavigationWarn);
        }
      });
    cy.get("#personJSON .accordion-collapse").should("have.class", "accordion-collapse collapse");
    cy.get("#personJSON .accordion-button").click();
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.get("#personJSON .accordion-collapse").should("have.class", "accordion-collapse collapse show");
  });

  it("Should sort table by entityName asc and desc", () => {
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    modelPage.selectView("table");
    entityTypeTable.getExpandEntityIcon("Customer");

    modelPage.getSortIndicator().scrollIntoView().click();
    modelPage.getEntityLabelNames().then(($els) => {
      return (
        Cypress.$.makeArray($els)
          .map((el) => entityNamesAsc.push(el.innerText.toString()))
      );
    });

    modelPage.getSortIndicator().scrollIntoView().click();
    modelPage.getEntityLabelNames().then(($els) => {
      return (
        Cypress.$.makeArray($els)
          .map((el) => entityNamesDesc.push(el.innerText.toString()))
      );
    });
  });

  it("Validate that the table records on shown in the UI are sorted asc", () => {
    expect(JSON.stringify(entityNamesAsc)).equal(JSON.stringify(entityNamesAsc.sort()));
  });

  it("Validate that the table records on shown in the UI are sorted desc", () => {
    expect(JSON.stringify(entityNamesDesc)).equal(JSON.stringify(entityNamesDesc.sort().reverse()));
  });

  // Persistence of mapping step details is disabled temporarily. DHFPROD-7466
  // it("Switch to curate tile, go to Mapping step details, and then visit another tile. When returning to curate tile, the step details view is persisted", () => {
  //   cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
  //   cy.waitUntil(() => curatePage.getEntityTypePanel("Person").should("be.visible"));
  //   curatePage.toggleEntityTypeId("Person");
  //   curatePage.openStepDetails("mapPersonJSON");
  //   cy.contains("Entity Type: Person");
  //   cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
  //   cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
  //   cy.contains("Entity Type: Person");
  //   cy.findByTestId("arrow-left").click();
  // });

  it("Switch to curate tile, go to Matching step details, and then visit another tile. When returning to curate tile, the step details view is persisted", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Person").should("be.visible"));
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMatchTab("Person");
    curatePage.openStepDetails("match-person");
    cy.contains("The Matching step defines the criteria for determining whether the values from entities match, and the action to take based on how close of a match they are.");
    matchingStepDetail.getExpandBtn().click();

    cy.log("*** Change state of more/less links ***");

    matchingStepDetail.getMoreLinks().first().click({force: true});
    cy.contains("If only some of the values in the entities must match, then move the threshold lower.");
    matchingStepDetail.getMoreLinks().first().click({force: true});
    cy.contains("If you want it to have only some influence, then move the ruleset lower.");

    cy.log("*** Change state of timeline toggles ***");
    multiSlider.enableEdit("threshold");
    multiSlider.enableEdit("ruleset");

    cy.log("*** Add URI's and test response ***");
    matchingStepDetail.getAllDataURIRadio().scrollIntoView().click({force: true});
    matchingStepDetail.getUriInputField().type("/test/Uri1");
    matchingStepDetail.getAddUriIcon().click();
    matchingStepDetail.getUriInputField().clear().type("/test/Uri2");
    matchingStepDetail.getAddUriIcon().click();
    matchingStepDetail.verifyURIAdded("/test/Uri1");
    matchingStepDetail.verifyURIAdded("/test/Uri2");
    matchingStepDetail.getTestMatchUriButton();
    cy.findByLabelText("noMatchedDataView").should("have.length.gt", 0);

    cy.log("*** Return to Curate Tab and verify all states changed above are persisted");

    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.contains("The Matching step defines the criteria for determining whether the values from entities match, and the action to take based on how close of a match they are.");
    cy.contains("If only some of the values in the entities must match, then move the threshold lower.");
    cy.contains("If you want it to have only some influence, then move the ruleset lower.");
    multiSlider.sliderIsActive("threshold");
    multiSlider.sliderIsActive("ruleset");

    matchingStepDetail.getAllDataURIRadio().should("be.checked");
    matchingStepDetail.verifyURIAdded("/test/Uri1");
    matchingStepDetail.verifyURIAdded("/test/Uri2");
    cy.findByLabelText("noMatchedDataView").should("have.length.gt", 0);

    matchingStepDetail.getBackButton().scrollIntoView().click();
  });

  it("Switch to curate tile, go to Merging step details, and then visit another tile. When returning to curate tile, the step details view is persisted", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMergeTab("Person");
    curatePage.openStepDetails("merge-person");
    cy.log("*** Change state of table sorting and strategy expansion ***");
    tables.expandRow("retain-single-value");
    cy.contains("A merge strategy defines how to combine the property values of candidate entities, but the merge strategy is not active until assigned to a merge rule. A merge strategy can be assigned to multiple merge rules.");

    mergingStepDetail.getSortIndicator("Strategy Name").scrollIntoView().click();
    mergingStepDetail.getSortAscIcon().first().should("have.class", "hc-table_activeCaret__2ugNC");
    mergingStepDetail.getSortIndicator("Strategy").last().scrollIntoView().click();
    mergingStepDetail.getSortIndicator("Strategy").last().scrollIntoView().click();
    mergingStepDetail.getSortDescIcon().last().should("have.class", "hc-table_activeCaret__2ugNC");


    cy.log("*** Return to Curate Tab and verify all states changed above are persisted");
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.contains("A merge strategy defines how to combine the property values of candidate entities, but the merge strategy is not active until assigned to a merge rule. A merge strategy can be assigned to multiple merge rules.");
    mergingStepDetail.verifyRowExpanded();
    mergingStepDetail.getSortAscIcon().first().should("have.class", "hc-table_activeCaret__2ugNC");
    mergingStepDetail.getSortDescIcon().last().should("have.class", "hc-table_activeCaret__2ugNC");
    cy.findByTestId("arrow-left").click();
  });

  it("Validates that no unpublished data is lost when switching tiles from Model", () => {
    const entityName = generateUniqueName("Entity-Test");
    const propertyName = generateUniqueName("a-Test");

    cy.log("**Navigates to Model and triggers table view**");
    toolbar.getModelToolbarIcon().click();
    modelPage.selectView("table");

    cy.log("**Creates new Entity**");
    cy.waitUntil(() => modelPage.getAddButton()).click();
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});
    entityTypeModal.newEntityName(entityName);
    entityTypeModal.newEntityDescription("Test Entity");
    entityTypeModal.getAddButton().click();
    cy.waitForAsyncRequest();

    cy.log("**Add a new property to the Entity**");
    propertyTable.getAddPropertyButton(entityName).should("be.visible").click();
    propertyModal.newPropertyName(propertyName);
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string").click();
    propertyModal.getSubmitButton().click();
    cy.waitForAsyncRequest();

    cy.log("**Clicks on Load toolbar icon**");
    toolbar.getLoadToolbarIcon().click();

    cy.log("**Confirms Navigation warn**");
    confirmationModal.getYesButton(ConfirmationType.NavigationWarn);

    cy.log("**Returns to Model**");
    toolbar.getModelToolbarIcon().click();
    modelPage.selectView("table");

    cy.log("**Confirms that the property added is still there**");
    propertyTable.getProperty(propertyName).scrollIntoView().should("be.visible");

    cy.log("**Deletes the entity added by the test**");
    cy.deleteEntities([entityName]);
    cy.waitForAsyncRequest();
  });

});
