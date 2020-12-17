class Tiles {

  getLoadTile() {
    return cy.get(".mosaic-container-load");
  }

  getModelTile() {
    return cy.get(".mosaic-container-model");
  }

  getCurateTile() {
    return cy.get(".mosaic-container-curate");
  }

  getRunTile() {
    return cy.get(".mosaic-container-run");
  }

  getExploreTile() {
    return cy.get(".mosaic-container-explore");
  }

  waitForTableToLoad() {
    cy.waitUntil(() => cy.get(".ant-table-row").should("have.length.gt", 0));
  }

  itemRowInTable(item: string) {
    return cy.waitUntil(() => cy.get(`[data-row-key="${item}"]`));
  }

  closeTile() {
    return cy.get("i[aria-label=\"close\"]");
  }

  closeRunMessage() {
    cy.get("body").type("{esc}");
    cy.wait(500);
    return cy.get("body").type("{esc}");
  }
}

const tiles = new Tiles();
export default tiles;
