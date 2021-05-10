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

  addNewRuleset() {
    cy.findByLabelText("add-ruleset").click();
  }

  getSinglePropertyOption() {
    cy.findByLabelText("singlePropertyRulesetOption").click();
  }

  getMultiPropertyOption() {
    cy.findByLabelText("multiPropertyRulesetOption").click();
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
    return cy.findAllByLabelText("deleteIcon");
  }

  getTestMatchUriButton() {
    return cy.findByLabelText("testMatchUriButton");
  }

  getAllDataRadio() {
    return cy.findByLabelText("allDataRadio");
  }

  getUriOnlyInputField() {
    return cy.findByLabelText("UriOnlyInput");
  }

  getAddUriOnlyIcon() {
    return cy.findByLabelText("addUriOnlyIcon");
  }
}

const matchingStepDetail = new MatchingStepDetail();
export default matchingStepDetail;
