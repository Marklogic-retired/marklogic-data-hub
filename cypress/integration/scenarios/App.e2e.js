describe('Verify Json document', () => {
  it('go to the login page', () => {
    cy.visit('/');
    cy.get('h2').should('have.text', 'Sign In');
  });
  
  it('login to explorer app', () => {
    cy.visit('/');
    cy.get('#username').type('admin');
    cy.get('#password').type('admin');
    cy.contains('Submit').click();
    cy.get('li.ant-menu-item').first().should('have.text', 'View Entities')
  });

  it('should see two entity', () => {
   cy.get('.ant-table-row').should('have.length', 4);
  });  
  
  // it('sort by entity name on descending order', () => {
  //   cy.visit('/');
  //   cy.get('#username').type('admin');
  //   cy.get('#password').type('admin');
  //   cy.contains('Submit').click();
  //   cy.contains('Entity Name').click();
  //   cy.contains('Entity Name').click();
  //   cy.get('tr.ant-table-row-level-0 td').eq(1).should('contain', 'SupportCall')
  // });  
});
