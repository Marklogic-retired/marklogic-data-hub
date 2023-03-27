/// <reference types="cypress"/>

import graphVis from "../../support/components/model/graph-vis";
import {graphView, relationshipModal} from "../../support/components/model";
import modelPage from "../../support/pages/model";

describe(("relationBetweenEntities"), () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
    cy.visit("/tiles/model");
    cy.wait(2000);
  });

  const coordinatesMiddleRect = (x1:number, y1:number, x2:number, y2:number) => {
    const Xm = (x1 + x2) / 2;
    const Ym = (y1 + y2) / 2;
    return {Xm, Ym};
  };

  it("Add New Relationship example drag and drop", () => {
    graphView.getAddButton().click();
    graphView.addNewRelationship().should("be.visible").click({force: true});
    graphView.verifyEditInfoMessage().should("exist");

    modelPage.scrollPageBottom();
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let PersonCoordinates: any = nodePositions["Person"];
      let ClientCoordinates: any = nodePositions["Client"];
      cy.wait(150);
      graphVis.getGraphVisCanvas()
        .trigger("pointerdown", PersonCoordinates.x, PersonCoordinates.y, {button: 0, force: true})
        .trigger("pointermove", ClientCoordinates.x, ClientCoordinates.y, {button: 0, force: true})
        .trigger("pointerup", ClientCoordinates.x, ClientCoordinates.y, {button: 0, force: true});
    });
    cy.findByLabelText("relationshipHeader");
    relationshipModal.cancelModal();
  });

  it("Check type when relationship is created", () => {
    cy.reload();
    cy.wait(3500);
    // Add relationship
    graphView.getAddButton().click({force: true});
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
    relationshipModal.verifySourceEntity("Person").should("be.visible");
    relationshipModal.verifyTargetNode("Client").should("be.visible");
    relationshipModal.editRelationshipName("belongTo");
    relationshipModal.addRelationshipSubmit();

    // Open side panel
    cy.wait(2000);
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let PersonCoordinates: any = nodePositions["Person"];
      graphVis.getGraphVisCanvas().trigger("pointerdown", PersonCoordinates.x, PersonCoordinates.y, {button: 0});
      graphVis.getGraphVisCanvas().trigger("pointerup", PersonCoordinates.x, PersonCoordinates.y, {button: 0});
    });
    cy.findByText("(Client)");
    modelPage.closeSidePanel();

    //open edit relationship

    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let PersonCoordinates: any = nodePositions["Person"];
      let ClientCoordinates: any = nodePositions["Client"];
      const relationshipCoordinates = coordinatesMiddleRect(
        PersonCoordinates.x,
        PersonCoordinates.y,
        ClientCoordinates.x,
        ClientCoordinates.y
      );
      graphVis.getGraphVisCanvas().trigger("pointerdown", relationshipCoordinates.Xm, relationshipCoordinates.Ym, {button: 0});
      relationshipModal.editRelationshipName("belongsClient");
      relationshipModal.addRelationshipSubmit();
      cy.wait(3000);
    });

    //Open side panel for office
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let PersonCoordinates: any = nodePositions["Person"];
      graphVis.getGraphVisCanvas().trigger("pointerdown", PersonCoordinates.x, PersonCoordinates.y, {button: 0});
      graphVis.getGraphVisCanvas().trigger("pointerup", PersonCoordinates.x, PersonCoordinates.y, {button: 0});
    });
    cy.findByText("(Client)");
    modelPage.closeSidePanel();

    //Remove relationship
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let PersonCoordinates: any = nodePositions["Person"];
      let ClientCoordinates: any = nodePositions["Client"];
      const relationshipCoordinates = coordinatesMiddleRect(
        PersonCoordinates.x,
        PersonCoordinates.y,
        ClientCoordinates.x,
        ClientCoordinates.y
      );
      graphVis.getGraphVisCanvas().trigger("pointerdown", relationshipCoordinates.Xm, relationshipCoordinates.Ym, {button: 0});
      relationshipModal.getDeleteRelationshipIcon().click();
      relationshipModal.confirmDeleteRel();
    });

  });

  it("Truncate text for a long relationship name between entities", () => {
    cy.reload();
    cy.wait(3500);
    // Add relationship with a long Name
    graphView.getAddButton().click({force: true});
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
    relationshipModal.verifySourceEntity("Person").should("be.visible");
    relationshipModal.verifyTargetNode("Client").should("be.visible");
    const relationshipName = "ThisIsaRelationshipWithManyCharactersToValidateTruncate";
    relationshipModal.editRelationshipName(relationshipName);
    relationshipModal.addRelationshipSubmit();

    cy.waitForAsyncRequest();
    cy.reload();
    cy.waitForAsyncRequest();
    // Check label value of the relationship
    graphVis.getEdgesRelatedToaNode("Person", relationshipName).then((edgeNames:any) => {
      cy.wrap(edgeNames.label).should("equal", "ThisIsaRelationshipW...");
    });

    //Remove relationship
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let PersonCoordinates: any = nodePositions["Person"];
      let ClientCoordinates: any = nodePositions["Client"];
      const relationshipCoordinates = coordinatesMiddleRect(
        PersonCoordinates.x,
        PersonCoordinates.y,
        ClientCoordinates.x,
        ClientCoordinates.y
      );
      graphVis.getGraphVisCanvas().trigger("pointerdown", relationshipCoordinates.Xm, relationshipCoordinates.Ym, {button: 0});
      relationshipModal.getDeleteRelationshipIcon().click();
      relationshipModal.confirmDeleteRel();
    });
  });

  it("Truncate text for a long relationship name between entity and concept", () => {
    cy.reload();
    cy.wait(3500);
    // Add relationship with a long Name
    graphView.getAddButton().click({force: true});
    graphView.addNewRelationship().should("be.visible").click({force: true});
    graphView.verifyEditInfoMessage().should("exist");
    modelPage.scrollPageBottom();
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let PersonCoordinates: any = nodePositions["Person"];
      let ClothStyle: any = nodePositions["ClothStyle"];
      cy.wait(150);
      graphVis.getGraphVisCanvas()
        .trigger("pointerdown", PersonCoordinates.x, PersonCoordinates.y, {button: 0})
        .trigger("pointermove", ClothStyle.x, ClothStyle.y, {button: 0, force: true})
        .trigger("pointerup", ClothStyle.x, ClothStyle.y, {button: 0});
    });
    const relationshipName = "LongRelationshipBetweenEntityAndConceptToTestNameTruncate";
    relationshipModal.verifySourceEntity("Person").should("be.visible");
    relationshipModal.verifyTargetNode("ClothStyle").should("be.visible");
    relationshipModal.getSourcePropertySelectWrapper().click();
    relationshipModal.sourceProperty("fname").click();
    relationshipModal.editRelationshipName(relationshipName);
    relationshipModal.addRelationshipSubmit();
    cy.wait(3000);
    cy.reload();
    cy.wait(3000);
    // Check label value of the relationship
    graphVis.getEdgesRelatedToaNode("Person", relationshipName).then((edgeNames:any) => {
      cy.wrap(edgeNames.label).should("equal", "LongRelationshipBetw...");
    });

    //Open side panel for person
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let PersonCoordinates: any = nodePositions["Person"];
      graphVis.getGraphVisCanvas().trigger("pointerdown", PersonCoordinates.x, PersonCoordinates.y, {button: 0});
      graphVis.getGraphVisCanvas().trigger("pointerup", PersonCoordinates.x, PersonCoordinates.y, {button: 0});
    });
    cy.findByText("Related Concept Classes").click();
    cy.findByText("LongRelationshipBet...").should("exist");
    modelPage.closeSidePanel();

    //Remove relationship
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let PersonCoordinates: any = nodePositions["Person"];
      let ClothStyle: any = nodePositions["ClothStyle"];
      const relationshipCoordinates = coordinatesMiddleRect(
        PersonCoordinates.x,
        PersonCoordinates.y,
        ClothStyle.x,
        ClothStyle.y
      );
      graphVis.getGraphVisCanvas().trigger("pointerdown", relationshipCoordinates.Xm, relationshipCoordinates.Ym, {button: 0});
      relationshipModal.getDeleteRelationshipIcon().click();
      relationshipModal.confirmDeleteRel();
    });

  });

});