import entitiesSidebar from "../../support/pages/entitiesSidebar";
import table from "../../support/components/common/tables";
import explorePage from "../../support/pages/explore";
import browsePage from "../../support/pages/browse";
import "cypress-wait-until";

describe("Validate table and column selector in explore", () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
    browsePage.navigate();
    browsePage.getTableView().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForHCTableToLoad();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  after(() => {
    cy.resetTestUser();
  });

  it("Validate the table and expandable rows", () => {
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    browsePage.hcTableRows.should("have.length", 20);
    table.getTableColumns().should("be.visible");
    browsePage.getExpandable().should("be.visible");
  });

  it("Validate columns selector popover, draggable titles and checkable titles", () => {
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    browsePage.getColumnSelectorIcon().should("be.visible");
    browsePage.getColumnSelectorIcon().click({force: true});
    browsePage.getColumnSelector().should("be.visible");
    browsePage.getTreeItem(2).should("have.class", "rc-tree-treenode-draggable").should("have.class", "rc-tree-treenode-checkbox-checked");
  });

  it("Validate should only sort based on immediate properties (not for nested/structured types )", () => {
    browsePage.getTableView().click();

    cy.log(`**Filter by 'Customer' base entity**`);
    entitiesSidebar.baseEntityDropdown.scrollIntoView().click();
    entitiesSidebar.selectBaseEntityOption("Customer");

    cy.log("**Validate that a Non-Structured property has the sort arrows**");
    explorePage.getHeaderSortArrow("customerId").scrollIntoView().should("be.visible");

    cy.log("**Validate that a Structured property doesn't have the sort arrows**");
    explorePage.getHeaderSortArrow("shipping").should("not.exist");

    cy.log("**Sort ASC by customerId**");
    explorePage.getColumnHeader("customerId").scrollIntoView().click();

    cy.log("**Validate the table got sorted correctly ASC**");
    let elemsText: string[] = [];
    table.getTableRows().each(($el) => {
      elemsText.push($el.find("[class^='hc-table_tableCell']").first().text());
    }).then(() => {
      expect(elemsText.sort()).to.deep.eq(elemsText);
    });

    cy.log("**Sort DESC by customerId**");
    explorePage.getColumnHeader("customerId").scrollIntoView().click();

    cy.log("**Validate the table got sorted correctly ASC**");
    let elemsTextDESC: string[] = [];
    table.getTableRows().each(($el) => {
      elemsTextDESC.push($el.find("[class^='hc-table_tableCell']").first().text());
    }).then(() => {
      expect(elemsTextDESC.sort().reverse()).to.deep.eq(elemsTextDESC);
    });
  });
});

