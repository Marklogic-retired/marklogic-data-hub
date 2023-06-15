import {graphView, relationshipModal} from "../../support/components/model";
import graphVis from "../../support/components/model/graph-vis";
import modelPage from "../../support/pages/model";

describe(("relationBetweenEntities"), () => {
  before(() => {

    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.loginAsDeveloper().withRequest();
  });

  beforeEach(() => {
    cy.setupHubCentralConfig();
    cy.visit("tiles/model");
    cy.waitForAsyncRequest();
  });

  const coordinatesMiddleRect = (x1:number, y1:number, x2:number, y2:number) => {
    const Xm = (x1 + x2) / 2;
    const Ym = (y1 + y2) / 2;
    return {Xm, Ym};
  };

  it("Add New Relationship example drag and drop", () => {
    graphView.getAddButton().click();
    graphView.checkIfAddDropDownIsOpen();
    graphView.addNewRelationship().should("be.visible").click({force: true});
    graphView.verifyEditInfoMessage().should("exist");
    modelPage.zoomOut(600);
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
    graphView.getAddButton().click();
    graphView.checkIfAddDropDownIsOpen();
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
        .trigger("pointerup", ClientCoordinates.x, ClientCoordinates.y, {button: 0, force: true});
    });
    relationshipModal.verifySourceEntity("Person").should("be.visible");
    relationshipModal.verifyTargetNode("Client").should("be.visible");
    relationshipModal.editRelationshipName("belongTo");
    relationshipModal.addRelationshipSubmit();

    cy.wait(2000);
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let PersonCoordinates: any = nodePositions["Person"];
      graphVis.getGraphVisCanvas().trigger("pointerdown", PersonCoordinates.x, PersonCoordinates.y, {button: 0});
      graphVis.getGraphVisCanvas().trigger("pointerup", PersonCoordinates.x, PersonCoordinates.y, {button: 0});
    });
    cy.findByText("(Client)");
    modelPage.closeSidePanel();

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

    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let PersonCoordinates: any = nodePositions["Person"];
      graphVis.getGraphVisCanvas().trigger("pointerdown", PersonCoordinates.x, PersonCoordinates.y, {button: 0});
      graphVis.getGraphVisCanvas().trigger("pointerup", PersonCoordinates.x, PersonCoordinates.y, {button: 0});
    });
    cy.findByText("(Client)");
    modelPage.closeSidePanel();

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
    graphView.getAddButton().click();
    graphView.checkIfAddDropDownIsOpen();
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
        .trigger("pointerup", ClientCoordinates.x, ClientCoordinates.y, {button: 0, force: true});
    });
    relationshipModal.verifySourceEntity("Person").should("be.visible");
    relationshipModal.verifyTargetNode("Client").should("be.visible");
    const relationshipName = "ThisIsaRelationshipWithManyCharactersToValidateTruncate";
    relationshipModal.editRelationshipName(relationshipName);
    relationshipModal.addRelationshipSubmit();

    cy.waitForAsyncRequest();
    cy.reload();
    cy.waitForAsyncRequest();

    graphVis.getEdgesRelatedToaNode("Person", relationshipName).then((edgeNames:any) => {
      cy.wrap(edgeNames.label).should("equal", "ThisIsaRelationshipW...");
    });

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
    graphView.getAddButton().click();
    graphView.checkIfAddDropDownIsOpen();
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
    modelPage.navigate();
    graphVis.getEdgesRelatedToaNode("Person", relationshipName).then((edgeNames:any) => {
      cy.wrap(edgeNames.label).should("equal", "LongRelationshipBetw...");
    });
    modelPage.scrollPageBottom();
    graphVis.getPositionsOfNodes().then((nodePositions: any) => {
      let PersonCoordinates: any = nodePositions["Person"];
      graphVis.getGraphVisCanvas().trigger("pointerdown", PersonCoordinates.x, PersonCoordinates.y, {button: 0});
      graphVis.getGraphVisCanvas().trigger("pointerup", PersonCoordinates.x, PersonCoordinates.y, {button: 0});
    });
    cy.findByText("Related Concept Classes").click();
    cy.findByText("LongRelationshipBet...").should("exist");
    modelPage.closeSidePanel();

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