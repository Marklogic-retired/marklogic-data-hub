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
    cy.get(`[data-row-key="${property}"]`).within(() => cy.waitUntil(() => cy.findByLabelText(`${matchType}-option`).should("have.length.gt", 0)).click({force: true}));
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

  setUriText(property: string, str: string) {
    cy.findByLabelText(`${property}-uri-input`).focus().type(str);
  }

  setFunctionText(property: string, str: string) {
    cy.findByLabelText(`${property}-function-input`).focus().type(str);
  }

  setNamespaceText(property: string, str: string) {
    cy.findByLabelText(`${property}-namespace-input`).focus().type(str);
  }

  setDictionaryUri(property: string, str: string) {
    cy.findByLabelText(`${property}-dictionary-uri-input`).focus().type(str);
  }

  setDistanceThreshold(property: string, str: string) {
    cy.findByLabelText(`${property}-distance-threshold-input`).focus().type(str);
  }

  setThesaurus(property: string, str: string) {
    cy.findByLabelText(`${property}-thesaurus-uri-input`).focus().type(str);
  }
}

const rulesetMultipleModal = new RulesetMultipleModal();
export default rulesetMultipleModal;