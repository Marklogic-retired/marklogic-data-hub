class MultiSlider {

  getHandle(name: string) {
    return cy.findByTestId(`${name}-active`)
  }

  getEditOption(name: string) {
    return cy.findByTestId(`edit-${name}`);
  }

  getDeleteOption(name: string) {
    return cy.findByTestId(`delete-${name}`);
  }
}

const multiSlider = new MultiSlider();
export default multiSlider;