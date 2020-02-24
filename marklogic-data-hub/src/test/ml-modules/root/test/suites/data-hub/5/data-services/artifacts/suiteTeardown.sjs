const DataHubSingleton = require('/data-hub/5/datahub-singleton.sjs');
const dataHub = DataHubSingleton.instance();

dataHub.hubUtils.deleteDocument('/entities/TestEntity-NoMappingConfig', dataHub.config.STAGINGDATABASE);
dataHub.hubUtils.deleteDocument('/entities/TestEntity-hasMappingConfig', dataHub.config.STAGINGDATABASE);
