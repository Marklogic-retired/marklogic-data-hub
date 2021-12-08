class MergeRuleModal {

  selectPropertyToMerge(property: string) {
    cy.get(".rc-tree-select-selector").trigger("mouseover").click();
    cy.findByLabelText(`${property}-option`).then($option => {
      $option[0].click();
    });
    cy.waitUntil(() => cy.findByLabelText(`${property}-option`).should("not.be.visible", {timeout: 10000}));
  }

  selectStructuredPropertyToMerge(parent: string, property: string) {
    const structuredProperty = property.split(" > ").pop();
    //open the dropDown
    cy.get(".rc-tree-select-selector").trigger("mouseover").click();
    // select structured property
    cy.get(`[aria-label="${parent}-option"]`).find(`[aria-label="icon: caret-down"]`).should("be.visible").click({force: true});
    // click on the property selected
    cy.get(`[aria-label="${structuredProperty}-option"]`).should("be.visible").click({force: true});
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
    cy.findByLabelText("confirm-merge-rule").click();
  }

  selectStrategyName(strategyName: string) {
    cy.findByLabelText("strategy-name-select").should("be.visible").click();
    cy.waitUntil(() => cy.findByTestId(`strategyNameOptions-${strategyName}`).should("be.visible")).click({force: true});
  }

  alertContent() {
    return cy.get(`[id="hc-alert-component-content"]`);
  }

  ruleMaxValuesInput(value: string) {
    cy.get("#maxValuesRuleInput").clear().type(value).type("{enter}");
  }

  ruleMaxScoreInput(value: string) {
    cy.get("#maxSourcesRuleInput").clear().type(value).type("{enter}");
  }

  maxValueOtherRadio() {
    return cy.findByLabelText("maxValuesOtherRadio");
  }

  maxSourcesOtherRadio() {
    return cy.findByLabelText("maxSourcesOtherRadio");
  }
}

const mergeRuleModal = new MergeRuleModal();
export default mergeRuleModal;
