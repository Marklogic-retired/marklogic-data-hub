import {toolbar} from "../../../support/components/common";
import loadPage from "../../../support/pages/load";
import LoginPage from "../../../support/pages/login";
import "cypress-wait-until";

describe("Custom Ingestion", () => {
  let stepName = "ingestion-step";
  const users = ["hub-central-load-reader", "hub-central-load-writer"];

  before(() => {
    cy.visit("/");
  });
  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  //Iterating array with users for different scenarios
  users.forEach(element => {

    if (element.includes("reader")) {

      it("Verify tooltip is showing up for reader role after mouse hover for select flow in cards", () => {
        cy.loginAsTestUserWithRoles(users[0]).withRequest();
        LoginPage.postLogin();
        cy.visit("/tiles/load");
        cy.intercept("/api/jobs/**").as("getJobs");
        toolbar.getLoadToolbarIcon().click();
        cy.waitUntil(() => loadPage.stepName(stepName).should("be.visible"));
        loadPage.stepName(stepName).should("be.visible");

        cy.log("**-------- Before mouse hover card -------------**");
        loadPage.stepName(stepName).should("be.visible").trigger("mouseover", {force: true}).trigger("mousedown", {force: true});
        cy.log("**-- Before mouse hover disabled select --**");
        cy.get("[aria-label=\"ingestion-step-flowsList\"]").trigger("mouseover", {force: true, bubbles: false}).trigger("focus", {force: true});
        cy.get("#ingestion-stepmissing-permission-tooltip").should("be.visible");
      });
    }

    if (element.includes("writer")) {
      it("Verify tooltip is not showing up for writer role trying to select flow in cards", () => {
        cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-mapping-writer", "hub-central-load-writer").withRequest();
        LoginPage.postLogin();
        cy.visit("/tiles/load");
        cy.intercept("/api/jobs/**").as("getJobs");
        toolbar.getLoadToolbarIcon().click();
        cy.waitUntil(() => loadPage.stepName(stepName).should("be.visible"));
        loadPage.stepName(stepName).should("be.visible");

        cy.log("**-------- Before mouse hover card -------------**");
        loadPage.stepName(stepName).should("be.visible").trigger("mouseover", {force: true}).trigger("mousedown", {force: true});
        cy.log("**-- Before mouse hover select --**");
        cy.get("[aria-label=\"ingestion-step-flowsList\"]").trigger("mouseover", {force: true, bubbles: false}).trigger("focus", {force: true});
        cy.get("#ingestion-stepmissing-permission-tooltip").should("not.exist");
      });
    }
  });
});