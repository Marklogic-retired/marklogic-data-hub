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

const allDataMatchedResults = [{ruleset: "lname - Exact", matchType: "Exact 1", score: "score 10"},
  {ruleset: "fname - Double Metaphone", matchType: "Double Metaphone 2", score: "score 10"},
  {ruleset: "testMultipleProperty", matchType: "", score: "score 20"}];

const urisMerged = ["/json/persons/first-name-double-metaphone1.json", "/json/persons/first-name-double-metaphone2.json"];
const uris = ["/json/persons/first-name-double-metaphone1.json", "/json/persons/first-name-double-metaphone2.json", "/json/persons/last-name-plus-zip-boost1.json", "/json/persons/last-name-plus-zip-boost2.json", "/json/persons/last-name-dob-custom1.json", "/json/persons/last-name-dob-custom2.json", "/json/persons/first-name-synonym1.json", "/json/persons/first-name-synonym2.json"];
const compareValuesData = [{propertyName: "id", uriValue1: "empty", uriValue2: "empty"}, {propertyName: "fname", uriValue1: "Alexandria", uriValue2: "Alexandria"},
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
    cy.contains("The Matching step defines the criteria for comparing documents, as well as the actions to take based on the degree of similarity, which is measured as weights.");
    matchingStepDetail.showThresholdTextMore().should("have.length.lt", 1);
    matchingStepDetail.showThresholdTextLess().should("have.length.gt", 0);
    multiSlider.getRulesetSliderOptions().trigger("mouseover");
    matchingStepDetail.showRulesetTextMore().should("have.length.lt", 1);
    matchingStepDetail.showRulesetTextLess().should("have.length.gt", 0);
  });

  it("Add threshold", () => {
    matchingStepDetail.addThresholdButton().click();
    thresholdModal.setThresholdName("test");
    thresholdModal.selectActionDropdown("Merge");
    thresholdModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByLabelText("test-merge").should("have.length.gt", 0));
    multiSlider.getHandleNameAndType("test", "merge").should("be.visible");
  });
  it("Edit threshold Property to Match", () => {
    multiSlider.editOption("test");
    thresholdModal.clearThresholdName();
    thresholdModal.setThresholdName("testing");
    thresholdModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByLabelText("testing-merge").should("have.length.gt", 0));
    multiSlider.getHandleNameAndType("testing", "merge").should("be.visible");
  });
  it("Edit threshold Match Type", () => {
    multiSlider.editOption("testing");
    thresholdModal.selectActionDropdown("Notify");
    thresholdModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByLabelText("testing-notify").should("have.length.gt", 0));
    multiSlider.getHandleNameAndType("testing", "notify").should("be.visible");
  });
  it("Validating the slider tooltip", () => {
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
    cy.waitUntil(() => cy.findByLabelText("customerId-exact").should("have.length.gt", 0));
    multiSlider.getHandleNameAndType("customerId", "exact").should("be.visible");
    multiSlider.getHandleName("customerId").should("be.visible");
  });
  it("When we work on the spike story to update multi-slider componenens using cypress", () => {
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
    cy.waitUntil(() => cy.findByLabelText("email-exact").should("have.length.gt", 0));
    multiSlider.getHandleNameAndType("email", "exact").should("be.visible");
    multiSlider.getHandleName("email").should("be.visible");
  });
  it("When we work on the spike story to update multi-slider componenens using cypress", () => {
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
    cy.waitUntil(() => cy.findByLabelText("shipping.street-exact").should("have.length.gt", 0));
    multiSlider.getHandleNameAndType("shipping.street", "exact").should("be.visible");
    multiSlider.getHandleName("shipping.street").should("be.visible");
  });
  it("When we work on the spike story to update multi-slider componenens using cypress", () => {
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
    cy.waitUntil(() => cy.findByLabelText("customerMultiplePropertyRuleset").should("have.length.gt", 0));
    multiSlider.getHandleName("customerMultiplePropertyRuleset").should("be.visible");
  });
  it("Edit ruleset with multiple properties", () => {
    multiSlider.editOption("customerMultiplePropertyRuleset");
    cy.contains("Edit Match Ruleset for Multiple Properties");
    rulesetMultipleModal.selectMatchTypeDropdown("name", "doubleMetaphone");
    rulesetMultipleModal.setDictionaryUri("name", "/dictionary/first-names.xml");
    rulesetMultipleModal.setDistanceThreshold("name", "100");
    rulesetMultipleModal.selectPropertyToMatch("email");
    rulesetMultipleModal.selectMatchTypeDropdown("email", "zip");
    rulesetMultipleModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByLabelText("customerMultiplePropertyRuleset").should("have.length.gt", 0));
  });
  it("Delete a ruleset", () => {
    multiSlider.deleteOption("shipping.street");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    matchingStepDetail.confirmSliderOptionDeleteButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByLabelText("rulesetName-testing-shipping.street").should("have.length", 0));
    multiSlider.getHandleName("shipping.street").should("not.exist");
    matchingStepDetail.getPossibleMatchCombinationRuleset("testing", "shipping.street").should("not.exist");
  });
  it("Delete a ruleset", () => {
    multiSlider.deleteOption("email");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    matchingStepDetail.confirmSliderOptionDeleteButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByLabelText("rulesetName-testing-email").should("have.length", 0));
    multiSlider.getHandleName("email").should("not.exist");
    matchingStepDetail.getPossibleMatchCombinationRuleset("testing", "email").should("not.exist");
  });
  it("Delete a ruleset with multiple properties", () => {
    multiSlider.deleteOption("customerMultiplePropertyRuleset");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    matchingStepDetail.confirmSliderOptionDeleteButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByLabelText("rulesetName-testing-customerMultiplePropertyRuleset").should("have.length", 0));
    multiSlider.getHandleName("customerMultiplePropertyRuleset").should("not.exist");
    matchingStepDetail.getPossibleMatchCombinationRuleset("testing", "customerMultiplePropertyRuleset").should("not.exist");
  });
  it("Delete threshold", () => {
    multiSlider.deleteOption("testing");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    matchingStepDetail.confirmSliderOptionDeleteButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByLabelText("rulesetName-testing-notify").should("have.length", 0));
    multiSlider.getHandleName("testing").should("not.exist");
    matchingStepDetail.getPossibleMatchCombinationRuleset("testing", "notify").should("not.exist");
  });
  it("Edit ruleset", () => {
    multiSlider.editOption("customerId");
    cy.contains("Edit Match Ruleset for Single Property");
    rulesetSingleModal.selectMatchTypeDropdown("exact");
    rulesetSingleModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByLabelText("customerId-exact").should("have.length.gt", 0));
  });
  it("Delete ruleset", () => {
    multiSlider.deleteOption("customerId");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    matchingStepDetail.confirmSliderOptionDeleteButton().click();
    cy.waitForAsyncRequest();
    cy.findByLabelText("noMatchedCombinations").trigger("mouseover");
    cy.waitUntil(() => cy.findByLabelText("noMatchedCombinations").should("have.length.gt", 0));
    multiSlider.getHandleName("customerId").should("not.exist");
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
    matchingStepDetail.getTestMatchUriButton().click();
    cy.findByText("At least Two URIs are required.").should("be.visible");
    matchingStepDetail.getUriOnlyInputField().type("/test/Uri1");
    matchingStepDetail.getAddUriOnlyIcon().click();
    matchingStepDetail.getTestMatchUriButton().click();
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
    matchingStepDetail.getTestMatchUriButton().click();
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

    multiSlider.getHandleName("testMultipleProperty").trigger("mousedown", {force: true});
    cy.findByTestId("ruleSet-slider-ticks").find(`div[style*="left: 19.1919%;"]`).trigger("mousemove", {force: true});
    multiSlider.getHandleName("testMultipleProperty").trigger("mouseup", {force: true});

    //To test when user enters uris and click on test button
    for (let i in uris) {
      cy.waitUntil(() => matchingStepDetail.getUriInputField().type(uris[i]));
      matchingStepDetail.getAddUriIcon().click();
    }
    matchingStepDetail.getTestMatchUriButton().click();
    for (let j in uriMatchedResults) {
      cy.findByText(uriMatchedResults[j].ruleName).should("have.length.gt", 0);
      cy.findByText("(Threshold: "+uriMatchedResults[j].threshold + ")").should("have.length.gt", 0);
    }

    //To test when user selects all data and click on test button
    matchingStepDetail.getAllDataRadio().click();
    matchingStepDetail.getTestMatchUriButton().click();
    for (let j in ruleset) {
      cy.waitUntil(() => cy.findByText(ruleset[j].ruleName).should("have.length.gt", 0).trigger("mousemove"));
      cy.waitUntil(() => cy.findByText("(Threshold: "+ruleset[j].threshold + ")").should("have.length.gt", 0));
    }
    cy.wait(1000);
    cy.findByText(ruleset[0].ruleName).click();
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
    cy.findAllByLabelText("right").first().click();
    cy.waitUntil(() => cy.findAllByText("lname").should("have.length.gt", 0));
    cy.waitUntil(() => cy.findByLabelText("exact 0").should("have.length.gt", 0));
    cy.waitUntil(() => cy.findAllByText("ZipCode").should("have.length.gt", 0));
    cy.waitUntil(() => cy.findByLabelText("zip 1").should("have.length.gt", 0));

    // To test compare values for matched Uris
    cy.findAllByLabelText("/json/persons/first-name-double-metaphone compareButton").first().click();
    for (let i in compareValuesData) {
      cy.findByLabelText(compareValuesData[i].propertyName).should("have.length.gt", 0);
      cy.findAllByLabelText(compareValuesData[i].uriValue1).should("have.length.gt", 0);
      cy.findAllByLabelText(compareValuesData[i].uriValue2).should("have.length.gt", 0);
    }

    // To test highlighted matched rows
    cy.findByTitle("fname").should("have.css", "background-color", "rgb(133, 191, 151)");
    cy.findByTitle("lname").should("have.css", "background-color", "rgb(133, 191, 151)");
    cy.findByTitle("Address").should("not.have.css", "background-color", "rgb(133, 191, 151)");
    cy.findByLabelText("Close").click();

    // To test expanded uri table content
    cy.waitUntil(() => cy.findByText("/json/persons/first-name-double-metaphone2.json").first().click());
    for (let i in allDataMatchedResults) {
      cy.findAllByLabelText(allDataMatchedResults[i].ruleset).should("have.length.gt", 0);
      cy.findAllByLabelText(allDataMatchedResults[i].matchType).should("have.length.gt", 0);
      cy.findAllByLabelText(allDataMatchedResults[i].score).should("have.length.gt", 0);
    }
    cy.findAllByText("Total Score: 40").should("have.length.gt", 0);

    multiSlider.deleteOption("testMultipleProperty");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    matchingStepDetail.confirmSliderOptionDeleteButton().click();
    cy.waitForAsyncRequest();

    // To test when user click on collapse all icon
    cy.get(".matching-step-detail_expandCollapseIcon__3hvf2").within(() => {
      cy.findByLabelText("expand-collapse").within(() => {
        cy.get(".ant-radio-group").within(() => {
          cy.get("label:last").click();
        });
      });
    });
    cy.findAllByLabelText("expandedTableView").should("not.visible");
  });
});

