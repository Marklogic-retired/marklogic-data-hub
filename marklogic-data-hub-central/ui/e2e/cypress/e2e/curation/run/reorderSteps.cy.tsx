import {toolbar} from "../../../support/components/common";
import loadPage from "../../../support/pages/load";
import runPage from "../../../support/pages/run";

describe("Run Tile tests", () => {
  before(() => {
    cy.loginAsTestUserWithRoles("hub-central-flow-writer").withRequest();
  });

  beforeEach(() => {
    runPage.navigate();
    toolbar.getRunToolbarIcon().click({force: true});
    runPage.getFlowName("personJSON").should("be.visible");
  });

  after(() => {
    cy.deleteRecordsInFinal("master-xml-person", "mapPersonXML");
    cy.deleteFlows("testPerson");
    cy.resetTestUser();
  });

  it("Can create flow and add steps to flow and reorder flow", {defaultCommandTimeout: 120000}, () => {
    cy.wait(3000);
    const flowName = "testPerson";

    runPage.createFlowButton().click({force: true});
    runPage.newFlowModal().should("be.visible");
    runPage.setFlowName(flowName);
    loadPage.confirmationOptions("Save").click();
    runPage.addStep(flowName);
    runPage.addStepToFlow("loadPersonXML");
    runPage.verifyStepInFlow("Loading", "loadPersonXML", flowName);
    runPage.addStep(flowName);
    runPage.addStepToFlow("mapPersonXML");
    runPage.verifyStepInFlow("Mapping", "mapPersonXML", flowName);
    runPage.addStep(flowName);
    runPage.addStepToFlow("match-xml-person");
    runPage.verifyStepInFlow("Matching", "match-xml-person", flowName);
    runPage.addStep(flowName);
    runPage.addStepToFlow("merge-xml-person");
    runPage.verifyStepInFlow("Merging", "merge-xml-person", flowName);
    runPage.addStep(flowName);
    runPage.addStepToFlow("master-person");
    runPage.verifyStepInFlow("Mastering", "master-person", flowName);
    runPage.addStep(flowName);

    runPage.moveStepRight("mapPersonXML");
    runPage.moveStepRight("mapPersonXML");
    runPage.moveStepLeft("mapPersonXML");
    runPage.moveStepRight("match-xml-person");
    runPage.moveStepRight("loadPersonXML");
    runPage.moveStepLeft("loadPersonXML");
    runPage.moveStepLeft("master-person");
    runPage.moveStepLeft("merge-xml-person");
  });
});
