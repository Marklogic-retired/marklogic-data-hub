import "cypress-wait-until";
import {Application} from "../../../support/application.config";
import {
  toolbar,
  createEditStepDialog,
  multiSlider,
  confirmYesNo
} from "../../../support/components/common/index";
import {matchingStepDetail, rulesetSingleModal, thresholdModal, rulesetMultipleModal} from "../../../support/components/matching/index";
import curatePage from "../../../support/pages/curate";
import LoginPage from "../../../support/pages/login";

const matchStep = "matchCustTest";

const uriMatchedResults  = [{ruleName: "Match - merge", threshold: "19", matchedPairs: "6"},
  {ruleName: "Likely Match - notify", threshold: "9", matchedPairs: "5"}];

const ruleset  = [{ruleName: "Match - merge", threshold: "19", matchedPairs: "5"},
  {ruleName: "Likely Match - notify", threshold: "9", matchedPairs: "2"}];

const allDataMatchedResults = [{ruleset: "lname - Exact", matchType: "Exact 0", score: "score 10"},
  {ruleset: "fname - Double Metaphone", matchType: "Double Metaphone 1", score: "score 10"},
  {ruleset: "testMultipleProperty", matchType: "", score: ""}];

const urisMerged = ["/json/persons/first-name-double-metaphone1.json", "/json/persons/first-name-double-metaphone2.json"];
const uris = ["/json/persons/first-name-double-metaphone1.json", "/json/persons/first-name-double-metaphone2.json", "/json/persons/last-name-plus-zip-boost1.json", "/json/persons/last-name-plus-zip-boost2.json", "/json/persons/last-name-dob-custom1.json", "/json/persons/last-name-dob-custom2.json", "/json/persons/first-name-synonym1.json", "/json/persons/first-name-synonym2.json"];
const compareValuesData = [{propertyName: "id", uriValue1: "empty", uriValue2: "empty"}, {propertyName: "fname", uriValue1: "Alexandria", uriValue2: "Alexandria"}, // eslint-disable-line @typescript-eslint/no-unused-vars
  {propertyName: "lname", uriValue1: "Wilson", uriValue2: "Wilson"}, {propertyName: "Address", uriValue1: "123 Wilson Rd", uriValue2: "123 Wilson Rd"}];

describe("Matching", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer").withRequest();
    cy.waitForAsyncRequest();
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("matching", "matchCustTest");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Navigate to curate tab and Open Customer entity", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMatchTab("Customer");
    cy.waitUntil(() => curatePage.addNewStep());
  });
  it("Creating a new match step", () => {
    curatePage.addNewStep().should("be.visible").click();
    createEditStepDialog.stepNameInput().type(matchStep);
    createEditStepDialog.stepDescriptionInput().type("match customer step example", {timeout: 2000});
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['${matchStep}'])`);
    createEditStepDialog.saveButton("matching").click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(matchStep);
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
    // To test when user click on Expand all icon
    cy.get(".matching-step-detail_expandCollapseRulesIcon__37swU").within(() => {
      cy.findByLabelText("expand-collapse").within(() => {
        cy.get(".ant-radio-group").within(() => {
          cy.get("label:first").click();
        });
      });
    });
    cy.findByText("Expand All").should("be.visible");
    // To test when user click on Collapse all icon
    cy.get(".matching-step-detail_expandCollapseRulesIcon__37swU").within(() => {
      cy.findByLabelText("expand-collapse").within(() => {
        cy.get(".ant-radio-group").within(() => {
          cy.get("label:last").click();
        });
      });
    });
    cy.findByText("Collapse All").should("be.visible");
    matchingStepDetail.showThresholdTextMore().should("have.length.lt", 1);
    matchingStepDetail.showThresholdTextLess().should("have.length.gt", 0);
    //multiSlider.getRulesetSliderOptions().scrollIntoView().trigger("mouseover");
    matchingStepDetail.showRulesetTextMore().should("have.length.lt", 1);
    matchingStepDetail.showRulesetTextLess().should("have.length.gt", 0);
  });

  it("Add threshold", () => {
    matchingStepDetail.addThresholdButton().click();
    thresholdModal.setThresholdName("test");
    thresholdModal.selectActionDropdown("Merge");
    thresholdModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByText("test - merge").should("have.length.gt", 0));
    multiSlider.getThresholdHandleNameAndType("test", "merge").should("be.visible");
  });
  it("Edit threshold Property to Match", () => {
    multiSlider.enableEdit("threshold");
    multiSlider.thresholdEditOption("test", "merge");
    thresholdModal.clearThresholdName();
    thresholdModal.setThresholdName("testing");
    thresholdModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByText("testing - merge").should("have.length.gt", 0));
    multiSlider.getThresholdHandleNameAndType("testing", "merge").should("be.visible");
  });
  it("Edit threshold Match Type", () => {
    multiSlider.thresholdEditOption("testing", "merge");
    thresholdModal.selectActionDropdown("Notify");
    thresholdModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByText("testing - notify").should("have.length.gt", 0));
    multiSlider.getThresholdHandleNameAndType("testing", "notify").should("be.visible");
  });
  //TODO: Will be handled as part of DHFPROD-7815
  xit("Validating the slider tooltip", () => {
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
    cy.waitUntil(() => cy.contains("customerId - Exact").should("have.length.gt", 0));
    multiSlider.getRulesetHandleNameAndType("customerId", "Exact").should("be.visible");
    //multiSlider.getHandleName("customerId").should("be.visible");
  });
  xit("When we work on the spike story to update multi-slider componenens using cypress", () => {
    multiSlider.getHandleName("customerId").trigger("mousedown", {force: true});
    cy.findByTestId("ruleSet-slider-ticks").find(`div[style*="left: 19.1919%;"]`).trigger("mousemove", {force: true});
    multiSlider.getHandleName("customerId").trigger("mouseup", {force: true});
    //Verify the possible match combinations
    matchingStepDetail.getPossibleMatchCombinationHeading("testing").trigger("mousemove").should("be.visible");
    matchingStepDetail.getPossibleMatchCombinationRuleset("testing", "customerId - Exact").should("be.visible");
  });
  it("Add another ruleset", () => {
    matchingStepDetail.addNewRuleset();
    matchingStepDetail.getSinglePropertyOption();
    rulesetSingleModal.selectPropertyToMatch("email");
    rulesetSingleModal.selectMatchTypeDropdown("exact");
    rulesetSingleModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.contains("email - Exact").should("have.length.gt", 0));
    multiSlider.getRulesetHandleNameAndType("email", "Exact").should("be.visible");
    //multiSlider.getHandleName("email").should("be.visible");
  });
  xit("When we work on the spike story to update multi-slider componenens using cypress", () => {
    multiSlider.getHandleName("email").trigger("mousedown", {force: true});
    cy.findByTestId("ruleSet-slider-ticks").find(`div[style*="left: 30.303%;"]`).trigger("mousemove", {force: true});
    multiSlider.getHandleName("email").trigger("mouseup", {force: true});
    //Verify the possible match combinations
    matchingStepDetail.getPossibleMatchCombinationRuleset("testing", "email - Exact").trigger("mousemove").should("be.visible");
  });
  it("Add a ruleset with single structured property", () => {
    matchingStepDetail.addNewRuleset();
    matchingStepDetail.getSinglePropertyOption();
    rulesetSingleModal.selectStructuredPropertyToMatch("shipping", "shipping > street");
    rulesetSingleModal.selectMatchTypeDropdown("exact");
    rulesetSingleModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.contains("shipping.street - Exact").should("have.length.gt", 0));
    multiSlider.getRulesetHandleNameAndType("shipping.street", "Exact").should("be.visible");
    //multiSlider.getHandleName("shipping.street").should("be.visible");
  });
  xit("When we work on the spike story to update multi-slider componenens using cypress", () => {
    multiSlider.getHandleName("shipping.street").trigger("mousedown", {force: true});
    cy.findByTestId("ruleSet-slider-ticks").find(`div[style*="left: 30.303%;"]`).trigger("mousemove", {force: true});
    multiSlider.getHandleName("shipping.street").trigger("mouseup", {force: true});
    //Verify the possible match combinations
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
    cy.waitUntil(() => cy.contains("customerMultiplePropertyRuleset").should("have.length.gt", 0));
    //multiSlider.getHandleName("customerMultiplePropertyRuleset").should("be.visible");
  });
  it("Edit ruleset with multiple properties", () => {
    multiSlider.enableEdit("ruleset");
    multiSlider.ruleSetEditOptionMulti("customerMultiplePropertyRuleset");
    cy.contains("Edit Match Ruleset for Multiple Properties");
    rulesetMultipleModal.selectMatchTypeDropdown("name", "doubleMetaphone");
    rulesetMultipleModal.setDictionaryUri("name", "/dictionary/first-names.xml");
    rulesetMultipleModal.setDistanceThreshold("name", "100");
    rulesetMultipleModal.selectPropertyToMatch("email");
    rulesetMultipleModal.selectMatchTypeDropdown("email", "zip");
    rulesetMultipleModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.contains("customerMultiplePropertyRuleset").should("have.length.gt", 0));
  });
  it("Delete a ruleset", () => {
    multiSlider.deleteOption("shipping.street", "Exact");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    multiSlider.confirmDelete("shipping.street", "Exact");
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByTestId("rulesetName-testing-shipping.street - Exact").should("have.length", 0));
    multiSlider.getRulesetHandleNameAndType("shipping.street", "Exact").should("not.exist");
    matchingStepDetail.getPossibleMatchCombinationRuleset("shipping.street", "Exact").should("not.exist");
  });
  it("Delete a ruleset", () => {
    multiSlider.deleteOption("email", "Exact");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    multiSlider.confirmDelete("email", "Exact");
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByTestId("rulesetName-testing-email - Exact").should("have.length", 0));
    //multiSlider.getHandleName("email").should("not.exist");
    matchingStepDetail.getPossibleMatchCombinationRuleset("testing", "email").should("not.exist");
  });
  it("Delete a ruleset with multiple properties", () => {
    multiSlider.deleteOptionMulti("customerMultiplePropertyRuleset");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    multiSlider.confirmDeleteMulti("customerMultiplePropertyRuleset");
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByTestId("rulesetName-testing-customerMultiplePropertyRuleset").should("have.length", 0));
    multiSlider.getHandleName("customerMultiplePropertyRuleset").should("not.exist");
    matchingStepDetail.getPossibleMatchCombinationRulesetMulti("customerMultiplePropertyRuleset").should("not.exist");
  });
  it("Delete threshold", () => {
    multiSlider.deleteOptionThreshold("testing", "notify");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    multiSlider.confirmDeleteThreshold("testing");
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByLabelText("rulesetName-testing-notify").should("have.length", 0));
    multiSlider.getHandleName("testing").should("not.exist");
    matchingStepDetail.getPossibleMatchCombinationRuleset("testing", "notify").should("not.exist");
  });
  it("Edit ruleset", () => {
    multiSlider.ruleSetEditOption("customerId", "Exact");
    cy.contains("Edit Match Ruleset for Single Property");
    rulesetSingleModal.selectMatchTypeDropdown("exact");
    rulesetSingleModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.contains("customerId - Exact").should("have.length.gt", 0));
  });
  it("Delete ruleset", () => {
    multiSlider.deleteOption("customerId", "Exact");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    multiSlider.confirmDelete("customerId", "Exact");
    cy.waitForAsyncRequest();
    cy.findByLabelText("noMatchedCombinations").trigger("mouseover");
    cy.waitUntil(() => cy.findByLabelText("noMatchedCombinations").should("have.length.gt", 0));
    //multiSlider.getHandleName("customerId").should("not.exist");
    matchingStepDetail.getDefaultTextNoMatchedCombinations().should("be.visible");
    cy.waitUntil(() => cy.visit("/tiles"));
  });
  it("Edit test match URIs", () => {
    toolbar.getCurateToolbarIcon().click();
    curatePage.toggleEntityTypeId("Person");
    cy.findByText("Match").click();
    curatePage.openStepDetails("match-person");

    // to verify tooltips are present
    cy.findByLabelText("testUriOnlyTooltip").should("have.length.gt", 0);
    cy.findByLabelText("testUriTooltip").should("have.length.gt", 0);
    cy.findByLabelText("allDataTooltip").should("have.length.gt", 0);

    // to test validation checks when user selects test among URIs only radio
    matchingStepDetail.getTestMatchUriButton();
    cy.findByText("At least Two URIs are required.").should("be.visible");
    matchingStepDetail.getUriOnlyInputField().type("/test/Uri1");
    matchingStepDetail.getAddUriOnlyIcon().click();
    matchingStepDetail.getTestMatchUriButton();
    cy.findByText("At least Two URIs are required.").should("be.visible");
    matchingStepDetail.getUriOnlyInputField().type("/test/Uri1");
    matchingStepDetail.getAddUriOnlyIcon().click();
    cy.findByText("This URI has already been added.").should("be.visible");
    matchingStepDetail.getUriOnlyInputField().type("/test/Uri2");
    matchingStepDetail.getAddUriOnlyIcon().click();
    cy.findByText("At least Two URIs are required.").should("not.exist");
    cy.findByText("This URI has already been added.").should("not.exist");

    // to test validation checks when user selects test with all URIs entered radio
    cy.findByLabelText("inputUriRadio").click();
    matchingStepDetail.getUriDeleteIcon().should("not.exist");
    matchingStepDetail.getUriInputField().type("/test/Uri1");
    matchingStepDetail.getAddUriIcon().click();
    cy.findByText("/test/Uri1").should("be.visible");
    matchingStepDetail.getUriDeleteIcon().click();
    cy.findByText("/test/Uri1").should("not.exist");

    matchingStepDetail.getAddUriIcon().click();
    matchingStepDetail.getTestMatchUriButton();
    cy.findByText("At least one URI is required.").should("be.visible");
    matchingStepDetail.getUriInputField().type("/test/Uri1");
    matchingStepDetail.getAddUriIcon().click();
    matchingStepDetail.getUriInputField().type("/test/Uri1");
    matchingStepDetail.getAddUriIcon().click();
    cy.findByText("This URI has already been added.").should("be.visible");
    matchingStepDetail.getUriInputField().type("/test/Uri2");
    matchingStepDetail.getAddUriIcon().click();
    cy.findByText("This URI has already been added.").should("not.exist");
    cy.findByText("The minimum of two URIs are required.").should("not.exist");
    cy.waitUntil(() => cy.visit("/tiles"));
  });


  it("Show matched results for test match", () => {
    toolbar.getCurateToolbarIcon().click();
    curatePage.toggleEntityTypeId("Person");
    cy.findByText("Match").click();
    curatePage.openStepDetails("match-person");
    cy.findByLabelText("inputUriRadio").click();

    //adding new multiple property
    matchingStepDetail.addNewRuleset();
    matchingStepDetail.getMultiPropertyOption();
    rulesetMultipleModal.setRulesetName("testMultipleProperty");
    rulesetMultipleModal.selectPropertyToMatch("lname");
    rulesetMultipleModal.selectMatchTypeDropdown("lname", "exact");
    rulesetMultipleModal.selectPropertyToMatch("ZipCode");
    rulesetMultipleModal.selectMatchTypeDropdown("ZipCode", "zip");
    rulesetMultipleModal.saveButton().click();
    cy.waitForAsyncRequest();

<<<<<<< HEAD
    /*multiSlider.getHandleName("testMultipleProperty").trigger("mousedown", {force: true});
    cy.findByTestId("ruleSet-slider-ticks").find(`div[style*="left: 19.1919%;"]`).trigger("mousemove", {force: true});
    multiSlider.getHandleName("testMultipleProperty").trigger("mouseup", {force: true});*/
=======
    // TODO DHFPROD-7711 skip since fails for Ant Design Table component
    // multiSlider.getHandleName("testMultipleProperty").trigger("mousedown", {force: true});
    // cy.findByTestId("ruleSet-slider-ticks").find(`div[style*="left: 19.1919%;"]`).trigger("mousemove", {force: true});
    // multiSlider.getHandleName("testMultipleProperty").trigger("mouseup", {force: true});
>>>>>>> DHFPROD-7768: Threshold and ruleset handle names are not displayed (#6009)

    //To test when users click on test button and no data is returned
    cy.waitUntil(() => matchingStepDetail.getUriInputField().type("/json/noDataUri"));
    matchingStepDetail.getAddUriIcon().click();
    matchingStepDetail.getTestMatchUriButton();
    cy.findByLabelText("noMatchedDataView").should("have.length.gt", 0);
    matchingStepDetail.getUriDeleteIcon().click();

    //To test when user enters uris and click on test button
    for (let i in uris) {
      cy.waitUntil(() => matchingStepDetail.getUriInputField().type(uris[i]));
      matchingStepDetail.getAddUriIcon().click();
    }
    matchingStepDetail.getTestMatchUriButton();
    cy.waitForAsyncRequest();
    cy.wait(3000);
    cy.findByLabelText("noMatchedDataView").should("not.exist");
    for (let j in uriMatchedResults) {
      cy.get(`[id="testMatchedPanel"]`).contains(uriMatchedResults[j].ruleName).should("have.length.gt", 0);
      cy.findByText("(Threshold: "+uriMatchedResults[j].threshold + ")").should("have.length.gt", 0);
    }

    //To test when user selects all data and click on test button
    matchingStepDetail.getAllDataRadio().click();
    matchingStepDetail.getTestMatchUriButton();
    cy.waitForAsyncRequest();
    cy.wait(3000);
    cy.findByLabelText("noMatchedDataView").should("not.exist");
    for (let j in uriMatchedResults) {
      cy.get(`[id="testMatchedPanel"]`).contains(uriMatchedResults[j].ruleName).should("have.length.gt", 0);
      cy.findByText("(Threshold: "+uriMatchedResults[j].threshold + ")").should("have.length.gt", 0);
    }
    cy.wait(1000);
    cy.get(`[id="testMatchedPanel"]`).contains(ruleset[0].ruleName).click();
    for (let k in urisMerged) {
      cy.waitUntil(() => cy.findAllByText(urisMerged[k]).should("have.length.gt", 0));
    }

    // To test when user click on expand all icon
    cy.get(".matching-step-detail_expandCollapseIcon__3hvf2").within(() => {
      cy.findByLabelText("expand-collapse").within(() => {
        cy.get(".ant-radio-group").within(() => {
          cy.get("label:first").click();
        });
      });
    });
    cy.findAllByLabelText("expandedTableView").should("have.length.gt", 0);

    // To verify content of multiple properties

    // TODO DHFPROD-7711 skip since fails for Ant Design Table component
    // cy.findAllByLabelText("right").first().click();
    // cy.waitUntil(() => cy.findAllByText("lname").should("have.length.gt", 0));
    // cy.waitUntil(() => cy.findByLabelText("exact 0").should("have.length.gt", 0));
    // cy.waitUntil(() => cy.findAllByText("ZipCode").should("have.length.gt", 0));
    // cy.waitUntil(() => cy.findByLabelText("zip 1").should("have.length.gt", 0));

    // // To test compare values for matched Uris
    // cy.findAllByLabelText("/json/persons/first-name-double-metaphone compareButton").first().click();
    // for (let i in compareValuesData) {
    //   cy.findByLabelText(compareValuesData[i].propertyName).should("have.length.gt", 0);
    //   cy.findAllByLabelText(compareValuesData[i].uriValue1).should("have.length.gt", 0);
    //   cy.findAllByLabelText(compareValuesData[i].uriValue2).should("have.length.gt", 0);
    // }

<<<<<<< HEAD
    // To test expanded uri table content
    cy.waitUntil(() => cy.findByText("/json/persons/first-name-double-metaphone2.json").first().click());
    for (let i in allDataMatchedResults) {
      cy.findAllByLabelText(allDataMatchedResults[i].ruleset).should("have.length.gt", 0);
      cy.findAllByLabelText(allDataMatchedResults[i].matchType).should("have.length.gt", 0);
      cy.findAllByLabelText(allDataMatchedResults[i].score).should("have.length.gt", 0);
    }
    cy.findAllByText("Total Score: 20").should("have.length.gt", 0);

    multiSlider.enableEdit("ruleset");
    multiSlider.deleteOptionMulti("testMultipleProperty");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    multiSlider.confirmDeleteMulti("testMultipleProperty");
    cy.waitForAsyncRequest();
=======
    // // To test highlighted matched rows
    // cy.findByTitle("fname").should("have.css", "background-color", "rgb(133, 191, 151)");
    // cy.findByTitle("lname").should("have.css", "background-color", "rgb(133, 191, 151)");
    // cy.findByTitle("Address").should("not.have.css", "background-color", "rgb(133, 191, 151)");
    // cy.findByLabelText("Close").click();

    // // To test expanded uri table content
    // cy.waitUntil(() => cy.findByText("/json/persons/first-name-double-metaphone2.json").first().click());
    // for (let i in allDataMatchedResults) {
    //   cy.findAllByLabelText(allDataMatchedResults[i].ruleset).should("have.length.gt", 0);
    //   cy.findAllByLabelText(allDataMatchedResults[i].matchType).should("have.length.gt", 0);
    //   cy.findAllByLabelText(allDataMatchedResults[i].score).should("have.length.gt", 0);
    // }
    // cy.findAllByText("Total Score: 40").should("have.length.gt", 0);
>>>>>>> DHFPROD-7768: Threshold and ruleset handle names are not displayed (#6009)

    // multiSlider.deleteOption("testMultipleProperty");
    // matchingStepDetail.getSliderDeleteText().should("be.visible");
    // matchingStepDetail.confirmSliderOptionDeleteButton().click();
    // cy.waitForAsyncRequest();

    // // To test when user click on collapse all icon
    // cy.get(".matching-step-detail_expandCollapseIcon__3hvf2").within(() => {
    //   cy.findByLabelText("expand-collapse").within(() => {
    //     cy.get(".ant-radio-group").within(() => {
    //       cy.get("label:last").click();
    //     });
    //   });
    // });
    // cy.findAllByLabelText("expandedTableView").should("not.visible");
  });
});
