/// <reference types="cypress"/>

import {Application} from "../../support/application.config";
import "cypress-wait-until";
import LoginPage from "../../support/pages/login";
import table from "../../support/components/common/tables";
import monitor from "../../support/pages/monitor";
import pagination from "../../support/components/common/pagination";
import {toolbar} from "../../support/components/common";
import runPage from "../../support/pages/run";

describe("Validate pagination for the Monitor tile", () => {

  before(() => {
    cy.log("**Go to the Home Page and log into the app**");
    cy.visit("/");
    cy.contains(Application.title);

    //Login into the app
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();

    cy.log("**Go to the Monitor page**");
    cy.visit("/tiles/monitor");
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  it("Validate the default amount for pagination it's 20", () => {
    cy.log("**Validate table records length it's not grather than 20**");
    table.getTableRows().should("not.be.empty");
    table.getTableRows().should("have.length.at.most", 20);

    cy.log("**Scroll right and validate default pagination**");
    monitor.scrollMonitorToPageSelect();
    pagination.getPaginationSizeSelected().should("have.text", "20 / page20 / page");

    cy.log("**Make sure I have the option to change from 20 to 10/40/80**");
    pagination.getPaginationPageSizeOptions().should("contain", "10 / page").should("contain", "40 / page").should("contain", "80 / page");

    cy.log("**Set pagination to 10 and validate amount of records**");
    monitor.getPaginationPageSizeOptions().scrollIntoView().select("10 / page", {force: true});
    pagination.getPaginationSizeSelected().should("have.text", "10 / page10 / page");
    monitor.getTableRows().should("have.length.at.most", 10);
  });

  it("Navigate to next page(in Monitor) and make sure pagination has persisted", () => {
    cy.log("**Go to page 2**");
    pagination.clickPaginationItem(2);
    table.getTableRows().should("not.be.empty");

    cy.log("**Confirm it navigated to 2nd page and pagination was maintained**");
    table.getTableRows().should("have.length.at.most", 10);
    pagination.getCurrentPage().should("contain", "2(current)");
    pagination.getPaginationSizeSelected().should("have.text", "10 / page10 / page");
  });

  it("Go to another tile and come back to make sure pagination continues set to 10", () => {

    table.getTableRows().should("not.be.empty");

    cy.log("**Go to Run page**");
    toolbar.getRunToolbarIcon().should("be.visible").click();
    runPage.createFlowButton().should("be.visible");

    cy.log("**Go back to Monitor page and validate pagination it's still 10**");
    toolbar.getMonitorToolbarIcon().should("be.visible").click();
    table.getTableRows().should("have.length.at.most", 10);
    pagination.getPaginationSizeSelected().should("have.text", "10 / page10 / page");
  });

});