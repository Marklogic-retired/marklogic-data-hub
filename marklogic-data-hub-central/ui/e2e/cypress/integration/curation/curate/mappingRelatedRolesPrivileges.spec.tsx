/// <reference types="cypress"/>

import {toolbar} from "../../../support/components/common";
import {createEditMappingDialog, mappingStepDetail} from "../../../support/components/mapping/index";
import curatePage from "../../../support/pages/curate";
import "cypress-wait-until";
import {generateUniqueName} from "../../../support/helper";
import runPage from "../../../support/pages/run";
import loginPage from "../../../support/pages/login";


describe("Mapping", () => {
  before(() => {
    cy.visit("/");
    cy.waitForAsyncRequest();
  });

  after(() => {
    //resetting the test user back to only have 'hub-central-user' role
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("verifies privileges for hub-central-mapping-writer", () => {
    let entityTypeId = "Customer";
    let loadStep = "loadCustomersJSON";
    let mapStepName = generateUniqueName("map-").substring(0, 20);

    cy.log("**loggin in as user with role hub-central-mapping-writer**");
    cy.loginAsTestUserWithRoles("hub-central-mapping-writer").withRequest();
    loginPage.postLogin();

    cy.log("**verify that all tiles but Explore and Model show a tooltip that says contact your administrator**");
    ["Load", "Model", "Run"].forEach((tile) => {
      toolbar.getToolBarIcon(tile).should("have.attr", {style: "cursor: not-allowed"});
    });

    cy.log("**Navigates to Curate and opens EntityTypeId name**");
    toolbar.getCurateToolbarIcon().click();
    curatePage.toggleEntityTypeId(entityTypeId);
    curatePage.verifyMatchingTab(entityTypeId);

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
    curatePage.runStepInCardView(mapStepName).should("be.visible").click({force: true});
    curatePage.runStepSelectFlowConfirmation().should("be.visible");
    curatePage.runInNewFlow(mapStepName).click();
    cy.findByLabelText("Ok").click();
    runPage.newFlowModal().should("not.exist");
    toolbar.getCurateToolbarIcon().click();

    cy.log("**deletes the step**");
    curatePage.getEntityMappingStep(entityTypeId, mapStepName).should("be.visible");
    curatePage.deleteMappingStepButton(mapStepName).should("be.visible").click();
    curatePage.deleteConfirmation("Yes").click();
  });
});
