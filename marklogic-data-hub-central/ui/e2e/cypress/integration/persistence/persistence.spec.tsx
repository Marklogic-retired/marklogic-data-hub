import {Application} from "../../support/application.config";
import {confirmationModal, toolbar} from "../../support/components/common";
import curatePage from "../../support/pages/curate";
import loadPage from "../../support/pages/load";
import LoginPage from "../../support/pages/login";
import modelPage from "../../support/pages/model";
import {ConfirmationType} from "../../support/types/modeling-types";
import {
  entityTypeTable,
} from "../../support/components/model/index";

describe("Validate persistence across Hub Central", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer", "hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
    LoginPage.postLogin();
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
    loadPage.loadView("table").click();
    cy.findByTestId("loadTableName").click();
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    loadPage.addNewButton("list").should("be.visible");
    cy.get("[aria-label=\"icon: caret-up\"]").should("have.class", "anticon anticon-caret-up ant-table-column-sorter-up on");
  });

  it("Go to model tile, expand entity and property tables, and then visit another tile. When returning to the model tile, the expanded rows are persisted.", () => {
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    modelPage.selectView("table");
    entityTypeTable.getExpandEntityIcon("Customer").click();
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    confirmationModal.getNavigationWarnText().should("be.visible");
    confirmationModal.getYesButton(ConfirmationType.NavigationWarn);
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    modelPage.selectView("table");
    cy.findByTestId("shipping-shipping-span").should("exist");
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    confirmationModal.getNavigationWarnText().should("be.visible");
    confirmationModal.getYesButton(ConfirmationType.NavigationWarn);
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    modelPage.selectView("table");
    cy.findByTestId("shipping-shipping-span").should("exist");
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

  it.skip("Switch to curate tile, go to Matching step details, and then visit another tile. When returning to curate tile, the step details view is persisted", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Person").should("be.visible"));
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMatchTab("Person");
    curatePage.openStepDetails("match-person");
    cy.contains("The Matching step defines the criteria for comparing documents, as well as the actions to take based on the degree of similarity, which is measured as weights.");
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.contains("The Matching step defines the criteria for comparing documents, as well as the actions to take based on the degree of similarity, which is measured as weights.");
    cy.findByTestId("arrow-left").click();
  });

  it.skip("Switch to curate tile, go to Merging step details, and then visit another tile. When returning to curate tile, the step details view is persisted", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMergeTab("Person");
    curatePage.openStepDetails("merge-person");
    cy.contains("The Merging step defines how to combine documents that the Matching step identified as similar.");
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.contains("The Merging step defines how to combine documents that the Matching step identified as similar.");
    cy.findByTestId("arrow-left").click();
  });

  it("Switch to run view, expand flows, and then visit another tile. When returning to run tile, the expanded flows are persisted.", () => {
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    confirmationModal.getNavigationWarnText().should("be.visible");
    confirmationModal.getYesButton(ConfirmationType.NavigationWarn);
    cy.get("[id=\"personJSON\"]").should("have.class", "ant-collapse-item").click();
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => toolbar.getRunToolbarIcon()).click();
    cy.get("[id=\"personJSON\"]").should("have.class", "ant-collapse-item ant-collapse-item-active");
  });
});
