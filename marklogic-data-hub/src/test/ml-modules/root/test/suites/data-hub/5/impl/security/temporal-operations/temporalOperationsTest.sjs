const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");
const temporal = require("/MarkLogic/temporal.xqy");

const assertions = [];

const setUseLsqtUsingAForbiddenUser = (roles) => {
  hubTest.runWithRolesAndPrivileges(roles, [], function () {
    xdmp.invokeFunction(function () {
      try {
        temporal.setUseLsqt("kool", true);
        assertions.push(test.fail('Exception not thrown when attempting to set LSQT using a forbidden user'));
      } catch (e) {
        assertions.push(test.assertTrue(e.data && Array.isArray(e.data) && e.data.length === 1,
          "Expected exception object's 'data' property to be an array of one item"));
        assertions.push(test.assertEqual('http://marklogic.com/xdmp/privileges/temporal-set-use-lsqt', e.data[0]));
      }
    }, {update: "true"});
  });
}

const setLsqtAutomationUsingAForbiddenUser = (roles) => {
  hubTest.runWithRolesAndPrivileges(roles, [], function () {
    xdmp.invokeFunction(function () {
      try {
        temporal.setLsqtAutomation("kool", true, 5000);
        assertions.push(test.fail('Exception not thrown when attempting to set LSQT Automation using a forbidden user'));
      } catch (e) {
        assertions.push(test.assertTrue(e.data && Array.isArray(e.data) && e.data.length === 1,
          "Expected exception object's 'data' property to be an array of one item"));
        assertions.push(test.assertEqual('http://marklogic.com/xdmp/privileges/temporal-set-lsqt-automation', e.data[0]));
      }
    }, {update: "true"});
  });
}

const setUseLsqtUsingAPermittedUser = (roles) => {
  hubTest.runWithRolesAndPrivileges(roles, [], function () {
    xdmp.invokeFunction(function () {
      assertions.push(test.assertEqual(null, temporal.setUseLsqt("kool", true)));
    }, {update: "true"});
  });
}

const setLsqtAutomationUsingAPermittedUser = (roles) => {
  hubTest.runWithRolesAndPrivileges(roles, [], function () {
    xdmp.invokeFunction(function () {
      assertions.push(test.assertEqual(null, temporal.setLsqtAutomation("kool", true, 5000)));
    }, {update: "true"});
  });
}

const setSystemTime = (roles, i) => {
  hubTest.runWithRolesAndPrivileges(roles, [], function () {
    const root =
      {
        axes:
          {
            systemStart: "1601-01-01T13:59:00Z",
            systemEnd: "9999-12-31T11:59:59Z"
          }
      };
    const options =
      {
        permissions: [xdmp.permission('data-hub-common', 'read'), xdmp.permission('data-hub-common', 'update')]
      };
    xdmp.invokeFunction(function () {
      assertions.push(test.assertEqual(null, temporal.documentInsert("kool", `doc${i}.json`, root, options)));
      assertions.push(test.assertEqual(null, temporal.statementSetSystemTime(xs.dateTime("1601-01-01T14:00:00Z"))));
    }, {update: "true"});
    const record = hubTest.getRecord(`doc${i}.json`);
    assertions.push(test.assertExists(record.document));
    assertions.push(test.assertEqual("1601-01-01T14:00:00Z", record.document.axes.systemStart));
  });
}

const setDocumentProtection = (roles, i) => {
  hubTest.runWithRolesAndPrivileges(roles, [], function () {
    xdmp.invokeFunction(function () {
      assertions.push(test.assertEqual(null, temporal.documentProtect("kool", `doc${i}.json`, {
        level: "noWipe",
        expireTime: "2016-07-20T14:00:00Z"
      })));
    }, {update: "true"});
  });
}

const wipeDocumentUsingAForbiddenUser = (roles, i) => {
  hubTest.runWithRolesAndPrivileges(roles, [], function () {
    xdmp.invokeFunction(function () {
      try {
        temporal.documentWipe("kool", `doc${i}.json`);
        assertions.push(test.fail('Exception not thrown when attempting to wipe a protected document using a forbidden user'));
      } catch (e) {
        assertions.push(test.assertTrue(e.data && Array.isArray(e.data) && e.data.length === 1,
          "Expected exception object's 'data' property to be an array of one item"));
        assertions.push(test.assertEqual('http://marklogic.com/xdmp/privileges/temporal-document-wipe', e.data[0]));
      }
    }, {update: "true"});
  });
}

const wipeDocumentUsingAPermittedUser = (roles, i) => {
  hubTest.runWithRolesAndPrivileges(roles, [], function () {
    xdmp.invokeFunction(function () {
      assertions.push(test.assertEqual(null, temporal.documentWipe("kool", `doc${i}.json`)));
    }, {update: "true"});
  });
}

[['data-hub-operator'],
  ['data-hub-temporal-user', 'data-hub-common']].forEach((roles) => {
  setUseLsqtUsingAForbiddenUser(roles);
  setLsqtAutomationUsingAForbiddenUser(roles);
});
setUseLsqtUsingAPermittedUser(['data-hub-developer']);
setLsqtAutomationUsingAPermittedUser(['data-hub-developer']);
[['data-hub-developer'],
  ['data-hub-operator'],
  ['data-hub-temporal-user', 'data-hub-common-writer']].forEach((roles, index) => {
  setSystemTime(roles, index);
  setDocumentProtection(roles, index);
  wipeDocumentUsingAForbiddenUser(roles, index);
  wipeDocumentUsingAPermittedUser(['data-hub-admin'], index);
});

assertions;
