'use strict';
const es = require('/MarkLogic/entity-services/entity-services');
const esMappingLib = require('/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs');
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();

function mlGenerateFunctionMetadata(context, params, content) {
  let uri = context.uri;
  let pattern = '^(.*)\.(sjs|mjs|xqy)$';
  let match = new RegExp(pattern).exec(uri);
  let metadataXml;
  if (match !== null) {
    let uriVal = match[1];
    // The namespace for custom xqy functions should be "http://marklogic.com/mapping-functions/custom"
    if(uri.includes("/custom-modules/mapping-functions/") && uri.endsWith('.xqy')){
      metadataXml = es.functionMetadataValidate(es.functionMetadataGenerate("http://marklogic.com/mapping-functions/custom", uri));
    }
    else {
      metadataXml = es.functionMetadataValidate(es.functionMetadataGenerate(uri));
    }
    metadataXml = addMapNamespaceToMetadata(metadataXml);
    let collection = 'http://marklogic.com/entity-services/function-metadata';
    let permissions = xdmp.defaultPermissions().concat([
      xdmp.permission(datahub.config.FLOWOPERATORROLE, 'execute'),
      xdmp.permission(datahub.config.FLOWDEVELOPERROLE, 'execute'),
      xdmp.permission(datahub.config.FLOWDEVELOPERROLE, 'update'),
      xdmp.permission(datahub.config.FLOWOPERATORROLE, 'read'),
      xdmp.permission(datahub.config.FLOWDEVELOPERROLE, 'read'),
      xdmp.permission(datahub.consts.DATA_HUB_MODULE_READER_ROLE, 'execute'),
      xdmp.permission(datahub.consts.DATA_HUB_MODULE_WRITER_ROLE, 'update'),
      xdmp.permission(datahub.consts.DATA_HUB_MODULE_READER_ROLE, 'read'),
      xdmp.permission("data-hub-module-reader", "execute"),
      // In the absence of this, ML will report an error about standard-library.xqy not being found. This is misleading; the
      // actual problem is that a mapping will fail if the XML or XSLT representation of a custom mapping function library
      // does not have this permission on it, which is expected to be on every other DHF module.
      xdmp.permission("rest-extension-user", "execute")
    ]);
    let writeInfo = datahub.hubUtils.writeDocument(uriVal + ".xml", metadataXml, permissions, [collection], datahub.config.MODULESDATABASE);
    if (writeInfo && fn.exists(writeInfo.transaction)) {
      // try/catch workaround to avoid XSLT-UNBPRFX error. See https://bugtrack.marklogic.com/52870
      try {
        es.functionMetadataPut(uriVal + ".xml");
      } catch (e) {
        if (/(prefix|XSLT-UNBPRFX)/ig.test(e.message)) {
          xdmp.moduleCacheClear();
          es.functionMetadataPut(uriVal + ".xml");
        } else {
          throw e;
        }
      }
    } else {
      datahub.debug.log({message: `No write for function metadata. (${xdmp.describe(writeInfo)})`, type: 'notice'});
    }
  }
  return content;
}

/**
 * Ensures that the map namespace is declared in the XML mapping document. This ensures that it is carried over to the
 * XSL stylesheet that is generated via es.mappingPut. And that ensures that the map:* references in the stylesheet
 * generated for DHF's core.sjs module are resolved correctly, no matter the context.
 */
function addMapNamespaceToMetadata(xml) {
  let metadata = xml;
  try {
    let query = xdmp.quote(xml).replace('<?xml version="1.0" encoding="UTF-8"?>', '');
    query = "let $xml := xdmp:unquote('" + xml + "')/node() return element {fn:node-name($xml)} {$xml/@*,namespace {'map'} {'http://marklogic.com/xdmp/map'},$xml/node()}";
    metadata = xdmp.xqueryEval(query);
  } catch (e) {
    datahub.debug.log({
      message: "Unable to add the map namespace prefix to the metadata document, which is intended to carryover to the " +
        "compiled stylesheet. The compiled stylesheet may still function correctly if it does not reference any map:* functions.",
      type: 'error',
      stack: e.stack
    });
  }
  return metadata;
}

exports.transform = mlGenerateFunctionMetadata;
exports.addMapNamespaceToMetadata = addMapNamespaceToMetadata;
