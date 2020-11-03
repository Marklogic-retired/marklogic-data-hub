import { Application } from "../../../support/application.config";
import { toolbar } from "../../../support/components/common";
import { createEditStepDialog } from '../../../support/components/merging/index';
import curatePage from "../../../support/pages/curate";
import { confirmYesNo } from '../../../support/components/common/index';
import 'cypress-wait-until';

describe('Merging', () => {

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
    cy.deleteSteps('merging', 'mergeOrderTestStep');
  });

  it('can create/edit a merge step within the merge tab of curate tile, ', () => {
    const mergeStep = 'mergeOrderTestStep';

    //Navigating to merge tab
    curatePage.toggleEntityTypeId('Order');
    curatePage.selectMergeTab('Order');

    //Creating a new merge step
    cy.waitUntil(() => curatePage.addNewStep()).click();

    createEditStepDialog.stepNameInput().type(mergeStep);
    createEditStepDialog.stepDescriptionInput().type('merge order step example');
    createEditStepDialog.setSourceRadio('Query');
    createEditStepDialog.setQueryInput(`cts.collectionQuery(['${mergeStep}'])`);
    createEditStepDialog.setTimestampInput().type('/envelop/headers/createdOn');
    createEditStepDialog.saveButton('merging').click();
    curatePage.verifyStepNameIsVisible(mergeStep);

    //Editing the merge step
    curatePage.editStep(mergeStep).click();

    createEditStepDialog.stepNameInput().should('be.disabled');
    createEditStepDialog.stepDescriptionInput().should('have.value', 'merge order step example');
    createEditStepDialog.setTimestampInput().should('have.value', '/envelop/headers/createdOn');

    //Editing the value to see if the confirmation dialogs are working fine.
    createEditStepDialog.stepDescriptionInput().clear().type('UPDATED - merge order step example');
    createEditStepDialog.cancelButton('merging').click();

    confirmYesNo.getDiscardText().should('be.visible');
    confirmYesNo.getYesButton().click();

    //Check if the changes are reverted back when discarded all changes.
    curatePage.editStep(mergeStep).click();
    createEditStepDialog.stepDescriptionInput().should('not.have.value', 'UPDATED - merge order step example');

  });
});
