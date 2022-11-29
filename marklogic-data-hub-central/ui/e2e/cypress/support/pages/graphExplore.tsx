let retry = 0;
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

  nodeInCanvas(nodeIds?: any) {
    return new Cypress.Promise((resolve) => resolve(cy.window().then((win: any) => {
      let nodesList: any = !nodeIds ? null : nodeIds.split(",");
      let nodePositionInCanvas: any = win.graphVisExploreApi.getNodePositions(nodesList && nodesList.length === 1 ? nodesList[0] : nodesList);
      return nodePositionInCanvas;
    })));
  }


  getAllNodes() {
    return new Cypress.Promise((resolve) => resolve(cy.window().then((win: any) => {
      let nodesInCanvas = win.graphVisExploreApi.getNodePositions();
      return nodesInCanvas;
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

  fit() {
    return new Cypress.Promise((resolve) => resolve(cy.window().then((win: any) => {
      return win.graphVisExploreApi.fit();
    })));
  }

  getCenterNodeOption() {
    return cy.get("#centerNode");
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

  getRecordTab() {
    return cy.findByLabelText("recordTab");
  }

  getInstanceTab() {
    return cy.findByLabelText("instanceTab");
  }

  getJsonRecordData() {
    return cy.findByTestId("graphView-json-container");
  }

  getGraphViewRightArrow() {
    return cy.findByLabelText("graphViewRightArrow");
  }

  getUnmergeIcon() {
    return cy.findByTestId("unmergeIcon");
  }

  getUnmergeOption() {
    return cy.findByTestId("UnmergeOption");
  }

  getUnmergeSpinner() {
    return cy.findByTestId("hc-button-component-spinner");
  }

  getMergeModal() {
    return cy.findAllByTestId("compareTitle");
  }

  getCloseCompareModal() {
    return cy.get(`[aria-label="Close"]`);
  }

  getJsonTypeDetailView() {
    return cy.findByLabelText("jsonTypeData");
  }

  getExportPNGIcon() {
    return cy.get(`[aria-label="graph-export"]`);
  }

  getExportPNGIconTooltip() {
    return cy.get(`[id="export-graph-icon-tooltip"]`);
  }
  getTooltip() {
    return cy.get(`div.vis-tooltip`);
  }
  getStabilizationAlert() {
    return cy.get(`[aria-label="graph-stabilization-alert"]`);
  }

  //loading spinner and message container
  getGraphLoader() {
    return cy.get(`[aria-label="spinner-message-container"]`);
  }

  getContextMenu() {
    return cy.waitUntil(() => cy.get("#contextMenu"));
  }
  showRecordsInCluster() {
    return cy.waitUntil(() => cy.get("#focusOnCluster")).click();
  }
  showAllRecordsFromQuery() {
    return cy.waitUntil(() => cy.get("#defocus")).trigger("mouseover").click();
  }
  /*
   * GROUP/LEAF NODE DROPDOWN ITEMS
   */
  getExpand3RecordsFromGroupNode() {
    return cy.get("#expand3SampleRecords");
  }
  clickExpand3RecordsFromGroupNode() {
    this.getExpand3RecordsFromGroupNode().click();
  }
  clickExpandAllRecordsFromGroupNode() {
    return cy.get("#expandAllRecords").click();
  }
  clickCollapseGroupNode() {
    return cy.get("#collapseRecords").click();
  }
  clickCollapseLeafNode() {
    return cy.get("#collapseLeafNode").click();
  }
  clickShowRelated() {
    return cy.get("#showRelated").click();
  }
  getViewRecordsInTable() {
    return cy.get("#viewRecordsInTableView");
  }
  getTotalResultsCount() {
    let count = "";
    cy.get(`[aria-label="results-count"]`).then(element => {
      count = element.text();
    });
    return parseInt(count.split(" ")[3]);
  }

  getViewingResultsCount() {
    return cy.get(`[aria-label=results-count]`).then(value => {
      return parseInt(value.first().text().split(" ")[1]);
    });
  }

  getRunTile() {
    return cy.get(`[aria-label="tool-run"]`);
  }

  getPersonJSONacordeon() {
    return cy.findAllByTestId("accordion-personJSON");
  }

  getRunButtonMatchPerson() {
    return cy.findAllByTestId("runStep-match-person");
  }

  getCloseModalMatchPerson() {
    return cy.findAllByTestId("personJSON-close");
  }

  getRunButtonMergePerson() {
    return cy.findAllByTestId("runStep-merge-person");
  }


  getTitleApp() {
    return cy.get(`[aria-label="title-container"]`);
  }

  getCloseModalMergePerson() {
    return cy.get(`[aria-label="personJSON-close"]`);
  }


  isElementVisible(selector: any, action1: any, action2: any) {
    if (retry < 3 && Cypress.$(selector).length === 0) {
      //Increment retry
      retry++;
      //wait 1 seconds
      cy.wait(1000);
      //Perforn series of action if the element is not visible
      action1;
      //Element is not yet visible, Call the recursive function again
      cy.then(this.isElementVisible(selector));
    } else if (retry < 3 && Cypress.$(selector).length === 1) {
      //Perforn series of action if the element is visible
      if (action2) {
        action2;
      }
      return;
    } else {
      //It excedded required no. of execution
      cy.log("The element is not visible even after multiple reloads");
      return;
    }
  }
}
export default new GraphExplore();
