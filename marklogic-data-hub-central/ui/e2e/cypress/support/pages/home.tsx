class HomePage{

    getViewEntities() {
        return cy.contains('View Entities');
    }

    getBrowseEntities() {
        return cy.contains('Browse Entities');
    }
    getModeling() {
      return cy.contains('Modeling');
  }
}

export default HomePage;
