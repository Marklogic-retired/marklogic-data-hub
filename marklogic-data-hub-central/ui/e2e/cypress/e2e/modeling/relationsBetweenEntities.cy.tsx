/// <reference types="cypress"/>

import graphVis from "../../support/components/model/graph-vis";
import {graphView} from "../../support/components/model";
import modelPage from "../../support/pages/model";

describe(("relationBetweenEntities"), () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
    cy.visit("/tiles/model");
    cy.wait(2000);
  });

  it("Add New Relationship", () => {

    graphView.getAddButton().click();
    graphView.addNewRelationship().should("be.visible").click({force: true});
    graphView.verifyEditInfoMessage().should("exist");

    modelPage.scrollPageBottom();
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let PersonCoordinates: any = nodePositions["Person"];
      let ClientCoordinates: any = nodePositions["Client"];
      cy.wait(150);
      graphVis.getGraphVisCanvas()
        .trigger("pointerdown", PersonCoordinates.x, PersonCoordinates.y, {button: 0})
        .trigger("pointermove", ClientCoordinates.x, ClientCoordinates.y, {button: 0, force: true})
        .trigger("pointerup", ClientCoordinates.x, ClientCoordinates.y, {button: 0});
    });
    cy.findByLabelText("relationshipHeader");
  });
});