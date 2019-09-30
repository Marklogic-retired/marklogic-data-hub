const mapping = require("/data-hub/5/builtins/steps/mapping/entity-services/main.sjs");

function mapInstance(uri, validateEntity, outputFormat) {
  return mapping.main(
    {
      uri: uri,
      value: cts.doc(uri)
    },
    {
      mapping: {
        name: 'CustomerMapping',
        version: 0
      },
      validateEntity: validateEntity,
      outputFormat: outputFormat
    }
  );
}

function canTestJsonSchemaValidation() {
  if (xdmp.version().startsWith("10.0-2019") || xdmp.version().startsWith("10.0-2")) {
    console.log("Not running test due to bug https://bugtrack.marklogic.com/53122");
    return false;
  }
  return true;
}

exports.mapInstance = mapInstance;
exports.canTestJsonSchemaValidation = canTestJsonSchemaValidation;
