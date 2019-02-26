
function getModel(targetEntity, version = '0.0.1') {
  return xdmp.eval("cts.search(cts.andQuery([cts.collectionQuery('http://marklogic.com/entity-services/models'), cts.jsonPropertyScopeQuery('info', cts.andQuery([cts.jsonPropertyValueQuery('title', '" + targetEntity + "',['case-insensitive']), cts.jsonPropertyValueQuery('version', '" + version + "',['case-insensitive'])]))]))", null,
    {
      "database": xdmp.schemaDatabase(),
      "ignoreAmps": true,
      "update": 'false'
    })
}

function getMapping(mappingName) {
  return  fn.head(cts.search(cts.andQuery([cts.collectionQuery('http://marklogic.com/data-hub/mappings'), cts.jsonPropertyValueQuery('name', mappingName,['case-insensitive'])]), ["unfiltered", cts.indexOrder(cts.uriReference(), "descending")]));
}

function getMapping(mappingName, version) {
  return fn.head(cts.search(cts.andQuery([cts.collectionQuery('http://marklogic.com/data-hub/mappings'), cts.jsonPropertyValueQuery('name', mappingName,['case-insensitive']), cts.jsonPropertyValueQuery('version', version)])));
}



function processInstance(model, instance) {

  //first let's get our required props and PK
  let required = model.required;
  if(model.required.indexOf(model.primaryKey) === -1) {
    model.required.push(model.primaryKey);
  }

  return instance;
}

function getInstance(doc) {
  let instance = doc;

  if (instance instanceof Element || instance instanceof ObjectNode) {
    let instancePath = '/';
    if(instance instanceof Element) {
      //make sure we grab content root only
      instancePath = '/node()[not(. instance of processing-instruction() or . instance of comment())]';
    }
    instance = new NodeBuilder().addNode(fn.head(instance.xpath(instancePath))).toNode();
  }
  else{
    instance = new NodeBuilder().addNode(fn.head(instance)).toNode();
  }

  return instance;
}

module.exports = {
  getInstance: getInstance,
  getMapping: getMapping,
  processInstance: processInstance,
  getModel: getModel
}
