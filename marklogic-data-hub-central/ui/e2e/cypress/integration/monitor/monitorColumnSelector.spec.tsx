import monitorPage from "../../support/pages/monitor";
import {Application} from "../../support/application.config";
import "cypress-wait-until";
import {toolbar} from "../../support/components/common";
import LoginPage from "../../support/pages/login";

describe("Monitor Tile", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);

    cy.log("**Logging into the app as a developer**");
    // cy.loginAsDeveloper().withRequest();
    cy.loginAsTestUserWithRoles("hub-central-job-monitor").withRequest();
    LoginPage.postLogin();
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    Cypress.Cookies.preserveOnce("HubCentralSession");
    cy.restoreLocalStorage();
    cy.waitUntil(() => toolbar.getMonitorToolbarIcon()).click();
    monitorPage.waitForMonitorTableToLoad();
  });

  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Navigate to Monitor Tile and verify that the column selector works", () => {
    cy.log("** Click on the column selector and check that the popover appears **");
    monitorPage.getColumnSelectorIcon().click({force: true});
    monitorPage.getColumnSelectorPopover().should("be.visible");

    cy.log("** Get the columns and check that are present in the table **");
    monitorPage.getColumnSelectorColumns().should("have.length.gt", 0).then($options => {
      // convert the jQuery object into a plain array with the innerText prop
      return (
        Cypress.$.makeArray($options).map((el) => el.innerText)
      );
    }).then((options) => { // here is the array of elements
      cy.log("** Close column selector popover **");
      monitorPage.getColumnSelectorCancelButton().click();
      monitorPage.getColumnSelectorPopover().should("not.exist");

      cy.log("** Check the existence of the columns in the table header**");
      options.forEach(option => {
        monitorPage.getTableHeaders().contains(option).should("exist");
      });
    });

    cy.log("** Uncheck the first column in the list and verify that it's no present in the table header **");
    cy.log("** Click on the column selector for second time to uncheck first column **");
    monitorPage.getColumnSelectorIcon().click({force: true});
    cy.log("** Get the first column and uncheck the input **");
    monitorPage.getColumnSelectorCheckboxs().first().click().should("not.be.checked");
    cy.log("** Get the text of the unchecked column, close popover and verify that the column disappear from the table **");
    monitorPage.getColumnSelectorColumns().first().then($firstColumn => {
      const firstColumnText = $firstColumn.text();
      cy.log("** Apply changes in column selector popover **");
      monitorPage.getColumnSelectorApplyButton().click();
      monitorPage.getColumnSelectorPopover().should("not.exist");
      monitorPage.getTableHeaders().contains(firstColumnText).should("not.exist");
    });

    cy.log("** Check the column again and verify that it's present again in the table header **");
    cy.log("** Click on the column selector for third time to check first column **");
    monitorPage.getColumnSelectorIcon().click({force: true});
    cy.log("** Get the first column and uncheck the input **");
    monitorPage.getColumnSelectorCheckboxs().first().click().should("be.checked");
    cy.log("** Get the text of the checked column, close popover and verify that the column appear again in the table **");
    monitorPage.getColumnSelectorColumns().first().then($firstColumn => {
      const firstColumnText = $firstColumn.text();
      cy.log("** Apply changes in column selector popover **");
      monitorPage.getColumnSelectorApplyButton().click();
      monitorPage.getColumnSelectorPopover().should("not.exist");
      monitorPage.getTableHeaders().contains(firstColumnText).should("exist");
    });
  });
});
