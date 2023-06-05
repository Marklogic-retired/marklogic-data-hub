import hubTest from "/test/data-hub-test-helper.mjs";
const temporal = require("/MarkLogic/temporal.xqy");

const roles = ["admin"];

xdmp.invokeFunction(() => {
  const hubTestX = require("/test/data-hub-test-helper.xqy");

  hubTestX.resetHub();

  const customerModel = {
    "info": {
      "title": "Customer",
      "version": "0.0.1",
      "baseUri": "http://example.org/"
    },
    "definitions": {
      "Customer": {
        "required": [],
        "pii": [],
        "elementRangeIndex": [],
        "rangeIndex": [],
        "wordLexicon": [],
        "properties": {
          "customerId": {
            "datatype": "string",
            "collation": "http://marklogic.com/collation/codepoint"
          },
          "firstname": {
            "datatype": "string",
            "collation": "http://marklogic.com/collation/codepoint"
          },
          "lastname": {
            "datatype": "string",
            "collation": "http://marklogic.com/collation/codepoint"
          }
        }
      }
    }
  };

  const matchStep = {
    "name" : "match-customers",
    "stepDefinitionName" : "default-matching",
    "stepDefinitionType" : "MATCHING",
    "sourceQuery" : "cts.collectionQuery('kool')",
    "targetEntityType" : "http://example.org/Customer-0.0.1/Customer",
    "sourceDatabase" : "data-hub-FINAL",
    "targetDatabase" : "data-hub-FINAL",
    "targetFormat" : "json",
    "stepId" : "match-customers-matching",
    "matchRulesets" : [ {
    "name" : "customerId - Exact",
    "weight" : 10,
    "matchRules" : [ {
      "entityPropertyPath" : "customerId",
      "matchType" : "exact",
      "options" : { }
    } ]
  } ],
    "thresholds" : [ {
    "thresholdName" : "Definitive Match",
    "action" : "merge",
    "score" : 10
  } ]
  };

  hubTest.createSimpleProject("simpleMatchingFlow",
    [matchStep],
    customerModel);
}, { update: "true" });

hubTest.runWithRolesAndPrivileges(roles, [], function () {
  xdmp.invokeFunction(function () {
    try {
      temporal.axisRemove("system");
    } catch (e) {
    }
  }, {update: "true"});
});

hubTest.runWithRolesAndPrivileges(roles, [], function () {
  xdmp.invokeFunction(function () {
    const admin = require("/MarkLogic/admin");
    let config = admin.getConfiguration();
    let elementRangeIndexes = [
      admin.databaseRangeElementIndex("dateTime", "", "systemStart", "", fn.false()),
      admin.databaseRangeElementIndex("dateTime", "", "systemEnd", "", fn.false())]
    elementRangeIndexes.forEach((elementRangeIndex) => {
      try {
        config = admin.databaseAddRangeElementIndex(config, xdmp.database(), elementRangeIndex);
      } catch (e) {
      }
    });
    admin.saveConfiguration(config);
  });
});

hubTest.runWithRolesAndPrivileges(roles, [], function () {
  xdmp.invokeFunction(function () {
    temporal.axisCreate("system", cts.elementReference("systemStart", "type=dateTime"), cts.elementReference("systemEnd", "type=dateTime"));
    temporal.collectionCreate("kool", "system", null, "updates-admin-override");
  }, {update: "true"});
});
