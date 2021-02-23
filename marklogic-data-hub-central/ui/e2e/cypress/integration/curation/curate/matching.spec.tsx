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

describe("Matching", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer").withRequest();
    LoginPage.postLogin();
  });
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer").withRequest();
  });
  afterEach(() => {
    cy.resetTestUser();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("matching", "matchCustomerTest");
    cy.resetTestUser();
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
    matchingStepDetail.showThresholdTextMore().should("not.be.visible");
    matchingStepDetail.showThresholdTextLess().should("be.visible");
    multiSlider.getRulesetSliderOptions().trigger("mouseover");
    matchingStepDetail.showRulesetTextMore().should("not.be.visible");
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
    rulesetSingleModal.selectPropertyToMatch("customerId");
    rulesetSingleModal.selectMatchTypeDropdown("exact");
    rulesetSingleModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByLabelText("customerId-exact").should("have.length.gt", 0));
    multiSlider.getHandleNameAndType("customerId", "exact").should("be.visible");
    multiSlider.getHandleName("customerId").should("be.visible");
  });
  //TODO
  //it("When we work on the spike story to update multi-slider componenens using cypress", () => {
  // multiSlider.getRulesetSliderRail().invoke('attr','activehandleid','$$-0');
  // multiSlider.getHandleName('customerId').invoke('attr', 'style', 'left: 20%').then(attr => {
  //Verify the possible match combinations
  // matchingStepDetail.getPossibleMatchCombinationHeading('testing').should('be.visible');
  // matchingStepDetail.getPossibleMatchCombinationRuleset('testing','customerId').should('be.visible');
  //});
  it("Add another ruleset", () => {
    matchingStepDetail.addNewRulesetSingle();
    rulesetSingleModal.selectPropertyToMatch("email");
    rulesetSingleModal.selectMatchTypeDropdown("exact");
    rulesetSingleModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findByLabelText("email-exact").should("have.length.gt", 0));
    multiSlider.getHandleNameAndType("email", "exact").should("be.visible");
    multiSlider.getHandleName("email").should("be.visible");
  });
  //TODO
  //it("When we work on the spike story to update multi-slider componenens using cypress", () => {
  // multiSlider.getRulesetSliderRail().invoke('attr','activehandleid','$$-1');
  // multiSlider.getHandleName('email').invoke('attr', 'style', 'left: 30%').then(attr => {
  //   //Verify the possible match combinations
  //   matchingStepDetail.getPossibleMatchCombinationRuleset('testing','email').should('be.visible');
  //});
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
  it("Delele ruleset", () => {
    multiSlider.deleteOption("customerId");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    matchingStepDetail.confirmSliderOptionDeleteButton().click();
    cy.waitForAsyncRequest();
    cy.findByLabelText("noMatchedCombinations").trigger("mouseover");
    cy.waitUntil(() => cy.findByLabelText("noMatchedCombinations").should("have.length.gt", 0));
    multiSlider.getHandleName("customerId").should("not.exist");
    matchingStepDetail.getDefaultTextNoMatchedCombinations().should("be.visible");
  });
});
