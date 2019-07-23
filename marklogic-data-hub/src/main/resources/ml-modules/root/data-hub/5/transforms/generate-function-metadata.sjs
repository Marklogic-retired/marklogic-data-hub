'use strict';
const es = require('/MarkLogic/entity-services/entity-services');
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();

function transform(context, params, content) {
  let uri = context.uri;
  let pattern = '^(.*)\.(sjs|mjs|xqy)$';
  let match = new RegExp(pattern).exec(uri);
  if (match !== null) {
    let uriVal = match[1];
    let metaDataXml = es.functionMetadataValidate(es.functionMetadataGenerate(uri));
    let collection = 'http://marklogic.com/entity-services/function-metadata';
    datahub.hubUtils.writeDocument(uriVal+ ".xml", metaDataXml, 'xdmp.defaultPermissions()',  [collection], datahub.config.MODULESDATABASE);
    es.functionMetadataPut(uriVal+ ".xml")
  }
  return content;
}

exports.transform = transform;
