import {createEditMappingDialog} from "../../../support/components/mapping/index";
import curatePage from "../../../support/pages/curate";
import browsePage from "../../../support/pages/browse";

import {generateUniqueName} from "../../../support/helper";
import "cypress-wait-until";

const loadStep = "loadOrderCustomHeader";
const mapStep = generateUniqueName("mapOrder");

describe("Check visibility of dropdown with search in mapping step details table", () => {
  before(() => {
    cy.loginAsTestUserWithRoles("hub-central-mapping-writer").withRequest();
    curatePage.navigate();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("mapping", mapStep);
    cy.resetTestUser();
  });

  it("Create mapping step and check the visibility of the dropdowns related to source, function and reference", () => {
    cy.waitUntil(() => curatePage.getEntityTypePanel("Customer").should("be.visible"));
    curatePage.toggleEntityTypeId("Order");
    cy.waitUntil(() => curatePage.addNewStep("Order").click());
    createEditMappingDialog.setMappingName(mapStep);
    createEditMappingDialog.setMappingDescription("An order mapping");
    createEditMappingDialog.setSourceRadio("Query");
    createEditMappingDialog.setQueryInput(`cts.collectionQuery(['${loadStep}'])`);
    createEditMappingDialog.saveButton().click({force: true});

    cy.log("Verify that step details automatically opens after step creation");
    curatePage.verifyStepDetailsOpen(mapStep);
    browsePage.waitForSpinnerToDisappear();

    cy.get(`[data-cy="dropdown-button"]`).each($icon => {
      cy.wrap($icon).click()
        .find(".dropdown-menu.show").scrollIntoView().should("be.visible")
        .find("#dropdownList-select-MenuList").should("be.visible");
      cy.wrap($icon).click()
        .find(".dropdown-menu.show").should("not.exist");
    });
  });
});
