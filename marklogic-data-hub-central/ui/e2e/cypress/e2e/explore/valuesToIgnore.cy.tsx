import matchingStepDetail from "../../support/components/matching/matching-step-detail";
import {rulesetSingleModal} from "../../support/components/matching";
import graphExplore from "../../support/pages/graphExplore";
import {generateRandomString} from "../../support/helper";
import browsePage from "../../support/pages/browse";
import curatePage from "../../support/pages/curate";
import runPage from "../../support/pages/run";
import {multiSlider} from "../../support/components/common";

const ignoreGonzales = generateRandomString("ignoreGonzales", 3);
const ignoreSimpson  = generateRandomString("ignoreSimpson", 3);

describe("Verify values to ignore feature", () => {
  before(() => {
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.loginAsDeveloperV2().withRequest();
    runPage.navigate();
  });

  after(() => {
    cy.loginAsDeveloperV2().withRequest();
    cy.deleteRecordsInStaging("loadValuesToIgnore");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  afterEach(() => {
    cy.loginAsDeveloperV2().withRequest();
    cy.deleteRecordsInFinal("loadValuesToIgnore", "mapForValuesToIgnore", "matchForValuesToIgnore", "mergeForValuesToIgnore");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Tests matching preview with values to ignore", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();

    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMatchTab("Person");
    curatePage.openStepDetails("match-person");
    matchingStepDetail.getAllDataRadio().click();
    matchingStepDetail.getTestMatchUriButton();
    cy.waitForAsyncRequest();
    cy.wait(1000);
    cy.findByLabelText("noMatchedDataView").should("not.exist");
    let mergeResults = cy.get(`[id="testMatchedPanel"]`).first();
    mergeResults.contains("Match - merge").scrollIntoView().should("have.length.gt", 0).click();
    cy.findByText("/json/persons/first-name-double-metaphone1.json").scrollIntoView().should("be.visible");
    cy.findByText("/json/persons/first-name-double-metaphone2.json").scrollIntoView().should("be.visible");
    cy.findByLabelText("modalTitleLegend").findByTestId("expandBtn").click();
    cy.findAllByText("lname - Exact").should("have.length.gt", 0);

    multiSlider.enableEdit("ruleset");
    multiSlider.ruleSetEditOptionActive("lname", "Exact");
    cy.wait(500);
    rulesetSingleModal.selectValuesToIgnoreInput();
    rulesetSingleModal.createNewList();
    rulesetSingleModal.addValuesToListToIgnore("Wilson");
    rulesetSingleModal.addListTitle("values-to-ignore-input", "ignore-lastname");
    rulesetSingleModal.saveModalButton("confirm-list-ignore");

    rulesetSingleModal.selectValuesToIgnoreInput();
    rulesetSingleModal.selectItemFromList("ignore-lastname");
    rulesetSingleModal.saveButton().click();
    cy.waitForAsyncRequest();

    matchingStepDetail.getAllDataRadio().click();
    matchingStepDetail.getTestMatchUriButton();
    cy.waitForAsyncRequest();
    cy.wait(1000);
    mergeResults = cy.get(`[id="testMatchedPanel"]`).first();
    mergeResults.contains("Match - merge").should("have.length.gt", 0).click();
    cy.findByText("/json/persons/first-name-double-metaphone1.json").should("be.visible");
    cy.findByText("/json/persons/first-name-double-metaphone2.json").should("be.visible");
    cy.findByLabelText("modalTitleLegend").findByTestId("expandBtn").click();
    cy.findByLabelText("lname - Exact").should("not.exist");


    multiSlider.ruleSetEditOptionActive("lname", "Exact");
    cy.wait(500);
    cy.get(`[id="valuesToIgnore"]`).type("{backspace}");
    rulesetSingleModal.selectValuesToIgnoreInput();
    rulesetSingleModal.saveButton().click();
  });

  it("Should merge when values do not match", () => {
    cy.visit("/tiles/run");
    cy.waitForAsyncRequest();
    runPage.toggleExpandFlow("testValuesToIgnore");
    runPage.openStepsSelectDropdown("testValuesToIgnore");
    runPage.clickStepInsidePopover("#loadValuesToIgnore");
    runPage.getRunFlowButton("testValuesToIgnore").click();
    cy.waitUntil(() => runPage.getDocumentsWritten("matchForValuesToIgnore").then((value) => value >= 1));
    cy.findByTestId("mergeForValuesToIgnore-success", {timeout: 12000}).should("be.visible");
    runPage.explorerLink("mergeForValuesToIgnore").click();
    cy.waitForAsyncRequest();
    browsePage.switchToTableView();
    cy.findAllByText("Robert,Bob");
    cy.findAllByText("Marge,Margot");
    cy.findAllByTestId("unmergeIcon").should("have.length", 2);
  });

  it("Should not merge when values do match with one list", () => {
    cy.log("create a new values to ignore list");
    curatePage.navigate();
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
    runPage.getRunFlowButton("testValuesToIgnore").click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    cy.findByTestId("mergeForValuesToIgnore-success", {timeout: 12000}).should("be.visible");
    runPage.explorerLink("mergeForValuesToIgnore").click();
    browsePage.switchToTableView();
    browsePage.waitForSpinnerToDisappear();
    cy.findByText(/^(Robert,Bob|Bob,Robert)$/).should("not.exist");
    cy.findByText(/^(Marge,Margot|Margot,Marge)$/).should("exist");
  });

  it("Should not merge when values do match with multiple lists", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();

    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMatchTab("Person");
    curatePage.openStepDetails("matchForValuesToIgnore");
    matchingStepDetail.getRuleSetSwitch().click();
    cy.wait(1000);
    cy.findAllByText("lname - Exact").eq(1).click({force: true});
    rulesetSingleModal.selectValuesToIgnoreInput();
    rulesetSingleModal.createNewList();
    rulesetSingleModal.addListTitle("values-to-ignore-input", ignoreSimpson);
    rulesetSingleModal.addValuesToListToIgnore("Bouvier Simpson");
    rulesetSingleModal.saveModalButton("confirm-list-ignore");
    cy.findByText(ignoreSimpson).click({force: true});
    rulesetSingleModal.saveButton().click();

    cy.log("Run match and merge");
    graphExplore.getRunTile().click();
    cy.waitForAsyncRequest();
    runPage.toggleExpandFlow("testValuesToIgnore");
    runPage.getRunFlowButton("testValuesToIgnore").click();
    cy.waitForAsyncRequest();
    cy.findByTestId("mergeForValuesToIgnore-success", {timeout: 12000}).should("be.visible");
    runPage.explorerLink("mergeForValuesToIgnore").click();
    cy.findByText(/^(Robert,Bob|Bob,Robert)$/).should("not.exist");
    cy.findByText(/^(Marge,Margot|Margot,Marge)$/).should("not.exist");
  });


  it("Create new List in values to ignore", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMatchTab("Person");
    curatePage.openStepDetails("match-person");
    matchingStepDetail.addNewRuleset();
    matchingStepDetail.getSinglePropertyOption();

    cy.wait(1000);
    rulesetSingleModal.selectValuesToIgnoreInput();
    rulesetSingleModal.createNewList();

    rulesetSingleModal.saveModalButton("confirm-list-ignore");
    cy.findByText("A title for this list is required.");
    cy.findByText("Values to ignore in this list are required.");


    cy.log("**Create new List**");
    rulesetSingleModal.addListTitle("values-to-ignore-input", "TitleList1");
    rulesetSingleModal.addValuesToListToIgnore("Word1");
    rulesetSingleModal.addValuesToListToIgnore("2Word");
    rulesetSingleModal.saveModalButton("confirm-list-ignore");
    cy.wait(500);
    rulesetSingleModal.selectValuesToIgnoreInput();
    cy.findByText("TitleList1");

    cy.log("**try to create with the same name of the last one list**");
    rulesetSingleModal.createNewList();
    rulesetSingleModal.addListTitle("values-to-ignore-input", "TitleList1");
    rulesetSingleModal.addValuesToListToIgnore("Word1");
    rulesetSingleModal.addValuesToListToIgnore("2Word");
    rulesetSingleModal.saveModalButton("confirm-list-ignore");

    cy.findByText((_content, node) => {
      const hasText = (node: Element) => node.textContent === "An existing list is already using the name TitleList1.";
      const nodeHasText = hasText(node);
      const childrenDontHaveText = Array.from(node.children).every(
        (child) => !hasText(child)
      );

      return nodeHasText && childrenDontHaveText;
    });

    cy.log("**Create and close valid list**");
    rulesetSingleModal.clearListTitle("values-to-ignore-input");
    rulesetSingleModal.addListTitle("values-to-ignore-input", "TitleList1New");
    rulesetSingleModal.saveModalButton("confirm-list-ignore");
    cy.wait(1000);

    cy.log("**Edit list of values to ignore**");
    rulesetSingleModal.selectValuesToIgnoreInput();
    rulesetSingleModal.editListButton("TitleList1");
    cy.findByText("Edit List");
    rulesetSingleModal.addListTitle("values-to-ignore-input", "22");
    rulesetSingleModal.addValuesToListToIgnore("Word3");
    rulesetSingleModal.addValuesToListToIgnore("split word");
    rulesetSingleModal.saveModalButton("confirm-list-ignore");
    cy.wait(500);
    rulesetSingleModal.selectValuesToIgnoreInput();
    rulesetSingleModal.hoverItemPresetList("TitleList122");
    cy.findByText("Word1, 2Word, Word3, split word");

    cy.log("**Copy List**");
    rulesetSingleModal.copyListButton("TitleList122");
    cy.findByText("List");
    rulesetSingleModal.addListTitle("values-to-ignore-input", "MyCopy");
    rulesetSingleModal.addValuesToListToIgnore("dog");
    rulesetSingleModal.saveModalButton("confirm-list-ignore");
    cy.wait(500);
    rulesetSingleModal.selectValuesToIgnoreInput();
    cy.findByText("MyCopy");
    rulesetSingleModal.hoverItemPresetList("MyCopy");
    cy.findByText("Word1, 2Word, Word3, split word, dog");
    rulesetSingleModal.closeButton().click();
  });

  it("Values to Ignore list tooltip", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();

    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMatchTab("Person");
    curatePage.openStepDetails("match-person");
    cy.findByLabelText("inputUriRadio").scrollIntoView().click();

    cy.log("**adding new multiple property**");
    cy.log("**check tooltip on presetList**");
    matchingStepDetail.addNewRuleset();
    matchingStepDetail.getSinglePropertyOption();
    rulesetSingleModal.selectValuesToIgnoreInput();
    cy.wait(500);
    if (Cypress.isBrowser("!chrome")) {
      rulesetSingleModal.hoverItemPresetList("MyCopy");
      cy.findByText("Word1, 2Word, Word3, split word, dog");
      rulesetSingleModal.closeButton().click();
    }
  });

  it("Select and save values to ignore", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();

    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMatchTab("Person");
    curatePage.openStepDetails("match-person");
    cy.findByLabelText("inputUriRadio").scrollIntoView().click();

    cy.log("**Add To list to ignore**");
    matchingStepDetail.addNewRuleset();
    matchingStepDetail.getSinglePropertyOption();
    rulesetSingleModal.selectValuesToIgnoreInput();
    rulesetSingleModal.createNewList();
    rulesetSingleModal.addValuesToListToIgnore("Word1");
    rulesetSingleModal.addListTitle("values-to-ignore-input", "swim");
    rulesetSingleModal.saveModalButton("confirm-list-ignore");

    rulesetSingleModal.selectValuesToIgnoreInput();
    rulesetSingleModal.createNewList();
    rulesetSingleModal.addValuesToListToIgnore("Word1");
    rulesetSingleModal.addListTitle("values-to-ignore-input", "List1");
    rulesetSingleModal.saveModalButton("confirm-list-ignore");

    rulesetSingleModal.selectValuesToIgnoreInput();
    rulesetSingleModal.selectItemFromList("swim");
    rulesetSingleModal.selectItemFromList("List1");

    rulesetSingleModal.selectPropertyToMatch("id");
    rulesetSingleModal.selectMatchTypeDropdown("exact");
    rulesetSingleModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.contains("id - Exact").should("have.length.gt", 0);
    cy.findByLabelText("ruleset-scale-switch").click();
    multiSlider.ruleSetEditOptionActive("id", "Exact");
    cy.findByText("swim");
    cy.findByText("List1");

    cy.log("**Deleting a list with references**");
    rulesetSingleModal.saveModalButton("cancel-single-ruleset");
    matchingStepDetail.addNewRuleset();
    matchingStepDetail.getSinglePropertyOption();
    rulesetSingleModal.selectValuesToIgnoreInput();

    rulesetSingleModal.deleteListButton("List1");
    cy.waitForAsyncRequest();
    cy.findAllByTestId("confirmation-modal").within(() => {
      rulesetSingleModal.getElementByAriaLabel("Close").click();
    });

    cy.log("**Creating and deleting a new list without references**");
    rulesetSingleModal.createNewList();
    rulesetSingleModal.addValuesToListToIgnore("Word3");
    rulesetSingleModal.addListTitle("values-to-ignore-input", "swim1");
    rulesetSingleModal.saveModalButton("confirm-list-ignore");
    rulesetSingleModal.selectValuesToIgnoreInput();
    rulesetSingleModal.deleteListButton("swim1");
    rulesetSingleModal.saveModalButton("Yes");
    rulesetSingleModal.selectValuesToIgnoreInput();
    rulesetSingleModal.findText("swim1").should("not.exist");
    rulesetSingleModal.getElementByAriaLabel("Close").click();

    cy.log("**Assign a list, save and delete it**");
    cy.intercept("GET", "/api/steps/matching/exclusionList").as("getExclusionList");
    multiSlider.ruleSetEditOptionActive("id", "Exact");
    cy.wait("@getExclusionList");
    rulesetSingleModal.selectValuesToIgnoreInput();
    rulesetSingleModal.clearValuesToIgnoreInput();
    rulesetSingleModal.deleteListButton("List1");
    rulesetSingleModal.saveModalButton("Yes");
    rulesetSingleModal.findText("List1").should("not.exist");
  });

  it("Try to delete an excludeList that is used in another step", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();

    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMatchTab("Person");
    curatePage.openStepDetails("match-person");
    cy.findByLabelText("inputUriRadio").scrollIntoView().click();
    matchingStepDetail.addNewRuleset();
    matchingStepDetail.getSinglePropertyOption();
    rulesetSingleModal.selectValuesToIgnoreInput();
    rulesetSingleModal.deleteListButton(ignoreSimpson);
    rulesetSingleModal.toggleSteps();
    cy.findByText("matchForValuesToIgnore").should("be.visible");
    cy.findAllByTestId("confirmation-modal").within(() => {
      rulesetSingleModal.getElementByAriaLabel("Close").click();
    });
  });




});
