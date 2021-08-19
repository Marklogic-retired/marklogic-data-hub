class GraphVis {
  getGraphVisCanvas() {
    return cy.get("canvas");
  }

  /**
     * Get coordinates of one or more entity nodes
     * @param nodeIds
     * @example

  // All nodes in the network (Do not provide a parameter value).
  getPositionsOfNodes();
  >   {
        node1: { x: 5, y: 12 },
        node2: { x: 3, y: 4 },
        node3: { x: 7, y: 10 }
    }

  // Multiple nodes.
  getPositionsOfNodes("node1,node2");
  >   {
        node1: { x: 5, y: 12 },
        node2: { x: 3, y: 4 },
      }

  // A single node.
  getPositionsOfNodes('node1');
  >   {
        node1: { x: 5, y: 12 }
    }
  */
  getPositionsOfNodes(nodeIds?: any) {
    return new Cypress.Promise((resolve) => resolve(cy.window().then((win: any) => {
      let nodesList: any = !nodeIds ? null : nodeIds.split(",");
      let nodePositionInCanvas = win.graphVisApi.getNodePositions(nodesList && nodesList.length === 1 ? nodesList[0] : nodesList);
      let nodePositionsInDOM: any = {};
      for (let nodeId in nodePositionInCanvas) {
        nodePositionsInDOM[nodeId] = win.graphVisApi.canvasToDOM(nodePositionInCanvas[nodeId].x, nodePositionInCanvas[nodeId].y);
      }
      return nodePositionsInDOM;
    })));
  }

  /**
     * Get coordinates of the connecting edge between two nodes
     * @param nodeIds
     * @example

  //Provide comma separated list of two nodeIds in the network, to get the coordinates of the connecting edge between them.
  getPositionOfEdgeBetween("node1,node2"]);
  >   {
        x: 5,
        y: 12
      }
  */
  getPositionOfEdgeBetween(nodeIds: any) {
    return new Cypress.Promise((resolve) => resolve(this.getPositionsOfNodes(nodeIds).then((nodePositions: any) => {
      let nodesList = nodeIds.split(",");
      let fromNodeCoordinates: any = nodePositions[nodesList[0]];
      let toNodeCoordinates: any = nodePositions[nodesList[1]];
      let edgeCenterCoordinates: any = {x: (fromNodeCoordinates.x + toNodeCoordinates.x) / 2, y: (fromNodeCoordinates.y + toNodeCoordinates.y) / 2};
      return edgeCenterCoordinates;
    })));
  }

  canvasToDOM(x: any, y: any) {
    return new Cypress.Promise((resolve) => resolve(cy.window().then((win: any) => {
      let coordinatesInDOM = win.graphVisApi.canvasToDOM(x, y);
      return coordinatesInDOM;
    })));
  }

  getCenterOnEntityTypeOption(entityName: string) {
    cy.findByTestId(`centerOnEntityType-${entityName}`).click({force: true});
  }
}

const graphVis = new GraphVis();
export default graphVis;