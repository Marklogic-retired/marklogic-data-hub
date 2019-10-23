declareUpdate();
const test = require("/test/test-helper.xqy");


let assertions = [];

assertions.push(test.assertTrue(fn.head(xdmp.eval(
    "fn.docAvailable('/mappings/OrdersMapping/OrdersMapping-1.mapping.xml') ",
    {},{database:xdmp.modulesDatabase()}
  ))));
assertions.push(test.assertTrue(fn.head(xdmp.eval(
    "  fn.docAvailable('/mappings/OrdersMapping/OrdersMapping-1.mapping.xml.xslt') ",
    {},{database:xdmp.modulesDatabase()}
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
    {},{database:xdmp.modulesDatabase()}
  ))));
assertions.push(test.assertFalse(fn.head(xdmp.eval(
    " fn.docAvailable('/mappings/OrdersMapping/OrdersMapping-1.mapping.xml.xslt') ",
    {},{database:xdmp.modulesDatabase()}
  ))));

assertions;
