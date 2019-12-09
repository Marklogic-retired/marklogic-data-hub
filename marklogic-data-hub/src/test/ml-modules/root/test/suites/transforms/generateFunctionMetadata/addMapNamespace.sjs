const test = require("/test/test-helper.xqy");
const transform = require("/marklogic.rest.transform/mlGenerateFunctionMetadata/assets/transform.sjs");

function metadataWithoutMapNamespace() {
  let metadata = fn.head(xdmp.unquote('<m:function-defs xml:lang="zxx" location="/data-hub/5/mapping-functions/core.sjs" xmlns:m="http://marklogic.com/entity-services/mapping">\n' +
    '  <m:function-def name="memoryLookup">\n' +
    '    <m:parameters>\n' +
    '      <m:parameter name="input"/>\n' +
    '      <m:parameter name="inputDictionary"/>\n' +
    '    </m:parameters>\n' +
    '    <m:return type=""/>\n' +
    '  </m:function-def></m:function-defs>'));

  metadata = transform.addMapNamespaceToMetadata(metadata);
  metadata = xdmp.quote(metadata);
  return test.assertTrue(metadata.indexOf('xmlns:map="http://marklogic.com/xdmp/map"') > -1,
    "Expected the map prefix to be added to the metadata document: " + metadata);
}

function metadataThatAlreadyHasMapNamespace() {
  let metadata = fn.head(xdmp.unquote('<m:function-defs xml:lang="zxx" location="/data-hub/5/mapping-functions/core.sjs" ' +
    'xmlns:m="http://marklogic.com/entity-services/mapping" ' +
    'xmlns:map="http://marklogic.com/xdmp/map">\n' +
    '  <m:function-def name="memoryLookup">\n' +
    '    <m:parameters>\n' +
    '      <m:parameter name="input"/>\n' +
    '      <m:parameter name="inputDictionary"/>\n' +
    '    </m:parameters>\n' +
    '    <m:return type=""/>\n' +
    '  </m:function-def><map:map></map:map></m:function-defs>'));
  metadata = transform.addMapNamespaceToMetadata(metadata);
  metadata = xdmp.quote(metadata);
  return test.assertTrue(metadata.indexOf('xmlns:map="http://marklogic.com/xdmp/map"') > -1,
    "Just verifying that the map namespace declaration isn't dropped, and that the fact that it exists already " +
    "doesn't cause an error");
}

[]
//.concat(metadataWithoutMapNamespace())
  .concat(metadataThatAlreadyHasMapNamespace());
