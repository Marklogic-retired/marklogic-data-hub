const test = require("/test/test-helper.xqy");
import hubTest from "/test/data-hub-test-helper.mjs";
const temporal = require("/MarkLogic/temporal.xqy");
import config from "/com.marklogic.hub/config.mjs";
import flowApi from "/data-hub/public/flow/flow-api.mjs";
import DataHubSingleton from "/data-hub/5/datahub-singleton.mjs";

const datahub = DataHubSingleton.instance();

const assertions = [];

const setMatchDocuments = (docs) => {
  const roles = ['data-hub-developer'];
  hubTest.runWithRolesAndPrivileges(roles, [], function () {
    const options =
      {
        permissions: [xdmp.permission('data-hub-common', 'read'), xdmp.permission('data-hub-common', 'update')]
      };
    xdmp.invokeFunction(function () {
      docs.forEach((doc, i) => {
        assertions.push(test.assertEqual(null, temporal.documentInsert("kool", `cust${i}.json`, doc, options)));
      });
    }, {database: xdmp.database(config.FINALDATABASE), update: "true",});
  });
}

const setDocumentProtection = (docs) => {
  hubTest.runWithRolesAndPrivileges(['data-hub-developer'], [], function () {
    xdmp.invokeFunction(function () {
      docs.forEach((doc, i) => {
        assertions.push(test.assertEqual(null, temporal.documentProtect("kool", `cust${i}.json`, {
          level: "noWipe",
          expireTime: "2016-07-20T14:00:00Z"
        })));
      });
    }, {update: "true"});
  });
}
const wipeDocument = (doc) => {
  hubTest.runWithRolesAndPrivileges(['data-hub-admin'], [], function () {
    xdmp.invokeFunction(function () {
      assertions.push(test.assertEqual(null, temporal.documentWipe("kool", doc)));
    }, {update: "true"});
  });
}

const matchDocs = [
  {
    "envelope": {
      "headers": {
        "sources": [
          {
            "name": "CustomerJSON"
          },
          {
            "datahubSourceName": "CustomerJSON",
            "datahubSourceType": "JSON"
          }
        ],
        "createdOn": "2023-04-11T13:50:37.1035154-03:00",
        "createdBy": "admin"
      },
      "triples": [
      ],
      "instance": {
        "info": {
          "title": "Customer",
          "version": "0.0.1",
          "baseUri": "http://example.org/"
        },
        "Customer": {
          "customerId": 102,
          "firstname": "Cole",
          "lastname": "Adams",

        }
      }
    },
    axes:
      {
        systemStart: "1601-01-01T13:59:00Z",
        systemEnd: "9999-12-31T11:59:59Z"
      }
  },
  {
    "envelope": {
      "headers": {
        "sources": [
          {
            "name": "CustomerJSON"
          },
          {
            "datahubSourceName": "CustomerJSON",
            "datahubSourceType": "JSON"
          }
        ],
        "createdOn": "2023-04-11T13:50:37.1035154-03:00",
        "createdBy": "admin"
      },
      "triples": [
      ],
      "instance": {
        "info": {
          "title": "Customer",
          "version": "0.0.1",
          "baseUri": "http://example.org/"
        },
        "Customer": {
          "customerId": 102,
          "firstname": "Carmella",
          "lastname": "Hardin",

        }
      }
    },
    axes:
      {
        systemStart: "1601-01-01T13:59:00Z",
        systemEnd: "9999-12-31T11:59:59Z"
      }
  }
]

setMatchDocuments(matchDocs);
xdmp.invokeFunction(() => {
  const pma = require("/data-hub/5/mastering/preview-matching-activity-lib.xqy");

  let uris = ["cust0.json", "cust1.json"]

  const previewOptions = cts.doc("/steps/matching/match-customers.step.json").root;
  const sourceQuery = xdmp.eval(previewOptions.sourceQuery);

  let previewResults1 = pma.previewMatchingActivity(previewOptions, sourceQuery, uris, false, false, 0);

  assertions.push(
    test.assertEqual(1, previewResults1.actionPreview.length, xdmp.toJsonString(previewResults1)),
    test.assertEqual("merge", previewResults1.actionPreview[0].action.toString(), "The action should be merge")
  );

  const flowName = "simpleMatchingFlow";

  const options1 = {uris: cts.uris(null, null, cts.collectionQuery('kool')).toArray().map((uri) => fn.string(uri))};
  const content1 = datahub.flow.findMatchingContent(flowName, "1", options1);

  const results1 = flowApi.runFlowOnContent(flowName, content1, "1", options1);
  const matchResponse = results1.stepResponses["1"];
  assertions.push(
    test.assertEqual("finished", results1.jobStatus, "Unexpected status: " + xdmp.toJsonString(results1)),
    test.assertEqual("completed step 1", matchResponse.status),
    test.assertEqual(2, matchResponse.successfulEvents),
    test.assertEqual(0, matchResponse.failedEvents),
    test.assertEqual(1, matchResponse.successfulBatches)
  );

  const updateDoc = [
    {
      "envelope": {
        "headers": {
          "sources": [
            {
              "name": "CustomerJSON"
            },
            {
              "datahubSourceName": "CustomerJSON",
              "datahubSourceType": "JSON"
            }
          ],
          "createdOn": "2023-04-11T13:50:37.1035154-03:00",
          "createdBy": "admin"
        },
        "triples": [],
        "instance": {
          "info": {
            "title": "Customer",
            "version": "0.0.1",
            "baseUri": "http://example.org/"
          },
          "Customer": {
            "customerId": 101,
            "firstname": "Cole",
            "lastname": "Adams",

          }
        }
      },
      axes:
        {
          systemStart: "1601-01-01T14:59:00Z",
          systemEnd: "9999-12-31T11:59:59Z"
        }
    }
  ]
  setMatchDocuments([updateDoc]);

  const options2 = {uris: cts.uris(null, null, cts.andQuery([cts.andQuery(cts.collectionQuery('kool')),cts.collectionQuery('latest')])).toArray().map((uri) => fn.string(uri))};
  const content2 = datahub.flow.findMatchingContent(flowName, "1", options2);

  const results2 = flowApi.runFlowOnContent(flowName, content2, "1", options2);
  const matchResponse2 = results2.stepResponses["1"];
  assertions.push(
    test.assertEqual("finished", results2.jobStatus, "Unexpected status: " + xdmp.toJsonString(results2)),
    test.assertEqual("completed step 1", matchResponse2.status),
    test.assertEqual(2, matchResponse2.successfulEvents),
    test.assertEqual(0, matchResponse2.failedEvents),
    test.assertEqual(1, matchResponse2.successfulBatches)
  );


  /* To include when we fix preview matching with temporal docs
  let results2 = pma.previewMatchingActivity(options, sourceQuery, uris, false, false, 0);
  assertions.push(
    test.assertEqual(0, results2.actionPreview.length, xdmp.toJsonString(results2)),
  );*/
}, {database: xdmp.database(config.FINALDATABASE)});

setDocumentProtection(['cust0.json', 'cust1.json']);
wipeDocument('cust0.json');
wipeDocument('cust1.json');

assertions;
