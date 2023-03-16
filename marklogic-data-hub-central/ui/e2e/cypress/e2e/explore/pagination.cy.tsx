import entitiesSidebar from "../../support/pages/entitiesSidebar";
import table from "../../support/components/common/tables";
import explorePage from "../../support/pages/explore";
import browsePage from "../../support/pages/browse";
import "cypress-wait-until";

describe("Validate scenarios for pagination in the explore page table", () => {
  let firstPageTableCells: string[] = [];

  before(() => {
    cy.loginAsDeveloper().withRequest();

    cy.log("**Go to Explore page and select the table view option**");
    cy.intercept("GET", "/api/models/primaryEntityTypes?includeDrafts=true").as("lastRequest");
    cy.visit("/tiles/explore");
    cy.wait("@lastRequest");
    browsePage.getTableView().click();
    table.mainTable.should("be.visible");
    table.getTableRows().should("not.be.empty");

    cy.log("**Saving table rows text from the first page");
    table.getTableRows().then(($els) => {
      Cypress.$.makeArray($els)
        .map((el) => firstPageTableCells.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")[0]));
    });
    entitiesSidebar.clearMainPanelSearch();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
  });

  it("Change page number and verify the updated result", () => {
    cy.log("**Go to page number 2**");
    browsePage.clickPaginationItem(2);
    table.getTableRows().should("not.be.empty");

    cy.log("**Validate that elements from page 1 do not exist on page 2**");
    table.getTableRows().each((item, i) => {
      expect(item).to.not.equal(firstPageTableCells[i]);
    });
  });

  it("Change page size and validate it gets updated correctly", () => {
    cy.log("**Go back to page number 1**");
    browsePage.clickPaginationItem(1);
    table.getTableRows().should("not.be.empty");
    table.getTableRows().should("have.length", 20);

    cy.log("**Change page size to 10 and validate total number of elements shown at the top it's accurate**");
    browsePage.getTotalDocuments().then(val => {
      explorePage.scrollToBottom();
      explorePage.getPaginationPageSizeOptions().select("10 / page", {force: true});
      cy.contains("Showing 1-10 of ");
      browsePage.getTotalDocuments().should("be.equal", val);
    });
    table.getTableRows().should("have.length", 10);
  });

  it("Verify page number persists when navigating back from detail view", () => {
    cy.log("**Select 'Order' and 'BabyRegistry' entity**");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Order");
    entitiesSidebar.getBaseEntityOption("Order").scrollIntoView().should("be.visible");
    table.getTableRows().should("not.be.empty");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("BabyRegistry");
    entitiesSidebar.getBaseEntityOption("BabyRegistry").scrollIntoView().should("be.visible");
    browsePage.waitForSpinnerToDisappear();
    table.getTableRows().should("not.be.empty");

    cy.log("**Change page size to 10**");
    explorePage.scrollToBottom();
    explorePage.getPaginationPageSizeOptions().select("10 / page", {force: true});
    table.getTableRows().should("have.length", 10);

    cy.log("**Go to page number 2**");
    browsePage.clickPaginationItem(2);
    table.getTableRows().should("not.be.empty");

    cy.log("**Go back to 'All Entities'**");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
    entitiesSidebar.getBaseEntityOption("All Entities").scrollIntoView().should("be.visible");
    table.getTableRows().should("not.be.empty");

    cy.log("**Validate that when going back to 'All Entities' the active page it's now the first one again**");
    table.getActiveTablePage().should("contain", "1");
  });

});
