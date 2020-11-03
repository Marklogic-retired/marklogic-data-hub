import { Application } from "../../../support/application.config";
import { toolbar } from "../../../support/components/common";
import { createEditStepDialog } from '../../../support/components/merging/index';
import curatePage from "../../../support/pages/curate";
import { confirmYesNo } from '../../../support/components/common/index';
import 'cypress-wait-until';

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

  it('can create/edit a match step within the match tab of curate tile, ', () => {
    const matchStep = 'matchCustomerTest';

    //Navigating to merge tab
    curatePage.toggleEntityTypeId('Customer');
    curatePage.selectMatchTab('Customer');

    //Creating a new merge step
    cy.waitUntil(() => curatePage.addNewStep()).click();

    createEditStepDialog.stepNameInput().type(matchStep);
    createEditStepDialog.stepDescriptionInput().type('match customer step example');
    createEditStepDialog.setSourceRadio('Query');
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['${matchStep}'])`);
    createEditStepDialog.saveButton('matching').click();
    curatePage.verifyStepNameIsVisible(matchStep);

    //Editing the merge step
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

  });
});
