class BaseEntitySidebar {
  //Elements
  get backToMainSidebarButton() {
    return cy.get(`[aria-label="base-entity-icons-list-close"]`);
  }
  getBaseEntity(entity: string) {
    //return cy.get("base-entities-facet_entityName").contains(entity);
    return cy.get(`div[aria-label="base-entities-${entity}"]`);
  }
  getEntityTitle(entity: string) {
    return cy.get(`div[aria-label="specif-sidebar-${entity}"]`);
  }
  getEntityIconFromList(entity: string) {
    return cy.get(`div[aria-label="base-entity-icon-${entity}"]`);
  }
  //Actions
  clickOnBaseEntity(entity: string) {
    return this.getBaseEntity(entity).click();
  }
}
export default new BaseEntitySidebar();