import {Application} from "../../support/application.config";
import LoginPage from "../../support/pages/login";
import {toolbar} from "../../support/components/common/index";
import browsePage from "../../support/pages/browse";
import graphExplore from "../../support/pages/graphExplore";
import dataModelDisplaySettingsModal from "../../support/components/explore/data-model-display-settings-modal";
import explorePage from "../../support/pages/explore";
import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";
import {compareValuesModal} from "../../support/components/matching/index";

const defaultSelectLabel = "Select...";
const clientEntityData = {
  entityName: "Client",
  postal: "postal",
  postalName: "17864",
};

const orderEntityData = {
  entityName: "Order",
  orderName: "orderName",
};

describe("Validate Client and Order Mastered Data", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
  });
  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });
  it("Verify Search on Both Mastered Entities", {defaultCommandTimeout: 12000}, () => {
    toolbar.getExploreToolbarIcon().click({force: true});
    cy.waitForAsyncRequest();
    cy.wait(5000); //let graph nodes settle

    cy.log("** Setup node labels **");
    explorePage.clickExploreSettingsMenuIcon();
    browsePage.getEntityTypeDisplaySettingsButton().scrollIntoView().click({force: true});
    dataModelDisplaySettingsModal.getModalBody().should("be.visible");

    cy.log("** Select Client Labels **");
    dataModelDisplaySettingsModal.getEntityLabelDropdown(clientEntityData.entityName).should("have.text", defaultSelectLabel);
    dataModelDisplaySettingsModal.getEntityLabelDropdown(clientEntityData.entityName).click();
    cy.waitForAsyncRequest();
    dataModelDisplaySettingsModal.getEntityLabelDropdownOption(
      clientEntityData.entityName, clientEntityData.postal).click();
    dataModelDisplaySettingsModal.getEntityLabelDropdown(clientEntityData.entityName)
      .should("contain.text", clientEntityData.postal);

    cy.log("** Select Order Labels **");
    dataModelDisplaySettingsModal.getEntityLabelDropdown(orderEntityData.entityName)
      .should("have.text", defaultSelectLabel);
    dataModelDisplaySettingsModal.getEntityLabelDropdown(orderEntityData.entityName).click();
    cy.waitForAsyncRequest();
    dataModelDisplaySettingsModal.getEntityLabelDropdownOption(
      orderEntityData.entityName, orderEntityData.orderName).click();
    dataModelDisplaySettingsModal.getEntityLabelDropdown(orderEntityData.entityName)
      .should("contain.text", orderEntityData.orderName);

    cy.log("**Save the changes**");
    dataModelDisplaySettingsModal.getModalSaveButton().click();
    cy.waitForAsyncRequest();
    dataModelDisplaySettingsModal.getModalBody().should("not.exist");


    cy.log("** Search on Merged Client Data and verify connection to Order **");
    browsePage.search(clientEntityData.postalName, true, true);
    graphExplore.nodeInCanvas(ExploreGraphNodes.CLIENT_17864)
      .then((nodePositions: any) => {
        let clientCoordinates = nodePositions[ExploreGraphNodes.CLIENT_17864];
        expect(clientCoordinates).to.not.equal(undefined);
      });

    cy.log("** Search on Merged Order Data and verify connection to Client **");

    browsePage.search(ExploreGraphNodes.ORDER_NODE);

    graphExplore.nodeInCanvas(ExploreGraphNodes.CLIENT_17864)
      .then((nodePositions: any) => {
        let clientCoordinates = nodePositions[ExploreGraphNodes.CLIENT_17864];
        expect(clientCoordinates).to.not.equal(undefined);
      });

    graphExplore.nodeInCanvas(ExploreGraphNodes.ORDER_NODE)
      .then((nodePositions: any) => {
        let orderCoordinates = nodePositions[ExploreGraphNodes.ORDER_NODE];
        expect(orderCoordinates).to.not.equal(undefined);
      });
  });

  it("Unmerge Order Data and verify relationships with Client remain", () => {
    cy.log("** open unmerge action through right click menu **");
    cy.wait(5000);
    graphExplore.focusNode(ExploreGraphNodes.ORDER_NODE);
    graphExplore.nodeInCanvas(ExploreGraphNodes.ORDER_NODE).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.ORDER_NODE];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.trigger("mouseover", orderCoordinates.x, orderCoordinates.y, {force: true});
      canvas.click(orderCoordinates.x, orderCoordinates.y, {force: true});
      cy.wait(2000);
    });

    graphExplore.nodeInCanvas(ExploreGraphNodes.ORDER_NODE).then((nodePositions: any) => {
      let orderCoordinates: any = nodePositions[ExploreGraphNodes.ORDER_NODE];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.trigger("mouseover", orderCoordinates.x, orderCoordinates.y, {force: true});
      canvas.rightclick(orderCoordinates.x, orderCoordinates.y, {force: true});
    });

    cy.log("** submit unmerge in modal **");
    graphExplore.getUnmergeOption().should("be.visible").click();
    compareValuesModal.getModal().should("be.visible");
    compareValuesModal.getUnmergeButton().should("be.visible");
    compareValuesModal.includeUnmergedDocsInFutureMatch().click();
    compareValuesModal.getUnmergeButton().click();
    compareValuesModal.confirmationYes().click();
    compareValuesModal.getModal().should("not.exist");

    cy.log("** confirm merged Order document is replaced with two unmerged Order documents in graph **");

    graphExplore.nodeInCanvas(ExploreGraphNodes.CLIENT_17864)
      .then((nodePositions: any) => {
        let clientCoordinates = nodePositions[ExploreGraphNodes.CLIENT_17864];
        expect(clientCoordinates).to.not.equal(undefined);
      });

    graphExplore.nodeInCanvas(ExploreGraphNodes.ORDER_NODE)
      .then((nodePositions: any) => {
        let orderCoordinates = nodePositions[ExploreGraphNodes.ORDER_NODE];
        expect(orderCoordinates).to.not.equal(undefined);
      });
  });

  it("Search on Client Node now and confirm the same results", () => {
    browsePage.search(clientEntityData.postalName);
    graphExplore.nodeInCanvas(ExploreGraphNodes.CLIENT_17864)
      .then((nodePositions: any) => {
        let clientCoordinates = nodePositions[ExploreGraphNodes.CLIENT_17864];
        expect(clientCoordinates).to.not.equal(undefined);
      });
  });
});
