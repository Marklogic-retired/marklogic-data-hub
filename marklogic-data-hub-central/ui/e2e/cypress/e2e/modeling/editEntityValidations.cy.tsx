import {confirmationModal} from "../../support/components/common/index";
import {entityTypeModal, entityTypeTable} from "../../support/components/model";
import {ConfirmationType} from "../../support/types/modeling-types";
import modelPage from "../../support/pages/model";

const userRoles = [
  "hub-central-entity-model-reader",
  "hub-central-entity-model-writer",
  "hub-central-saved-query-user"
];

describe("Entity validations ", () => {
  before(() => {
    cy.loginAsTestUserWithRoles(...userRoles).withRequest();
    modelPage.navigate();
  });

  afterEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  it("Check Namespace URI and prefix", () => {
    modelPage.selectView("table");
    entityTypeTable.waitForTableToLoad();
    modelPage.getAddButton().click();
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});
    entityTypeModal.newEntityName("TestEdit");
    entityTypeModal.getAddButton().click();

    cy.log("**Check error handling with wrong URI**");
    entityTypeTable.getEntity("TestEdit").click();
    entityTypeModal.getNamespaceInput().type("....");
    entityTypeModal.getAddButton().click();
    cy.findByText("You must define a prefix because you defined a namespace URI.");

    cy.log("**Check error handling prefix without nameURI**");
    entityTypeModal.getNamespaceInput().clear();
    entityTypeModal.getPrefixInput().type("...");
    entityTypeModal.getAddButton().click();
    cy.findByText("You must define a namespace URI because you defined a prefix.");

    cy.log("**Check error handling invalid syntax URI**");
    entityTypeModal.getNamespaceInput().type("....");
    entityTypeModal.getAddButton().click();
    cy.findByText("Invalid syntax: Namespace property must be a valid absolute URI. Example: http://example.org/es/gs");
    entityTypeModal.getCancelButton().click();
    entityTypeTable.getDeleteEntityIcon("TestEdit").click();
    confirmationModal.getYesButton(ConfirmationType.DeleteEntity);
  });
});