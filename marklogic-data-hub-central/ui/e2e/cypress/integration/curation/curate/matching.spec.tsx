import "cypress-wait-until";
import {Application} from "../../../support/application.config";
import {
  toolbar,
  createEditStepDialog,
  multiSlider,
  confirmYesNo
} from "../../../support/components/common/index";
import {matchingStepDetail, rulesetSingleModal, thresholdModal} from "../../../support/components/matching/index";
import curatePage from "../../../support/pages/curate";
import LoginPage from "../../../support/pages/login";

const matchStep = "matchCustomerTest";
const uris = ["/content/CustMatchMerge1.json", "/content/CustMatchMerge2.json", "/content/CustMatchMerge3.json", "/content/CustShippingCityStateMatch1.json", "/content/CustShippingCityStateMatch2.json", "/content/CustShippingCityStateMatch3.json", "/content/CustShippingCityStateMatch4.json"];
const entityNames = ["Customer1", "Customer2", "Customer3", "Customer4", "Customer6"];

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
    cy.deleteSteps("matching", "matchCustomerTest");
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
    matchingStepDetail.showThresholdTextMore().should("not.exist");
    matchingStepDetail.showThresholdTextLess().should("be.visible");
    multiSlider.getRulesetSliderOptions().trigger("mouseover");
    matchingStepDetail.showRulesetTextMore().should("not.exist");
    matchingStepDetail.showRulesetTextLess().should("be.visible");
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
    matchingStepDetail.addNewRulesetSingle();
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
    matchingStepDetail.addNewRulesetSingle();
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
  it("Delete a ruleset", () => {
    multiSlider.deleteOption("email");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    matchingStepDetail.confirmSliderOptionDeleteButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByLabelText("rulesetName-testing-email").should("have.length", 0));
    multiSlider.getHandleName("email").should("not.exist");
    matchingStepDetail.getPossibleMatchCombinationRuleset("testing", "email").should("not.exist");
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
  });
  it("Edit test match URIs", () => {
    matchingStepDetail.getUriDeleteIcon().should("not.exist");
    matchingStepDetail.getUriInputField().type("/test/Uri1");
    matchingStepDetail.getAddUriIcon().click();
    cy.findByText("/test/Uri1").should("be.visible");
    matchingStepDetail.getUriDeleteIcon().click();
    cy.findByText("/test/Uri1").should("not.exist");

    //to test validation check
    matchingStepDetail.getUriInputField().type("/test/Uri1");
    matchingStepDetail.getAddUriIcon().click();
    matchingStepDetail.getTestMatchUriButton().click();
    cy.findByText("The minimum of two URIs are required.").should("be.visible");
    matchingStepDetail.getUriInputField().type("/test/Uri1");
    matchingStepDetail.getAddUriIcon().click();
    cy.findByText("This URI has already been added.").should("be.visible");
    matchingStepDetail.getUriInputField().type("/test/Uri2");
    matchingStepDetail.getAddUriIcon().click();
    cy.findByText("This URI has already been added.").should("not.exist");
    matchingStepDetail.getTestMatchUriButton().click();
    cy.findByText("The minimum of two URIs are required.").should("not.exist");
    matchingStepDetail.getUriDeleteIcon().click({multiple: true});
  });
  it("Show matched results for test match", () => {
    for (let i in uris) {
      matchingStepDetail.getUriInputField().type(uris[i]);
      matchingStepDetail.getAddUriIcon().click();
    }
    matchingStepDetail.getTestMatchUriButton().click();
    cy.findAllByText("Customer11").trigger("mousemove");
    for (let j in entityNames) {
      cy.findAllByText(entityNames[j]).should("be.visible");
    }
    cy.findAllByText("Customer11").trigger("mouseover");
    //to test tooltip on hovering over entity name
    cy.waitUntil(() => cy.findAllByText("/content/CustMatchMerge1.json").should("have.length.gt", 1));
    matchingStepDetail.getUriDeleteIcon().click({multiple: true});
    //when user selects all data radio and clicks on test button
    matchingStepDetail.getAllDataRadio().click();
    matchingStepDetail.getTestMatchUriButton().click();
    cy.findAllByText("Customer11").trigger("mousemove");
    for (let j in entityNames) {
      cy.findAllByText(entityNames[j]).should("be.visible");
    }
  });
});
