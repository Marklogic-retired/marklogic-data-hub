import {createEditMappingDialog, mappingStepDetail} from "../../../support/components/mapping/index";
import {toolbar} from "../../../support/components/common";
import curatePage from "../../../support/pages/curate";
import loginPage from "../../../support/pages/login";

import {generateUniqueName} from "../../../support/helper";
import "cypress-wait-until";

describe("Mapping", () => {
  before(() => {
    cy.loginAsTestUserWithRoles("hub-central-mapping-writer").withRequest();
    loginPage.navigateToMainPage();
  });

  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Verifies privileges for hub-central-mapping-writer", () => {
    let entityTypeId = "Customer";
    let loadStep = "loadCustomersJSON";
    let mapStepName = generateUniqueName("map-").substring(0, 20);

    cy.log("**verify that all tiles but Explore and Model show a tooltip that says contact your administrator**");
    ["Load", "Model", "Run"].forEach((tile) => {
      toolbar.getToolBarIcon(tile).should("have.attr", {style: "cursor: not-allowed"});
    });

    cy.log("**Navigates to Curate and opens EntityTypeId name**");
    curatePage.navigate();
    curatePage.toggleEntityTypeId(entityTypeId);
    curatePage.verifyMatchingTab(entityTypeId, "not.exist");

    cy.log("**Adds a new step**");
    curatePage.verifyTabs(entityTypeId, "be.visible", "not.exist");
    curatePage.addNewStep(entityTypeId).should("be.visible").click();
    createEditMappingDialog.setMappingName(mapStepName);
    createEditMappingDialog.setMappingDescription("Testing privileges");
    createEditMappingDialog.setSourceRadio("Collection");
    createEditMappingDialog.setCollectionInput("loadCustom");
    cy.get(`a[aria-label="${loadStep}"]`).click();

    cy.log("**verify advanced setting modifications during creation**");
    curatePage.switchEditAdvanced().click();
    createEditMappingDialog.saveButton().click({force: true});
    cy.waitForAsyncRequest();

    cy.log("**verify that clear/test button are enabled**");
    curatePage.verifyStepDetailsOpen(mapStepName);
    mappingStepDetail.clearMap().should("be.enabled");
    mappingStepDetail.testMap().should("be.enabled");

    cy.log("**verify that xpath expressions can be edited**");
    curatePage.xpathExpression("customerId").should("be.enabled");
    curatePage.xpathExpression("name").should("be.enabled");
    curatePage.xpathExpression("email").should("be.enabled");
    curatePage.xpathExpression("pin").should("be.enabled");
    curatePage.xpathExpression("nicknames").should("be.enabled");
    curatePage.xpathExpression("shipping").should("be.enabled");
    curatePage.xpathExpression("billing").should("be.enabled");
    curatePage.xpathExpression("birthDate").should("be.enabled");
    curatePage.xpathExpression("status").should("be.enabled");
    curatePage.xpathExpression("customerSince").should("be.enabled");

    cy.log("**verify that the step is created**");
    mappingStepDetail.goBackToCurateHomePage();
    curatePage.getEntityMappingStep(entityTypeId, mapStepName).should("be.visible");

    cy.log("**edits the step**");
    curatePage.editStep(mapStepName).click();
    curatePage.verifyStepNameIsVisibleEdit(mapStepName);
    curatePage.saveEdit().should("be.enabled");
    curatePage.cancelEdit().click();

    cy.log("**verify that the step is not runnable**");
    curatePage.addToNewFlowDisabled(entityTypeId, mapStepName);
    curatePage.getExistingFlowDropdown(mapStepName).trigger("mouseover");
    cy.get(`#${mapStepName}-flowsList`).should("be.disabled");

    cy.log("**deletes the step**");
    curatePage.getEntityMappingStep(entityTypeId, mapStepName).should("be.visible");
    curatePage.deleteMappingStepButton(mapStepName).should("be.visible").click();
    curatePage.deleteConfirmation("Yes").click();
  });

  it("Data hub operator cannot add mapping steps to a flow", () => {
    let stepName = "map-orders";

    cy.log("**Login as an operator**");
    cy.loginAsOperator().withRequest();

    cy.log("**Go to Curate Tile**");
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();

    cy.log("**Open Order to see steps**");
    curatePage.getEntityTypePanel("Order").should("be.visible").click({force: true});

    cy.log("**Verify the flow list is disabled and a tooltip appears**");
    curatePage.addToNewFlowDisabled("Order", stepName);
    curatePage.getExistingFlowDropdown(stepName).trigger("mouseover").then(() => {
      curatePage.getTooltip().should("contain", "Contact your security administrator for access.");
      curatePage.getFlowList(stepName).should("be.disabled");
    });
    curatePage.getStepCard("Order", stepName).should("be.visible").trigger("mouseover", "top");

    cy.log("**verify that the step is not runnable and a tooltip appears**");
    curatePage.getDisabledRunButton(stepName).should("be.visible").trigger("mouseover").then(() => {
      curatePage.getTooltip().should("contain", "Contact your security administrator for access.");
      curatePage.getDisabledRunButton(stepName).click({force: true});
      curatePage.runStepSelectFlowConfirmation().should("not.exist");
    });
  });
});
