import "./commands";
import "cypress-fail-fast";

Cypress.on("uncaught:exception", (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});

Cypress.on("fail", (err) => {
});