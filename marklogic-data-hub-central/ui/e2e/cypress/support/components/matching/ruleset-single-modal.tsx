class RulesetSingleModal {

  selectPropertyToMatch(property: string) {
    cy.get('span.ml-tree-select').trigger('mouseover').click();
    cy.findByLabelText(`${property}-option`).then($option => {
      $option[0].click();
    })
  }

  selectMatchTypeDropdown(matchType: string) {
    cy.findByLabelText('match-type-dropdown').should('be.visible').click();
    cy.waitUntil(() => cy.findByLabelText(`${matchType}-option`).should('be.visible')).click();
  }

  setUriText(str: string) {
    cy.get('#uri-input').focus().type(str);
  }

  setFunctionText(str: string) {
    cy.get('#function-input').focus().type(str);
  }

  setNamespaceText(str: string) {
    cy.get('#namespace-input').focus().type(str);
  }

  cancelButton() {
    return cy.findByLabelText('cancel-single-ruleset');
  }

  saveButton() {
    return cy.findByLabelText('confirm-single-ruleset');
  }

}

const rulesetSingleModal = new RulesetSingleModal();
export default rulesetSingleModal;