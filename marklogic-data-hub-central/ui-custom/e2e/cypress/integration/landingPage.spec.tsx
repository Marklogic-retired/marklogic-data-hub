describe("Visit Entity Viewer Landing page", () => {
  it("Greets with Entity Viewer title", () => {
	cy.visit("/");
    cy.title().should("eq", "Entity Viewer");
  });
});
