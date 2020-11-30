class MultiSlider {

  getHandle(name: string) {
    return cy.findByTestId(`${name}-active`);
  }

  editOption(name: string) {
    cy.findByTestId(`edit-${name}`).should('be.visible').then($option => {
      $option[0].click();
    });
  }

  deleteOption(name: string) {
    cy.findByTestId(`delete-${name}`).should('be.visible').then($option => {
      $option[0].click();
    });;
  }
}

const multiSlider = new MultiSlider();
export default multiSlider;