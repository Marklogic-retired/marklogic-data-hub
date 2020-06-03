class Tiles {

  getLoadTile() {
    return cy.get('.mosaic-container-load');
  }

  getModelTile() {
    return cy.get('.mosaic-container-model');
  }

  getCurateTile() {
    return cy.get('.mosaic-container-curate');
  }

  getRunTile() {
    return cy.get('.mosaic-container-run');
  }

  getExploreTile() {
    return cy.get('.mosaic-container-explore');
  }
}

const tiles = new Tiles();
export default tiles;
