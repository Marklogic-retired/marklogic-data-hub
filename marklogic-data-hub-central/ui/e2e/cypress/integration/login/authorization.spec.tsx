/// <reference types="cypress"/>

import loginPage from "../../support/pages/login";
import {Application} from "../../support/application.config";
import {toolbar, tiles, projectInfo} from "../../support/components/common/index";
import "cypress-wait-until";
import loadPage from "../../support/pages/load";
import modelPage from "../../support/pages/model";
import runPage from "../../support/pages/run";
import curatePage from "../../support/pages/curate";
import browsePage from "../../support/pages/browse";

describe("login", () => {

  before(() => {
    cy.visit("/");
    cy.waitForAsyncRequest();
  });

  afterEach(() => {
    cy.logout();
    cy.waitForAsyncRequest();
  });

  after(() => {
    //resetting the test user back to only have 'hub-central-user' role
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("greets with Data Hub Central title and footer links", () => {
    cy.contains(Application.title);
    cy.contains("Privacy");
  });

  it("should verify all the error conditions for login", () => {
    //Verify username/password is required and login button is enabled
    loginPage.getUsername().type("{enter}").blur();
    loginPage.getPassword().type("{enter}").blur();
    cy.contains("Username is required");
    cy.contains("Password is required");
    loginPage.getLoginButton().should("be.enabled");

    //Verify invalid credentials error message
    loginPage.getUsername().type("test");
    loginPage.getPassword().type("password");
    loginPage.getLoginButton().click();
    cy.contains("The username and password combination is not recognized by MarkLogic.");

    //Verify admin cannot login
    loginPage.getUsername().clear();
    loginPage.getPassword().clear();
    cy.fixture("users/admin").then(user => {
      loginPage.getUsername().type(user["user-name"]);
      loginPage.getPassword().type(user.password);
    });
    loginPage.getLoginButton().click();
    cy.contains("User does not have the required permissions to run Data Hub.");

  });

  it("should only enable Explorer tile for hub-central-user", () => {
    cy.loginAsTestUserWithRoles("hub-central-saved-query-user").withUI()
      .url().should("include", "/tiles");
    //All tiles but Explore, should show a tooltip that says contact your administrator
    ["Load", "Model", "Curate", "Run"].forEach((tile) => {
      toolbar.getToolBarIcon(tile).should("have.attr", {style: "cursor: not-allowed"});
    });

    toolbar.getExploreToolbarIcon().trigger("mouseover");
    cy.contains("Explore");
    toolbar.getExploreToolbarIcon().click();
    cy.findByText("Search, filter, review, and export your data.");
    tiles.getExploreTile().should("exist");
    projectInfo.getAboutProject().click();
    projectInfo.waitForInfoPageToLoad();
    projectInfo.getDownloadProjectButton().should("be.disabled");
    projectInfo.getDownloadHubCentralFilesButton().should("be.disabled");
    projectInfo.getClearButton().should("be.disabled");
  });

  it("should only enable Model and Explorer tile for hub-central-entity-model-reader", () => {
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-saved-query-user").withUI()
      .url().should("include", "/tiles");
    //All tiles but Explore and Model, should show a tooltip that says contact your administrator
    ["Load", "Curate", "Run"].forEach((tile) => {
      toolbar.getToolBarIcon(tile).should("have.attr", {style: "cursor: not-allowed"});
    });

    toolbar.getModelToolbarIcon().click();
    cy.wait(2000);
    tiles.getModelTile().should("exist");
    modelPage.selectView("table");
    modelPage.getAddEntityButton().should("be.disabled");
  });

  it("should only enable Load and Explorer tile for hub-central-load-reader", () => {
    let stepName = "loadCustomersJSON";
    let flowName= "personJSON";
    cy.loginAsTestUserWithRoles("hub-central-load-reader").withUI()
      .url().should("include", "/tiles");
    //All tiles but Explore and Model, should show a tooltip that says contact your administrator
    ["Model", "Curate", "Run"].forEach((tile) => {
      toolbar.getToolBarIcon(tile).should("have.attr", {style: "cursor: not-allowed"});
    });

    toolbar.getLoadToolbarIcon().click();
    loadPage.loadView("th-large").should("be.visible");
    loadPage.addNewButton("card").should("not.exist");
    loadPage.editStepInCardView(stepName).click();
    loadPage.saveButton().should("be.disabled");
    loadPage.cancelButton().click();
    loadPage.deleteStepDisabled(stepName).should("exist");
    loadPage.stepName(stepName).trigger("mouseover");
    loadPage.addToNewFlow(stepName).click();
    runPage.newFlowModal().should("not.exist");
    loadPage.existingFlowsList(stepName).click();
    loadPage.existingFlowsList(flowName).should("not.exist");

    loadPage.loadView("table").click();
    tiles.waitForTableToLoad();
    loadPage.addToFlowDisabled(stepName).should("exist");
    loadPage.stepName(stepName).click();
    loadPage.saveButton().should("be.disabled");
    loadPage.cancelButton().click();
    loadPage.deleteStepDisabled(stepName).should("exist");
  });

  it("should only enable Curate and Explorer tile for hub-central-mapping-reader", () => {
    let entityTypeId = "Customer";
    let mapStepName = "mapCustomersXML";
    cy.loginAsTestUserWithRoles("hub-central-mapping-reader").withUI()
      .url().should("include", "/tiles");
    //All tiles but Explore and Model, should show a tooltip that says contact your administrator
    ["Load", "Model", "Run"].forEach((tile) => {
      toolbar.getToolBarIcon(tile).should("have.attr", {style: "cursor: not-allowed"});
    });

    toolbar.getCurateToolbarIcon().click();
    curatePage.toggleEntityTypeId(entityTypeId);
    curatePage.verifyTabs(entityTypeId, "be.visible", "not.exist");
    curatePage.addNewStepDisabled(entityTypeId).should("be.visible");
    curatePage.editStep(mapStepName).click();
    curatePage.verifyStepNameIsVisibleEdit(mapStepName);
    curatePage.saveEdit().should("be.disabled");
    curatePage.cancelEdit().click();
    curatePage.deleteDisabled().should("exist");
    curatePage.noEntityType().should("not.exist");
  });

  it("should only enable Run and Explorer tile for hub-central-step-runner", () => {
    const flowName = "personJSON";
    const stepName = "loadPersonJSON";
    cy.loginAsTestUserWithRoles("hub-central-step-runner").withUI()
      .url().should("include", "/tiles");
    //All tiles but Run and Explore, should show a tooltip that says contact your administrator
    ["Load", "Model", "Curate"].forEach((tile) => {
      toolbar.getToolBarIcon(tile).should("have.attr", {style: "cursor: not-allowed"});
    });

    toolbar.getRunToolbarIcon().click();
    runPage.createFlowButton().should("be.disabled");
    cy.findByText(flowName).should("be.visible");
    runPage.deleteFlowDisabled(flowName).should("exist");
    runPage.toggleFlowConfig(flowName);
    runPage.deleteStepDisabled(stepName).should("exist");
  });

  it("should only enable Run and Explorer tile for hub-central-flow-writer", () => {
    const flowName = "personJSON";
    const stepName = "loadPersonJSON";
    cy.loginAsTestUserWithRoles("hub-central-flow-writer").withUI()
      .url().should("include", "/tiles");
    //All tiles but Run and Explore, should show a tooltip that says contact your administrator
    ["Load", "Model", "Curate"].forEach((tile) => {
      toolbar.getToolBarIcon(tile).should("have.attr", {style: "cursor: not-allowed"});
    });

    toolbar.getRunToolbarIcon().click();
    runPage.createFlowButton().should("be.enabled");
    cy.findByText(flowName).should("be.visible");
    runPage.deleteFlow(flowName).should("exist");
    runPage.deleteFlowDisabled(flowName).should("not.exist");
    runPage.toggleFlowConfig(flowName);
    runPage.deleteStep(stepName, flowName).click();
    runPage.deleteStepConfirmationMessage(stepName, flowName).should("be.visible");
    cy.findByLabelText("No").click();
  });

  it("should verify download of an HC project", () => {
    cy.loginAsTestUserWithRoles("hub-central-downloader").withUI();
    projectInfo.getAboutProject().click();
    projectInfo.waitForInfoPageToLoad();
    projectInfo.getDownloadHubCentralFilesButton().click();
    projectInfo.getDownloadProjectButton().click();
  });

  it("should redirect to /tiles/explore when uri is undefined for /detail view bookmark", () => {
    let host = Cypress.config().baseUrl;
    cy.visit(`${host}?from=%2Ftiles%2Fexplore%2Fdetail`);
    loginPage.getUsername().type("hc-test-user");
    loginPage.getPassword().type("password");
    loginPage.getLoginButton().click();
    cy.location("pathname").should("include", "/tiles/explore");
    tiles.getExploreTile().should("exist");
    browsePage.getSelectedEntity().should("contain", "All Entities");
  });

  it("should redirect a bookmark to login screen when not authenticated", () => {
    let host = Cypress.config().baseUrl;
    //URL from bookmark
    cy.visit(`${host}?from=%2Ftiles%2Fcurate`);
    //Redirected to login
    loginPage.getUsername().type("hc-developer");
    loginPage.getPassword().type("password");
    loginPage.getLoginButton().click();
    cy.location("pathname").should("include", "/tiles/curate");
    cy.waitUntil(() => cy.contains("Customer"));
    cy.contains("Person");
    cy.contains("No Entity Type");
  });

  it("can login, navigate to modeling tile, logout, login and auto return to tile view", () => {
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader")
      .withUI()
      .url().should("include", "/tiles");

    // To verify on click operation works as expected
    toolbar.getHomePageInfoIcon().click();
    toolbar.getHomePageInfoPopover().should("be.visible");
    toolbar.getHomePageInfoIcon().click();
    toolbar.getHomePageInfoPopover().should("be.not.visible");

    toolbar.getModelToolbarIcon().trigger("mouseover").click();
    cy.url().should("include", "/tiles/model");
    tiles.getModelTile().should("exist");
    cy.get("[aria-label=\"user-dropdown\"]").trigger("mousedown");
    cy.waitUntil(() => cy.get("#logOut").should("be.visible")).click();

    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader")
      .withUI()
      .url().should("include", "/tiles");
    cy.contains("Welcome to MarkLogic Data Hub Central");
  });

});
