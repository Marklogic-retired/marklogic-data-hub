class GraphExploreSidePanel {
  getSidePanel() {
    return cy.get("[data-testid=\"graphSidePanel\"]");
  }

  getSidePanelHeading() {
    return cy.get("[data-testid=\"entityHeading\"]");
  }

  getInstanceViewIcon() {
    return cy.get("[data-cy=instance]");
  }
  getTableCellValueByName(text : String) {
    return cy.get(".hc-table_tableCell__1pdIz").contains(`${text}`).parent().next();
  }
  closeGraphExploreSidePanel() {
    cy.get(`[aria-label="closeGraphExploreSidePanel"]`).scrollIntoView().click({force: true});
  }
  getSidePanelConceptHeading(conceptName: string) {
    return cy.get(`[aria-label="${conceptName}-conceptHeading"]`);
  }
  getSidePanelConceptHeadingInfo(conceptName: string) {
    return cy.get(`[aria-label="${conceptName}-conceptHeadingInfo"]`);
  }
}

const graphExploreSidePanel = new GraphExploreSidePanel();
export default graphExploreSidePanel;
