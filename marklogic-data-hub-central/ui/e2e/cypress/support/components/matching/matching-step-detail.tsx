class MatchingStepDetail {

  addThresholdButton() {
    return cy.findByLabelText('add-threshold');
  }

  showThresholdTextMore() {
    return cy.findByLabelText('threshold-more');
  }

  showThresholdTextLess() {
    return cy.findByLabelText('threshold-less');
  }

  showRulesetTextMore() {
    return cy.findByLabelText('ruleset-more');
  }

  showRulesetTextLess() {
    return cy.findByLabelText('ruleset-less');
  }

  addNewRulesetSingle() {
    cy.findByLabelText('add-ruleset').click();
    cy.waitUntil(() => cy.findByLabelText('single-ruleset-menu').trigger('mouseover')).click();
  }

  getSliderDeleteText() {
    return cy.findByLabelText('delete-slider-text');
  }

  cancelSliderOptionDeleteButton() {
    return cy.findByLabelText('delete-slider-no');
  }

  confirmSliderOptionDeleteButton() {
    return cy.findByLabelText('delete-slider-yes');
  }
}

const matchingStepDetail = new MatchingStepDetail();
export default matchingStepDetail;