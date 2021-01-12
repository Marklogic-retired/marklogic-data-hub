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


describe("Matching", () => {

  beforeEach(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer").withRequest();
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
  });

  afterEach(() => {
    cy.resetTestUser();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("matching", "matchCustomerTest");
  });

  it("can create/edit a match step within the match tab of curate tile, can create match thresholds/rulesets, can delete match thresholds/rulesets", () => {
    const matchStep = "matchCustomerTest";

    //Navigating to match tab
    curatePage.toggleEntityTypeId("Customer");
    curatePage.selectMatchTab("Customer");

    //Creating a new match step
    cy.waitUntil(() => curatePage.addNewStep()).click();

    createEditStepDialog.stepNameInput().type(matchStep);
    createEditStepDialog.stepDescriptionInput().type("match customer step example");
    createEditStepDialog.setSourceRadio("Query");
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['${matchStep}'])`);
    createEditStepDialog.saveButton("matching").click();
    curatePage.verifyStepNameIsVisible(matchStep);

    //Editing the match step
    curatePage.editStep(matchStep).click();

    createEditStepDialog.stepNameInput().should("be.disabled");
    createEditStepDialog.stepDescriptionInput().should("have.value", "match customer step example");

    //Editing the value to see if the confirmation dialogs are working fine.
    createEditStepDialog.stepDescriptionInput().clear().type("UPDATED - match customer step example");
    createEditStepDialog.cancelButton("matching").click();

    confirmYesNo.getDiscardText().should("be.visible");
    confirmYesNo.getYesButton().click();

    //Check if the changes are reverted back when discarded all changes.
    curatePage.editStep(matchStep).click();
    createEditStepDialog.stepDescriptionInput().should("not.have.value", "UPDATED - match customer step example");
    createEditStepDialog.cancelButton("matching").click();

    //open matching step details
    curatePage.openStepDetails(matchStep);
    cy.contains("The Matching step defines the criteria for comparing documents, as well as the actions to take based on the degree of similarity, which is measured as weights.");
    matchingStepDetail.showThresholdTextMore().should("not.be.visible");
    matchingStepDetail.showThresholdTextLess().should("be.visible");
    matchingStepDetail.showRulesetTextMore().should("not.be.visible");
    matchingStepDetail.showRulesetTextLess().should("be.visible");

    //add threshold
    matchingStepDetail.addThresholdButton().click();
    thresholdModal.setThresholdName("test");
    thresholdModal.selectActionDropdown("Merge");
    thresholdModal.saveButton().click();
    multiSlider.getHandleNameAndType("test", "merge").should("be.visible");

    //edit threshold
    multiSlider.editOption("test");
    thresholdModal.selectActionDropdown("Notify");
    thresholdModal.saveButton().click();
    multiSlider.getHandleNameAndType("test", "notify").should("be.visible");

    multiSlider.editOption("test");
    thresholdModal.clearThresholdName();
    thresholdModal.setThresholdName("testing");
    thresholdModal.saveButton().click();
    multiSlider.getHandleNameAndType("testing", "notify").should("be.visible");

    //Validating the slider tooltip
    multiSlider.getHandleName("testing").trigger("mouseover", {force: true});
    multiSlider.sliderTooltipValue("1");
    multiSlider.sliderTicksHover("threshold-slider", "19.1919");
    multiSlider.sliderTooltipValue("20");


    //add ruleset
    matchingStepDetail.addNewRulesetSingle();
    rulesetSingleModal.selectPropertyToMatch("customerId");
    rulesetSingleModal.selectMatchTypeDropdown("exact");
    rulesetSingleModal.saveButton().click();
    multiSlider.getHandleNameAndType("customerId", "exact").should("be.visible");
    multiSlider.getHandleName("customerId").should("be.visible");

    //TODO - When we work on the spike story to update multi-slider componenens using cypress
    // multiSlider.getRulesetSliderRail().invoke('attr','activehandleid','$$-0');
    // multiSlider.getHandleName('customerId').invoke('attr', 'style', 'left: 20%').then(attr => {
    //   //Verify the possible match combinations
    //   matchingStepDetail.getPossibleMatchCombinationHeading('testing').should('be.visible');
    //   matchingStepDetail.getPossibleMatchCombinationRuleset('testing','customerId').should('be.visible');
    // });

    //add another ruleset
    matchingStepDetail.addNewRulesetSingle();
    rulesetSingleModal.selectPropertyToMatch("email");
    rulesetSingleModal.selectMatchTypeDropdown("exact");
    rulesetSingleModal.saveButton().click();
    multiSlider.getHandleName("email").should("be.visible");

    // multiSlider.getRulesetSliderRail().invoke('attr','activehandleid','$$-1');
    // multiSlider.getHandleName('email').invoke('attr', 'style', 'left: 30%').then(attr => {
    //   //Verify the possible match combinations
    //   matchingStepDetail.getPossibleMatchCombinationRuleset('testing','email').should('be.visible');
    // });

    // delele a ruleset
    multiSlider.deleteOption("email");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    matchingStepDetail.confirmSliderOptionDeleteButton().click();
    multiSlider.getHandleName("email").should("not.exist");

    //the possible combination related to email ruleset should not exist anymore
    matchingStepDetail.getPossibleMatchCombinationRuleset("testing", "email").should("not.exist");

    // delete threshold
    multiSlider.deleteOption("testing");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    matchingStepDetail.confirmSliderOptionDeleteButton().click();
    multiSlider.getHandleName("testing").should("not.exist");

    //edit ruleset
    multiSlider.editOption("customerId");
    cy.contains("Edit Match Ruleset for Single Property");
    rulesetSingleModal.selectMatchTypeDropdown("reduce");
    rulesetSingleModal.saveButton().click();

    // delele ruleset
    multiSlider.deleteOption("customerId");
    matchingStepDetail.getSliderDeleteText().should("be.visible");
    matchingStepDetail.confirmSliderOptionDeleteButton().click();
    multiSlider.getHandleName("customerId").should("not.exist");

    matchingStepDetail.getDefaultTextNoMatchedCombinations().should("be.visible");
  });
});
