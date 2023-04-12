const mapping = require('/data-hub/5/builtins/steps/mapping/entity-services/main.sjs')

function preMapMapAndUnwrap(content, mapping) {
  var preMappedConent = preMap(content, mapping)
  return mapAndUnwrap(preMappedConent, mapping)
}

function preMap(content, mapping) {
  var premappingModulName = "/custom-modules/egress-preprocessors/" + mapping + ".sjs"
  var premappingModule = null
  try {
    premappingModule = require(premappingModulName)
  } catch (e) {
    //no preprocessor
  }
  if(premappingModule != null) {
    return premappingModule.transform(content)
  } else {
    return content
  }
}

function writePreMapToDB(content, mapping){
  var premappingModulName = "/custom-modules/egress-preprocessors/" + mapping + ".sjs"
  const premappingModule = require(premappingModulName)

  var newDocument = premappingModule.transform(content)
  var collections = premappingModule.getCollections(newDocument)
  var uri = premappingModule.getURI(newDocument)

  xdmp.documentInsert(uri, newDocument, {permissions : xdmp.defaultPermissions(), collections : collections})
}

function mapAndUnwrap(content, mapping) {
  var mappedConent = map(content, mapping)
  return unwrapEnvelopeDoc(mappedConent)
}

function map(content, mappingName) {
  var doc = {
    'value': content
  }

  var options = {
    'mapping': {
      'name': mappingName
    }
  }

  return mapping.main(doc, options).value
}

function unwrapEnvelopeDoc(doc) {
  return unwrapES(doc.toObject().envelope.instance)
}

function unwrapES(node) {
  if (node instanceof Array) {
    return node.map(unwrapES)
  } else if (node instanceof Object) {
    var instanceKey = Object.keys(node).find(element => element != "info")
    var newNode = node[instanceKey]
    for (var child in newNode) {
      newNode[child] = unwrapES(newNode[child])
      if(newNode[child] == null) {
        delete newNode[child]
      }
    }
    if(newNode.hasOwnProperty('$ref')) {
      return null
    }
    return newNode
  } else {
    return node
  }
}

// Common Egress Code to transform documents returned from the query
function transformMultiple(rawDocs, entityToFHIR) {
  var egressedDoc = []

  for (var rawDoc of rawDocs) {
    egressedDoc.push(preMapMapAndUnwrap(rawDoc, entityToFHIR))
  }
  return egressedDoc;
};

function searchValuesWithModifier(values, modifier) {
  switch (modifier) {
    case "exact":
      return values;
    case "contains":
      return values.map(value => "*" + value + "*");
    default:
      return values.map(value => value + "*");
  }
}

const modifierPrefixMap = new Map([
  ['eq', '='],
  ['ne', '!='],
  ['lt', '<'],
  ['le', '<='],
  ['gt', '>'],
  ['ge', '>='],
  ['sa', '>'],
  ['eb', '<']
]);

module.exports = {
  mapAndUnwrap,
  preMap,
  writePreMapToDB,
  preMapMapAndUnwrap,
  transformMultiple,
  searchValuesWithModifier,
  modifierPrefixMap
}
