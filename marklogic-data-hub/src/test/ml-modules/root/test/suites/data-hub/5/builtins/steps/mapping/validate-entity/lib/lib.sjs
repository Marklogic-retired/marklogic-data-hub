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

exports.mapInstance = mapInstance;
