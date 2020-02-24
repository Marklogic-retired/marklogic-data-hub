const DataHubSingleton = require('/data-hub/5/datahub-singleton.sjs');
const dataHub = DataHubSingleton.instance();

const permissions = [xdmp.permission('data-hub-entity-model-writer', 'update'), xdmp.permission('data-hub-entity-model-reader', 'read')];

dataHub.hubUtils.writeDocument('/entities/TestEntity-NoMappingConfig', {
  "info": {
    "title": "TestEntity-NoMappingConfig",
    "version": "0.0.1",
    "baseUri": "http://example.org/"
  },
  "definitions": {
    "TestEntity-NoMappingConfig": {
      "Field1": {
        "datatype": "string"
      }
    }
  }
}, permissions, ['http://marklogic.com/entity-services/models'], dataHub.config.STAGINGDATABASE);

dataHub.hubUtils.writeDocument('/entities/TestEntity-hasMappingConfig', {
  "info": {
    "title": "TestEntity-hasMappingConfig",
    "version": "0.0.1",
    "baseUri": "http://example.org/"
  },
  "definitions": {
    "TestEntity-hasMappingConfig": {
      "Field1": {
        "datatype": "string"
      }
    }
  }
}, permissions, ['http://marklogic.com/entity-services/models'], dataHub.config.STAGINGDATABASE);

