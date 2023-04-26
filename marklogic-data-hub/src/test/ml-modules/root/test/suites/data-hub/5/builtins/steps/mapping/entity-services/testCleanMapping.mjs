const test = require("/test/test-helper.xqy");

let assertions = [];

assertions.push(test.assertTrue(fn.head(xdmp.eval(
  "fn.docAvailable('/steps/mapping/OrdersMapping1.step.xml') ",
  {}, {database: xdmp.modulesDatabase()}
))));
assertions.push(test.assertTrue(fn.head(xdmp.eval(
  "  fn.docAvailable('/steps/mapping/OrdersMapping1.step.xml.xslt') ",
  {}, {database: xdmp.modulesDatabase()}
))));

xdmp.eval('xdmp.documentDelete("/steps/mapping/OrdersMapping1.step.json")',
  {},
  {
    commit: 'auto',
    update: 'true',
    isolation: 'different-transaction',
    ignoreAmps: true
  });

assertions.push(test.assertFalse(fn.head(xdmp.eval(
  "fn.docAvailable('/steps/mapping/OrdersMapping1.step.xml') ",
  {}, {database: xdmp.modulesDatabase()}
))));
assertions.push(test.assertFalse(fn.head(xdmp.eval(
  " fn.docAvailable('/steps/mapping/OrdersMapping1.step.xml.xslt') ",
  {}, {database: xdmp.modulesDatabase()}
))));

assertions;
