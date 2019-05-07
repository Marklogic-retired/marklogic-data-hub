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

function getSourceContext(sourceContext) {
  let connector = "/*:";
  let srcCtxArr;

  sourceContext = sourceContext.startsWith("/") ? sourceContext.substring(1,sourceContext.length) : sourceContext;
  srcCtxArr = sourceContext.split("/");
  sourceContext = "";

  srcCtxArr.forEach(function(element) {
    if(element.indexOf(':') === -1) {
      sourceContext += connector + element;
    } else {
      sourceContext += "/" + element;
    }
  });
  return sourceContext;
}

function getPath(sourceContext, connector, propertyName) {
  let path;
  if (xdmp.castableAs("http://www.w3.org/2001/XMLSchema", "NCName", propertyName)) {
    path = `${sourceContext}${connector}${propertyName}`;
  } else {
    if (connector.includes("*:")) {
      connector = connector.replace("*:", "");
    }
    path = `${sourceContext}${connector}node('${propertyName}')[fn:not(. instance of array-node())]`;
  }
  return path;
}

function processInstance(model, mapping, content) {
 return extractInstanceFromModel(model, model.info.title, mapping, content);
}

function extractInstanceFromModel(model, modelName, mapping, content) {
  let sourceContext = mapping.sourceContext;
  if (content.nodeKind === 'element' && sourceContext !== '/')  {
    sourceContext = getSourceContext(sourceContext);
  }
  let mappingProperties = mapping.properties;
  let instance = {};
  instance['$type'] = model.info.title;
  if (model.info.version) {
    instance['$version'] = model.info.version;
  } else {
    instance['$version'] = '0.0.1';
  }

  if (!(content.nodeName === 'envelope' || (content.nodeKind === 'document'))) {
    content = new NodeBuilder().addNode(fn.head(content)).toNode();
  }
  if(fn.head(content.xpath('/*:envelope'))) {
    sourceContext = '/*:envelope/*:instance' + sourceContext;
  }

  let definition = model.definitions[modelName];
  //first let's get our required props and PK
  let required = definition.required;
  if (definition.primaryKey && definition.required.indexOf(definition.primaryKey) === -1) {
    definition.required.push(definition.primaryKey);
  }
  let properties = definition.properties;
  for (let property in properties) {
    if (properties.hasOwnProperty(property)) {
    let prop = properties[property];
    let dataType = prop["datatype"];
    let valueSource = null;
    let connector = "";
    if (mappingProperties && mappingProperties.hasOwnProperty(property)) {
      if(sourceContext[sourceContext.length-1] !== '/' &&  !mappingProperties[property].sourcedFrom.startsWith('/') && !mappingProperties[property].sourcedFrom.startsWith('[')){
        connector += '/';
      }
      if (mappingProperties[property].sourcedFrom.indexOf(':') === -1) {
        connector += '*:';
      }
      valueSource = content.xpath(getPath(sourceContext, connector, mappingProperties[property].sourcedFrom));
    } else {
      if (sourceContext[sourceContext.length - 1] !== '/' && !property.startsWith('/') && !property.startsWith('[')) {
        connector += '/';
      }
      if (property.indexOf(':') === -1) {
        connector += '*:';
      }
      valueSource = content.xpath(getPath(sourceContext, connector, property));
    }
    if (dataType !== 'array') {
      valueSource = fn.head(valueSource);
    }
    let value = null;
    if (!dataType && prop['$ref']) {
      let refArr = prop['$ref'].split('/');
      let refModelName = refArr[refArr.length - 1];
      if (valueSource) {
        let itemSource = new NodeBuilder();
        itemSource.addNode(valueSource);
        value = {refModelName: extractInstanceFromModel(model, refModelName, mapping, itemSource.toNode())};
      } else {
        value = null;
      }
    } else if (dataType === 'array') {
      let items = prop['items'];
      let itemsDatatype = items['datatype'];
      let valueArray = [];
      if (!itemsDatatype && items['$ref']) {
        let refArr = items['$ref'].split('/');
        let refModelName = refArr[refArr.length - 1];
        for (const item of Sequence.from(valueSource)) {
          // let's create and pass the node
          let itemSource = new NodeBuilder();
          itemSource.addNode(item);
          valueArray.push(extractInstanceFromModel(model, refModelName, mapping, itemSource.toNode()));
        }
      } else {
        for (const val of Sequence.from(valueSource)) {
          valueArray.push(castDataType(dataType, val.valueOf()));
        }
      }
      value = valueArray;

    } else {
      if (valueSource) {
        try {
          value = castDataType(dataType, valueSource);
        } catch (e) {
          value = null;
        }
      }
    }
    if (required.indexOf(property) > -1 && !value) {
      throw Error('The property: ' + property + ' is required property on the model: ' + modelName + ' and must have a valid value. Value was: ' + valueSource + '.');
    }
    instance[property] = value;
  }
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

module.exports = {
  castDataType: castDataType,
  extractInstanceFromModel: extractInstanceFromModel,
  getMapping: getMapping,
  getMappingWithVersion: getMappingWithVersion,
  processInstance: processInstance,
  getModel: getModel
}
