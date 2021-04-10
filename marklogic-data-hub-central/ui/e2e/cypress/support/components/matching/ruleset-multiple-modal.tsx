class RulesetMultipleModal {

  setRulesetName(str: string) {
    cy.findByLabelText("rulesetName-input").focus().type(str);
  }

  selectPropertyToMatch(property: string) {
    cy.get(`[data-row-key="${property}"] .ant-checkbox-input`).trigger("mouseover").click();
    cy.waitUntil(() => cy.get(`[data-row-key="${property}"] .ant-checkbox-checked`).should("be.visible"), {timeout: 10000});
  }

  selectMatchTypeDropdown(property: string, matchType: string) {
    cy.findByLabelText(`${property}-match-type-dropdown`).should("be.visible", {timeout: 10000}).click({force: true});
    cy.waitUntil(() => cy.findByLabelText(`${matchType}-option`).should("have.length.gt", 0)).click({force: true});
  }

  cancelButton() {
    return cy.findByLabelText("cancel-multiple-ruleset");
  }

  saveButton() {
    return cy.findByLabelText("confirm-multiple-ruleset");
  }

  reduceButton() {
    return cy.findByLabelText("reduceToggle");
  }
}

const rulesetMultipleModal = new RulesetMultipleModal();
export default rulesetMultipleModal;