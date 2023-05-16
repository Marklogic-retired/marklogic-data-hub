import LoginPage from "../../support/pages/login";
import curatePage from "../../support/pages/curate";
import graphExplore from "../../support/pages/graphExplore";
import explorePage from "../../support/pages/explore";
import runPage from "../../support/pages/run";
import {rulesetSingleModal} from "../../support/components/matching";
import browsePage from "../../support/pages/browse";
import matchingStepDetail from "../../support/components/matching/matching-step-detail";
import {generateRandomString} from "../../support/helper";


const ignoreGonzales = generateRandomString("ignoreGonzales", 3);
const ignoreSimpson  = generateRandomString("ignoreSimpson", 3);

describe("Verify values to ignore feature", () => {

  before(() => {
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer").withRequest();
    LoginPage.navigateToMainPage();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteRecordsInFinal("loadValuesToIgnore", "mapForValuesToIgnore", "matchForValuesToIgnore", "mergeForValuesToIgnore");
    cy.deleteRecordsInFinal("sm-Person-archived", "sm-Person-mastered", "sm-Person-merged", "sm-Person-auditing", "sm-Person-notification");
    cy.deleteRecordsInStaging("loadValuesToIgnore");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Should merge when values do not match", () => {
    cy.visit("/tiles/run");
    cy.waitForAsyncRequest();

    runPage.toggleExpandFlow("testValuesToIgnore");
    runPage.getRunFlowButton("testValuesToIgnore").click();
    cy.uploadFile("input/valuesToIgnore/values-to-ignore1.json");
    cy.uploadFile("input/valuesToIgnore/values-to-ignore2.json");
    cy.uploadFile("input/valuesToIgnore/values-to-ignore3.json");
    cy.uploadFile("input/valuesToIgnore/values-to-ignore4.json");
    cy.waitForAsyncRequest();
    cy.findByTestId("mergeForValuesToIgnore-success", {timeout: 12000}).should("be.visible");
    runPage.explorerLink("mergeForValuesToIgnore").click();
    browsePage.getTableView().click();
    browsePage.waitForSpinnerToDisappear();
    cy.findAllByText("Robert,Bob");
    cy.findAllByText("Marge,Margot");
    cy.findAllByTestId("unmergeIcon").should("have.length", 2);
  });

  it("Should not merge when values do match with one list", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();

    // create a new values to ignore list
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMatchTab("Person");
    curatePage.openStepDetails("matchForValuesToIgnore");
    matchingStepDetail.getRuleSetSwitch().click();
    cy.wait(1000);
    cy.findAllByText("lname - Exact").eq(1).click({force: true});
    rulesetSingleModal.selectValuesToIgnoreInput();
    rulesetSingleModal.createNewList();
    rulesetSingleModal.addListTitle("values-to-ignore-input", ignoreGonzales);
    rulesetSingleModal.addValuesToListToIgnore("Gonzales");
    rulesetSingleModal.saveModalButton("confirm-list-ignore");
    cy.findByText(ignoreGonzales).click({force: true});
    rulesetSingleModal.saveButton().click();

    graphExplore.getRunTile().click();
    cy.waitForAsyncRequest();
    runPage.toggleExpandFlow("testValuesToIgnore");
    runPage.openStepsSelectDropdown("testValuesToIgnore");
    runPage.clickStepInsidePopover("#loadValuesToIgnore");
    runPage.clickStepInsidePopover("#mapForValuesToIgnore");
    runPage.getRunFlowButton("testValuesToIgnore").click();
    cy.waitForAsyncRequest();
    cy.findByTestId("mergeForValuesToIgnore-success", {timeout: 12000}).should("be.visible");
    runPage.explorerLink("mergeForValuesToIgnore").click();
    cy.findByText("Robert,Bob").should("not.exist");
    cy.findByText("Marge,Margot").should("exist");
  });

  it("Should not merge when values do match with multiple lists", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();

    // create a new values to ignore list
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMatchTab("Person");
    curatePage.openStepDetails("matchForValuesToIgnore");
    matchingStepDetail.getRuleSetSwitch().click();
    cy.wait(1000);
    cy.findAllByText("lname - Exact").eq(1).click({force: true});
    rulesetSingleModal.selectValuesToIgnoreInput();
    rulesetSingleModal.createNewList();
    rulesetSingleModal.addListTitle("values-to-ignore-input", ignoreSimpson);
    rulesetSingleModal.addValuesToListToIgnore("Simpson");
    rulesetSingleModal.saveModalButton("confirm-list-ignore");
    cy.findByText(ignoreSimpson).click({force: true});
    rulesetSingleModal.saveButton().click();

    // Run match and merge
    graphExplore.getRunTile().click();
    cy.waitForAsyncRequest();
    runPage.toggleExpandFlow("testValuesToIgnore");
    runPage.getRunFlowButton("testValuesToIgnore").click();
    cy.waitForAsyncRequest();
    cy.findByTestId("mergeForValuesToIgnore-success", {timeout: 12000}).should("be.visible");
    runPage.explorerLink("mergeForValuesToIgnore").click();
    cy.waitForAsyncRequest();
    explorePage.getEntities().click();
    browsePage.getTableView().click();
    browsePage.waitForSpinnerToDisappear();
    cy.findByText("Robert,Bob").should("not.exist");
    cy.findByText("Marge,Margot").should("not.exist");
  });
});
