const test = require("/test/test-helper.xqy");
import hubTest from "/test/data-hub-test-helper.mjs";
const temporal = require("/MarkLogic/temporal.xqy");
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
    }, {update: "true"});
    const record = hubTest.getRecord(`cust${i}.json`);
    assertions.push(test.assertExists(record.document));
  });
}



const wipeDocument = (roles, doc) => {
  hubTest.runWithRolesAndPrivileges(roles, [], function () {
    xdmp.invokeFunction(function () {
      assertions.push(test.assertEqual(null, temporal.documentWipe("kool", doc)));
    }, {update: "true"});
  });
}

const matchDocs = [
  {
    "CustomerID": 102,
    "Name": {
      "FirstName": "Cole",
      "LastName": "Adams"
    },
    axes:
      {
        systemStart: "1601-01-01T13:59:00Z",
        systemEnd: "9999-12-31T11:59:59Z"
      }
  },
  {
    "CustomerID": 102,
    "Name": {
      "FirstName": "Carmella",
      "LastName": "Hardin"
    },
    axes:
      {
        systemStart: "1601-01-01T13:59:00Z",
        systemEnd: "9999-12-31T11:59:59Z"
      }
  }
]

setMatchDocuments(matchDocs);

const flowName = "CustomerJSON";

const content1 = datahub.flow.findMatchingContent(flowName, "1", options);
assertions.push(
  test.assertEqual(1, content1.length),
  test.assertEqual("cust1.json", content1[0].uri,
    "Each value is stored in a separate content item under the 'uri' property so that we can maintain the convention " +
    "that every content item has a 'uri' property.")
);

const updateDoc = [
  {
    "CustomerID": 101,
    "Name": {
      "FirstName": "Cole",
      "LastName": "Adams"
    },
    axes:
      {
        systemStart: "1601-01-01T14:59:00Z",
        systemEnd: "9999-12-31T11:59:59Z"
      }
  }
]
setMatchDocuments([updateDoc]);

const content2 = datahub.flow.findMatchingContent(flowName, "1", options);
assertions.push(
  test.assertEqual(0, content2.length)
);

wipeDocument(['data-hub-admin'], 'cust1.json');
wipeDocument(['data-hub-admin'], 'cust2.json');

assertions;
