class MultiSlider {

  getHandleName(name: string) {
    return cy.findByTestId(`${name}-active`);
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
    cy.findByTestId(`delete-${name}`).should("be.visible").then($option => {
      $option[0].click();
    });
  }

  getRulesetSliderRail() {
    return cy.findByTestId("ruleSet-slider-rail");
  }
}

const multiSlider = new MultiSlider();
export default multiSlider;
