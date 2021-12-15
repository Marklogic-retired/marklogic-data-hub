class ModelPage {

  /**
  * @param type - accepts `table` for table-view or `project-diagram` for graph-view
  */
  selectView(view: string) {
    cy.get(`[data-icon="${view}"]`).first().trigger("mouseover").click({force: true});
    cy.wait(1000);
    cy.get("body")
      .then(($body) => {
        if ($body.find("[class*=\"rbt-input\"]")) {
          cy.get(`[data-icon="${view}"]`).first().trigger("mouseover").click({force: true});
        }
      });
  }

  closeSidePanel() {
    return cy.findByLabelText("closeGraphViewSidePanel").click({force: true});
  }

  getAddEntityButton() {
    return cy.findByLabelText("add-entity");
  }

  getPublishButton() {
    return cy.findByLabelText("publish-to-database");
  }

  getEntityModifiedAlert() {
    return cy.findByLabelText("entity-modified-alert");
  }

  clickModelingInfoIcon() {
    return cy.findByLabelText("modelInfoIcon").trigger("click");
  }

  verifyModelingInfo() {
    return cy.findByLabelText("modelingInfo").should("exist");
  }

  scrollPageBottom() {
    return cy.get(".mosaic-window > :nth-child(2)").scrollTo("bottom");
  }

  scrollPageTop() {
    return cy.get(".mosaic-window > :nth-child(2)").scrollTo("top");
  }
}

const modelPage = new ModelPage();
export default modelPage;
