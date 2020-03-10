declareUpdate();
const mappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

let assertions = [];

if (mappingLib.versionIsCompatibleWithES()) {
  assertions.push(test.assertTrue(fn.head(xdmp.eval(
    "fn.docAvailable('/mappings/OrdersMapping/OrdersMapping-1.mapping.xml') ",
    {}, {database: xdmp.modulesDatabase()}
  ))));
  assertions.push(test.assertTrue(fn.head(xdmp.eval(
    "  fn.docAvailable('/mappings/OrdersMapping/OrdersMapping-1.mapping.xml.xslt') ",
    {}, {database: xdmp.modulesDatabase()}
  ))));
  //Test to ensure standard-library.xqy is removed from inserted xslt
  assertions.push(test.assertFalse(fn.head(xdmp.eval(
    "  String(fn.doc('/mappings/OrdersMapping/OrdersMapping-1.mapping.xml.xslt')).includes('/MarkLogic/entity-services/standard-library.xqy') ",
    {}, {database: xdmp.modulesDatabase()}
  ))));

  xdmp.eval('xdmp.documentDelete("/mappings/OrdersMapping/OrdersMapping-1.mapping.json")',
    {},
    {
      commit: 'auto',
      update: 'true',
      isolation: 'different-transaction',
      ignoreAmps: true
    });

  assertions.push(test.assertFalse(fn.head(xdmp.eval(
    "fn.docAvailable('/mappings/OrdersMapping/OrdersMapping-1.mapping.xml') ",
    {}, {database: xdmp.modulesDatabase()}
  ))));
  assertions.push(test.assertFalse(fn.head(xdmp.eval(
    " fn.docAvailable('/mappings/OrdersMapping/OrdersMapping-1.mapping.xml.xslt') ",
    {}, {database: xdmp.modulesDatabase()}
  ))));
}

assertions;
