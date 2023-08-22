import loginPage from "../support/pages/login";
import "@testing-library/cypress/add-commands";
import "cypress-file-upload";
import "cypress-wait-until";
import "cypress-file-upload";
require("cypress-plugin-tab");
import {confirmationModal} from "../support/components/common/index";
import {ConfirmationType} from "../support/types/modeling-types";
import modelPage from "../support/pages/model";

let protocol = "http";
if (Cypress.env("mlHost").indexOf("marklogicsvc") > -1) { protocol = "https"; }

Cypress.Commands.add("withUI", {prevSubject: "optional"}, (subject) => {
  if (subject) {
    cy.wrap(subject).then(user => {
      cy.visit("/");
      loginPage.getUsername().type(user["user-name"]);
      loginPage.getPassword().type(user.password);
      loginPage.getLoginButton().click();
    });
    cy.wait(2000);
    cy.window()
      .its("stompClientConnected")
      .should("exist");
  }
});

Cypress.Commands.add("withRequest", {prevSubject: "optional"}, (subject) => {
  if (subject) {
    cy.wrap(subject).then(user => {
      const username = user["user-name"];
      const password = user.password;

      cy.request({
        method: "POST",
        url: "/api/login",
        body: {username, password}
      }).then(response => {
        try {
          localStorage.setItem("dataHubUser", username);
          localStorage.setItem("loginResp", JSON.stringify(response.body));
          return true;
        } catch (e) {
          return false;
        }
      });

      cy.request({
        method: "GET",
        url: "/api/environment/systemInfo"
      }).then(response => {
        try {
          localStorage.setItem("environment", JSON.stringify(response.body));
          localStorage.setItem("serviceName", response.body.serviceName);
          return true;
        } catch (e) {
          return false;
        }
      });
    });
  }
});

Cypress.Commands.add("loginAsDeveloper", () => {
  setTestUserRoles(["hub-central-developer"]);
  return cy.fixture("users/hub-user");
});

Cypress.Commands.add("loginAsDeveloperV2", () => {
  setTestUserRoles(["hub-central-developer"]);
  return cy.fixture("users/developer");
});


Cypress.Commands.add("loginAsOperator", () => {
  return cy.fixture("users/operator");
});

Cypress.Commands.add("loginAsTestUser", () => {
  return cy.fixture("users/hub-user");
});

Cypress.Commands.add("loginAsTestUserWithRoles", (...roles) => {
  setTestUserRoles(roles);
  return cy.fixture("users/hub-user");
});

Cypress.Commands.add("resetTestUser", () => {
  return resetTestUser();
});

Cypress.Commands.add("logout", () => {
  cy.request({
    request: "GET",
    url: "/api/logout"
  }).then(() => {
    cy.visit("/");
  });
});

Cypress.Commands.add("verifyStepAddedToFlow", (stepType, stepName, flowName) => {
  cy.wait(1000);
  cy.get("[class=\"accordion-collapse collapse show\"]").then($body => {
    if ($body.find(`[aria-label="runStep-${stepName}"]`).length > 0) {
      const text = $body.find("[class^=\"hc-card_title\"]").text();
      expect(text).to.equal(stepType);
    } else {
      cy.reload();
      cy.wait(1000);
      cy.waitForAsyncRequest();
      cy.get(`#${flowName}`).should("be.visible");
      cy.get(`#${flowName}`).find("[class*=\"accordion-button\"]").click({force: true});
      cy.findAllByText(stepType).eq(0).should("be.visible");
      cy.findAllByText(stepName).eq(0).should("be.visible");
    }
  });
});

Cypress.Commands.add("waitForModalToDisappear", () => {
  cy.get("[class=\"modal-dialog\"]").should("not.exist");
});

Cypress.Commands.add("waitForBootstrapModalToDisappear", () => {
  cy.get("[class=\"fade modal\"]").should("not.exist");
});

Cypress.Commands.add("uploadFile", (filePath) => {
  cy.get("input[type=\"file\"]");
  cy.get("input[type=\"file\"]").attachFile(filePath, {force: true});
  cy.waitForAsyncRequest();
});

Cypress.Commands.add("verifyStepRunResult", (jobStatus, stepType, stepName) => {
  if (jobStatus === "success") {
    cy.get("[data-icon=\"check-circle\"]").should("be.visible");
    cy.get("span").should("contain.text", `The ${stepType.toLowerCase()} step ${stepName} completed successfully`);
  } else {
    cy.get("[data-icon=\"exclamation-circle\"]").should("be.visible");
    cy.get("span").should("contain.text", `The ${stepType.toLowerCase()} step ${stepName} failed`);
    cy.get("#error-list").should("contain.text", "Message:");
  }
});

function getSavedQueries() {
  return cy.request({
    request: "GET",
    url: "/api/entitySearch/savedQueries"
  }).then(response => {
    return response.body;
  });
}

Cypress.Commands.add("deleteSavedQueries", () => {
  getSavedQueries().each(query => {
    cy.request({
      method: "DELETE",
      url: `/api/entitySearch/savedQueries/query?id=${query.savedQuery.id}`,
    }).then(response => {
      console.warn("DELETE SAVED QUERY: " + JSON.stringify(response.statusText));
    });
  });
});

Cypress.Commands.add("deleteFlows", (...flowNames) => {
  flowNames.forEach(flow => {
    cy.request({
      method: "DELETE",
      url: `/api/flows/${flow}`,
      failOnStatusCode: false
    }).then(response => {
      console.warn(`DELETE FLOW ${flow}: ${JSON.stringify(response.statusText)}`);
    });
  });
});

Cypress.Commands.add("runStep", (flowName, stepName) => {
  cy.request({
    method: "POST",
    url: `/api/flows/${flowName}/steps/${stepName}`
  }).then(response => {
    console.warn(`RUN FLOW ${flowName}: ${JSON.stringify(response.statusText)}`);
  });
});

Cypress.Commands.add("deleteSteps", (stepType, ...stepNames) => {
  stepNames.forEach(step => {
    cy.request({
      method: "DELETE",
      url: `/api/steps/${stepType}/${step}`,
      failOnStatusCode: false
    }).then(response => {
      console.warn(`DELETE ${stepType} STEP ${step}: ${JSON.stringify(response.statusText)}`);
    });
  });
});

Cypress.Commands.add("deleteEntities", (...entityNames) => {
  entityNames.forEach(entity => {
    cy.request({
      method: "DELETE",
      url: `/api/models/${entity}`,
      failOnStatusCode: false
    }).then(response => {
      console.warn(`DELETE ENTITY ${entity}: ${JSON.stringify(response.statusText)}`);
    });
  });
});

Cypress.Commands.add("deleteRecordsInFinal", (...collections) => {
  collections.forEach(collection => {
    cy.exec(`curl -X DELETE --anyauth -u test-admin-for-data-hub-tests:password -H "Content-Type:application/json" \
    "${protocol}://${Cypress.env("mlHost")}:8002/v1/search?database=data-hub-FINAL&collection=${collection}"`);
    console.warn(`DELETE RECORDS IN ${collection} COLLECTION`);
  });
});

Cypress.Commands.add("deleteRecordsInStaging", (...collections) => {
  collections.forEach(collection => {
    cy.exec(`curl -X DELETE --anyauth -u test-admin-for-data-hub-tests:password -H "Content-Type:application/json" \
    "${protocol}://${Cypress.env("mlHost")}:8002/v1/search?database=data-hub-STAGING&collection=${collection}"`);
    console.warn(`DELETE RECORDS IN ${collection} COLLECTION`);
  });
});

Cypress.Commands.add("deleteFiles", (dataBase, ...files) => {
  files.forEach(filePath => {
    cy.exec(`curl -X DELETE --anyauth -u test-admin-for-data-hub-tests:password "${protocol}://${Cypress.env("mlHost")}:8002/v1/documents?database=data-hub-${dataBase}&uri=${filePath}"`);
    console.warn(`DELETE FILES  ${filePath} IN ${dataBase}`);
  });
});

Cypress.Commands.add("waitForAsyncRequest", () => {
  cy.window().then({timeout: 60000},
    win => new Cypress.Promise((resolve, reject) => win.requestIdleCallback(resolve, {timeout: 60000}))
  );
});

function setTestUserRoles(roles) {
  let role = roles.concat("hub-central-user");
  cy.writeFile("cypress/support/body.json", {"role": role});
  cy.readFile("cypress/support/body.json").then(content => {
    expect(content.role).deep.equals(role);
  });
  cy.exec(`curl -X PUT --anyauth -u test-admin-for-data-hub-tests:password -H "Content-Type:application/json" \
  -d @cypress/support/body.json ${protocol}://${Cypress.env("mlHost")}:8002/manage/v2/users/hc-test-user/properties`);
  cy.wait(1000);
  cy.waitForAsyncRequest();
}

function resetTestUser() {
  cy.exec(`curl -X PUT --anyauth -u test-admin-for-data-hub-tests:password -H "Content-Type:application/json" \
  -d @cypress/support/resetUser.json ${protocol}://${Cypress.env("mlHost")}:8002/manage/v2/users/hc-test-user/properties`);
}

Cypress.on("uncaught:exception", () => { return false; });

Cypress.Commands.add("getAttached", selector => {
  const getElement = typeof selector === "object" ? selector : $d => $d.find(selector);
  let $el = null;
  return cy.document().should($d => {
    $el = getElement(Cypress.$($d));
    expect(Cypress.dom.isDetached($el)).to.be.false;
  }).then(() => cy.wrap($el));
});

Cypress.Commands.add("setupHubCentralConfig", () => {
  cy.fixture("config/hubCentral.json").then((hubCentralConfig) => {
    cy.log("**Setting up HubCentralConfig**");
    cy.request({
      method: "PUT",
      url: `/api/models/hubCentralConfig`,
      body: hubCentralConfig
    });
  });
});

Cypress.Commands.add("publishDataModel", () => {
  modelPage.getPublishButton().should("be.visible").click();
  cy.waitForAsyncRequest();
  cy.wait(1000);

  cy.get("body")
    .then(($body) => {
      if (!$body.find(`[aria-label=confirm-publishAllEntity-yes]`).length) {
        modelPage.getPublishButton().click({force: true});
      }
    });
  confirmationModal.getSaveAllEntityText().should("exist");
  confirmationModal.getYesButton(ConfirmationType.PublishAll);
  cy.waitForAsyncRequest();
  confirmationModal.getSaveAllEntityText().should("not.exist");
  modelPage.getEntityModifiedAlert().should("not.exist");
});

Cypress.Commands.add("revertDataModel", () => {
  modelPage.getRevertButton().click();
  cy.waitForAsyncRequest();
  cy.wait(1000);

  confirmationModal.getYesButton(ConfirmationType.RevertChanges);
  cy.waitForAsyncRequest();
  confirmationModal.getSaveAllEntityText().should("exist");
  confirmationModal.getSaveAllEntityText().should("not.exist");
  modelPage.getEntityModifiedAlert().should("not.exist");
});

Cypress.Commands.add("typeTab", (shiftKey, ctrlKey) => {
  cy.focused().trigger("keydown", {
    keyCode: 9,
    which: 9,
    shiftKey: shiftKey,
    ctrlKey: ctrlKey
  });
});

let LOCAL_STORAGE_MEMORY = {};

Cypress.Commands.add("saveLocalStorage", () => {
  Object.keys(localStorage).forEach(key => {
    LOCAL_STORAGE_MEMORY[key] = localStorage[key];
  });
});

Cypress.Commands.add("restoreLocalStorage", () => {
  Cypress.Cookies.preserveOnce("HubCentralSession");
  Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
  });
});

Cypress.Commands.add("createFlowWithApi", (flowName) => {
  return cy.request({
    method: "POST",
    url: `/api/flows`,
    body: {
      name: flowName,
      description: ""
    }
  });
});

Cypress.Commands.add("addStepToFlowWithApi", (flowName, stepName, stepType) => {
  return cy.request({
    method: "POST",
    url: `/api/flows/${flowName}/steps`,
    body: {
      "stepName": stepName,
      "stepDefinitionType": stepType
    }
  });
});
