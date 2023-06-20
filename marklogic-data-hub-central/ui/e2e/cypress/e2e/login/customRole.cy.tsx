import {tiles, confirmationModal} from "../../support/components/common/index";
import {ConfirmationType} from "../../support/types/modeling-types";
import curatePage from "../../support/pages/curate";
import loadPage from "../../support/pages/load";
import runPage from "../../support/pages/run";
import "cypress-wait-until";
import modelPage from "../../support/pages/model";

describe("Custom Role", () => {
  before(() => {
    cy.visit("/");
    cy.waitForAsyncRequest();
  });

  afterEach(() => {
    cy.logout();
    cy.waitForAsyncRequest();
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Should be able to access all tiles with hc-custom-role", () => {
    cy.loginAsTestUserWithRoles("hc-custom-role").withUI();
    cy.url().should("include", "/tiles");

    loadPage.navigate();
    cy.waitForAsyncRequest();
    loadPage.loadView("th-large").should("be.visible");

    modelPage.navigate();
    cy.waitForAsyncRequest();
    tiles.getModelTile().should("exist");

    let entityTypeId = "Customer";
    curatePage.navigate();
    cy.waitForAsyncRequest();
    cy.get("body")
      .then(($body) => {
        if ($body.find("[aria-label=\"confirm-navigationWarn-yes\"]").length) {
          confirmationModal.getYesButton(ConfirmationType.NavigationWarn);
        }
      });
    curatePage.toggleEntityTypeId(entityTypeId);
    curatePage.verifyTabs(entityTypeId, "be.visible", "be.visible");

    const flowName = "personJSON";
    runPage.navigate();
    cy.waitForAsyncRequest();
    runPage.createFlowButton().should("be.disabled");
    cy.findByText(flowName).should("be.visible");
  });
});
