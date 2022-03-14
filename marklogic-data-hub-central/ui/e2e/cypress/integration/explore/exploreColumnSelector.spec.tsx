import {Application} from "../../support/application.config";
import "cypress-wait-until";
import {toolbar} from "../../support/components/common";
import LoginPage from "../../support/pages/login";
import browsePage from "../../support/pages/browse";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import {BaseEntityTypes} from "../../support/types/base-entity-types";

describe("Monitor Tile", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);

    cy.log("**Logging into the app as a developer**");
    cy.loginAsTestUserWithRoles("hub-central-job-monitor").withRequest();
    LoginPage.postLogin();
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    Cypress.Cookies.preserveOnce("HubCentralSession");
    cy.restoreLocalStorage();
  });

  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Navigate to Monitor Tile and verify that the column selector works", () => {
    cy.log("**Open explore and select table view**");
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.clickTableView();

    cy.log("**Open base entities dropdown and select an entity**");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption(BaseEntityTypes.PERSON);
    browsePage.waitForSpinnerToDisappear();

    cy.log("**Click on the column selector and check that the popover appears**");
    browsePage.getColumnSelectorIcon().click();
    browsePage.getColumnSelectorPopover().should("be.visible");

    cy.log("**Get the columns and check that are present in the table**");
    browsePage.getColumnSelectorColumns().should("have.length.gt", 0).then($options => {
      // convert the jQuery object into a plain array with the innerText prop
      return (
        Cypress.$.makeArray($options).map((el) => el.innerText)
      );
    }).then((options) => { // here is the array of elements
      cy.log("**Close column selector popover**");
      browsePage.getColumnSelectorCancelButton().click();
      browsePage.getColumnSelectorPopover().should("not.exist");

      cy.log("**Check the existence of the columns in the table heade**");
      options.forEach(option => {
        browsePage.getTableHeaders().contains(option).should("exist");
      });
    });

    cy.log("**Uncheck the first column in the list and verify that it's no present in the table header**");
    cy.log("**Click on the column selector for second time to uncheck first column**");
    browsePage.getColumnSelectorIcon().click({force: true});
    cy.log("**Get the first column and uncheck the input**");
    browsePage.getColumnSelectorCheckboxs().last().click().should("not.have.class", "rc-tree-checkbox-checked");
    cy.log("**Get the text of the unchecked column, close popover and verify that the column disappear from the table**");
    browsePage.getColumnSelectorColumns().last().then($lastColumn => {
      const lastColumnText = $lastColumn.text();
      cy.log("**Apply changes in column selector popover**");
      browsePage.getColumnSelectorApplyButton().click();
      browsePage.getColumnSelectorPopover().should("not.exist");
      browsePage.getTableHeaders().contains(lastColumnText).should("not.exist");
    });

    cy.log("**Check the column again and verify that it's present again in the table header**");
    cy.log("**Click on the column selector for third time to check first column**");
    browsePage.getColumnSelectorIcon().click({force: true});
    cy.log("**Get the first column and uncheck the input**");
    browsePage.getColumnSelectorCheckboxs().last().click().should("have.class", "rc-tree-checkbox-checked");
    cy.log("**Get the text of the checked column, close popover and verify that the column appear again in the table**");
    browsePage.getColumnSelectorColumns().last().then($lastColumn => {
      const lastColumnText = $lastColumn.text();
      cy.log("**Apply changes in column selector popover**");
      browsePage.getColumnSelectorApplyButton().click();
      browsePage.getColumnSelectorPopover().should("not.exist");
      browsePage.getTableHeaders().contains(lastColumnText).should("exist");
    });
  });
});
