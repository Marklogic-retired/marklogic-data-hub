import mergingStepDetail from "../../support/components/merging/merging-step-detail";
import {confirmationModal, toolbar} from "../../support/components/common";
import propertyTable from "../../support/components/model/property-table";
import multiSlider from "../../support/components/common/multi-slider";
import {matchingStepDetail} from "../../support/components/matching";
import {ConfirmationType} from "../../support/types/modeling-types";
import graphView from "../../support/components/explore/graph-view";
import graphVis from "../../support/components/model/graph-vis";
import tables from "../../support/components/common/tables";
import graphExplore from "../../support/pages/graphExplore";
import {generateUniqueName} from "../../support/helper";
import curatePage from "../../support/pages/curate";
import browsePage from "../../support/pages/browse";
import LoginPage from "../../support/pages/login";
import modelPage from "../../support/pages/model";
import loadPage from "../../support/pages/load";

import {
  entityTypeModal,
  entityTypeTable,
  graphViewSidePanel,
  propertyModal
} from "../../support/components/model/index";


let entityNamesAsc: string[] = [];
let entityNamesDesc: string[] = [];

const userRoles = [
  "hub-central-flow-writer",
  "hub-central-match-merge-writer",
  "hub-central-mapping-writer",
  "hub-central-load-writer",
  "hub-central-entity-model-reader",
  "hub-central-entity-model-writer",
  "hub-central-saved-query-user"
];

describe("Validate persistence across Hub Central", () => {
  before(() => {
    cy.loginAsTestUserWithRoles(...userRoles).withRequest();
    LoginPage.navigateToMainPage();
    cy.setupHubCentralConfig();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Go to load tile, switch to list view, sort, and then visit another tile. When returning to load tile the list view is persisted", {defaultCommandTimeout: 120000}, () => {
    toolbar.getLoadToolbarIcon().should("be.visible").click();
    browsePage.waitForSpinnerToDisappear();
    toolbar.getRunToolbarIcon().should("be.visible").click();
    browsePage.waitForSpinnerToDisappear();
    toolbar.getLoadToolbarIcon().should("be.visible").click();
    browsePage.waitForSpinnerToDisappear();
    loadPage.loadView("table").click();
    browsePage.waitForSpinnerToDisappear();
    loadPage.addNewButton("list").should("be.visible");
    cy.findByTestId("loadTableName").should("be.visible").click();
    cy.get("[aria-label=\"icon: caret-up\"]").should("have.attr", "class").and("match", /hc-table_activeCaret/);
  });

  it("Explore tile: the graph view switches settings should be preserved", () => {
    toolbar.getExploreToolbarIcon().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.clickGraphView();

    cy.log("**Switch off all the toggles**");
    graphView.getPhysicsAnimationToggle().scrollIntoView().click({force: true});
    graphView.getPhysicsAnimationToggle().should("have.value", "false");

    graphView.getConceptToggle().scrollIntoView().click({force: true});
    graphView.getConceptToggle().should("have.value", "false");

    graphView.getRelationshipLabelsToggle().scrollIntoView().click({force: true});
    graphView.getRelationshipLabelsToggle().should("have.value", "false");

    cy.log("**Switch Tile and come back, toggle value should be the same**");
    toolbar.getCurateToolbarIcon().click();
    browsePage.waitForSpinnerToDisappear();
    toolbar.getExploreToolbarIcon().click();
    browsePage.waitForSpinnerToDisappear();
    graphView.getRelationshipLabelsToggle().should("have.value", "false");
    graphView.getPhysicsAnimationToggle().should("have.value", "false");
    graphView.getPhysicsAnimationToggle().should("have.value", "false");
  });

  it("Go to curate tile, and validate that the accordion and tabs are kept when switching between pages", () => {
    toolbar.getCurateToolbarIcon().click();
    browsePage.waitForSpinnerToDisappear();
    curatePage.getAccordionButton(0).click();
    curatePage.getAccordionButton(1).click();
    curatePage.getAccordionButtonTab(0, 1).click();
    curatePage.getAccordionButtonTab(1, 2).click();
    cy.log("**Before switch page**");
    toolbar.getLoadToolbarIcon().click();
    browsePage.waitForSpinnerToDisappear();
    toolbar.getCurateToolbarIcon().click();
    browsePage.waitForSpinnerToDisappear();
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
    toolbar.getModelToolbarIcon().should("be.visible").click();
    browsePage.waitForSpinnerToDisappear();
    cy.log("Table view");
    modelPage.getPublishButton().invoke("attr", "class").then($classNames => {
      if (!$classNames.includes("graph-view_disabledPointerEvents")) {
        cy.publishDataModel();
      }
    });
    modelPage.selectView("table");
    browsePage.waitForSpinnerToDisappear();
    entityTypeTable.getExpandEntityIcon("Customer");
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.get("body")
      .then(($body) => {
        if ($body.find("[aria-label=\"confirm-navigationWarn-yes\"]").length) {
          confirmationModal.getYesButton(ConfirmationType.NavigationWarn);
        }
      });
    toolbar.getModelToolbarIcon().should("be.visible").click();
    browsePage.waitForSpinnerToDisappear();
    modelPage.selectView("table");
    browsePage.waitForSpinnerToDisappear();
    cy.findByTestId("shipping-shipping-span").should("exist");
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.get("body")
      .then(($body) => {
        if ($body.find("[aria-label=\"confirm-navigationWarn-yes\"]").length) {
          confirmationModal.getYesButton(ConfirmationType.NavigationWarn);
        }
      });
    toolbar.getModelToolbarIcon().should("be.visible").click();
    browsePage.waitForSpinnerToDisappear();
    modelPage.selectView("table");
    browsePage.waitForSpinnerToDisappear();
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
    toolbar.getRunToolbarIcon().should("be.visible").click();
    browsePage.waitForSpinnerToDisappear();
    cy.get("body")
      .then(($body) => {
        if ($body.find("[aria-label=\"confirm-navigationWarn-yes\"]").length) {
          confirmationModal.getYesButton(ConfirmationType.NavigationWarn);
        }
      });
    toolbar.getModelToolbarIcon().should("be.visible").click();
    browsePage.waitForSpinnerToDisappear();
    graphViewSidePanel.getEntityTypeTabContent().should("exist");

    graphViewSidePanel.getPropertiesTab().click();
    propertyTable.getExpandIcon("shipping").scrollIntoView().click();

    cy.log("Verify property has expanded");
    propertyTable.getProperty("shipping-street").scrollIntoView();
    propertyTable.getProperty("shipping-city").scrollIntoView();

    cy.log("Visit run tile and come back to model");
    toolbar.getRunToolbarIcon().should("be.visible").click();
    browsePage.waitForSpinnerToDisappear();
    cy.get("body")
      .then(($body) => {
        if ($body.find("[aria-label=\"confirm-navigationWarn-yes\"]").length) {
          confirmationModal.getYesButton(ConfirmationType.NavigationWarn);
        }
      });
    toolbar.getModelToolbarIcon().should("be.visible").click();
    browsePage.waitForSpinnerToDisappear();

    cy.log("Verify property is still expanded");
    propertyTable.getProperty("shipping-street").scrollIntoView();
    propertyTable.getProperty("shipping-city").scrollIntoView();
  });

  /* Skipping until the Run flow persistance functionality is restored on DHFPROD-9456 */
  it.skip("Go to run tile, expand flows and then visit another tile. When returning to the rrun tile, the expanded flows are persisted.", () => {
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
    toolbar.getModelToolbarIcon().should("be.visible").click();
    browsePage.waitForSpinnerToDisappear();
    modelPage.selectView("table");
    browsePage.waitForSpinnerToDisappear();
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
    toolbar.getCurateToolbarIcon().should("be.visible").click();
    browsePage.waitForSpinnerToDisappear();
    curatePage.getEntityTypePanel("Person").should("be.visible");
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

    toolbar.getLoadToolbarIcon().should("be.visible").click();
    browsePage.waitForSpinnerToDisappear();
    toolbar.getCurateToolbarIcon().should("be.visible").click();
    browsePage.waitForSpinnerToDisappear();
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
    toolbar.getCurateToolbarIcon().should("be.visible").click();
    browsePage.waitForSpinnerToDisappear();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMergeTab("Person");
    curatePage.openStepDetails("merge-person");
    cy.log("*** Change state of table sorting and strategy expansion ***");
    tables.expandRow("retain-single-value");
    cy.contains("A merge strategy defines how to combine the property values of candidate entities, but the merge strategy is not active until assigned to a merge rule. A merge strategy can be assigned to multiple merge rules.");

    mergingStepDetail.getSortIndicator("Strategy Name").scrollIntoView().click();
    mergingStepDetail.getSortAscIcon().first().invoke("attr", "class").should("contain", "hc-table_activeCaret__");
    mergingStepDetail.getSortIndicator("Strategy").last().scrollIntoView().click();
    mergingStepDetail.getSortIndicator("Strategy").last().scrollIntoView().click();
    mergingStepDetail.getSortDescIcon().last().invoke("attr", "class").should("contain", "hc-table_activeCaret__");

    cy.log("*** Return to Curate Tab and verify all states changed above are persisted");
    toolbar.getLoadToolbarIcon().should("be.visible").click();
    browsePage.waitForSpinnerToDisappear();
    toolbar.getCurateToolbarIcon().should("be.visible").click();
    browsePage.waitForSpinnerToDisappear();
    cy.contains("A merge strategy defines how to combine the property values of candidate entities, but the merge strategy is not active until assigned to a merge rule. A merge strategy can be assigned to multiple merge rules.");
    mergingStepDetail.verifyRowExpanded();
    mergingStepDetail.getSortAscIcon().first().invoke("attr", "class").should("contain", "hc-table_activeCaret__");
    mergingStepDetail.getSortDescIcon().last().invoke("attr", "class").should("contain", "hc-table_activeCaret__");
    cy.findByTestId("arrow-left").click();
  });

  it("Validates that no unpublished data is lost when switching tiles from Model", () => {
    const entityName = generateUniqueName("Entity-Test");
    const propertyName = generateUniqueName("a-Test");

    cy.log("**Navigates to Model and triggers table view**");
    toolbar.getModelToolbarIcon().click();
    browsePage.waitForSpinnerToDisappear();
    modelPage.selectView("table");
    browsePage.waitForSpinnerToDisappear();

    cy.log("**Creates new Entity**");
    modelPage.getAddButton().should("be.visible").click();
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});
    entityTypeModal.newEntityName(entityName);
    entityTypeModal.newEntityDescription("Test Entity");
    entityTypeModal.getAddButton().click();
    cy.waitForAsyncRequest();

    cy.log("**Add a new property to the Entity**");
    cy.get("[aria-label='Last Processed sortable']").scrollIntoView().should("be.visible").click();
    propertyTable.getAddPropertyButton(entityName).scrollIntoView().should("be.visible").click();
    propertyModal.newPropertyName(propertyName);
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string");
    propertyModal.getSubmitButton().click();
    cy.waitForAsyncRequest();

    cy.log("**Clicks on Load toolbar icon**");
    toolbar.getLoadToolbarIcon().click();
    browsePage.waitForSpinnerToDisappear();

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

  it("Validate persistence for search and facets on sidebar when toggling database in explore tile", () => {
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer", "hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
    cy.visit("/tiles/explore");
    cy.waitForAsyncRequest();
    browsePage.waitForSpinnerToDisappear();
    browsePage.databaseSwitch("final");
    graphExplore.getSearchBar().type("Adams");
    browsePage.getApplyFacetsButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("source-name", "CustomerSourceName").click();
    browsePage.getFacetItemCheckbox("collection", "Customer").click();
    browsePage.getApplyFacetsButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.databaseSwitch("staging").click();
    browsePage.waitForSpinnerToDisappear();
    graphExplore.getSearchBar().should("have.value", "Adams");
    browsePage.getFacetItemCheckbox("source-name", "CustomerSourceName").should("exist");
    browsePage.getFacetItemCheckbox("collection", "Customer").should("exist");
    browsePage.databaseSwitch("final").click();
    browsePage.waitForSpinnerToDisappear();
    graphExplore.getSearchBar().should("have.value", "Adams");
    browsePage.getFacetItemCheckbox("source-name", "CustomerSourceName").should("exist");
    browsePage.getFacetItemCheckbox("collection", "Customer").should("exist");
  });

  it("MatchingStepDetails: Retain state in 'Test and review matched entities' section when switch Tile", () => {
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer", "hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMatchTab("Person");
    curatePage.openStepDetails("match-person");
    matchingStepDetail.getAllDataRadio().click();

    toolbar.getRunToolbarIcon().click();
    cy.waitForAsyncRequest();
    toolbar.getCurateToolbarIcon().click();
    matchingStepDetail.getTestMatchUriButton().click();
    cy.findByText("Matched Entities");

    matchingStepDetail.getAllDataURIRadio().click();
    toolbar.getRunToolbarIcon().click();
    cy.waitForAsyncRequest();
    toolbar.getCurateToolbarIcon().click();
    matchingStepDetail.getTestMatchUriButton().click();
    cy.findByText("At least one URI is required.");

    matchingStepDetail.getUriOnlyRadio().click();
    toolbar.getRunToolbarIcon().click();
    cy.waitForAsyncRequest();
    toolbar.getCurateToolbarIcon().click();
    matchingStepDetail.getTestMatchUriButton().click();
    cy.findByText("At least Two URIs are required.");
  });
});
