import {entityTypeModal, propertyTable} from "../../support/components/model/index";
import {confirmationModal} from "../../support/components/common/index";
import {ConfirmationType} from "../../support/types/modeling-types";
import graphVis from "../../support/components/model/graph-vis";
import modelPage from "../../support/pages/model";
import "cypress-wait-until";

import {
  entityTypeTable,
  graphViewSidePanel,
  propertyModal,
  relationshipModal,
} from "../../support/components/model/index";
import curatePage from "../../support/pages/curate";

describe("Graph Validations", {defaultCommandTimeout: 40000}, () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
    cy.setupHubCentralConfig();
  });

  beforeEach(() => {
    cy.visit("tiles-model");
    cy.waitForAsyncRequest();
    modelPage.switchTableView();
  });

  after(() => {
    cy.log("**Reverting**");
    cy.revertDataModel();
    cy.waitForAsyncRequest();
  });

  it("Can view and edit Entity Type tab in side panel", () => {
    entityTypeTable.viewEntityInGraphView("Person");
    graphViewSidePanel.getEntityTypeTab().click();
    graphViewSidePanel.getEntityDescription().should("be.visible");
    modelPage.getPublishButton().invoke("attr", "class").then($classNames => {
      if (typeof $classNames === "string" && !$classNames.includes("graph-view_disabledPointerEvents")) {
        cy.publishDataModel();
      }
    });
    modelPage.getEntityModifiedAlert().should("not.exist");
    modelPage.getPublishButton().should("not.be.enabled");

    graphViewSidePanel.getEntityDescription().clear();
    graphViewSidePanel.getEntityNamespace().clear();
    graphViewSidePanel.getEntityPrefix().clear();

    graphViewSidePanel.getEntityDescription().clear();
    graphViewSidePanel.getEntityNamespace().clear();
    graphViewSidePanel.getEntityPrefix().clear();
    graphViewSidePanel.getEntityDescription().type("test description");
    graphViewSidePanel.getEntityNamespace().click();
    modelPage.getEntityModifiedAlert().should("exist");
    modelPage.getPublishButton().should("be.enabled");
    graphViewSidePanel.getEntityNamespace().type("test", {delay: 500});
    graphViewSidePanel.getEntityDescription().click();
    cy.findByText("Since you entered a namespace, you must specify a prefix.").should("be.visible");
    graphViewSidePanel.getEntityPrefix().type("pre", {delay: 500});
    graphViewSidePanel.getEntityDescription().click();
    cy.findByText("Invalid model: Namespace property must be a valid absolute URI. Value is test.").should("be.visible");
    graphViewSidePanel.getEntityDescription().clear();
    graphViewSidePanel.getEntityNamespace().clear().type("http://example.org/test", {delay: 500});
    graphViewSidePanel.getEntityDescription().click();
    cy.findByText("Invalid model: Namespace property must be a valid absolute URI. Value is test.").should("not.exist");
    modelPage.toggleColorSelector("Person");
    modelPage.selectColorFromPicker("#D5D3DD").click();
    if (Cypress.isBrowser("!firefox")) {
      graphViewSidePanel.getEntityTypeColor("Person").should("have.css", "background", "rgb(213, 211, 221) none repeat scroll 0% 0% / auto padding-box border-box");
    }
    if (Cypress.isBrowser("firefox")) {
      graphViewSidePanel.getEntityTypeColor("Person").should("have.css", "background-color", "rgb(213, 211, 221)");
    }
  });

  it("Can view and works with the Related Concept Classes tab in the side panel", () => {
    cy.log("**Visit Product entity**");
    entityTypeTable.viewEntityInGraphView("Product");

    cy.log("**Select Related Concept Classes tab**");
    graphViewSidePanel.getRelatedConceptClassesTab().click();
    graphViewSidePanel.getPropertyTableHeader("relationshipName").should("exist");
    graphViewSidePanel.getPropertyTableHeader("conceptClass").should("exist");
    graphViewSidePanel.getPropertyTableHeader("delete").should("exist");

    cy.log("**Check if an element could be eliminated**");
    graphViewSidePanel.getRelatedConceptClassesDeleteIcon("isCategory", "ShoeType").click();
    graphViewSidePanel.getConfirmationModal().should("exist");
  });

  it("Can view and works with the Optional section and select source property dropdown", () => {
    cy.log("**Visit Customer entity**");
    entityTypeTable.viewEntityInGraphView("Customer");
    graphViewSidePanel.getAddPropertyLinkButton("Customer").scrollIntoView().should("exist");

    cy.log("**Select Related Concept Classes tab**");
    graphViewSidePanel.getRelatedConceptClassesTab().click();
    graphViewSidePanel.getPropertyTableHeader("relationshipName").should("exist");
    graphViewSidePanel.getPropertyTableHeader("conceptClass").should("exist");

    cy.log("**Open relationship modal**");
    graphViewSidePanel.getRelatedConceptPropertyName("shoes").click();

    cy.log("**Open relationship modal**");
    relationshipModal.toggleOptional();
    relationshipModal.getSourcePropertyListIcon().should("exist");
    relationshipModal.getSourcePropertyListIcon().click();
    relationshipModal.verifyEntityOption("nicknames").should("exist");
  });

  it("Can filter and select entity type in graph view", () => {
    modelPage.switchGraphView();
    graphViewSidePanel.getSelectedEntityHeading("BabyRegistry").should("not.exist");
    graphViewSidePanel.getGraphViewFilterInput().type("Bab", {delay: 500});
    graphViewSidePanel.selectEntityDropdown();
    graphViewSidePanel.getSelectedEntityHeading("BabyRegistry").should("exist");
    graphViewSidePanel.getPropertiesTab().should("exist");
    graphViewSidePanel.getEntityTypeTab().should("exist");
    graphViewSidePanel.getDeleteIcon("BabyRegistry").should("exist");
  });

  it("Can center on entity type in graph view", () => {
    modelPage.switchGraphView();
    cy.wait(500);

    modelPage.scrollPageBottom();
    graphVis.getPositionsOfNodes("Person").then((nodePositions: any) => {
      let personCoordinates: any = nodePositions["Person"];
      graphVis.getGraphVisCanvas().trigger("mouseover", personCoordinates.x, personCoordinates.y);
    });
    cy.wait(500);

    graphVis.getPositionsOfNodes("Person").then((nodePositions: any) => {
      let personCoordinates: any = nodePositions["Person"];
      cy.wait(150);
      graphVis.getGraphVisCanvas().rightclick(personCoordinates.x, personCoordinates.y);
      graphVis.getGraphVisCanvas().rightclick(personCoordinates.x, personCoordinates.y);
    });

    cy.wait(500);
    graphVis.getCenterOnEntityTypeOption("Person").trigger("mouseover").click();

    let centeredPersonX: any;
    let centeredPersonY: any;

    graphVis.getPositionsOfNodes("Person").then((nodePositions: any) => {
      centeredPersonX = nodePositions["Person"].x;
      centeredPersonY = nodePositions["Person"].y;

      expect(centeredPersonX).to.be.greaterThan(700);
      expect(centeredPersonX).to.be.lessThan(800);
      expect(centeredPersonY).to.be.greaterThan(300);
      expect(centeredPersonY).to.be.lessThan(500);
    });
  });

  it("Can select all available nodes in graph view, locations persist", () => {
    let ids = ["BabyRegistry", "Client", "Customer", "Order", "Person"];
    let savedCoords: any = {};
    modelPage.switchGraphView();

    ids.forEach(id => {
      graphVis.getPositionsOfNodes(id).then((nodePositions: any) => {
        let coords: any = nodePositions[id];
        savedCoords[id] = {x: coords.x, y: coords.y};
      });
    });

    curatePage.navigate();
    confirmationModal.getNavigationWarnText().should("exist");
    confirmationModal.getYesButton(ConfirmationType.NavigationWarn);

    modelPage.navigate();
    modelPage.switchGraphView();

    ids.forEach(id => {
      graphVis.getPositionsOfNodes(id).then((nodePositions: any) => {
        let coords: any = nodePositions[id];
        let persistedCoords = {x: coords.x, y: coords.y};
        expect(savedCoords[id].x).to.equal(persistedCoords.x);
        expect(savedCoords[id].y).to.equal(persistedCoords.y);
      });
    });
  });

  it("Add entities, a relation, publish, delete the relation and check if it's possible to delete an entity", () => {
    cy.log("**Reverts changes**");
    cy.revertDataModel();

    cy.log("**Creating new entity Test2 in table view**");
    modelPage.getAddButton().click();
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});//.should("exist").click();
    entityTypeModal.newEntityName("a-Test2");
    entityTypeModal.newEntityDescription("Entity description test2");
    entityTypeModal.getAddButton().click();

    cy.log("**Add attributes to Test2**");
    cy.get("[data-testid='entityName']").scrollIntoView().should("be.visible").click();
    propertyTable.getAddPropertyButton("a-Test2").scrollIntoView().click();
    propertyModal.addTextInput("hc-input-component", "id-test2");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string");
    propertyModal.getSubmitButton().click();

    cy.log("**Creating new entity Test1 in table view**");
    modelPage.getAddButton().click();
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});
    entityTypeModal.newEntityName("a-Test1");
    entityTypeModal.newEntityDescription("Entity description test1");
    entityTypeModal.getAddButton().click();

    cy.log("**Adding attributes to Test1**");
    propertyTable.getAddPropertyButton("a-Test1").scrollIntoView().click();
    propertyModal.addTextInput("hc-input-component", "id");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string");
    propertyModal.getSubmitButton().click();

    cy.log("**Creating relation**");
    propertyTable.getAddPropertyButton("a-Test1").scrollIntoView().click();
    propertyModal.addTextInput("hc-input-component", "relTest1-Test2");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Related Entity");
    propertyModal.getCascadedTypeFromDropdown("a-Test2");
    propertyModal.getForeignKeySelectWrapper().click();
    propertyModal.getForeignKey("id-test2").click();
    propertyModal.getSubmitButton().click();

    cy.log("**Trying to delete the foregin key property**");
    entityTypeTable.getExpandEntityIcon("a-Test2");
    propertyModal.getDeleteIcon("a-Test2-id-test2").should("exist").scrollIntoView().should("be.visible").click();
    confirmationModal.getDeletePropertyForeignKeyWarnText().should("be.visible");
    cy.findByText("Close").should("be.visible").click();
  });

  it("Can view and edit an Entity's properties in side panel", () => {
    cy.get("[data-testid='entityName']").scrollIntoView().should("be.visible").click({force: true});
    cy.waitForAsyncRequest();
    cy.log("**Opens a-Test2 details**");
    entityTypeTable.viewEntityInGraphView("a-Test2");
    graphViewSidePanel.getPropertiesTab().click();
    graphViewSidePanel.getPropertyName("id-test2").should("be.visible");

    cy.log("**Edits id-test2 property**");
    propertyTable.editProperty("id-test2");
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName("test2-id");
    propertyModal.getSubmitButton().click();
    cy.wait(1000);
    propertyTable.getProperty("test2-id").should("exist");

    cy.log("**Opens a-Test1 details**");
    cy.intercept("/api/models/primaryEntityTypes?includeDrafts=true").as("loadTable");
    cy.get("#switch-view-table").click({force: true});
    cy.wait("@loadTable");
    entityTypeTable.viewEntityInGraphViewNotScroll("a-Test1");
    graphViewSidePanel.getPropertiesTab().click({force: true});
    graphViewSidePanel.getPropertyName("relTest1-Test2").should("be.visible");

    cy.log("**Edit relTest1-Test2 property**");
    propertyTable.editProperty("relTest1-Test2");
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName("rel-Test1-Test2");
    cy.get(`[aria-label="test2-id-option"]`).should("exist");
    propertyModal.getSubmitButton().click();
    cy.wait(2000);
    cy.waitForAsyncRequest();
    propertyTable.getProperty("rel-Test1-Test2").should("exist");

    cy.log("**Checks that test2-id cannot be deleted because is being used as foreign key**");
    cy.get("#switch-view-table").click({force: true});
    cy.wait(2000);
    cy.waitForAsyncRequest();
    entityTypeTable.viewEntityInGraphView("a-Test2");
    graphViewSidePanel.getPropertiesTab().click();
    propertyTable.getDeletePropertyIcon("a-Test2", "test2-id").should("be.visible").click();
    confirmationModal.getDeletePropertyForeignKeyWarnText().should("be.visible");
    cy.findByText("Close").should("be.visible").click();
  });

  it("Can view Entity's relationship from graph ", () => {
    cy.get("[data-cy=graph-view]").click({force: true});
    graphVis.getPositionOfEdgeBetween("a-Test2,a-Test1").then((edgePosition: any) => {
      cy.wait(150);
      cy.waitUntil(() => graphVis.getGraphVisCanvas().click(edgePosition.x, edgePosition.y, {force: true}));
    });

    relationshipModal.getModalHeader().should("be.visible");
    relationshipModal.verifyRelationshipValue("rel-Test1-Test2");
    relationshipModal.verifyForeignKeyValue("test2-id");
    relationshipModal.cancelModal();
  });

  it("Deleting relation, entities and publish", () => {
    cy.log("**Sort table by entities Name**");
    cy.get("[data-testid='entityName']").scrollIntoView().should("be.visible").click({force: true});
    entityTypeTable.getExpandEntityIcon("a-Test1");

    cy.log("**Deletes rel-Test1-Test2 relationship**");
    propertyModal.getDeleteIcon("a-Test1-rel-Test1-Test2").should("exist").scrollIntoView().should("be.visible").click({force: true});
    propertyModal.confirmDeleteProperty("deletePropertyWarn-yes");
    cy.waitForAsyncRequest();
    propertyModal.getDeleteIcon("a-Test1-rel-Test1-Test2").should("not.exist");

    cy.log("**Deletes a-Test2 Entity**");
    propertyTable.getEntityToDelete("a-Test2-trash-icon").should("exist").scrollIntoView().should("be.visible").click({force: true});
    propertyModal.confirmDeleteProperty("deleteEntity-yes");
    cy.waitForAsyncRequest();
    propertyTable.getEntityToDelete("a-Test2-trash-icon").should("not.exist");

    cy.log("**Deletes a-Test1 Entity**");
    propertyTable.getEntityToDelete("a-Test1-trash-icon").should("exist").scrollIntoView().should("be.visible").click({force: true});
    propertyModal.confirmDeleteProperty("deleteEntity-yes");
    cy.waitForAsyncRequest();
    propertyTable.getEntityToDelete("a-Test1-trash-icon").should("not.exist");
  });
});
