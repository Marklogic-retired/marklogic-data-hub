import {confirmationModal, createEditStepDialog, multiSlider} from "../../support/components/common/index";
import mergeStrategyModal from "../../support/components/merging/merge-strategy-modal";
import mergingStepDetail from "../../support/components/merging/merging-step-detail";
import mergeRuleModal from "../../support/components/merging/merge-rule-modal";
import {ConfirmationType} from "../../support/types/modeling-types";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import curatePage from "../../support/pages/curate";
import browsePage from "../../support/pages/browse";
import modelPage from "../../support/pages/model";
import loadPage from "../../support/pages/load";
import runPage from "../../support/pages/run";
import graphExploreSidePanel from "../../support/components/explore/graph-explore-side-panel";
import detailPage from "../../support/pages/detail";

import {
  createEditMappingDialog,
  mappingStepDetail
} from "../../support/components/mapping/index";

import {
  entityTypeModal,
  entityTypeTable,
  propertyModal,
  propertyTable,
  structuredTypeModal,
} from "../../support/components/model/index";

const loadStepName = "loadPatient";
const matchStep = "patientMatch";
const mergeStep = "patientMerge";
const flowName = "patientFlow";
const mapStep = "patientMap";

let smPatientArchivedCollection = [
  "metaphone1.json",
  "metaphone2.json",
  "ssn-match1.json",
  "name-synonym1.json",
  "ssn-match2.json",
  "name-synonym2.json",
];

let smPatientNotificationCollection = [
  "/patient/last-name-dob-custom1.json /patient/last-name-dob-custom2.json",
  "/patient/last-name-address-reduce1.json /patient/last-name-address-reduce2.json",
  "/patient/last-name-plus-zip-boost1.json /patient/last-name-plus-zip-boost2.json"
];

let smPatientAuditingCollection = {
  "/patient/ssn-match1.json": "/patient/ssn-match2.json",
  "/patient/first-name-double-metaphone1.json": "/patient/first-name-double-metaphone2.json",
  "/patient/first-name-synonym1.json": "/patient/first-name-synonym2.json"
};

describe("Validate E2E Mastering Flow", () => {
  before(() => {
    cy.loginAsDeveloper().withRequest();
    loadPage.navigate();
  });

  after(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("ingestion", "loadPatient");
    cy.deleteSteps("mapping", "patientMap");
    cy.deleteSteps("matching", "patientMatch");
    cy.deleteSteps("merging", "patientMerge");
    cy.deleteFlows(flowName);
    cy.deleteEntities("Patient");
    cy.deleteRecordsInFinal("loadPatient", "patientMap", "patientMatch", "patientMerge");
    cy.deleteRecordsInFinal("sm-Patient-archived", "sm-Patient-mastered", "sm-Patient-merged", "sm-Patient-auditing", "sm-Patient-notification");
    cy.deleteRecordsInStaging("loadPatient");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  it("Create a load Step", () => {
    loadPage.stepName("ingestion-step").should("be.visible");
    loadPage.loadView("th-large").click();
    loadPage.addNewButton("card").click();
    loadPage.stepNameInput().clear().type(loadStepName);
    loadPage.stepDescriptionInput().clear().type(`${loadStepName} description`);
    loadPage.stepSourceNameInput().clear().type("patientSourceName");
    loadPage.stepSourceNameType().clear().type("patientSourceType");
    loadPage.uriPrefixInput().clear().type("/patient/");
    cy.intercept("/api/flows").as("loadView");
    loadPage.saveButton().click();
    cy.wait("@loadView");
    cy.wait("@loadView");
    cy.findByText(loadStepName).should("be.visible");
  });

  it("Add load Step to New Flow", {defaultCommandTimeout: 120000}, () => {
    loadPage.addStepToNewFlow(loadStepName);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();

    runPage.toggleFlowAccordion(flowName);
    cy.verifyStepAddedToFlow("Loading", loadStepName, flowName);
    runPage.runStep(loadStepName, flowName);
    cy.get("input[type=\"file\"]").attachFile(["patients/first-name-double-metaphone1.json", "patients/first-name-double-metaphone2.json", "patients/first-name-synonym1.json", "patients/first-name-synonym2.json", "patients/last-name-address-reduce1.json", "patients/last-name-address-reduce2.json", "patients/last-name-dob-custom1.json", "patients/last-name-dob-custom2.json", "patients/last-name-plus-zip-boost1.json", "patients/last-name-plus-zip-boost2.json", "patients/last-name-slight-match1.json", "patients/last-name-slight-match2.json", "patients/ssn-match1.json", "patients/ssn-match2.json"], {force: true});
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    runPage.verifyStepRunResult(loadStepName, "success");

    cy.log("** Verify step name appears as a collection facet in explorer**");
    runPage.explorerLink(loadStepName).should("be.visible").click({force: true});
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForCardToLoad();
    browsePage.totalResults.should("have.text", "14");
    browsePage.getFacet("collection").should("be.visible");
    browsePage.getFacetItemCheckbox("collection", loadStepName).should("be.visible");
    cy.wait(3000);

    modelPage.navigate();
    modelPage.switchTableView();
    entityTypeTable.waitForTableToLoad();
    modelPage.getAddButton().should("be.visible").click();
    modelPage.getAddEntityTypeOption().should("be.visible").click({force: true});
    entityTypeModal.newEntityName("Patient");
    entityTypeModal.newEntityDescription("An entity for patients");
    entityTypeModal.getAddButton().click();
    cy.waitForAsyncRequest();

    propertyTable.getAddPropertyButton("Patient").should("be.visible").click();
    propertyModal.newPropertyName("FirstName");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string");
    propertyModal.getSubmitButton().click();
    propertyTable.getAddPropertyButton("Patient").should("be.visible").click();
    propertyModal.newPropertyName("LastName");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string");
    propertyModal.getSubmitButton().click();
    propertyTable.getAddPropertyButton("Patient").should("be.visible").click();
    propertyModal.newPropertyName("SSN");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string");
    propertyModal.getSubmitButton().click();
    propertyTable.getAddPropertyButton("Patient").should("be.visible").click();
    propertyModal.newPropertyName("ZipCode");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string");
    propertyModal.getSubmitButton().click();
    propertyTable.getAddPropertyButton("Patient").should("be.visible").click();
    propertyModal.newPropertyName("Address");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string");
    propertyModal.getSubmitButton().click();
    propertyTable.getAddPropertyButton("Patient").should("be.visible").click();
    propertyModal.newPropertyName("DateOfBirth");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("More date types");
    propertyModal.getCascadedTypeFromDropdown("date");
    propertyModal.getSubmitButton().click();
    propertyTable.getAddPropertyButton("Patient").should("be.visible").click();
    propertyModal.newPropertyName("Details");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("Structured");
    propertyModal.getCascadedTypeFromDropdown("New Property Type");
    structuredTypeModal.newName("DetailsProperty");
    structuredTypeModal.getAddButton().click();
    propertyModal.getSubmitButton().click();

    cy.wait(1000);
    modelPage.getPublishButton().click({force: true});
    confirmationModal.getYesButton(ConfirmationType.PublishAll);
    cy.waitForAsyncRequest();
    confirmationModal.getSaveAllEntityText().should("be.visible");
    confirmationModal.getSaveAllEntityText().should("not.exist");
    modelPage.getEntityModifiedAlert().should("not.exist");
  });

  it("Create mapping step and Map source to entity", () => {
    curatePage.navigate();
    curatePage.getEntityTypePanel("Patient").should("be.visible");
    curatePage.toggleEntityTypeId("Patient");
    curatePage.addNewStep("Patient").click();
    createEditMappingDialog.setMappingName(mapStep);
    createEditMappingDialog.setMappingDescription("An order mapping with custom interceptors");
    createEditMappingDialog.setCollectionInput(loadStepName);
    cy.get(`[aria-label="${loadStepName}"]`).should("be.visible").click({force: true});
    cy.get(".rbt-input-main").should("be.visible").should("have.value", loadStepName).then(() => { createEditMappingDialog.saveButton().click({force: true}); });
    cy.waitForAsyncRequest();
    curatePage.dataPresent().scrollIntoView().should("be.visible");
    curatePage.verifyStepDetailsOpen(mapStep);

    mappingStepDetail.setXpathExpressionInput("FirstName", "FirstName");
    mappingStepDetail.setXpathExpressionInput("LastName", "LastName");
    mappingStepDetail.setXpathExpressionInput("SSN", "SSN");
    mappingStepDetail.setXpathExpressionInput("ZipCode", "ZipCode");
    mappingStepDetail.setXpathExpressionInput("Address", "Address");
    mappingStepDetail.setXpathExpressionInput("DateOfBirth", "DateOfBirth");
    curatePage.dataPresent().scrollIntoView().should("be.visible");
    mappingStepDetail.navigateUrisRight().click({force: true});

    mappingStepDetail.testMap().should("be.visible").should("be.enabled");
    mappingStepDetail.expandEntity().should("be.visible").click();
    mappingStepDetail.testMap().click({force: true});
    mappingStepDetail.goBackToCurateHomePage();
  });

  it("Add Map step to existing flow Run", {defaultCommandTimeout: 120000}, () => {
    curatePage.runStepInCardView(mapStep).click();
    curatePage.runStepSelectFlowConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName);
    runPage.verifyStepRunResult(mapStep, "success");

    runPage.explorerLink(mapStep).click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getTableView().click();
    browsePage.waitForHCTableToLoad();
    browsePage.totalResults.should("have.text", "14");
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacet("collection").should("be.visible");
    browsePage.getFacetItemCheckbox("collection", mapStep).should("be.visible");
  });

  it("Create a new match step", () => {
    curatePage.navigate();
    curatePage.getEntityTypePanel("Patient").should("be.visible");
    curatePage.selectMatchTab("Patient");
    curatePage.addNewStep("Patient").should("be.visible").click();
    createEditStepDialog.stepNameInput().clear().type(matchStep);
    createEditStepDialog.stepDescriptionInput().clear().type("match patient step example", {timeout: 2000});
    createEditStepDialog.setCollectionInput(mapStep);
    cy.get(`[aria-label="${mapStep}"]`).should("be.visible").click({force: true});
    cy.get(".rbt-input-main").should("have.value", mapStep).should("be.visible").then(() => { createEditStepDialog.saveButton("matching").click(); });
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(matchStep);
  });

  it("Add Thresholds and rule sets by hitting API ", () => {
    cy.request({
      method: "PUT",
      url: `/api/steps/matching/${matchStep}`,
      body: {"batchSize": 100, "sourceDatabase": "data-hub-FINAL", "targetDatabase": "data-hub-FINAL", "targetEntityType": "Patient", "sourceQuery": "cts.collectionQuery(['patientMap'])", "collections": ["patientMatch"], "permissions": "data-hub-common,read,data-hub-common,update", "targetFormat": "JSON", "matchRulesets": [{"name": "LastName - Exact", "weight": 10, "reduce": false, "matchRules": [{"entityPropertyPath": "LastName", "matchType": "exact", "options": {}}]}, {"name": "SSN - Exact", "weight": 20, "reduce": false, "matchRules": [{"entityPropertyPath": "SSN", "matchType": "exact", "options": {}}]}, {"name": "FirstName - Fuzzy Match", "fuzzyMatch": true, "weight": 10, "reduce": false, "matchRules": [{"entityPropertyPath": "FirstName", "matchType": "exact", "options": {}}]}, {"name": "FirstName - Fuzzy Synonym", "fuzzyMatch": true, "weight": 10, "reduce": false, "matchRules": [{"entityPropertyPath": "FirstName", "matchType": "synonym", "options": {"thesaurusURI": "/thesaurus/nicknames.xml"}}]}, {"name": "patientMultiplePropertyRuleset", "weight": 10, "reduce": false, "matchRules": [{"entityPropertyPath": "FirstName", "matchType": "synonym", "options": {"thesaurusURI": "/thesaurus/nicknames.xml"}}, {"entityPropertyPath": "ZipCode", "matchType": "zip", "options": {}}, {"entityPropertyPath": "DateOfBirth", "matchType": "custom", "algorithmModulePath": "/custom-modules/custom/dob-match.xqy", "algorithmFunction": "dob-match", "algorithmModuleNamespace": "http://marklogic.com/smart-mastering/algorithms", "options": {}}], "rulesetType": "multiple"}, {"name": "Address - Exact", "weight": 5, "reduce": true, "matchRules": [{"entityPropertyPath": "Address", "matchType": "exact", "options": {}}]}], "thresholds": [{"thresholdName": "Match", "action": "merge", "score": 19}, {"thresholdName": "Likely Match", "action": "notify", "score": 9}, {"thresholdName": "Slight Match", "action": "custom", "score": 4, "actionModulePath": "/custom-modules/custom/custom-match-action.sjs", "actionModuleFunction": "customMatch", "actionModuleNamespace": ""}], "name": "patientMatch", "description": "match patient step example", "collection": "patientMap", "selectedSource": "collection", "additionalCollections": [], "headers": {}, "interceptors": [], "provenanceGranularityLevel": "off", "customHook": {}, "stepDefinitionName": "default-matching", "stepDefinitionType": "matching", "stepId": "patientMatch-matching", "acceptsBatch": true, "stepUpdate": false, "lastUpdated": "2021-09-20T14:55:49.007489-07:00"}
    }).then(response => {
      console.warn(`Match Step ${matchStep}: ${JSON.stringify(response.statusText)}`);
    });
  });

  it("Add Match step to existing flow Run", {defaultCommandTimeout: 120000}, () => {
    curatePage.selectMatchTab("Patient");
    curatePage.runStepInCardView(matchStep).click();
    curatePage.runStepSelectFlowConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName);
    runPage.verifyStepRunResult(matchStep, "success");
    runPage.closeFlowStatusModal(flowName);
  });

  it("Create a new merge step ", () => {
    curatePage.navigate();
    curatePage.getEntityTypePanel("Patient").should("be.visible");
    curatePage.getEntityTypePanel("Patient").then(($ele) => {
      if ($ele.hasClass("accordion-button collapsed")) {
        cy.log("**Toggling Entity because it was closed.**");
        curatePage.toggleEntityTypeId("Patient");
      }
    });
    curatePage.selectMergeTab("Patient");
    curatePage.addNewStep("Patient").should("be.visible").click();
    createEditStepDialog.stepNameInput().clear().type(mergeStep, {timeout: 2000});
    createEditStepDialog.stepDescriptionInput().clear().type("merge patient step example", {timeout: 2000});
    createEditStepDialog.setCollectionInput(matchStep);
    cy.get(`[aria-label="${matchStep}"]`).should("be.visible").click({force: true});
    cy.get(".rbt-input-main").should("be.visible").should("have.value", matchStep).then(() => { createEditStepDialog.saveButton("merging").click(); });
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(mergeStep);
  });

  it("Add strategy", () => {
    curatePage.openStepDetails(mergeStep);
    mergingStepDetail.addStrategyButton().click();
    mergeStrategyModal.setStrategyName("retain-single-value");
    mergeStrategyModal.addSliderOptionsButton().click();
    multiSlider.getHandleName("Length").should("be.visible");
    multiSlider.getHandleName("Length").first().trigger("mousedown", {force: true});
    multiSlider.getHandleName("Length").first().trigger("mouseup", {force: true});
    mergeStrategyModal.maxValue("1");
    mergeStrategyModal.saveButton().click();
    mergeStrategyModal.getModalDialog().should("not.exist");
    cy.waitForAsyncRequest();
    cy.findAllByText("retain-single-value").should("be.visible").should("have.length.gt", 0);
    cy.findByText("retain-single-value").should("be.visible");
  });

  it("Add merge rules ", () => {
    mergingStepDetail.addMergeRuleButton().click();
    mergeRuleModal.selectPropertyToMerge("Address");
    mergeRuleModal.selectMergeTypeDropdown("Strategy");
    mergeRuleModal.selectStrategyName("retain-single-value");
    mergeRuleModal.saveButton();
    cy.waitForAsyncRequest();
    mergingStepDetail.addMergeRuleButton().click();
    mergeRuleModal.selectPropertyToMerge("DateOfBirth");
    mergeRuleModal.selectMergeTypeDropdown("Property-specific");
    mergeRuleModal.saveButton();
    cy.waitForAsyncRequest();
    mergingStepDetail.addMergeRuleButton().click();
    mergeRuleModal.selectPropertyToMerge("ZipCode");
    mergeRuleModal.selectMergeTypeDropdown("Strategy");
    mergeRuleModal.selectStrategyName("retain-single-value");
    mergeRuleModal.saveButton();
    cy.waitForAsyncRequest();
    mergingStepDetail.addMergeRuleButton().click();
    mergeRuleModal.selectPropertyToMerge("Details");
    mergeRuleModal.selectMergeTypeDropdown("Strategy");
    mergeRuleModal.selectStrategyName("retain-single-value");
    mergeRuleModal.saveButton();
    cy.waitForAsyncRequest();
    mappingStepDetail.goBackToCurateHomePage();
  });

  it("Add Merge step to existing flow Run", {defaultCommandTimeout: 120000}, () => {
    curatePage.getEntityTypePanel("Patient").then(($ele) => {
      if ($ele.hasClass("accordion-button collapsed")) {
        cy.log("**Toggling Entity because it was closed.**");
        curatePage.toggleEntityTypeId("Patient");
      }
    });
    curatePage.selectMergeTab("Patient");
    curatePage.runStepInCardView(mergeStep).click();
    curatePage.runStepSelectFlowConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName);
    runPage.verifyStepRunResult(mergeStep, "success");

    runPage.explorerLink(mergeStep).click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getTableView().click();
    browsePage.waitForHCTableToLoad();
    browsePage.getTotalDocuments().should("eq", 3);
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacet("collection").should("be.visible");
    browsePage.getFacetItemCheckbox("collection", mergeStep).should("be.visible");
    cy.findByTestId("clear-sm-Patient-merged").should("be.visible");
    browsePage.clearAllFacets();
  });

  it("Explore mastered collections", () => {
    browsePage.navigate();
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Patient");
    browsePage.switchToTableView();
    browsePage.showMoreCollection();
    cy.get("#hc-sider-content").scrollTo("bottom");

    browsePage.getFacetItemCheckbox("collection", "sm-Patient-mastered").click();
    entitiesSidebar.applyFacets();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getTotalDocuments().should("eq", 9);
    cy.fixture("patients/e2eMasteringflow/sm-patient-mastered").then(smPatienMastered => {
      browsePage.hcTableRows.should("have.length", 9).each(($row, index) => {
        expect($row.text()).to.contain(smPatienMastered[index].firstName);
        expect($row.text()).to.contain(smPatienMastered[index].lastName);
        expect($row.text()).to.contain(smPatienMastered[index].ssn);
        expect($row.text()).to.contain(smPatienMastered[index].zipCode);
        expect($row.text()).to.contain(smPatienMastered[index].address);
        expect($row.text()).to.contain(smPatienMastered[index].dateOfBirth);
      });
    });

    browsePage.clearAllFacets();
  });

  it("Explore merge collections", () => {
    browsePage.getFacetItemCheckbox("collection", "sm-Patient-merged").click();
    entitiesSidebar.applyFacets();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getTotalDocuments().should("eq", 3);
    cy.fixture("patients/e2eMasteringflow/sm-patient-merged").then(smPatienMerged => {
      browsePage.hcTableRows.should("have.length", 3).each(($row, index) => {
        expect($row.text()).to.contain(smPatienMerged[index].firstName);
        expect($row.text()).to.contain(smPatienMerged[index].lastName);
        expect($row.text()).to.contain(smPatienMerged[index].ssn);
        expect($row.text()).to.contain(smPatienMerged[index].zipCode);
        expect($row.text()).to.contain(smPatienMerged[index].address);
        expect($row.text()).to.contain(smPatienMerged[index].dateOfBirth);
      });
    });

    browsePage.clearAllFacets();
  });

  it("Explore archived collections", () => {
    entitiesSidebar.toggleAllDataView();
    cy.log("Reloading available collections");
    browsePage.showMoreCollection();
    browsePage.showMoreCollection();
    browsePage.getFacetItemCheckbox("collection", "sm-Patient-archived").click();
    entitiesSidebar.applyFacets();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForCardToLoad();
    browsePage.getTotalDocuments().should("eq", 6);
    smPatientArchivedCollection.forEach((cardName: string) => {
      browsePage.verifyCardExist(cardName);
    });
    browsePage.clearAllFacets();
  });

  it("Explore auditing collections", () => {
    browsePage.getFacetItemCheckbox("collection", "sm-Patient-auditing").click();
    entitiesSidebar.applyFacets();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForCardToLoad();
    browsePage.getTotalDocuments().should("eq", 3);
    for (let i = 0; i < 3; i++) {
      graphExploreSidePanel.getInstanceViewIcon().eq(i).should("be.visible").click({force: true});
      detailPage.getDocumentXML().then(($body) => {
        for (let key in smPatientAuditingCollection) {
          if ($body.text().includes(key)) {
            cy.contains(smPatientAuditingCollection[key]);
          }
        }
      });
      detailPage.clickBackButton();
    }

    browsePage.clearAllFacets();
  });

  it("Explore notification collections", () => {
    browsePage.seeAllLink("Collection").then(($ele) => {
      if ($ele.length) {
        browsePage.clickPopoverSearch("Collection");
        browsePage.setInputField("Collection", "sm-Patient-notification");
        browsePage.getPopoverFacetCheckbox("sm-Patient-notification").should("be.visible").click({force: true});
        browsePage.confirmPopoverFacets();
      } else {
        browsePage.getFacetItemCheckbox("collection", "sm-Patient-notification").scrollIntoView().click({force: true});
      }
    });
    entitiesSidebar.applyFacets();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForCardToLoad();
    browsePage.getTotalDocuments().should("eq", 3);
    smPatientNotificationCollection.forEach((cardName: string) => {
      browsePage.verifyCardExist(cardName);
    });

    browsePage.clearAllFacets();
  });
});
