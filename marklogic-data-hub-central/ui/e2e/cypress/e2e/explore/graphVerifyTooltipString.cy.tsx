import dataModelDisplaySettingsModal from "../../support/components/explore/data-model-display-settings-modal";
import explore from "../../support/pages/explore";
import {ExploreGraphNodes} from "../../support/types/explore-graph-nodes";
import graphExplore from "../../support/pages/graphExplore";

describe("Verify text on hover nodes", () => {
  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.deleteFiles("FINAL", "/config/hubCentral.json");
    cy.deleteFiles("STAGING", "/config/hubCentral.json");
  });

  after(() => {
    cy.deleteFiles("FINAL", "/config/hubCentral.json");
    cy.deleteFiles("STAGING", "/config/hubCentral.json");
  });

  it("Check info tooltip using default and email label", () => {
    cy.loginAsDeveloperV2().withRequest();
    cy.visit("/tiles/explore");
    cy.waitForAsyncRequest();
    cy.wait(8000);

    graphExplore.focusNode(ExploreGraphNodes.CUSTOMER_102);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let customerCoordinates: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.trigger("mouseover", customerCoordinates.x, customerCoordinates.y, {force: true});
      canvas.click(customerCoordinates.x, customerCoordinates.y, {force: true});
    });
    cy.get(".vis-tooltip").should("have.text", `${ExploreGraphNodes.CUSTOMER_102}    Click to view details.`);
    explore.clickExploreSettingsMenuIcon();
    explore.getEntityTypeDisplaySettingsDropdown("Data model display settings").click();
    dataModelDisplaySettingsModal.getEntityLabelDropdown("Customer").click();
    dataModelDisplaySettingsModal.getEntityLabelDropdownOption("Customer", "email").click();
    dataModelDisplaySettingsModal.getModalSaveButton().click();
    cy.waitForAsyncRequest();
    cy.wait(8000);
    graphExplore.focusNode(ExploreGraphNodes.CUSTOMER_102);
    graphExplore.getPositionsOfNodes(ExploreGraphNodes.CUSTOMER_102).then((nodePositions: any) => {
      let customerCoordinates: any = nodePositions[ExploreGraphNodes.CUSTOMER_102];
      const canvas = graphExplore.getGraphVisCanvas();
      canvas.trigger("mouseover", customerCoordinates.x, customerCoordinates.y, {force: true});
      canvas.click(customerCoordinates.x, customerCoordinates.y, {force: true});
    });
    cy.get(".vis-tooltip").should("have.text", "adamscole@nutralab.com    Click to view details.");
  });
});