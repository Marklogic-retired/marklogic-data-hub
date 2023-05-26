import loadPage from "../../../support/pages/load";
import "cypress-wait-until";

describe("Custom Ingestion", () => {
  let stepName = "ingestion-step";
  const users = ["hub-central-load-reader", "hub-central-load-writer"];

  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  users.forEach(element => {
    if (element.includes("reader")) {
      it("Verify tooltip is showing up for reader role after mouse hover for select flow in cards", () => {
        cy.loginAsTestUserWithRoles(users[0]).withRequest();
        loadPage.navigate();
        loadPage.stepName(stepName).should("be.visible");

        cy.log("**-------- Before mouse hover card -------------**");
        loadPage.stepName(stepName).trigger("mouseover", {force: true}).trigger("mousedown", {force: true});
        cy.log("**-- Before mouse hover disabled select --**");
        loadPage.existingFlowsList(stepName).trigger("mouseover", {force: true, bubbles: false}).trigger("focus", {force: true});
        loadPage.missingPermissionTooltip(stepName).should("be.visible");
      });
    }

    if (element.includes("writer")) {
      it("Verify tooltip is not showing up for writer role trying to select flow in cards", () => {
        cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer", "hub-central-load-writer").withRequest();
        loadPage.navigate();
        loadPage.stepName(stepName).should("be.visible");

        cy.log("**-------- Before mouse hover card -------------**");
        loadPage.stepName(stepName).trigger("mouseover", {force: true}).trigger("mousedown", {force: true});
        cy.log("**-- Before mouse hover select --**");
        loadPage.existingFlowsList(stepName).trigger("mouseover", {force: true, bubbles: false}).trigger("focus", {force: true});
        loadPage.missingPermissionTooltip(stepName).should("not.exist");
      });
    }
  });
});