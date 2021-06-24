class MergeRuleModal {

  selectPropertyToMerge(property: string) {
    cy.get("span.ml-tree-select").trigger("mouseover").click();
    cy.findByLabelText(`${property}-option`).then($option => {
      $option[0].click();
    });
    cy.waitUntil(() => cy.findByLabelText(`${property}-option`).should("not.be.visible", {timeout: 10000}));
  }

  selectStructuredPropertyToMerge(parent: string, property: string) {
    cy.get("span.ml-tree-select").trigger("mouseover").click();
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

  selectMergeTypeDropdown(mergeType: string) {
    cy.findByLabelText("mergeType-select").should("be.visible").click();
    cy.waitUntil(() => cy.findByTestId(`mergeTypeOptions-${mergeType}`).should("be.visible")).click({force: true});
  }

  setUriText(str: string) {
    cy.findByLabelText("uri-input").focus().type(str);
  }

  setFunctionText(str: string) {
    cy.findByLabelText("function-input").focus().clear().type(str);
  }

  setNamespaceText(str: string) {
    cy.findByLabelText("namespace-input").focus().type(str);
  }

  addSliderOptionsButton() {
    return cy.findByLabelText("add-slider-button");
  }

  cancelButton() {
    return cy.findByLabelText("cancel-merge-rule");
  }

  saveButton() {
    return cy.findByLabelText("confirm-merge-rule");
  }

  selectStrategyName(strategyName: string) {
    cy.findByLabelText("strategy-name-select").should("be.visible").click();
    cy.waitUntil(() => cy.findByTestId(`strategyNameOptions-${strategyName}`).should("be.visible")).click({force: true});
  }

  alertMessage() {
    return cy.get(".merge-rule-dialog_alertMessage__28dTa");
  }

  alertDescription() {
    return cy.get(".ant-alert-description");
  }

  ruleMaxValuesInput(value: string) {
    cy.get("#maxValuesRuleInput").clear().type(value).type("{enter}");
  }

  ruleMaxScoreInput(value: string) {
    cy.get("#maxSourcesRuleInput").clear().type(value).type("{enter}");
  }
}

const mergeRuleModal = new MergeRuleModal();
export default mergeRuleModal;
