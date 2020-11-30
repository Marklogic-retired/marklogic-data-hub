import {Application} from "../../support/application.config";

class HomePage {

  getViewEntities() {
    return cy.contains("View Entities");
  }

  getBrowseEntities() {
    return cy.contains("Browse Entities");
  }

  // temporary change as tile is not working
  getTitle() {
    return cy.contains(Application.title);
  }

  getModelTile() {
    return cy.get("button[aria-label=\"Model\"]");
  }
  getEntitiesTile() {
    return cy.get("button[aria-label=\"Entity\"]");
  }

  getExploreTile() {
    return cy.get("div[aria-label=\"tool-explore\"]");
  }
}

const homePage = new HomePage();
export default homePage;
