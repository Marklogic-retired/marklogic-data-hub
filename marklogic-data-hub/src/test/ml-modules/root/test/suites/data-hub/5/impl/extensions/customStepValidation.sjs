const test = require("/test/test-helper.xqy");
const stepValidate = require("/marklogic.rest.resource/mlStepValidate/assets/resource.sjs");


function checkPermissions() {
  let operatorRole = xdmp.role("data-hub-module-reader").toString();
  let modPerms = fn.head(xdmp.eval('xdmp.documentGetPermissions("/data-hub/5/impl/flow.mjs")', null,
    {
      "database" : xdmp.database(xdmp.databaseName(xdmp.modulesDatabase()))
    }));
  return [
    test.assertEqual(true, stepValidate.checkPermissions(modPerms, operatorRole),
      "This document should have right permissions for the role 'data-hub-module-reader'")
  ];
}


function moduleStaticCheck() {
  return [
    test.assertEqual("JS-JAVASCRIPT: let id = content.uri; -- Error running JavaScript request: SyntaxError: Unexpected identifier in /test/suites/data-hub/5/impl/extensions/lib/invalidModule.sjs, at 34:2 [javascript]"
    , stepValidate.staticCheck("/test/suites/data-hub/5/impl/extensions/lib/invalidModule.sjs"),
      "Invalid module"),
    test.assertEqual(null, stepValidate.staticCheckMJS("/data-hub/5/impl/flow.mjs"),
      "Valid module")
  ];
}

[]
  .concat(checkPermissions())
  .concat(moduleStaticCheck());
