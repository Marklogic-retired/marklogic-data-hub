import queryComponent from "../../support/components/query/manage-queries-modal";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import table from "../../support/components/common/tables";
import explorePage from "../../support/pages/explore";
import browsePage from "../../support/pages/browse";
import "cypress-wait-until";

let qName = "";

describe("Save/manage queries scenarios, developer role", () => {
  before(() => {
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.loginAsDeveloper().withRequest();
    cy.runStep("personJSON", "mapPersonJSON");
    cy.waitForAsyncRequest();
    explorePage.navigate();
  });

  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSavedQueries();
    cy.waitForAsyncRequest();
  });

  it("Verifies selected popover facets are unselected with the clear selection button", () => {
    cy.wait(4000);
    entitiesSidebar.toggleAllDataView();
    entitiesSidebar.toggleStagingView();
    browsePage.getPopOverLabel("Collection").click();
    browsePage.setInputField("Collection", "col");
    browsePage.getPopOverCheckbox("collection1").click();
    browsePage.getPopOverCheckbox("collection2").click();
    browsePage.confirmPopoverFacets();

    entitiesSidebar.getCollectionCheckbox("collection", "collection1").should("be.checked");
    entitiesSidebar.getCollectionCheckbox("collection", "collection2").should("be.checked");

    entitiesSidebar.clearAllFacetsApplied();

    entitiesSidebar.getCollectionCheckbox("collection", "collection1").should("not.exist");
    entitiesSidebar.getCollectionCheckbox("collection", "collection2").should("not.exist");
  });

  it("Apply facet search,open save modal, save new query", () => {
    explorePage.navigate();
    browsePage.databaseSwitch("final").click();
    explorePage.getEntities().click();
    browsePage.switchToTableView();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForHCTableToLoad();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.openBaseEntityFacets("Customer");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getGreySelectedFacets("Adams Cole").should("exist");
    browsePage.getFacetApplyButton().click();
    table.clickColumnTitle(2);
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.backToMainSidebar();
    browsePage.getSaveModalIcon().scrollIntoView().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveQueryName().should("be.visible");
    browsePage.getSaveQueryName().type("new-query");
    browsePage.getSaveQueryDescription().should("be.visible");
    browsePage.getSaveQueryDescription().type("new-query description");
    browsePage.getSaveQueryButton().click();
    browsePage.waitForSpinnerToDisappear();

    browsePage.getSelectedQuery().should("contain", "new-query");
    browsePage.getSelectedQueryDescription().should("contain", "new-query description");
    browsePage.getSaveQueryButton().should("not.exist");
    browsePage.getSaveQueriesDropdown().should("be.visible");
  });

  it("Editing a previous query", () => {
    browsePage.getEllipsisButton().click();
    browsePage.getEditQueryModalIcon().click();
    browsePage.getEditQueryDetailDesc().clear();
    browsePage.getEditQueryDetailDesc().type("new-query description edited");
    browsePage.getEditQueryDetailButton().click();
    browsePage.getSelectedQueryDescription().should("contain", "new-query description edited");
  });

  it("Saving a copy of previous query", () => {
    browsePage.getClearAllFacetsButton().then(($ele) => {
      if ($ele.is(":enabled")) {
        cy.log("**clear all facets**");
        browsePage.getClearAllFacetsButton().click();
        browsePage.waitForSpinnerToDisappear();
      }
    });
    browsePage.getEllipsisButton().click();
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().type("new-query-2");
    browsePage.getSaveQueryDescription().type("new-query-2 description");
    browsePage.getSaveQueryButton().click();
    browsePage.getSelectedQuery().should("contain", "new-query-2");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getHubProperties().then(($ele) => {
      if ($ele.hasClass("accordion-button collapsed")) {
        browsePage.getHubPropertiesExpanded();
      }
    });
    browsePage.showMoreCollection();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersJSON").scrollIntoView().click({force: true});
    browsePage.getGreySelectedFacets("mapCustomersJSON").should("exist");
    browsePage.getSaveModalIcon().scrollIntoView().click();
    browsePage.getRadioOptionSelected();
    browsePage.getEditSaveChangesButton().click();
    browsePage.getSelectedQueryDescription().should("contain", "new-query-2 description");
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    browsePage.getFacetApplyButton().click();
    cy.get(".css-1hwfws3").then((body) => {
      if (body.find(`span[aria-label="Remove Person"]`).length === 0) {
        entitiesSidebar.openBaseEntityDropdown();
        entitiesSidebar.selectBaseEntityOption("Person");
      }
    });
    browsePage.getTableCell(1, 2).should("contain", "102");
    browsePage.getTableCell(2, 2).should("contain", "103");

    cy.reload();
    cy.wait(3000);
    browsePage.waitForSpinnerToDisappear();
    cy.log("**Verify if the facets and other query related properties are intact after refreshing the browser page**");
    browsePage.getSelectedQuery().should("contain", "new-query-2");
    browsePage.getSelectedQueryDescription().should("contain", "new-query-2 description");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    browsePage.getTableCell(1, 2).should("contain", "102");
    browsePage.getTableCell(2, 2).should("contain", "103");

    cy.log("**save more queries with duplicate query name from browse and manage queries view**");
    cy.wait(3000);
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.openBaseEntityFacets("Customer");
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    entitiesSidebar.backToMainSidebar();

    browsePage.getSaveModalIcon().scrollIntoView().click();
    browsePage.getEditSaveChangesFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditSaveChangesFormName().clear();
    browsePage.getEditSaveChangesFormName().type("new-query");
    browsePage.getEditSaveChangesButton().click();
    browsePage.getErrorMessage().should("contain", "You already have a saved query with a name of new-query");
    browsePage.getEditSaveChangesCancelButton().click();
    cy.log("**checking previous query name is set clicking save modal icon**");
    browsePage.getEllipsisButton().click();
    browsePage.getSaveModalIcon().scrollIntoView().click();
    browsePage.getEditSaveChangesFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditSaveChangesCancelButton().click();
    cy.log("**checking previous query name is set clicking edit modal icon**");
    browsePage.getEllipsisButton().click();
    browsePage.getEditQueryModalIcon().click();
    browsePage.getEditQueryDetailFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditQueryDetailCancelButton().click();
    cy.log("**checking previous query name is set clicking save a copy modal icon**");
    browsePage.getEllipsisButton().click();
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().invoke("val").should("be.empty");
    browsePage.getSaveQueryCancelButton().click();
  });

  it("Edit queries with duplicate query name", () => {
    browsePage.getEllipsisButton().click();
    browsePage.getEditQueryModalIcon().click();
    browsePage.getEditQueryDetailFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditQueryDetailFormName().clear();
    browsePage.getEditQueryDetailFormName().type("new-query");
    browsePage.getEditQueryDetailButton().click();
    browsePage.getErrorMessage().should("contain", "You already have a saved query with a name of new-query");
    browsePage.getEditQueryDetailCancelButton().click();
    cy.log("**checking previous query name is set clicking save modal icon**");
    browsePage.getSaveModalIcon().scrollIntoView().click();
    browsePage.getEditSaveChangesFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditSaveChangesCancelButton().click();
    cy.log("**checking previous query name is set clicking edit modal icon");
    browsePage.getEllipsisButton().click();
    browsePage.getEditQueryModalIcon().click();
    browsePage.getEditQueryDetailFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditQueryDetailCancelButton().click();
    cy.log("**checking previous query name is set clicking save a copy modal icon");
    browsePage.getEllipsisButton().click();
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().invoke("val").should("be.empty");
    browsePage.getSaveQueryCancelButton().click();
  });

  it("Clicking on save a copy icon", () => {
    browsePage.getEllipsisButton().click();
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().clear();
    browsePage.getSaveQueryName().type("new-query");
    browsePage.getSaveQueryButton().click();
    browsePage.getErrorMessage().should("contain", "You already have a saved query with a name of new-query");
    browsePage.getSaveQueryCancelButton().click();
    cy.log("**checking previous query name is set clicking save modal icon");
    browsePage.getSaveModalIcon().scrollIntoView().click();
    browsePage.getEditSaveChangesFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditSaveChangesCancelButton().click();
    cy.log("**checking previous query name is set clicking edit modal icon");
    browsePage.getEllipsisButton().click();
    browsePage.getEditQueryModalIcon().click();
    browsePage.getEditQueryDetailFormName().invoke("val").should("contain", "new-query-2");
    browsePage.getEditQueryDetailCancelButton().click();
    cy.log("**checking previous query name is set clicking save a copy modal icon");
    browsePage.getEllipsisButton().click();
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().invoke("val").should("be.empty");
    browsePage.getSaveQueryCancelButton().click();
  });

  it("Checking manage query", () => {
    explorePage.clickExploreSettingsMenuIcon();
    browsePage.getManageQueriesModalOpened();
    queryComponent.getManageQueryModal().should("be.visible");

    cy.contains("td", "new-query-2").parent().within(() => {  cy.get(`td i[aria-label="editIcon"]`).click(); });
    queryComponent.getEditQueryName().invoke("val").then((text) => {
      if (typeof(text) === "string") qName = text;
    });
    queryComponent.getEditQueryName().clear();
    queryComponent.getEditQueryName().type("new-query");
    queryComponent.getSubmitButton().click();
    queryComponent.getErrorMessage().should("contain", "You already have a saved query with a name of new-query");
    queryComponent.getEditCancelButton().click();
    queryComponent.getManageQueryModal().find(".btn-close").click();

    browsePage.getSaveModalIcon().scrollIntoView().click();

    browsePage.getEditSaveChangesCancelButton().click();
    cy.log("**checking previous query name is set clicking edit modal icon**");
    browsePage.getEllipsisButton().should("be.visible").click();
    browsePage.getEditQueryModalIcon().first().click();
    browsePage.getEditQueryDetailFormName().invoke("val").then((text) => {
      let nameVal = text;
      expect(qName).to.contain(nameVal);
    });
    browsePage.getEditQueryDetailCancelButton().click();
    cy.log("**checking previous query name is set clicking save a copy modal icon**");
    browsePage.getEllipsisButton().scrollIntoView().click();
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().invoke("val").should("be.empty");
    browsePage.getSaveQueryCancelButton().click();
  });

  it("Edit saved query and verify discard changes functionality", () => {
    entitiesSidebar.removeSelectedBaseEntity();
    browsePage.getClearAllFacetsButton().click();
    entitiesSidebar.clearQuery();
    browsePage.getResetConfirmationNoClick();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
    entitiesSidebar.openBaseEntityFacets("Person");
    browsePage.getFacetItemCheckbox("lname", "Bates").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getGreySelectedFacets("Bates").should("exist");
    browsePage.getFacetApplyButton().click();
    entitiesSidebar.backToMainSidebar();
    browsePage.getSaveModalIcon().scrollIntoView().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveQueryName().type("person-query");
    browsePage.getSaveQueryDescription().type("person-query description");
    browsePage.getSaveQueryButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSelectedQuery().should("contain", "person-query");
    browsePage.search("Bates");
    table.clickColumnTitle(4);
    browsePage.getEllipsisButton().scrollIntoView().click();
    browsePage.getDiscardChangesIcon().click();
    browsePage.getDiscardYesButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getAppliedFacets("Bates").should("exist");
    browsePage.search("Bates");
    table.clickColumnTitle(4);
    browsePage.getEllipsisButton().scrollIntoView().click();
    browsePage.getDiscardChangesIcon().click();
    browsePage.getDiscardNoButton().click();
    browsePage.getSearchBar().should("have.value", "Bates");
    browsePage.getSortIndicatorAsc().should("have.css", "background-color", "rgba(0, 0, 0, 0)");
  });

  it("Switching between queries when making changes to saved query", () => {
    entitiesSidebar.removeSelectedBaseEntity();
    browsePage.getClearAllFacetsButton().click();
    entitiesSidebar.clearQuery();
    browsePage.getResetConfirmationNoClick();
    cy.log("**creating query 1 with customer entity**");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacetItemCheckbox("collection", "mapCustomersJSON").click({force: true});
    browsePage.getFacetApplyButton().click();
    browsePage.search("Adams Cole");
    browsePage.getSaveModalIcon().scrollIntoView().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveQueryName().type("query-1");
    browsePage.getSaveQueryDescription().type("query-1 description");
    browsePage.getSaveQueryButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSelectedQuery().should("contain", "query-1");
    browsePage.getSelectedQueryDescription().should("contain", "query-1 description");
    cy.log("**creating query 2 using save a copy**");
    browsePage.getEllipsisButton().scrollIntoView().click();
    browsePage.getSaveACopyModalIcon().click();
    browsePage.getSaveQueryName().type("query-2");
    browsePage.getSaveQueryButton().click();
    cy.log("**Making changes to query-2 and switching to query-1**");
    table.clickColumnTitle(2);
    browsePage.selectQuery("query-1");
    browsePage.getQueryConfirmationNoClick().click();
    browsePage.getSelectedQuery().should("contain", "query-1");
    browsePage.getClearFacetSearchSelection("mapCustomersJSON").click();
    table.clickColumnTitle(2);
    browsePage.selectQuery("query-2");
    browsePage.getQueryConfirmationYesClick().click();
    browsePage.getEditSaveChangesButton().click();
    browsePage.getSelectedQuery().should("contain", "query-2");
    browsePage.getAppliedFacets("mapCustomersJSON").should("exist");
    browsePage.selectQuery("query-1");
    browsePage.getSortIndicatorAsc().should("have.css", "background-color", "rgba(0, 0, 0, 0)");
  });

  it("Switching between entities when making changes to saved query", () => {
    browsePage.selectQuery("new-query");
    browsePage.getClearFacetSearchSelection("Adams Cole").click();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntity("Customer").click();
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    entitiesSidebar.applyFacets();
    entitiesSidebar.backToMainSidebar();
    table.clickColumnTitle(3);
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
    entitiesSidebar.getBaseEntityOption("Person").should("be.visible");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    browsePage.selectQuery("new-query");
    browsePage.waitForSpinnerToDisappear();
    browsePage.dontUpdateQuery().click();
    browsePage.getAppliedFacets("Adams Cole").should("exist");
    browsePage.getAppliedFacets("adamscole@nutralab.com").should("not.exist");
    browsePage.getSortIndicatorAsc().should("have.css", "background-color", "rgba(0, 0, 0, 0)");
    browsePage.getTableCell(1, 3).should("contain", "Adams Cole");
    browsePage.getTableCell(2, 3).should("contain", "Adams Cole");
  });

  it("Switching between entities when there are saved queries", () => {
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.removeSelectedBaseEntity();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
    browsePage.getSaveQueriesDropdown().should("exist");
    cy.log("**Checking if you are in person entity,select a saved query related to customer and shifting back to person**");
    browsePage.selectQuery("new-query");
    browsePage.dontUpdateQuery().click();
    entitiesSidebar.getBaseEntityOption("Customer").should("be.visible");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
  });

  it("Save query button should not show up in all entities view", () => {
    browsePage.getClearAllFacetsButton().click();
    cy.waitForAsyncRequest();
    entitiesSidebar.clearQuery();
    browsePage.getResetConfirmationNoClick();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
    browsePage.getSaveQueriesDropdown().should("exist");
    browsePage.getSelectedQuery().should("contain", "select a query");
    browsePage.getHubPropertiesExpanded();
  });

  it("Show Reset query button, open reset confirmation", () => {
    entitiesSidebar.clearQueryLabel.trigger("mouseover");
    entitiesSidebar.clearQueryTooltip.should("be.visible");
    cy.log("**clicking on no doesn't create a new query and navigates to zero state**");
    entitiesSidebar.getBaseEntityOption("All Entities").should("be.visible");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    entitiesSidebar.openBaseEntityFacets("Customer");
    browsePage.getFacetItemCheckbox("name", "Adams Cole").click();
    browsePage.getSelectedFacets().should("exist");
    browsePage.getFacetApplyButton().click();
    table.clickColumnTitle(2);
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.backToMainSidebar();
    browsePage.getSaveModalIcon().scrollIntoView().click();
    cy.log("**selecting yes will save the new query and navigates to zero state**");
    browsePage.getSaveQueryName().should("be.visible");
    browsePage.getSaveQueryName().type("reset-query");
    browsePage.getSaveQueryButton().click();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    browsePage.selectQuery("reset-query");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getAppliedFacets("Adams Cole").should("exist");
    browsePage.getSortIndicatorAsc().should("have.css", "background-color", "rgba(0, 0, 0, 0)");
    cy.wait(1000);
    browsePage.getTableCell(1, 2).should("contain", "102");
    browsePage.getTableCell(2, 2).should("contain", "103");
  });

  it("Show Reset query button, clicking reset confirmation when making changes to saved query", () => {
    cy.log("**Select saved query, make changes, click on reset opens a confirmation**");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    browsePage.getSaveQueriesDropdown().should("exist");
    browsePage.selectQuery("reset-query");
    browsePage.getSelectedQuery().should("contain", "reset-query");
    entitiesSidebar.openBaseEntityFacets("Customer");
    browsePage.getFacetItemCheckbox("email", "adamscole@nutralab.com").click();
    cy.log("**clicking on no doesn't update query and navigates to zero state**");
    entitiesSidebar.backToMainSidebar();
    entitiesSidebar.clearQuery();
    browsePage.getResetConfirmationNoClick();
    entitiesSidebar.getBaseEntityOption("All Entities").should("be.visible");
    cy.log("**selecting yes will update the query and navigates to zero state**");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    browsePage.selectQuery("reset-query");
    table.clickColumnTitle(2);
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    entitiesSidebar.clearQuery();
    browsePage.getResetConfirmationYes().should("be.visible").click();
    browsePage.getEditSaveChangesButton().should("be.visible").click();
    cy.waitForAsyncRequest();
    browsePage.getTotalDocuments();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    browsePage.selectQuery("reset-query");
    cy.waitForAsyncRequest();
    browsePage.getAppliedFacets("Adams Cole").should("exist");
    cy.wait(500);
    browsePage.getSortIndicatorDesc().should("have.css", "background-color", "rgba(0, 0, 0, 0)");
    browsePage.getTableCell(1, 2).should("contain", "103");
    browsePage.getTableCell(2, 2).should("contain", "102");
  });

  it("Show Reset query button, verify confirmation modal displays if only selected columns changed, clicking reset icon resets to all entities", () => {
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    browsePage.getColumnSelectorIcon().should("be.visible");
    browsePage.getColumnSelectorIcon().click();
    browsePage.getColumnSelector().should("be.visible");
    browsePage.selectColumnSelectorProperty("status");
    browsePage.getColumnSelectorApply().click({force: true});
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
    cy.log("**select saved query, make changes, click on reset opens a confirmation**");
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    explorePage.scrollSideBarTop();
    browsePage.getSaveQueriesDropdown().should("be.visible");
    browsePage.selectQuery("reset-query");
    browsePage.dontUpdateQuery().click();
    cy.log("**changing the selected column list should trigger modal confirmation**");
    browsePage.getColumnSelectorIcon().should("be.visible");
    browsePage.getColumnSelectorIcon().click();
    browsePage.getColumnSelector().should("be.visible");
    browsePage.selectColumnSelectorProperty("status");
    browsePage.getColumnSelectorApply().click({force: true});
    browsePage.getResetQueryButton().click({force: true});
    browsePage.getResetConfirmationNoClick();
    cy.waitForAsyncRequest();
    entitiesSidebar.getBaseEntityOption("All Entities").should("be.visible");

    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    explorePage.scrollSideBarTop();
    browsePage.getSaveQueriesDropdown().should("be.visible");
    browsePage.selectQuery("reset-query");
    browsePage.getResetQueryButton().click();
    entitiesSidebar.getBaseEntityOption("All Entities").should("be.visible");
  });

  it("Apply facet,save query using save as  option", () => {
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Person");
    entitiesSidebar.openBaseEntityFacets("Person");
    browsePage.getFacetItemCheckbox("lname", "Bates").click();
    browsePage.getFacetItemCheckbox("lname", "Bates").should("be.checked");
    browsePage.getGreySelectedFacets("Bates").should("exist");
    browsePage.getFacetApplyButton().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("fname", "Bob").click();
    browsePage.getFacetItemCheckbox("fname", "Bob").should("be.checked");
    entitiesSidebar.backToMainSidebar();
    browsePage.getSaveModalIcon().scrollIntoView().click({force: true});
    browsePage.waitForSpinnerToDisappear();
    browsePage.getSaveQueryName().should("be.visible");
    browsePage.getSaveQueryName().type("check-query");
    browsePage.getSaveQueryDescription().should("be.visible");
    browsePage.getSaveQueryDescription().type("check-query description");
    browsePage.getSaveQueryButton().click();
    entitiesSidebar.getBaseEntity("Person").click();
    browsePage.getFacetItemCheckbox("fname", "Bob").should("be.checked");
    browsePage.getFacetApplyButton().should("be.visible");
    entitiesSidebar.backToMainSidebar();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
    browsePage.getResetQueryButton().click({force: true});
    browsePage.getResetConfirmationNoClick();
    browsePage.getClearAllFacetsButton().click();
  });

  it("verify export array/structured data warning", () => {
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForHCTableToLoad();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Order");
    browsePage.getDataExportIcon().click();
    browsePage.alertContent().eq(0).contains(`One or more structured properties are included in this query. The data for those properties will not be included in the export file. Click "Show Preview" below to see what will be exported.`);
    browsePage.closeExportModal();
  });

  it("Verify facets checked on sidebar", () => {
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("All Entities");
    browsePage.getFacetItemCheckbox("collection", "Person").click();
    browsePage.getFacetItemCheckbox("collection", "Person").should("be.checked");
    browsePage.getGreySelectedFacets("Person").should("exist");
  });

  it("Verify selected query when switching database", () => {
    browsePage.getClearAllFacetsButton().click();
    cy.log("**apply saved query**");
    browsePage.selectQuery("person-query");
    browsePage.getSelectedQuery().should("contain", "person-query");
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.getBaseEntityOption("Person").should("be.visible");
    entitiesSidebar.openBaseEntityFacets("Person");
    browsePage.getFacetItemCheckbox("lname", "Bates").should("be.checked");
    cy.log("**switch the database**");
    entitiesSidebar.backToMainSidebar();
    explorePage.getStagingDatabaseButton();
    browsePage.waitForSpinnerToDisappear();
    entitiesSidebar.getBaseEntityOption("Person").should("be.visible");
    browsePage.getSaveQueriesDropdown().scrollIntoView().should("be.visible");
    browsePage.getSelectedQuery().should("contain", "select a query");
    cy.log("**Person entity is not available in stage database**");
    browsePage.getFacetItemCheckbox("lname", "Bates").should("not.exist");
    browsePage.getEditQueryModalIcon().should("not.exist");
    browsePage.getResetQueryButton().should("be.visible");
    browsePage.getSaveACopyModalIcon().should("not.exist");
  });
});
