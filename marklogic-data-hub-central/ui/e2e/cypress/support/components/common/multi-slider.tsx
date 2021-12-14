class MultiSlider {

  getHandleName(name: string) {
    return cy.findAllByText(`${name}`);
  }

  getHandleNameMulti(name: string) {
    return cy.findAllByTestId(`${name}-active`);
  }

  getThresholdHandleNameAndType(name: string, type: string) {
    return cy.findAllByTestId(`threshold ${name} - ${type}`);
  }

  getRulesetHandleNameAndType(name: string, type: string) {
    return cy.findAllByTestId(`ruleset ${name} - ${type}`);
  }

  thresholdEditOption(name: string, type: string) {
    cy.findByTestId(`threshold ${name} - ${type}`).should("be.visible").then($option => {
      $option[0].click();
    });
  }

  ruleSetEditOption(name: string, type: string) {
    cy.findByTestId(`ruleset ${name} - ${type}`).should("be.visible").then($option => {
      $option[0].click();
    });
  }

  ruleSetEditOptionMulti(name: string) {
    cy.findByTestId(`ruleset ${name}`).should("be.visible").then($option => {
      $option[0].click();
    });
  }

  deleteOption(name: string, type: string) {
    cy.findByTestId(`ruleset ${name} - ${type}`).click().then(() => {
      cy.get(`[data-icon="trash-alt"]`).click();
    });
  }

  deleteOptionMulti(name: string) {
    cy.findByTestId(`ruleset ${name}`).should("be.visible").click().then(() => {
      cy.get(`[data-icon="trash-alt"]`).click();
    });
  }

  deleteOptionThreshold(name: string, type: string) {
    cy.findByTestId(`threshold ${name} - ${type}`).scrollIntoView().should("be.visible").click().then(() => {
      cy.get(`[data-icon="trash-alt"]`).click();
    });
  }

  getRulesetSliderRail() {
    return cy.findByTestId("ruleSet-slider-rail");
  }

  getRulesetSliderOptions() {
    return cy.findByTestId("ruleSet-slider-options");
  }

  sliderTooltipValue(val: string) {
    cy.get("div[class=\"tooltipValue\"]").should("contain.text", val);
  }

  sliderTicksHover(sliderName: string, val: string) {
    cy.findByTestId(`${sliderName}-ticks`).find(`div[style*="left: ${val}%;"]`).trigger("mouseover", {force: true});
  }

  sliderTicksMove(sliderName: string, val: string) {
    cy.findByTestId(`${sliderName}-ticks`).find(`div[style*="left: ${val}%;"]`).trigger("mousemove", {force: true});
  }

  confirmDelete(name: string, type: string) {
    cy.findByLabelText(`confirm-${name} - ${type}-yes`).click();
  }

  confirmDeleteThreshold(name: string) {
    cy.findByLabelText(`confirm-${name}-yes`).click();
  }

  confirmDeleteMulti(name: string) {
    cy.findByLabelText(`confirm-${name}-yes`).click();
  }

  enableEdit(name: string) {
    cy.findByLabelText(`${name}-scale-switch`).click();
  }
}

const multiSlider = new MultiSlider();
export default multiSlider;
