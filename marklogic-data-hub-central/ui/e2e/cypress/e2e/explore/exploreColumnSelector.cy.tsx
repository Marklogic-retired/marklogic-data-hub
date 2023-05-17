import {BaseEntityTypes} from "../../support/types/base-entity-types";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import table from "../../support/components/common/tables";
import {toolbar} from "../../support/components/common";
import explorePage from "../../support/pages/explore";
import browsePage from "../../support/pages/browse";
import LoginPage from "../../support/pages/login";
import "cypress-wait-until";

describe("Monitor Tile", () => {
  before(() => {
    cy.loginAsTestUserWithRoles("hub-central-job-monitor").withRequest();
    LoginPage.navigateToMainPage();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
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
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
    browsePage.waitForSpinnerToDisappear();

    cy.log("**Open base entities dropdown and select an entity**");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption(BaseEntityTypes.PERSON);
    browsePage.waitForSpinnerToDisappear();

    cy.log("**Click on the column selector and check that the popover appears**");
    browsePage.getColumnSelectorIcon().click();
    explorePage.getColumnSelectorPopover().scrollIntoView().should("be.visible");

    cy.log("**Get the columns and check that are present in the table**");
    explorePage.getColumnSelectorColumns().should("have.length.gt", 0).then($options => {
      return (
        Cypress.$.makeArray($options).map((el) => el.innerText)
      );
    }).then((options) => {
      cy.log("**Close column selector popover**");
      explorePage.getColumnSelectorCancelButton().click();
      explorePage.getColumnSelectorPopover().should("not.exist");

      cy.log("**Check the existence of the columns in the table heade**");
      options.forEach(option => {
        table.getTableHeaders().contains(option).should("exist");
      });
    });

    cy.log("**Uncheck the first column in the list and verify that it's no present in the table header**");
    cy.log("**Click on the column selector for second time to uncheck first column**");
    browsePage.getColumnSelectorIcon().click({force: true});
    cy.log("**Get the first column and uncheck the input**");
    explorePage.getColumnSelectorCheckboxs().last().click().should("not.have.class", "rc-tree-checkbox-checked");
    cy.log("**Get the text of the unchecked column, close popover and verify that the column disappear from the table**");
    explorePage.getColumnSelectorColumns().last().then($lastColumn => {
      const lastColumnText = $lastColumn.text();
      cy.log("**Apply changes in column selector popover**");
      explorePage.getColumnSelectorApplyButton().click();
      explorePage.getColumnSelectorPopover().should("not.exist");
      table.getTableHeaders().contains(lastColumnText).should("not.exist");
    });

    cy.log("**Check the column again and verify that it's present again in the table header**");
    cy.log("**Click on the column selector for third time to check first column**");
    browsePage.getColumnSelectorIcon().click({force: true});
    cy.log("**Get the first column and uncheck the input**");
    explorePage.getColumnSelectorCheckboxs().last().click().should("have.class", "rc-tree-checkbox-checked");
    cy.log("**Get the text of the checked column, close popover and verify that the column appear again in the table**");
    explorePage.getColumnSelectorColumns().last().then($lastColumn => {
      const lastColumnText = $lastColumn.text();
      cy.log("**Apply changes in column selector popover**");
      explorePage.getColumnSelectorApplyButton().click();
      explorePage.getColumnSelectorPopover().should("not.exist");
      table.getTableHeaders().contains(lastColumnText).should("exist");
    });
  });
});
