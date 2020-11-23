import 'cypress-wait-until';
import { Application } from "../../../support/application.config";
import {
  toolbar,
  confirmationModal,
  createEditStepDialog,
  multiSlider,
  confirmYesNo
} from '../../../support/components/common/index';
import { matchingStepDetail, rulesetSingleModal, thresholdModal } from '../../../support/components/matching/index';
import curatePage from "../../../support/pages/curate";


describe('Matching', () => {

  beforeEach(() => {
    cy.visit('/');
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer","hub-central-mapping-writer", "hub-central-load-writer").withRequest();
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel('Customer').should('be.visible'));
  });

  afterEach(() => {
    cy.resetTestUser();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps('matching', 'matchCustomerTest');
  });

  it('can create/edit a match step within the match tab of curate tile, can create match thresholds/rulesets, can delete match thresholds/rulesets', () => {
    const matchStep = 'matchCustomerTest';

    //Navigating to match tab
    curatePage.toggleEntityTypeId('Customer');
    curatePage.selectMatchTab('Customer');

    //Creating a new match step
    cy.waitUntil(() => curatePage.addNewStep()).click();

    createEditStepDialog.stepNameInput().type(matchStep);
    createEditStepDialog.stepDescriptionInput().type('match customer step example');
    createEditStepDialog.setSourceRadio('Query');
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['${matchStep}'])`);
    createEditStepDialog.saveButton('matching').click();
    curatePage.verifyStepNameIsVisible(matchStep);

    //Editing the match step
    curatePage.editStep(matchStep).click();

    createEditStepDialog.stepNameInput().should('be.disabled');
    createEditStepDialog.stepDescriptionInput().should('have.value', 'match customer step example');

    //Editing the value to see if the confirmation dialogs are working fine.
    createEditStepDialog.stepDescriptionInput().clear().type('UPDATED - match customer step example');
    createEditStepDialog.cancelButton('matching').click();

    confirmYesNo.getDiscardText().should('be.visible');
    confirmYesNo.getYesButton().click();

    //Check if the changes are reverted back when discarded all changes.
    curatePage.editStep(matchStep).click();
    createEditStepDialog.stepDescriptionInput().should('not.have.value', 'UPDATED - match customer step example');
    createEditStepDialog.cancelButton('matching').click();

    //open matching step details
    curatePage.openStepDetails(matchStep);
    cy.contains('The Match step defines criteria for determining whether the values from entiies match, and the action to take based on how close of a match they are.');
    matchingStepDetail.showThresholdTextMore().should('not.be.visible');
    matchingStepDetail.showThresholdTextLess().should('be.visible');
    matchingStepDetail.showRulesetTextMore().should('not.be.visible');
    matchingStepDetail.showRulesetTextLess().should('be.visible');

    //add threshold
    matchingStepDetail.addThresholdButton().click();
    thresholdModal.setThresholdName('test');
    thresholdModal.selectActionDropdown('Merge');
    thresholdModal.saveButton().click();
    multiSlider.getHandle('test').should('be.visible');

    // delele threshold
    multiSlider.getDeleteOption('test').should('be.visible').click({force: true});
    matchingStepDetail.getSliderDeleteText().should('be.visible');
    matchingStepDetail.confirmSliderOptionDeleteButton().click();
    multiSlider.getHandle('test').should('not.exist');

    //add ruleset
    matchingStepDetail.addNewRulesetSingle();
    cy.contains('Add Match Ruleset for Single Property');
    rulesetSingleModal.selectPropertyToMatch('customerId');
    rulesetSingleModal.selectMatchTypeDropdown('exact');
    rulesetSingleModal.saveButton().click();
    multiSlider.getHandle('customerId').should('be.visible');

    // delele ruleset
    multiSlider.getDeleteOption('customerId').should('be.visible').click({force: true});
    matchingStepDetail.getSliderDeleteText().should('be.visible');
    matchingStepDetail.confirmSliderOptionDeleteButton().click();
    multiSlider.getHandle('customerId').should('not.exist');
  });
});
