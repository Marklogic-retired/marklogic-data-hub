class LandingPage {

  dashboard() {
    return cy.get(".dashboard");
  }
  entityViewerTitle() {
    return cy.get(".title > a");
  }
  menuOptions() {
    return cy.get(".Menus_menu__1OerK > a");
  }
  subMenu() {
    return cy.get("#nav-dropdown");
  }
  subMenuMlDocs() {
    return cy.get(".dropdown-item").eq(0);
  }
  subMenuSearch() {
    return cy.get(".dropdown-item > span");
  }
  whatsNewChart() {
    return cy.get(".chart");
  }

}

const landingPage = new LandingPage();
export default landingPage;
