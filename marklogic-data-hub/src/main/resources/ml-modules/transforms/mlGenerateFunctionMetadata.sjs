'use strict';
const es = require('/MarkLogic/entity-services/entity-services');
const esMappingLib = require('/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs');
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();

function mlGenerateFunctionMetadata(context, params, content) {
  if (esMappingLib.versionIsCompatibleWithES()) {
    let uri = context.uri;
    let pattern = '^(.*)\.(sjs|mjs|xqy)$';
    let match = new RegExp(pattern).exec(uri);
    if (match !== null) {
      let uriVal = match[1];
      let metaDataXml = es.functionMetadataValidate(es.functionMetadataGenerate(uri));
      let collection = 'http://marklogic.com/entity-services/function-metadata';
      let permissionsExpression = `xdmp.defaultPermissions().concat([
      xdmp.permission('${datahub.config.FLOWOPERATORROLE}','execute'),
      xdmp.permission('${datahub.config.FLOWDEVELOPERROLE}','execute'),
      xdmp.permission('${datahub.config.FLOWDEVELOPERROLE}','update'),
      xdmp.permission('${datahub.config.FLOWOPERATORROLE}','read'),
      xdmp.permission('${datahub.config.FLOWDEVELOPERROLE}','read')
      ])`;
      let writeInfo = datahub.hubUtils.writeDocument(uriVal + ".xml", metaDataXml, permissionsExpression, [collection], datahub.config.MODULESDATABASE);
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
  } else {
    datahub.debug.log({message: `Uploading declarative mapping library (${content.uri}) to incompatible MarkLogic version (${xdmp.version()}).`, type: 'notice'});
  }
  return content;
}

exports.transform = mlGenerateFunctionMetadata;
