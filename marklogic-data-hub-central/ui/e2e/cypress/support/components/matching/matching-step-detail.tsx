class MatchingStepDetail {

  addThresholdButton() {
    return cy.findByLabelText("add-threshold");
  }

  showThresholdTextMore() {
    return cy.findByLabelText("threshold-more");
  }

  showThresholdTextLess() {
    return cy.findByLabelText("threshold-less");
  }

  showRulesetTextMore() {
    return cy.findByLabelText("ruleset-more");
  }

  showRulesetTextLess() {
    return cy.findByLabelText("ruleset-less");
  }

  addNewRulesetSingle() {
    cy.findByLabelText("add-ruleset").click();
  }

  getSliderDeleteText() {
    return cy.findByLabelText("delete-slider-text");
  }

  cancelSliderOptionDeleteButton() {
    return cy.findByLabelText("delete-slider-no");
  }

  confirmSliderOptionDeleteButton() {
    return cy.findByLabelText("delete-slider-yes");
  }

  getPossibleMatchCombinationHeading(thresholdName: string) {
    return cy.findByLabelText(`combinationLabel-${thresholdName}`);
  }

  getPossibleMatchCombinationRuleset(thresholdName: string, ruleset: string) {
    return cy.findByLabelText(`rulesetName-${thresholdName}-${ruleset}`);
  }

  getDefaultTextNoMatchedCombinations() {
    return cy.findByLabelText("noMatchedCombinations");
  }

  getUriInputField() {
    return cy.findByLabelText("UriInput");
  }

  getAddUriIcon() {
    return cy.findByLabelText("addUriIcon");
  }

  getUriDeleteIcon() {
    return cy.findByLabelText("deleteIcon");
  }
}

const matchingStepDetail = new MatchingStepDetail();
export default matchingStepDetail;
