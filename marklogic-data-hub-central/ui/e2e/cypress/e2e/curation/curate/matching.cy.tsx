
import {advancedSettingsDialog, mappingStepDetail} from "../../../support/components/mapping/index";
import curatePage from "../../../support/pages/curate";
import {
  matchingStepDetail,
  rulesetSingleModal,
  thresholdModal,
  rulesetMultipleModal,
  compareValuesModal
} from "../../../support/components/matching/index";
import {
  createEditStepDialog,
  multiSlider,
  confirmYesNo
} from "../../../support/components/common/index";

import "cypress-wait-until";

const matchStep = "matchCustTest";
const matchStepCollection = "matchCustTestCollection";

const uriMatchedResults = [{ruleName: "Match - merge", threshold: "19", matchedPairs: "6"},
  {ruleName: "Likely Match - notify", threshold: "9", matchedPairs: "5"}];

const ruleset = [{ruleName: "Match - merge", threshold: "19", matchedPairs: "5"},
  {ruleName: "Likely Match - notify", threshold: "9", matchedPairs: "2"}];

const allDataMatchedResults = [{ruleset: "lname - Exact", matchType: "Exact 0", score: "score 10"},
  {ruleset: "fname - Double Metaphone", matchType: "Double Metaphone 1", score: "score 10"},
  {ruleset: "testMultipleProperty", matchType: "", score: ""}];

const urisMerged = ["/json/persons/first-name-double-metaphone1.json", "/json/persons/first-name-double-metaphone2.json"];
const uris = ["/json/persons/first-name-double-metaphone1.json", "/json/persons/first-name-double-metaphone2.json", "/json/persons/last-name-plus-zip-boost1.json", "/json/persons/last-name-plus-zip-boost2.json", "/json/persons/last-name-dob-custom1.json", "/json/persons/last-name-dob-custom2.json", "/json/persons/first-name-synonym1.json", "/json/persons/first-name-synonym2.json"];
const compareValuesData = [{propertyName: "id", uriValue1: "empty", uriValue2: "empty"}, {propertyName: "fname", uriValue1: "Alexandra", uriValue2: "Alexandria"},
  {propertyName: "lname", uriValue1: "Wilson", uriValue2: "Wilson"}, {propertyName: "Address", uriValue1: "123 Wilson St", uriValue2: "123 Wilson Rd"}];
const urisDummy = ["dummy1", "dummy2"];

describe("Matching", () => {
  before(() => {
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer").withRequest();
    curatePage.navigate();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("matching");
    cy.resetTestUser();
  });

  it("Navigate to curate tab and Open Product Detail entity", () => {
    curatePage.getEntityTypePanel("ProductDetail").should("be.visible");
    curatePage.toggleEntityTypeId("ProductDetail");
    cy.findByLabelText("mappingNoTitleDisplay").should("be.visible");
    curatePage.selectMatchTab("ProductDetail");
    cy.findByLabelText("matchingNoTitleDisplay").should("be.visible");
    curatePage.selectMergeTab("ProductDetail");
    cy.findByLabelText("mergingNoTitleDisplay").should("be.visible");
  });

  it("Navigate to curate tab and Open Customer entity", () => {
    curatePage.navigate();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMatchTab("Customer");
    curatePage.addNewStep("Customer");
  });

  it("Create a new match step with a collection and review the preloaded value", () => {
    curatePage.navigate();
    curatePage.getEntityTypePanel("Customer").should("be.visible");
    curatePage.addNewStep("Customer").should("be.visible").click();
    createEditStepDialog.stepNameInput().type(matchStepCollection);
    createEditStepDialog.stepDescriptionInput().type("match customer step example for collection", {timeout: 2000});
    createEditStepDialog.setSourceRadio("Collection");
    cy.log("**Selecting value in select component**");
    mappingStepDetail.getCollectionInputValue().click({force: true});
    cy.intercept("POST", "/api/entitySearch/facet-values?database=*").as("loadSelect");
    mappingStepDetail.getCollectionInputValue().focus().type("json");
    cy.wait("@loadSelect").its("response.statusCode").should("eq", 200).then(() => {
      createEditStepDialog.getElementById("collList").should("exist").then(() => {
        createEditStepDialog.reviewSelectContent("mapCustomersWithRelatedEntitiesJSON").click();
      });
    });
    createEditStepDialog.saveButton("matching").click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(matchStepCollection);
    cy.log("**Reviewing preloaded value**");
    mappingStepDetail.getEditStepSettingsButton("matchCustTestCollection").click();
    mappingStepDetail.getCollectionInputValue().should("have.value", "mapCustomersWithRelatedEntitiesJSON");
    createEditStepDialog.cancelButton("matching").click();
  });

  it("Creating a new match step and verify the counter", () => {
    curatePage.addNewStep("Customer").should("be.visible").click();
    createEditStepDialog.stepNameInput().type(matchStep);
    createEditStepDialog.stepDescriptionInput().type("match customer step example", {timeout: 2000});
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['${matchStep}'])`);
    createEditStepDialog.saveButton("matching").click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(matchStep);
    mappingStepDetail.verifyCountOfCards("Customer", "fa-pencil-alt", "-tab-match", "Matching");
  });

  it("Validate step name is disabled, description is as expected and validate discard confirmation modal is displayed on click of cancel", () => {
    curatePage.editStep(matchStep).click();
    createEditStepDialog.stepNameInput().should("be.disabled");
    createEditStepDialog.stepDescriptionInput().should("have.value", "match customer step example");
    createEditStepDialog.stepDescriptionInput().clear().type("UPDATED - match customer step example", {timeout: 2000});
    createEditStepDialog.cancelButton("matching").click();
    confirmYesNo.getDiscardText().should("be.visible");
    confirmYesNo.getYesButton().click();
  });

  it("Check if the changes are reverted back when discarded all changes.", () => {
    curatePage.editStep(matchStep).click();
    createEditStepDialog.stepDescriptionInput().should("not.have.value", "UPDATED - match customer step example");
    createEditStepDialog.cancelButton("matching").click();
  });

  it("Open matching step details", () => {
    curatePage.openStepDetails(matchStep);
    cy.contains("The Matching step defines the criteria for determining whether the values from entities match, and the action to take based on how close of a match they are.");

    cy.findByText("Expand All").should("have.length.lt", 1);
    cy.findByText("Collapse All").should("have.length.lt", 1);

    cy.get("[class*=\"matching-step-detail_expandCollapseRulesIcon_\"]").within(() => {
      cy.findByLabelText("expand-collapse").within(() => {
        cy.get(".switch-button-group").within(() => {
          cy.get("label:first").click();
        });
      });
    });
    cy.findByText("Expand All").should("be.visible");

    cy.get("[class*=\"matching-step-detail_expandCollapseRulesIcon_\"]").within(() => {
      cy.findByLabelText("expand-collapse").within(() => {
        cy.get(".switch-button-group").within(() => {
          cy.get("label:last").click();
        });
      });
    });
    cy.findByText("Collapse All").should("be.visible");
    matchingStepDetail.showThresholdTextMore().should("have.length.lt", 1);
    matchingStepDetail.showThresholdTextLess().should("have.length.gt", 0);
    matchingStepDetail.showRulesetTextMore().should("have.length.lt", 1);
    matchingStepDetail.showRulesetTextLess().should("have.length.gt", 0);
  });

  it("Add threshold", () => {
    matchingStepDetail.addThresholdButton().click();
    thresholdModal.setThresholdName("test");
    thresholdModal.selectActionDropdown("Merge");
    thresholdModal.saveButton().click({force: true});
    cy.waitForAsyncRequest();
    cy.findByText("test - merge").should("have.length.gt", 0);
    multiSlider.getThresholdDefaultHandleNameAndType("test", "merge").should("be.visible");
  });

  it("Edit threshold Property to Match", () => {
    multiSlider.enableEdit("threshold");
    multiSlider.thresholdEditOptionActive("test", "merge");
    thresholdModal.clearThresholdName();
    thresholdModal.setThresholdName("testing");
    thresholdModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.findByText("testing - merge").should("have.length.gt", 0);
    multiSlider.getThresholdHandleNameAndType("testing", "merge").should("be.visible");
  });

  it("Edit threshold Match Type", () => {
    multiSlider.thresholdEditOptionActive("testing", "merge");
    thresholdModal.selectActionDropdown("Notify");
    thresholdModal.saveButton().click();
    thresholdModal.getModalDialog().should("not.exist");
    cy.waitForAsyncRequest();
    cy.findByText("testing - notify").should("have.length.gt", 0);
    multiSlider.getThresholdHandleNameAndType("testing", "notify").should("be.visible");
  });

  // TODO: DHFPROD-10177
  it.skip("Validating the slider tooltip", () => {
    multiSlider.getHandleName("testing").trigger("mousemove", {force: true});
    multiSlider.sliderTooltipValue("1");
    multiSlider.sliderTicksHover("threshold-slider", "19.1919");
    multiSlider.sliderTooltipValue("20");
  });

  it("Add ruleset", () => {
    matchingStepDetail.addNewRuleset();
    matchingStepDetail.getSinglePropertyOption();
    rulesetSingleModal.selectPropertyToMatch("customerId");
    rulesetSingleModal.selectMatchTypeDropdown("exact");
    rulesetSingleModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.contains("customerId - Exact").should("have.length.gt", 0);
    multiSlider.getRulesetDefaultHandleNameAndType("customerId", "Exact").should("exist");
  });

  // TODO: DHFPROD-10177
  it.skip("When we work on the spike story to update multi-slider componenens using cypress", () => {
    multiSlider.getHandleName("customerId").trigger("mousedown", {force: true});
    cy.findByTestId("ruleSet-slider-ticks").find(`div[style*="left: 19.1919%;"]`).trigger("mousemove", {force: true});
    multiSlider.getHandleName("customerId").trigger("mouseup", {force: true});
    matchingStepDetail.getPossibleMatchCombinationHeading("testing").trigger("mousemove").should("exist");
    matchingStepDetail.getPossibleMatchCombinationRuleset("testing", "customerId - Exact").should("exist");
  });

  it("Add another ruleset", () => {
    matchingStepDetail.addNewRuleset();
    matchingStepDetail.getSinglePropertyOption();
    rulesetSingleModal.selectPropertyToMatch("email");
    rulesetSingleModal.selectMatchTypeDropdown("exact");

    cy.log("**Create new list**");
    rulesetSingleModal.getElementWithID("valuesToIgnore").click({force: true});
    rulesetSingleModal.getElementWithID("createNewListOption").click();
    rulesetSingleModal.saveModalButton("confirm-list-ignore");
    rulesetSingleModal.getElementWithID("errorListName").should("exist");
    rulesetSingleModal.getElementWithID("errorListValues").should("exist");
    rulesetSingleModal.addListTitle("values-to-ignore-input", "Titlelist1");
    rulesetSingleModal.addValuesToListToIgnore("Word1");
    rulesetSingleModal.addValuesToListToIgnore("Word2");
    rulesetSingleModal.saveModalButton("confirm-list-ignore");

    rulesetSingleModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.contains("email - Exact").should("have.length.gt", 0);
    multiSlider.getRulesetDefaultHandleNameAndType("email", "Exact").should("exist");
  });

  // TODO: DHFPROD-10177
  it.skip("When we work on the spike story to update multi-slider components using cypress", () => {
    multiSlider.getHandleName("email").trigger("mousedown", {force: true});
    cy.findByTestId("ruleSet-slider-ticks").find(`div[style*="left: 30.303%;"]`).trigger("mousemove", {force: true});
    multiSlider.getHandleName("email").trigger("mouseup", {force: true});
    matchingStepDetail.getPossibleMatchCombinationRuleset("testing", "email - Exact").trigger("mousemove").should("be.visible");
  });

  it("Add a ruleset with single structured property", () => {
    matchingStepDetail.addNewRuleset();
    matchingStepDetail.getSinglePropertyOption();
    rulesetSingleModal.selectStructuredPropertyToMatch("shipping", "shipping > street");
    rulesetSingleModal.selectMatchTypeDropdown("exact");
    rulesetSingleModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.contains("shipping.street - Exact").should("have.length.gt", 0);
    multiSlider.getRulesetDefaultHandleNameAndType("shipping.street", "Exact").should("be.visible");
  });

  // TODO: DHFPROD-10177
  it.skip("When we work on the spike story to update multi-slider components using cypress", () => {
    multiSlider.getHandleName("shipping.street").trigger("mousedown", {force: true});
    cy.findByTestId("ruleSet-slider-ticks").find(`div[style*="left: 30.303%;"]`).trigger("mousemove", {force: true});
    multiSlider.getHandleName("shipping.street").trigger("mouseup", {force: true});
    matchingStepDetail.getPossibleMatchCombinationRuleset("testing", "shipping.street - Exact").trigger("mousemove").should("be.visible");
  });

  it("Add a ruleset with multiple properties", () => {
    matchingStepDetail.addNewRuleset();
    matchingStepDetail.getMultiPropertyOption();
    rulesetMultipleModal.setRulesetName("customerMultiplePropertyRuleset");
    rulesetMultipleModal.selectPropertyToMatch("customerId");
    rulesetMultipleModal.selectMatchTypeDropdown("customerId", "exact");
    rulesetMultipleModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.contains("customerMultiplePropertyRuleset").should("have.length.gt", 0);
  });

  it("Edit ruleset with multiple properties", () => {
    multiSlider.enableEdit("ruleset");
    multiSlider.ruleSetActiveEditOptionMulti("customerMultiplePropertyRuleset");
    cy.contains("Edit Match Ruleset for Multiple Properties");
    rulesetMultipleModal.selectMatchTypeDropdown("name", "doubleMetaphone");
    rulesetMultipleModal.setDictionaryUri("name", "/dictionary/first-names.xml");
    rulesetMultipleModal.setDistanceThreshold("name", "100");
    rulesetMultipleModal.selectPropertyToMatch("email");
    rulesetMultipleModal.selectMatchTypeDropdown("email", "zip");
    rulesetMultipleModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.contains("customerMultiplePropertyRuleset").should("have.length.gt", 0);
  });

  it("Delete a ruleset", () => {
    multiSlider.deleteOptionActiveRuleset("shipping.street", "Exact");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    multiSlider.confirmDelete("shipping.street", "Exact");
    cy.waitForAsyncRequest();
    cy.findByTestId("rulesetName-testing-shipping.street - Exact").should("have.length", 0);
    multiSlider.assertRulesetHandleNameAndType("shipping.street", "Exact", "not.exist");
    matchingStepDetail.getPossibleMatchCombinationRuleset("shipping.street", "Exact").should("not.exist");
  });

  it("Delete a ruleset", () => {
    multiSlider.deleteOptionActiveRuleset("email", "Exact");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    multiSlider.confirmDelete("email", "Exact");
    cy.waitForAsyncRequest();
    cy.findByTestId("rulesetName-testing-email - Exact").should("have.length", 0);
    matchingStepDetail.getPossibleMatchCombinationRuleset("testing", "email").should("not.exist");
  });

  it("Delete a ruleset with multiple properties", () => {
    multiSlider.ruleSetActiveDeleteOptionMulti("customerMultiplePropertyRuleset");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    multiSlider.confirmDeleteMulti("customerMultiplePropertyRuleset");
    cy.waitForAsyncRequest();
    cy.findByTestId("rulesetName-testing-customerMultiplePropertyRuleset").should("have.length", 0);
    multiSlider.getHandleName("customerMultiplePropertyRuleset").should("not.exist");
    matchingStepDetail.getPossibleMatchCombinationRulesetMulti("customerMultiplePropertyRuleset").should("not.exist");
  });

  it("Delete threshold", () => {
    multiSlider.deleteOptionActiveThreshold("testing", "notify");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    multiSlider.confirmDeleteThreshold("testing");
    cy.waitForAsyncRequest();
    cy.findByLabelText("rulesetName-testing-notify").should("have.length", 0);
    multiSlider.getHandleName("testing").should("not.exist");
    matchingStepDetail.getPossibleMatchCombinationRuleset("testing", "notify").should("not.exist");
  });

  it("Edit ruleset", () => {
    multiSlider.ruleSetEditOptionActive("customerId", "Exact");
    cy.contains("Edit Match Ruleset for Single Property");
    rulesetSingleModal.selectMatchTypeDropdown("exact");
    rulesetSingleModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.contains("customerId - Exact").should("have.length.gt", 0);
  });

  it("Delete ruleset", () => {
    multiSlider.deleteOptionActiveRuleset("customerId", "Exact");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    multiSlider.confirmDelete("customerId", "Exact");
    cy.waitForAsyncRequest();
    cy.findByLabelText("noMatchedCombinations").scrollIntoView().trigger("mouseover");
    cy.findByLabelText("noMatchedCombinations").should("have.length.gt", 0);
    matchingStepDetail.getDefaultTextNoMatchedCombinations().should("be.visible");
    cy.visit("/tiles");
    cy.waitForAsyncRequest();
  });

  it("Edit test match URIs", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();

    cy.log("**Open Person mapping steps**");
    curatePage.getEntityTypePanel("Person").then(($ele) => {
      if ($ele.hasClass("accordion-button collapsed")) {
        cy.log("**Toggling Entity because it was closed.**");
        curatePage.toggleEntityTypeId("Person");
      }
    });
    curatePage.selectMatchTab("Person");
    curatePage.openStepDetails("match-person");

    cy.findByLabelText("testUriOnlyTooltip").should("have.length.gt", 0);
    cy.findByLabelText("testUriTooltip").should("have.length.gt", 0);
    cy.findByLabelText("allDataTooltip").should("have.length.gt", 0);

    matchingStepDetail.getTestMatchUriButton();
    cy.waitForAsyncRequest();
    cy.wait(1000);
    cy.findByText("At least Two URIs are required.").should("be.visible");
    matchingStepDetail.getUriOnlyInputField().type("/test/Uri1");
    matchingStepDetail.getAddUriOnlyIcon().click();
    matchingStepDetail.getTestMatchUriButton();
    cy.waitForAsyncRequest();
    cy.wait(1000);
    cy.findByText("At least Two URIs are required.").should("be.visible");
    matchingStepDetail.getUriOnlyInputField().clear().type("/test/Uri1");
    matchingStepDetail.getAddUriOnlyIcon().click();
    cy.findByText("This URI has already been added.").should("be.visible");
    matchingStepDetail.getUriOnlyInputField().clear().type("/test/Uri2");
    matchingStepDetail.getAddUriOnlyIcon().click();

    cy.findByText("At least Two URIs are required.").should("not.exist");
    cy.findByText("This URI has already been added.").should("not.exist");

    cy.findByLabelText("inputUriRadio").click();
    matchingStepDetail.getUriDeleteIcon().should("not.exist");
    matchingStepDetail.getUriInputField().type("/test/Uri1");
    matchingStepDetail.getAddUriIcon().click();
    cy.findByText("/test/Uri1").should("be.visible");
    matchingStepDetail.getTableHeader().should("not.be.visible");
    matchingStepDetail.getUriDeleteIcon().click();
    cy.findByText("/test/Uri1").should("not.exist");
    matchingStepDetail.getTestMatchUriButton();
    cy.waitForAsyncRequest();
    cy.wait(1000);
    cy.findByText("At least one URI is required.").should("be.visible");
    matchingStepDetail.getUriInputField().clear().type("/test/Uri1");
    matchingStepDetail.getAddUriIcon().click();
    matchingStepDetail.getUriInputField().clear().type("/test/Uri1");
    matchingStepDetail.getAddUriIcon().click();
    cy.findByText("This URI has already been added.").should("be.visible");
    matchingStepDetail.getUriInputField().clear().type("/test/Uri2");
    matchingStepDetail.getAddUriIcon().click();
    matchingStepDetail.getTableHeader().should("not.be.visible");
    cy.findByText("This URI has already been added.").should("not.exist");
    cy.findByText("The minimum of two URIs are required.").should("not.exist");
  });

  it("Show matched results for test match", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMatchTab("Person");
    curatePage.openStepDetails("match-person");
    cy.findByLabelText("inputUriRadio").scrollIntoView().click();

    cy.log("**adding new multiple property**");
    matchingStepDetail.addNewRuleset();
    matchingStepDetail.getMultiPropertyOption();
    rulesetMultipleModal.setRulesetName("testMultipleProperty");
    rulesetMultipleModal.selectPropertyToMatch("lname");
    rulesetMultipleModal.selectMatchTypeDropdown("lname", "exact");
    rulesetMultipleModal.selectPropertyToMatch("ZipCode");
    rulesetMultipleModal.selectMatchTypeDropdown("ZipCode", "zip");
    rulesetMultipleModal.saveButton().click();
    cy.waitForAsyncRequest();

    if (Cypress.isBrowser("!firefox")) {
      cy.log("**Test when user clicks on test button after adding/deleting URI's in 'Test Uris'**");
      matchingStepDetail.getUriOnlyRadio().click();
      for (let i = 0; i < 2; i++) {
        matchingStepDetail.getUriOnlyInputField().clear().type(uris[i]);
        matchingStepDetail.getAddUriOnlyIcon().click();
      }
      cy.log("**test two truthy URI matches**");
      matchingStepDetail.getTestMatchUriButton();
      cy.waitForAsyncRequest();
      cy.wait(1000);
      cy.findByLabelText("noMatchedDataView").should("have.length.lt", 1);
      cy.get(`[id="testMatchedPanel"]`).contains(uriMatchedResults[0].ruleName).should("have.length.gt", 0);
      cy.findByText("(Threshold: " + uriMatchedResults[0].threshold + ")").should("have.length.gt", 0);

      cy.log("**delete one and test two faulty URI matches**");
      matchingStepDetail.getUriDeleteIcon().last().scrollIntoView().click();
      matchingStepDetail.getUriOnlyInputField().clear().type("/json/persons/faulty-metaphone.json");
      matchingStepDetail.getAddUriOnlyIcon().click();
      matchingStepDetail.getTestMatchUriButton();
      cy.waitForAsyncRequest();
      cy.wait(1000);
      cy.findByLabelText("noMatchedDataView").should("have.length.gt", 0);

      cy.log("**test two truthy URI matches again**");
      matchingStepDetail.getUriDeleteIcon().last().scrollIntoView().click();
      matchingStepDetail.getUriOnlyInputField().clear().type("/json/persons/first-name-double-metaphone2.json");
      matchingStepDetail.getAddUriOnlyIcon().click();
      matchingStepDetail.getTestMatchUriButton();
      cy.waitForAsyncRequest();
      cy.wait(1000);
      cy.findByLabelText("noMatchedDataView").should("have.length.lt", 1);
      cy.get(`[id="testMatchedPanel"]`).contains(uriMatchedResults[0].ruleName).should("have.length.gt", 0);
      cy.findByText("(Threshold: " + uriMatchedResults[0].threshold + ")").should("have.length.gt", 0);

      cy.log("**To test when users click on test button and no data is returned");
      cy.log("**To test when users click on test button and no data is returned**");
      cy.findByLabelText("inputUriRadio").scrollIntoView({duration: 2000}).click();
      matchingStepDetail.getUriInputField().scrollIntoView().type("/json/noDataUri");
      matchingStepDetail.getAddUriIcon().click();
      matchingStepDetail.getTestMatchUriButton();
      cy.waitForAsyncRequest();
      cy.wait(1000);
      cy.findByLabelText("noMatchedDataView").should("have.length.gt", 0);
      matchingStepDetail.getUriDeleteIcon().click();

      cy.log("**To test when user enters uris and click on test button**");
      for (let i in uris) {
        matchingStepDetail.getUriInputField().clear().type(uris[i]);
        matchingStepDetail.getAddUriIcon().click();
      }

      cy.log("**To test if correct uri is deleted when clicked on delete uri button**");
      for (let i in urisDummy) {
        matchingStepDetail.getUriInputField().clear().type(urisDummy[i]);
        matchingStepDetail.getAddUriIcon().click();
      }

      matchingStepDetail.getUriDeleteIconByDataTestId(urisDummy[0]).click();
      matchingStepDetail.getUriDeleteIconByDataTestId(urisDummy[1]).should("exist");
      matchingStepDetail.getUriDeleteIconByDataTestId(urisDummy[0]).should("not.exist");
      matchingStepDetail.getUriDeleteIconByDataTestId(urisDummy[1]).click();

      matchingStepDetail.getTableHeader().should("not.be.visible");
      matchingStepDetail.getTestMatchUriButton();
      cy.waitForAsyncRequest();
      cy.wait(3000);
      matchingStepDetail.getTestMatchUriButton();
      cy.waitForAsyncRequest();
      cy.wait(3000);
      cy.findByLabelText("noMatchedDataView").should("not.exist");
      for (let j in uriMatchedResults) {
        cy.get(`[id="testMatchedPanel"]`).contains(uriMatchedResults[j].ruleName).should("have.length.gt", 0);
        cy.findByText("(Threshold: " + uriMatchedResults[j].threshold + ")").should("have.length.gt", 0);
      }

      cy.log("**To test when user selects all data and click on test button**");
      matchingStepDetail.getAllDataRadio().click();
      matchingStepDetail.getTestMatchUriButton();
      cy.waitForAsyncRequest();
      cy.wait(3000);
      cy.findByLabelText("noMatchedDataView").should("not.exist");
      for (let j in uriMatchedResults) {
        cy.get(`[id="testMatchedPanel"]`).contains(uriMatchedResults[j].ruleName).should("have.length.gt", 0);
        cy.findByText("(Threshold: " + uriMatchedResults[j].threshold + ")").should("have.length.gt", 0);
      }
      cy.wait(1000);
      cy.get(`[id="testMatchedPanel"]`).contains(ruleset[0].ruleName).scrollIntoView().click();
      for (let k in urisMerged) {
        cy.findAllByText(urisMerged[k]).should("have.length.gt", 0);
      }

      cy.log("**To test when user click on expand all icon**");
      cy.get("[class*=\"matching-step-detail_expandCollapseIcon_\"]").within(() => {
        cy.findByLabelText("expand-collapse").within(() => {
          cy.get(".switch-button-group").within(() => {
            cy.get("label:first").scrollIntoView().click();
          });
        });
      });
      cy.findAllByLabelText("expandedTableView").should("have.length.gt", 0);

      cy.log("**To verify content of multiple properties**");
      cy.findAllByLabelText("Expand row").first().scrollIntoView().click();
      cy.findAllByText("lname").should("have.length.gt", 0);
      cy.findByLabelText("exact 0").should("have.length.gt", 0);
      cy.findAllByText("ZipCode").should("have.length.gt", 0);
      cy.findByLabelText("zip 1").should("have.length.gt", 0);

      cy.log("**To test compare values for matched Uris**");
      cy.findAllByLabelText("/json/persons/first-name-double-metaphone compareButton").first().scrollIntoView().click();
      cy.waitForAsyncRequest();
      cy.get(".modal-body")
        .within(() => {
          cy.get("th").eq(2).within(() => {
            cy.findAllByText("Current Document:");
            cy.findAllByText("/json/persons/first-name-double-metaphone1.json");
          });
          cy.get("th").eq(3).within(() => {
            cy.findAllByText("Current Document:");
            cy.findAllByText("/json/persons/first-name-double-metaphone2.json");
          });
          cy.get("th").eq(4).within(() => {
            cy.findAllByText("Preview:");
          });
        });

      for (let i in compareValuesData) {
        cy.findByLabelText(compareValuesData[i].propertyName).should("have.length.gt", 0);
        cy.findAllByLabelText(`${compareValuesData[i].uriValue1}-cell2`).should("have.length.gt", 0);
      }
      compareValuesModal.getTableHeader().should("not.be.visible");

      cy.log("**To test highlighted matched rows**");
      cy.findByTitle("fname").should("have.css", "background-color", "rgb(133, 191, 151)");
      cy.findByTitle("lname").should("have.css", "background-color", "rgb(133, 191, 151)");
      cy.findByTitle("Address").should("not.have.css", "background-color", "rgb(133, 191, 151)");
      cy.findByLabelText("Close").scrollIntoView().click();

      cy.log("**To test expanded uri table content**");
      cy.findAllByText("/json/persons/first-name-double-metaphone2.json").first().scrollIntoView().click();
      for (let i in allDataMatchedResults) {
        cy.findAllByLabelText(allDataMatchedResults[i].ruleset).should("have.length.gt", 0);
        cy.findAllByLabelText(allDataMatchedResults[i].matchType).should("have.length.gt", 0);
        cy.findAllByLabelText(allDataMatchedResults[i].score).should("have.length.gt", 0);
      }
      cy.findAllByText("Total Score: 30").should("have.length.gt", 0);

      multiSlider.enableEdit("ruleset");
      multiSlider.ruleSetActiveDeleteOptionMulti("testMultipleProperty");
      matchingStepDetail.getSliderDeleteText().should("be.visible");
      multiSlider.confirmDeleteMulti("testMultipleProperty");
      cy.waitForAsyncRequest();

      cy.log("**To test when user click on collapse all icon**");
      cy.findByLabelText("inputUriRadio").scrollIntoView();
      cy.get("[class*=\"matching-step-detail_expandCollapseIcon_\"]").within(() => {
        cy.findByLabelText("expand-collapse").within(() => {
          cy.get(".switch-button-group").within(() => {
            cy.get("label:last").scrollIntoView().click();
          });
        });
      });
      cy.findAllByLabelText("expandedTableView").should("not.visible");
    }
  });



  it("Check collection Typeahead request when source  database is changed", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();

    curatePage.toggleEntityTypeId("Order");
    curatePage.selectMatchTab("Order");
    curatePage.addNewStep("Order").click();
    createEditStepDialog.stepNameInput().type("testName", {timeout: 2000});

    cy.log("**verify typehead is requesting to final db**");
    cy.intercept("POST", "api/entitySearch/facet-values?database=final").as("finalRequest1");
    createEditStepDialog.setCollectionInput("ABC");
    cy.wait("@finalRequest1");

    cy.log("**verify typehead is requesting to staging db when source DB is changed**");
    createEditStepDialog.getAdvancedTab().click();
    advancedSettingsDialog.setSourceDatabase("data-hub-STAGING");
    createEditStepDialog.getBasicTab().click();
    cy.intercept("POST", "api/entitySearch/facet-values?database=staging").as("stagingRequest1");
    createEditStepDialog.setCollectionInput("D");
    cy.wait("@stagingRequest1");
    createEditStepDialog.saveButton("matching").click();

    cy.log("**verify typehead request when the step is already created**");
    curatePage.editStep("testName").click();
    cy.intercept("POST", "api/entitySearch/facet-values?database=staging").as("stagingRequest2");
    createEditStepDialog.setCollectionInput("E");
    cy.wait("@stagingRequest2");
    createEditStepDialog.getAdvancedTab().click();
    advancedSettingsDialog.setSourceDatabase("data-hub-FINAL");
    createEditStepDialog.getBasicTab().click();
    cy.intercept("POST", "api/entitySearch/facet-values?database=final").as("finalRequest2");
    createEditStepDialog.setCollectionInput("F");
    cy.wait("@finalRequest2");
    createEditStepDialog.saveButton("matching").click();
    createEditStepDialog.saveButton("matching").click();
    curatePage.deleteMappingStepButton("testName").click();
    curatePage.deleteConfirmation("Yes").click();
  });
});
