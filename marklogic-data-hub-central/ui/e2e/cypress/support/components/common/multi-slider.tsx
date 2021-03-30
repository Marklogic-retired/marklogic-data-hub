class MultiSlider {

  getHandleName(name: string) {
    return cy.findByTestId(`${name}-active`);
  }

  getHandleNameMulti(name: string) {
    return cy.findAllByTestId(`${name}-active`);
  }

  getHandleNameAndType(name: string, type: string) {
    return cy.findByLabelText(`${name}-${type}`);
  }

  editOption(name: string) {
    cy.findByTestId(`edit-${name}`).should("be.visible").then($option => {
      $option[0].click();
    });
  }

  deleteOption(name: string) {
    cy.findByTestId(`delete-${name}`).trigger("mousemove").should("be.visible").then($option => {
      $option[0].click();
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
}

const multiSlider = new MultiSlider();
export default multiSlider;
