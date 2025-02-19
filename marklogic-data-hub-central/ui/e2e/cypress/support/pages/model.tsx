import {toolbar} from "../components/common";
import homePage from "./home";

class ModelPage {

  switchTableView() {
    cy.get("[data-cy='table-view']").should("be.visible").scrollIntoView().click({force: true});
    cy.get("#mainTable").should("be.visible");
    cy.waitForAsyncRequest();
  }

  switchGraphView() {
    cy.get("[data-cy='graph-view']").should("be.visible").scrollIntoView().click({force: true});
    cy.get("#graphVis").should("be.visible");
    cy.waitForAsyncRequest();
  }

  closeSidePanel() {
    cy.findByLabelText("closeGraphViewSidePanel").click({force: true});
  }

  getAddButton() {
    return cy.get(`[aria-label="add-entity-type-concept-class"] > button`);
  }

  getAddEntityButton() {
    return cy.findByLabelText("add-entity");
  }

  getAddEntityTypeOption() {
    return cy.get(`[aria-label="add-entity-type"]`);
  }

  getAddConceptClassOption() {
    return cy.get(`[aria-label="add-concept-class"]`);
  }

  getPublishButton() {
    return cy.get("[data-testId=\"publish-changes\"]").scrollIntoView();
  }

  getRevertButton() {
    return cy.get("[data-testId=\"revert-changes\"]").scrollIntoView();
  }

  getPublishButtonDisabledTooltip() {
    return cy.get(`[id="publish-disabled-tooltip"]`);
  }

  getEntityModifiedAlert() {
    return cy.findByLabelText("entity-modified-alert");
  }

  clickModelingInfoIcon() {
    cy.findByLabelText("modelInfoIcon").scrollIntoView().click({force: true});
  }

  verifyModelingInfo() {
    cy.findByLabelText("modelingInfo").should("exist");
  }

  scrollPageBottom() {
    cy.get(".mosaic-window > :nth-child(2)").scrollTo("bottom");
  }

  scrollPageTop() {
    cy.get(".mosaic-window > :nth-child(2)").scrollTo("top");
  }

  openIconSelector(entityName: string) {
    cy.get(`[data-testid="${entityName}-icon-selector"]`).click();
  }

  selectIcon(entitType: string, icon: string) {
    cy.get(`[data-testid="${entitType}-${icon}-icon-option"]`).click();
  }

  getSortIndicator() {
    return cy.get(`[aria-label^="Name"] [aria-label="icon: caret-up"]`);
  }

  getEntityLabelNames() {
    return cy.get(`[class^="hc-table_tableCell"] [class^="entity-type-table_link"]`);
  }

  getIconSelected(entityName:string, iconName: string) {
    return cy.get(`[aria-label="${entityName}-${iconName}-icon"]`);
  }

  getColorSelected(entityName:string, color:string) {
    return cy.get(`[aria-label="${entityName}-${color}-color"]`);
  }

  toggleColorSelector(entityType: string) {
    cy.get(`[id="${entityType}-color-button"]`).click();
  }

  selectColorFromPicker(color: string) {
    return cy.findByTitle(`${color}`);
  }

  zoomOut(duration: number) {
    cy.get(".vis-zoomOut").trigger("pointerdown", {button: 0});
    cy.wait(duration);
    cy.get(".vis-zoomOut").trigger("pointerup", {button: 0});
  }

  navigate() {
    cy.url().then((url: string) => {
      if (!url.includes("http")) {
        homePage.navigate();
      }
    });
    toolbar.getModelToolbarIcon().should("be.visible").click();
    cy.waitForAsyncRequest();
  }
}

const modelPage = new ModelPage();
export default modelPage;
