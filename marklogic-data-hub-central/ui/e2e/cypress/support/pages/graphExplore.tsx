
class GraphExplore {
  getGraphVisCanvas() {
    return cy.get("canvas");
  }
  getPositionsOfNodes(nodeIds?: any) {
    return new Cypress.Promise((resolve) => resolve(cy.window().then((win: any) => {
      let nodesList: any = !nodeIds ? null : nodeIds.split(",");
      let nodePositionInCanvas = win.graphVisExploreApi.getNodePositions(nodesList && nodesList.length === 1 ? nodesList[0] : nodesList);
      let nodePositionsInDOM: any = {};
      for (let nodeId in nodePositionInCanvas) {
        nodePositionsInDOM[nodeId] = win.graphVisExploreApi.canvasToDOM(nodePositionInCanvas[nodeId].x, nodePositionInCanvas[nodeId].y);
      }
      return nodePositionsInDOM;
    })));
  }

  focusNode(nodeId: any) {
    return new Cypress.Promise((resolve) => resolve(cy.window().then((win: any) => {
      win.graphVisExploreApi.focus(nodeId);
    })));
  }

  stopStabilization() {
    return new Cypress.Promise((resolve) => resolve(cy.window().then((win: any) => {
      return win.graphVisExploreApi.stopStabilization();
    })));
  }

  getExpandAll() {
    return cy.get("#expandIcon");
  }

  clickOnExpandAll() {
    return this.getExpandAll().click();
  }

  getCollapseAll() {
    return cy.get("#collapseIcon");
  }

  clickOnCollapseAll() {
    return this.getCollapseAll().click();
  }

  getTableHeaders() {
    return cy.get("th[class^='hc-table_header']");
  }

  getTableChildren() {
    return cy.get("*[class^='hc-table_childrenIndentTableRow']");
  }

  getExpandRows() {
    return cy.get("button[aria-label='Expand row']");
  }
}
export default new GraphExplore();
