class RulesetSingleModal {

  selectPropertyToMatch(property: string) {
    cy.get("[class^=\"entity-property-tree-select_matchTypeSelect\"] > .ant-select-selection").trigger("mouseover").click();
    cy.findByLabelText(`${property}-option`).then($option => {
      $option[0].click();
    });
    cy.waitUntil(() => cy.findByLabelText(`${property}-option`).should("not.be.visible", {timeout: 10000}));
  }

  selectStructuredPropertyToMatch(parent: string, property: string) {
    cy.get("[class^=\"entity-property-tree-select_matchTypeSelect\"] > .ant-select-selection").trigger("mouseover").click();
    cy.findByLabelText(`${parent}-option`).within(() => {
      cy.findByLabelText("icon: caret-down").then($option => {
        $option[0].click();
      });
      cy.findByLabelText(`${property}-option`).within(() => {
        cy.findByLabelText(`${property.split(" > ").pop()}-option`).then($option => {
          $option[0].click();
        });
      });
    });
    cy.waitUntil(() => cy.findByLabelText(`${property}-option`).should("not.be.visible", {timeout: 10000}));
  }

  selectMatchTypeDropdown(matchType: string) {
    cy.findByLabelText("match-type-dropdown").should("be.visible", {timeout: 10000}).click({force: true});
    cy.waitUntil(() => cy.findByLabelText(`${matchType}-option`).should("have.length.gt", 0)).click({force: true});
  }

  setUriText(str: string) {
    cy.get("#uri-input").focus().type(str);
  }

  setFunctionText(str: string) {
    cy.get("#function-input").focus().type(str);
  }

  setNamespaceText(str: string) {
    cy.get("#namespace-input").focus().type(str);
  }

  cancelButton() {
    return cy.findByLabelText("cancel-single-ruleset");
  }

  saveButton() {
    return cy.findByLabelText("confirm-single-ruleset");
  }

  setDictionaryUri(str: string) {
    cy.get("#dictionary-uri-input").focus().type(str);
  }

  setDistanceThreshold(str: string) {
    cy.get("#distance-threshold-input").focus().type(str);
  }

  setThesaurus(str: string) {
    cy.get("#thesaurus-uri-input").focus().type(str);
  }

  reduceButton() {
    return cy.findByLabelText("reduceToggle");
  }

}

const rulesetSingleModal = new RulesetSingleModal();
export default rulesetSingleModal;
