class HomePage{

    getViewEntities() {
        return cy.contains('View Entities');
    }

    getBrowseEntities() {
        return cy.contains('Browse Entities');
    }
}

export default HomePage;
