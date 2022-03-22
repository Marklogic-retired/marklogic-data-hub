class SpecificSidebar {
  getEntitySiderComponent(entityType: string) {
    return cy.get(`[data-testid="${entityType}-hc-sider-component"]`);
  }

  getEntitySpecifIcon(entityType: string) {
    return cy.get(`[aria-label="specif-icon-${entityType}"]`);
  }

  getEntitySpecifTitle(entityType: string) {
    return cy.get(`[aria-label="specif-title-${entityType}"]`);
  }

  getLeftBarEntityIcon(entityType: string) {
    return cy.get(`[aria-label="base-entity-icon-${entityType}"]`);
  }
}

const specificSidebar = new SpecificSidebar();
export default specificSidebar;
