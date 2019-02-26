function getModel(targetEntity, version = '0.0.1') {
  return xdmp.eval("cts.search(cts.andQuery([cts.collectionQuery('http://marklogic.com/entity-services/models'), cts.jsonPropertyScopeQuery('info', cts.andQuery([cts.jsonPropertyValueQuery('title', '" + targetEntity + "',['case-insensitive']), cts.jsonPropertyValueQuery('version', '" + version + "',['case-insensitive'])]))]))", null,
    {
      "database": xdmp.schemaDatabase(),
      "ignoreAmps": true,
      "update": 'false'
    })
}

function getMapping(mappingName) {
  return fn.head(cts.search(cts.andQuery([cts.collectionQuery('http://marklogic.com/data-hub/mappings'), cts.jsonPropertyValueQuery('name', mappingName, ['case-insensitive'])]), ["unfiltered", cts.indexOrder(cts.uriReference(), "descending")]));
}

function getMappingWithVersion(mappingName, version) {
  return fn.head(cts.search(cts.andQuery([cts.collectionQuery('http://marklogic.com/data-hub/mappings'), cts.jsonPropertyValueQuery('name', mappingName, ['case-insensitive']), cts.jsonPropertyValueQuery('version', version)])));
}

function processInstance(model, mapping, content) {
  let instance = {};
  instance['$attachments'] = content;
  if (model.info) {
    instance['$type'] = model.info.title;
    instance['$version'] = model.info.version;
  }

  let mainInstance = extractInstanceFromModel(model, model.info.title, mapping, content);

  instance = Object.assign(mainInstance, instance)

  return instance;
}

function extractInstanceFromModel(model, modelName, mapping, content) {
  let sourceContext = mapping.sourceContext;
  let mappingProperties = mapping.properties;
  let instance = {};
  //grab the model definition
  let definition = model.definitions[model.info.title];
  //first let's get our required props and PK
  let required = definition.required;
  if (definition.primaryKey && definition.required.indexOf(definition.primaryKey) === -1) {
    definition.required.push(definition.primaryKey);
  }
  for (let prop in definition.properties) {
    let dataType = prop["datatype"];
    let valueSource = null;
    if (mappingProperties.hasOwnProperty(prop)) {
      valueSource = fn.head(content.xpath(sourceContext + mappingProperties[prop].sourcedFrom));
    } else {
      valueSource = fn.head(content.xpath('/' + prop));
    }
    let value = null;
    if (!dataType && prop['$ref']) {
      let refArr = prop['$ref'].split('/');
      let refModelName = refArr[refArr.length - 1];
      value = extractInstanceFromModel(model, refModelName, mapping, content);
    } else if (dataType === 'Array') {
      let items = prop['items'];

      //Todo implement arrays so it employs recursion

    } else {
      if(valueSource) {
        value = castDataType(dataType, valueSource)
      }
    }
    instance[prop] = value;
  }

  return instance;
}

function castDataType(dataType, value) {
  //default, so let's set it
  let convertedValue = value;

  if (dataType === 'iri') {
    convertedValue = xs.string(value);
  } else if (dataType === 'duration') {
    convertedValue = xs.duration(value);
  } else if (dataType === 'negativeInteger') {
    convertedValue = xs.negativeInteger(value);
  } else if (dataType === 'array') {
  } else if (dataType === 'float') {
    convertedValue = xs.float(value);
  } else if (dataType === 'nonNegativeInteger') {
    convertedValue = xs.nonNegativeInteger(value);
  } else if (dataType === 'anyURI') {
    convertedValue = xs.string(value);
  } else if (dataType === 'gDay') {
    convertedValue = xs.gDay(value);
  } else if (dataType === 'nonPositiveInteger') {
    convertedValue = xs.nonPositiveInteger(value);
  } else if (dataType === 'base64Binary') {
    convertedValue = xs.base64Binary(value);
  } else if (dataType === 'gMonth') {
    convertedValue = xs.gMonth(value);
  } else if (dataType === 'short') {
    convertedValue = xs.short(value);
  } else if (dataType === 'boolean') {
    convertedValue = xs.boolean(value);
  } else if (dataType === 'gMonthDay') {
    convertedValue = xs.gMonthDay(value);
  } else if (dataType === 'string') {
    convertedValue = xs.string(value);
  } else if (dataType === 'byte') {
    convertedValue = xs.byte(value);
  } else if (dataType === 'gYear') {
    convertedValue = xs.gYear(value);
  } else if (dataType === 'time') {
    convertedValue = xs.time(value);
  } else if (dataType === 'date') {
    convertedValue = xs.date(value);
  } else if (dataType === 'gYearMonth') {
    convertedValue = xs.gYearMonth(value);
  } else if (dataType === 'unsignedByte') {
    convertedValue = xs.unsignedByte(value);
  } else if (dataType === 'dateTime') {
    convertedValue = xs.dateTime(value);
  } else if (dataType === 'hexBinary') {
    convertedValue = xs.hexBinary(value);
  } else if (dataType === 'unsignedInt') {
    convertedValue = xs.unsignedInt(value);
  } else if (dataType === 'dayTimeDuration') {
    convertedValue = xs.dayTimeDuration(value);
  } else if (dataType === 'int') {
    convertedValue = xs.int(value);
  } else if (dataType === 'unsignedLong') {
    convertedValue = xs.unsignedLong(value);
  } else if (dataType === 'decimal') {
    convertedValue = xs.decimal(value);
  } else if (dataType === 'integer') {
    convertedValue = xs.integer(value);
  } else if (dataType === 'unsignedShort') {
    convertedValue = xs.unsignedShort(value);
  } else if (dataType === 'double') {
    convertedValue = xs.double(value);
  } else if (dataType === 'long') {
    convertedValue = xs.long(value);
  } else if (dataType === 'yearMonthDuration') {
    convertedValue = xs.yearMonthDuration(value);
  }
  return convertedValue;
}

function getInstance(doc) {
  let instance = doc;

  if (instance instanceof Element || instance instanceof ObjectNode) {
    let instancePath = '/';
    if (instance instanceof Element) {
      //make sure we grab content root only
      instancePath = '/node()[not(. instance of processing-instruction() or . instance of comment())]';
    }
    instance = new NodeBuilder().addNode(fn.head(instance.xpath(instancePath))).toNode();
  } else {
    instance = new NodeBuilder().addNode(fn.head(instance)).toNode();
  }

  return instance;
}

module.exports = {
  castDataType: castDataType,
  extractInstanceFromModel: extractInstanceFromModel,
  getInstance: getInstance,
  getMapping: getMapping,
  getMappingWithVersion: getMappingWithVersion,
  processInstance: processInstance,
  getModel: getModel
}
