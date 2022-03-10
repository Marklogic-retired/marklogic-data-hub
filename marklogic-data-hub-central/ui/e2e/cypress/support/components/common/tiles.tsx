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
    cy.waitUntil(() => cy.get(".hc-table_row").should("have.length.gt", 0));
  }

  itemRowInTable(item: string) {
    return cy.waitUntil(() => cy.get(`[data-row-key="${item}"]`));
  }

  closeTile() {
    return cy.get("i[aria-label=\"close\"]");
  }

  closeRunMessage() {
    cy.wait(1500); //double requests are returning multiple modals - wait
    cy.get("button[aria-label=\"Close\"]").click({multiple: true});
    cy.get("body")
      .then(($body) => {
        if ($body.find("[data-testid=explorer-link]").length) {
          cy.get("button[aria-label=\"Close\"]").click({multiple: true});
        }
      });
    cy.waitForBootstrapModalToDisappear();
  }
}

const tiles = new Tiles();
export default tiles;
