import {toolbar, tiles, projectInfo} from "../../support/components/common/index";
import {mappingStepDetail} from "../../support/components/mapping";
import {Application} from "../../support/application.config";
import {generateUniqueName} from "../../support/helper";
import explorePage from "../../support/pages/explore";
import curatePage from "../../support/pages/curate";
import browsePage from "../../support/pages/browse";
import loginPage from "../../support/pages/login";
import modelPage from "../../support/pages/model";
import loadPage from "../../support/pages/load";
import runPage from "../../support/pages/run";
import "cypress-wait-until";

describe("Login", () => {
  before(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.visit("/");
    cy.waitForAsyncRequest();
  });

  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Greets with Data Hub Central title and footer links", () => {
    cy.contains(Application.title);
    cy.contains("Privacy");
  });

  it("Should verify all the error conditions for login", () => {
    loginPage.getUsername().type("{enter}").blur();
    loginPage.getPassword().type("{enter}").blur();
    cy.contains("Username is required");
    cy.contains("Password is required");
    loginPage.getLoginButton().should("be.enabled");

    loginPage.getUsername().type("test");
    loginPage.getPassword().type("password");
    loginPage.getLoginButton().click();
    cy.contains("The username and password combination is not recognized by MarkLogic.");

    loginPage.getUsername().clear();
    loginPage.getPassword().clear();
    cy.fixture("users/admin").then(user => {
      loginPage.getUsername().type(user["user-name"]);
      loginPage.getPassword().type(user.password);
    });
    loginPage.getLoginButton().click();
    cy.contains("User does not have the required permissions to run Data Hub.");
  });

  it("User dropdown should disappear when clicked away", () => {
    cy.loginAsTestUserWithRoles("hub-central-saved-query-user").withUI()
      .url().should("include", "/tiles");
    cy.get(`#user-dropdown`).click();
    cy.get("#logOut").should("be.visible");
    toolbar.getLoadToolbarIcon().click({force: true});
    cy.get("#logOut").should("not.be.visible");
  });

  it("Should only enable Explorer tile for hub-central-user", () => {
    cy.loginAsTestUserWithRoles("hub-central-saved-query-user").withUI()
      .url().should("include", "/tiles");

    ["Load", "Model", "Curate", "Run"].forEach((tile) => {
      toolbar.getToolBarIcon(tile).should("have.attr", {style: "cursor: not-allowed"});
    });

    toolbar.getExploreToolbarIcon().trigger("mouseover");
    cy.contains("Explore");
    toolbar.getExploreToolbarIcon().click();
    tiles.getExploreTile().should("exist");
    projectInfo.getAboutProject().click();
    projectInfo.waitForInfoPageToLoad();
    projectInfo.getDownloadProjectButton().should("be.disabled");
    projectInfo.getDownloadHubCentralFilesButton().should("be.disabled");
    projectInfo.getClearButton().should("be.disabled");
  });

  it("Should only enable Model and Explorer tile for hub-central-entity-model-reader", () => {
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-saved-query-user").withUI()
      .url().should("include", "/tiles");

    ["Load", "Curate", "Run"].forEach((tile) => {
      toolbar.getToolBarIcon(tile).should("have.attr", {style: "cursor: not-allowed"});
    });

    toolbar.getModelToolbarIcon().click();
    cy.wait(2000);
    tiles.getModelTile().should("exist");
    modelPage.switchTableView();
    modelPage.getAddButton().should("be.disabled");
  });

  it("Should only enable Load and Explorer tile for hub-central-load-reader", () => {
    let stepName = "loadCustomersJSON";
    let flowName = "personJSON";
    cy.loginAsTestUserWithRoles("hub-central-load-reader").withUI()
      .url().should("include", "/tiles");

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
    loadPage.addToNewFlow(stepName).click({force: true});
    runPage.newFlowModal().should("not.exist");
    loadPage.existingFlowsList(stepName).click({force: true});
    loadPage.existingFlowsList(flowName).should("not.exist");

    loadPage.loadView("table").click();
    tiles.waitForTableToLoad();
    loadPage.getSortIndicator().click();

    loadPage.addToFlowDisabled(stepName).should("exist");
    loadPage.stepName(stepName).click();
    loadPage.saveButton().should("be.disabled");
    loadPage.cancelButton().click();
    loadPage.deleteStepDisabled(stepName).should("exist");
  });

  it("Should only enable Load and Explorer tile for hub-central-load-writer", () => {
    let stepName = generateUniqueName("loadStep").substring(0, 20);

    cy.log("**Logging into the app as user with hub-central-load-writer role**");
    cy.loginAsTestUserWithRoles("hub-central-load-writer").withRequest();
    loginPage.navigateToMainPage();

    cy.log("**Checks that the user cant navigate to Model, Curate or Run tiles**");
    ["Model", "Curate", "Run"].forEach((tile) => {
      toolbar.getToolBarIcon(tile).should("have.attr", {style: "cursor: not-allowed"});
    });

    cy.log("**Navigates to Load and adds a New Step**");
    toolbar.getLoadToolbarIcon().click();
    cy.wait("@lastRequest");
    cy.wait("@lastRequest");
    loadPage.addNewButton("card").should("be.visible").click();

    cy.log("**Writes the step name and saves changes**");
    loadPage.editLoadModal().should("be.visible");
    loadPage.stepNameInput().type(stepName);
    loadPage.saveButton().should("be.enabled").click();

    cy.log("**Checks that the step is added to the list**");
    cy.log("**Cards view**");
    loadPage.stepName(stepName).should("be.visible");

    cy.log("**Clicks on Run button**");
    loadPage.runStep(stepName).click();
    loadPage.runStepSelectFlowConfirmation().should("be.visible");
    loadPage.runInNewFlow(stepName).click();
    cy.findByLabelText("Ok").click();
    runPage.newFlowModal().should("not.exist");
    toolbar.getLoadToolbarIcon().click();

    cy.log("**Clicks on Step Settings button**");
    loadPage.editStepInCardView(stepName).click();
    loadPage.editLoadModal().should("be.visible");
    loadPage.cancelButton().click();

    cy.log("**Hovers the card**");
    loadPage.stepName(stepName).trigger("mouseover", "top");
    loadPage.addToNewFlow(stepName).click("top", {force: true});
    runPage.newFlowModal().should("not.exist");
    loadPage.existingFlowsList(stepName).click({force: true});
    loadPage.addToNewFlow(stepName).click("top", {force: true}).then(() => {
      cy.log("**Clicks on Delete button**");
      loadPage.deleteStep(stepName).should("be.visible").click();
      loadPage.deleteConfirmation("No").click();
    });

    cy.log("**Table view**");
    loadPage.loadView("table").click();
    tiles.waitForTableToLoad();
    loadPage.stepName(stepName).should("be.visible");

    cy.log("**Clicks hovers and clicks Run to Flow button**");
    loadPage.addToFlowDisabled(stepName).trigger("mouseover");
    browsePage.getPermissionsDeniedTooltip().should("have.text", "Add to Flow: Contact your security administrator for access.");

    loadPage.addToFlowDisabled(stepName).should("be.visible").click();
    loadPage.existingFlowsList(stepName).click({force: true});
    loadPage.addToNewFlow(stepName).click({force: true});
    runPage.newFlowModal().should("not.exist");
    cy.findByLabelText("Ok").click();
    cy.wait(500);
    toolbar.getLoadToolbarIcon().click({force: true});

    cy.log("**Edits step description**");
    loadPage.stepName(stepName).click();
    loadPage.editLoadModal().should("be.visible");
    loadPage.stepDescriptionInput().type("Test description");
    loadPage.saveButton().should("be.enabled").click();
    cy.log("**Validates new description**");
    cy.contains("td", "Test description").should("be.visible");

    cy.log("**Clicks on Run button**");
    loadPage.runStep(stepName).click();
    loadPage.runStepSelectFlowConfirmation().should("be.visible");
    loadPage.runInNewFlow(stepName).click();
    cy.findByLabelText("Ok").click();
    runPage.newFlowModal().should("not.exist");
    cy.wait(500);
    toolbar.getLoadToolbarIcon().click({force: true});

    cy.log("**Clicks on Delete button and deletes the step**");
    loadPage.deleteStep(stepName).should("exist").click();
    loadPage.deleteConfirmation("Yes").click();
    tiles.waitForTableToLoad();
    loadPage.stepName(stepName).should("not.exist");
  });

  it("Verify hub-central-mapping-reader role privileges", () => {
    let entityTypeId = "Customer";
    let mapStepName = "mapCustomersJSON";
    cy.loginAsTestUserWithRoles("hub-central-mapping-reader").withRequest();
    loginPage.navigateToMainPage();

    ["Load", "Model", "Run"].forEach((tile) => {
      toolbar.getToolBarIcon(tile).should("have.attr", {style: "cursor: not-allowed"});
    });

    cy.log("**Navigates to Curate and opens EntityTypeId name**");
    toolbar.getCurateToolbarIcon().click();
    curatePage.toggleEntityTypeId(entityTypeId);
    curatePage.verifyTabs(entityTypeId, "be.visible", "not.exist");

    cy.log("**User cannot see Matching tab**");
    curatePage.verifyMatchingTab(entityTypeId, "not.exist");

    cy.log("**User cannot add a new mapping step**");
    curatePage.addNewStepDisabled(entityTypeId).should("be.visible");

    cy.log("**User can view step info but cannot edit it**");
    curatePage.editStep(mapStepName).click();
    curatePage.verifyStepNameIsVisibleEdit(mapStepName);
    curatePage.saveEdit().should("be.disabled");
    curatePage.cancelEdit().click();

    cy.log("**User cannot delete a step**");
    curatePage.deleteDisabled().should("exist");
    curatePage.noEntityType().should("not.exist");

    cy.log("**User can view step details**");
    curatePage.openStepDetails(mapStepName);

    cy.log("**verify that clear/test button are enabled**");
    curatePage.verifyStepDetailsOpen(mapStepName);
    mappingStepDetail.clearMap().should("be.enabled");
    mappingStepDetail.testMap().should("be.enabled");

    cy.log("**verify that xpath expressions can be edited**");
    curatePage.xpathExpression("customerId").should("be.disabled");
    curatePage.xpathExpression("name").should("be.disabled");
    curatePage.xpathExpression("email").should("be.disabled");
    curatePage.xpathExpression("pin").should("be.disabled");
    curatePage.xpathExpression("nicknames").should("be.disabled");
    curatePage.xpathExpression("shipping").should("be.disabled");
    curatePage.xpathExpression("billing").should("be.disabled");
    curatePage.xpathExpression("birthDate").should("be.disabled");
    curatePage.xpathExpression("status").should("be.disabled");
    curatePage.xpathExpression("customerSince").should("be.disabled");

    cy.log("**verify that URI can be edited**");
    curatePage.verifyStepDetailsOpen(mapStepName);
    mappingStepDetail.getURI().trigger("mouseover");
    mappingStepDetail.getEditIcon().should("be.visible").click();
    mappingStepDetail.getCheckIcon().should("be.visible");
    mappingStepDetail.getCloseIcon().should("be.visible").click();
  });

  it("Should only enable Run and Explorer tile for hub-central-step-runner", () => {
    const flowName = "personJSON";
    const stepName = "mapPersonJSON";
    cy.loginAsTestUserWithRoles("hub-central-step-runner").withUI()
      .url().should("include", "/tiles");

    ["Load", "Model", "Curate"].forEach((tile) => {
      toolbar.getToolBarIcon(tile).should("have.attr", {style: "cursor: not-allowed"});
    });

    cy.log("**Navigates to Run tile**");
    toolbar.getRunToolbarIcon().click();

    cy.log("**This user cannot create new Flows**");
    runPage.createFlowButton().should("be.disabled");

    cy.log("**Clicks on a Flow name**");
    runPage.getFlowNameHeader(flowName).should("be.visible").click();

    cy.log("**This user cant edit the Flow**");
    runPage.editSave().should("be.disabled");
    runPage.editCancel().click();

    runPage.openStepsSelectDropdown("personJSON");

    cy.log("**Change selected steps**");
    runPage.clickStepInsidePopover("#loadPersonJSON");
    runPage.clickStepInsidePopover("#mapPersonJSON");
    runPage.clickStepInsidePopover("#mapPersonJSON");

    cy.log("**This user can run the flow**");
    runPage.getRunFlowButton(flowName).should("be.enabled");

    cy.log("**This user cant add steps nor delete the flow**");
    runPage.getAddStepDropdown(flowName).should("be.disabled");
    runPage.deleteFlowDisabled(flowName).should("exist");

    cy.log("**Toggles the flow to see the steps**");
    runPage.toggleFlowConfig(flowName);
    runPage.deleteStepDisabled(stepName).should("exist");

    cy.log("**Opens Flow Status modal and clicks Explore Data button**");
    runPage.getStatusModalButton(flowName).should("be.visible").click();
    runPage.getAllExplorerLink().eq(0).click();
    explorePage.getTitleExplore().scrollIntoView().should("be.visible");
  });

  it("Should only enable Run and Explorer tile for hub-central-flow-writer", () => {
    const flowName = "personJSON";
    const stepName = "mapPersonJSON";
    cy.loginAsTestUserWithRoles("hub-central-flow-writer").withUI()
      .url().should("include", "/tiles");

    ["Load", "Model", "Curate"].forEach((tile) => {
      toolbar.getToolBarIcon(tile).should("have.attr", {style: "cursor: not-allowed"});
    });

    toolbar.getRunToolbarIcon().click();

    runPage.openStepsSelectDropdown("personJSON");

    cy.log("**Change selected steps**");
    runPage.clickStepInsidePopover("#loadPersonJSON");
    runPage.clickStepInsidePopover("#mapPersonJSON");
    runPage.clickStepInsidePopover("#mapPersonJSON");

    runPage.createFlowButton().should("be.enabled");
    cy.findByText(flowName).should("be.visible");
    runPage.deleteFlow(flowName).should("exist");
    runPage.deleteFlowDisabled(flowName).should("not.exist");
    runPage.toggleFlowConfig(flowName);
    runPage.deleteStep(stepName, flowName).click();
    runPage.deleteStepConfirmationMessage(stepName, flowName).should("be.visible");
    cy.findByLabelText("No").click();
  });

  it("Should verify download of an HC project", () => {
    cy.loginAsTestUserWithRoles("hub-central-downloader").withUI();
    projectInfo.getAboutProject().click();
    projectInfo.waitForInfoPageToLoad();
    projectInfo.getDownloadHubCentralFilesButton().click();
    projectInfo.getDownloadProjectButton().click();
  });

  it("Should redirect to /tiles/explore when uri is undefined for /detail view bookmark", () => {
    let host = Cypress.config().baseUrl;
    cy.visit(`${host}?from=%2Ftiles%2Fexplore%2Fdetail`);
    loginPage.getUsername().type("hc-test-user");
    loginPage.getPassword().type("password");
    loginPage.getLoginButton().click();
    cy.location("pathname").should("include", "/tiles-explore");
    tiles.getExploreTile().should("exist");
  });

  it("Should redirect a bookmark to login screen when not authenticated", () => {
    let host = Cypress.config().baseUrl;
    cy.visit(`${host}?from=%2Ftiles%2Fcurate`);

    loginPage.getUsername().type("hc-developer");
    loginPage.getPassword().type("password");
    loginPage.getLoginButton().click();
    cy.location("pathname").should("include", "/tiles-curate");
    cy.contains("Customer");
    cy.contains("Person");
    cy.contains("No Entity Type");
  });

  it("Can login, navigate to modeling tile, logout, login and auto return to tile view", () => {
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader")
      .withRequest();
    loginPage.navigateToMainPage();
    cy.waitForAsyncRequest();

    cy.scrollTo("top");
    toolbar.getHomePageInfoIcon().should("be.visible").scrollIntoView().click({force: true});
    toolbar.getHomePageInfoPopover().should("exist");

    toolbar.getModelToolbarIcon().should("be.visible").trigger("mouseover", {force: true}).click({force: true});
    cy.url().should("include", "/tiles-model");
    tiles.getModelTile().should("exist");
    cy.get(`#user-dropdown`).click();
    cy.get("#logOut").should("be.visible").click();

    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader")
      .withUI()
      .url().should("include", "/tiles");
    cy.contains("Welcome to MarkLogic Data Hub Central");
  });
});
